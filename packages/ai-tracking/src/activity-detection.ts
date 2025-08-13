// Zero-friction activity detection using device sensors and AI

interface ActivityDetectionConfig {
  enableMotion?: boolean;
  enableCamera?: boolean;
  enableAudio?: boolean;
  enableLocation?: boolean;
  sensitivity?: 'low' | 'medium' | 'high';
}

interface DetectedActivity {
  type: 'workout' | 'study' | 'meal' | 'rest' | 'commute' | 'social';
  confidence: number;
  startTime: Date;
  endTime?: Date;
  metadata?: Record<string, any>;
}

export class ActivityDetector {
  private config: ActivityDetectionConfig;
  private isDetecting: boolean = false;
  private currentActivity: DetectedActivity | null = null;
  private activityHistory: DetectedActivity[] = [];
  private sensorData: {
    motion: any[];
    location: any[];
    audio: any[];
  } = {
    motion: [],
    location: [],
    audio: [],
  };

  constructor(config: ActivityDetectionConfig = {}) {
    this.config = {
      enableMotion: true,
      enableCamera: false,
      enableAudio: false,
      enableLocation: true,
      sensitivity: 'medium',
      ...config,
    };
  }

  // Start automatic activity detection
  async startDetection(): Promise<void> {
    if (this.isDetecting) return;
    this.isDetecting = true;

    // Start motion detection
    if (this.config.enableMotion) {
      await this.startMotionDetection();
    }

    // Start location tracking
    if (this.config.enableLocation) {
      await this.startLocationTracking();
    }

    // Start audio detection (for study detection)
    if (this.config.enableAudio) {
      await this.startAudioDetection();
    }

    // Run detection loop
    this.runDetectionLoop();
  }

  // Motion detection using device accelerometer
  private async startMotionDetection(): Promise<void> {
    if (!('Accelerometer' in window)) {
      console.warn('Accelerometer not available');
      return;
    }

    try {
      const sensor = new (window as any).Accelerometer({ frequency: 10 });
      
      sensor.addEventListener('reading', () => {
        this.sensorData.motion.push({
          x: sensor.x,
          y: sensor.y,
          z: sensor.z,
          timestamp: Date.now(),
        });

        // Keep only last 100 readings
        if (this.sensorData.motion.length > 100) {
          this.sensorData.motion.shift();
        }
      });

      sensor.start();
    } catch (error) {
      console.error('Motion detection error:', error);
    }
  }

  // Location tracking for gym/library detection
  private async startLocationTracking(): Promise<void> {
    if (!navigator.geolocation) {
      console.warn('Geolocation not available');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.sensorData.location.push({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });

        // Keep only last 10 positions
        if (this.sensorData.location.length > 10) {
          this.sensorData.location.shift();
        }

        // Check if at known locations
        this.checkKnownLocations(position.coords);
      },
      (error) => {
        console.error('Location tracking error:', error);
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 30000,
      }
    );
  }

  // Audio detection for study environment
  private async startAudioDetection(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: false 
      });

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);

      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkAudioLevel = () => {
        if (!this.isDetecting) return;

        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        
        this.sensorData.audio.push({
          level: average,
          timestamp: Date.now(),
        });

        // Keep only last 60 readings (1 minute at 1Hz)
        if (this.sensorData.audio.length > 60) {
          this.sensorData.audio.shift();
        }

        requestAnimationFrame(checkAudioLevel);
      };

      checkAudioLevel();
    } catch (error) {
      console.error('Audio detection error:', error);
    }
  }

  // Main detection loop
  private runDetectionLoop(): void {
    if (!this.isDetecting) return;

    // Analyze sensor data every 5 seconds
    setInterval(() => {
      if (!this.isDetecting) return;
      
      const activity = this.analyzeActivity();
      
      if (activity) {
        this.handleDetectedActivity(activity);
      }
    }, 5000);
  }

  // Analyze sensor data to detect activity
  private analyzeActivity(): DetectedActivity | null {
    const motionIntensity = this.calculateMotionIntensity();
    const audioLevel = this.calculateAverageAudioLevel();
    const location = this.getCurrentLocation();

    // Workout detection
    if (motionIntensity > 5) {
      return {
        type: 'workout',
        confidence: Math.min(motionIntensity / 10, 1),
        startTime: new Date(),
        metadata: {
          intensity: motionIntensity > 8 ? 'high' : motionIntensity > 5 ? 'medium' : 'low',
          location: location?.type,
        },
      };
    }

    // Study detection (low motion, quiet environment or library location)
    if (motionIntensity < 2 && (audioLevel < 30 || location?.type === 'library')) {
      return {
        type: 'study',
        confidence: 0.8,
        startTime: new Date(),
        metadata: {
          environment: audioLevel < 30 ? 'quiet' : 'normal',
          location: location?.type,
        },
      };
    }

    // Commute detection (medium motion, changing location)
    if (this.isCommuting()) {
      return {
        type: 'commute',
        confidence: 0.7,
        startTime: new Date(),
        metadata: {
          mode: motionIntensity > 3 ? 'active' : 'passive',
        },
      };
    }

    return null;
  }

  // Calculate motion intensity from accelerometer data
  private calculateMotionIntensity(): number {
    if (this.sensorData.motion.length < 10) return 0;

    const recent = this.sensorData.motion.slice(-10);
    const magnitudes = recent.map(m => 
      Math.sqrt(m.x * m.x + m.y * m.y + m.z * m.z)
    );

    const variance = this.calculateVariance(magnitudes);
    return Math.min(variance * 2, 10); // Scale to 0-10
  }

  // Calculate average audio level
  private calculateAverageAudioLevel(): number {
    if (this.sensorData.audio.length === 0) return 0;
    
    const recent = this.sensorData.audio.slice(-30); // Last 30 seconds
    const average = recent.reduce((sum, a) => sum + a.level, 0) / recent.length;
    
    return average;
  }

  // Get current location type
  private getCurrentLocation(): { type: string; confidence: number } | null {
    if (this.sensorData.location.length === 0) return null;
    
    const latest = this.sensorData.location[this.sensorData.location.length - 1];
    
    // Check against known locations (would be stored in user preferences)
    // This is simplified - in production, would use actual location matching
    return {
      type: 'unknown',
      confidence: 0.5,
    };
  }

  // Check if user is commuting
  private isCommuting(): boolean {
    if (this.sensorData.location.length < 3) return false;
    
    const recent = this.sensorData.location.slice(-3);
    const distances = [];
    
    for (let i = 1; i < recent.length; i++) {
      const dist = this.calculateDistance(
        recent[i-1].latitude,
        recent[i-1].longitude,
        recent[i].latitude,
        recent[i].longitude
      );
      distances.push(dist);
    }
    
    const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
    return avgDistance > 50; // Moving more than 50m between readings
  }

  // Check known locations (gym, library, etc.)
  private checkKnownLocations(coords: GeolocationCoordinates): void {
    // In production, this would check against user's saved locations
    const knownLocations = [
      { lat: 0, lng: 0, type: 'gym', radius: 100 },
      { lat: 0, lng: 0, type: 'library', radius: 50 },
    ];

    for (const location of knownLocations) {
      const distance = this.calculateDistance(
        coords.latitude,
        coords.longitude,
        location.lat,
        location.lng
      );

      if (distance <= location.radius) {
        // User is at a known location
        this.handleLocationMatch(location.type);
        break;
      }
    }
  }

  // Handle detected activity
  private handleDetectedActivity(activity: DetectedActivity): void {
    // Check if activity type changed
    if (this.currentActivity?.type !== activity.type) {
      // End previous activity
      if (this.currentActivity) {
        this.currentActivity.endTime = new Date();
        this.activityHistory.push(this.currentActivity);
        this.onActivityEnd(this.currentActivity);
      }

      // Start new activity
      this.currentActivity = activity;
      this.onActivityStart(activity);
    }
  }

  // Handle location match
  private handleLocationMatch(locationType: string): void {
    // Trigger appropriate detection based on location
    if (locationType === 'gym' && this.currentActivity?.type !== 'workout') {
      this.handleDetectedActivity({
        type: 'workout',
        confidence: 0.9,
        startTime: new Date(),
        metadata: { location: 'gym', autoDetected: true },
      });
    } else if (locationType === 'library' && this.currentActivity?.type !== 'study') {
      this.handleDetectedActivity({
        type: 'study',
        confidence: 0.9,
        startTime: new Date(),
        metadata: { location: 'library', autoDetected: true },
      });
    }
  }

  // Callbacks for activity events
  private onActivityStart(activity: DetectedActivity): void {
    console.log('Activity started:', activity);
    // Emit event or call callback
    window.dispatchEvent(new CustomEvent('activityStart', { detail: activity }));
  }

  private onActivityEnd(activity: DetectedActivity): void {
    console.log('Activity ended:', activity);
    // Emit event or call callback
    window.dispatchEvent(new CustomEvent('activityEnd', { detail: activity }));
  }

  // Utility functions
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return variance;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  // Stop detection
  stopDetection(): void {
    this.isDetecting = false;
    
    if (this.currentActivity) {
      this.currentActivity.endTime = new Date();
      this.activityHistory.push(this.currentActivity);
      this.onActivityEnd(this.currentActivity);
      this.currentActivity = null;
    }
  }

  // Get activity history
  getActivityHistory(): DetectedActivity[] {
    return this.activityHistory;
  }

  // Get current activity
  getCurrentActivity(): DetectedActivity | null {
    return this.currentActivity;
  }
}