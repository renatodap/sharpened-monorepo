// AI-powered study tracking with automatic focus detection

interface StudySession {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  focusScore: number; // 0-1 score of focus quality
  subjects: string[];
  breaks: Break[];
  distractions: Distraction[];
  productivity: number; // 0-100 productivity score
  environment: 'quiet' | 'moderate' | 'noisy';
  autoDetected: boolean;
}

interface Break {
  startTime: Date;
  endTime: Date;
  type: 'scheduled' | 'distraction' | 'rest';
}

interface Distraction {
  timestamp: Date;
  type: 'phone' | 'browser' | 'noise' | 'movement' | 'other';
  duration: number;
}

export class StudyTracker {
  private isTracking: boolean = false;
  private currentSession: StudySession | null = null;
  private focusHistory: number[] = [];
  private tabHistory: { url: string; title: string; timestamp: Date }[] = [];
  private eyeTracker: EyeTracker | null = null;
  private audioMonitor: AudioMonitor | null = null;
  private lastActivityTime: Date = new Date();
  private sessionHistory: StudySession[] = [];
  
  // Pomodoro settings
  private pomodoroConfig = {
    focusTime: 25 * 60 * 1000, // 25 minutes
    shortBreak: 5 * 60 * 1000, // 5 minutes
    longBreak: 15 * 60 * 1000, // 15 minutes
    sessionsBeforeLongBreak: 4,
  };
  
  private pomodoroState = {
    currentPomodoro: 0,
    isBreak: false,
    nextBreakTime: null as Date | null,
  };

  constructor() {
    this.initializeTrackers();
  }

  // Initialize tracking systems
  private async initializeTrackers(): Promise<void> {
    // Initialize eye tracking (if available)
    this.eyeTracker = new EyeTracker();
    await this.eyeTracker.initialize();

    // Initialize audio monitoring
    this.audioMonitor = new AudioMonitor();
    await this.audioMonitor.initialize();
  }

  // Start automatic study tracking
  async startTracking(config?: {
    usePomodoro?: boolean;
    trackBrowser?: boolean;
    trackEyes?: boolean;
  }): Promise<void> {
    this.isTracking = true;

    // Create new session
    this.currentSession = {
      id: `study_${Date.now()}`,
      startTime: new Date(),
      duration: 0,
      focusScore: 1,
      subjects: [],
      breaks: [],
      distractions: [],
      productivity: 100,
      environment: 'quiet',
      autoDetected: true,
    };

    // Start focus monitoring
    this.startFocusMonitoring();

    // Start browser tracking if enabled
    if (config?.trackBrowser) {
      this.startBrowserTracking();
    }

    // Start eye tracking if enabled
    if (config?.trackEyes && this.eyeTracker) {
      this.eyeTracker.startTracking(this.onEyeData.bind(this));
    }

    // Start Pomodoro timer if enabled
    if (config?.usePomodoro) {
      this.startPomodoro();
    }

    // Start environment monitoring
    this.startEnvironmentMonitoring();
  }

  // Monitor focus using various signals
  private startFocusMonitoring(): void {
    if (!this.isTracking) return;

    const checkFocus = () => {
      if (!this.isTracking || !this.currentSession) return;

      // Calculate current focus score
      const focusScore = this.calculateFocusScore();
      this.focusHistory.push(focusScore);

      // Keep last 60 readings (1 minute)
      if (this.focusHistory.length > 60) {
        this.focusHistory.shift();
      }

      // Update session focus score (weighted average)
      this.currentSession.focusScore = this.calculateAverageFocus();

      // Check for distractions
      if (focusScore < 0.5) {
        this.detectDistraction();
      }

      // Update productivity score
      this.updateProductivityScore();

      // Continue monitoring
      setTimeout(checkFocus, 1000);
    };

    checkFocus();
  }

  // Calculate current focus score
  private calculateFocusScore(): number {
    let score = 1.0;

    // Check tab switching (if browser tracking enabled)
    const recentTabSwitches = this.tabHistory.filter(t => 
      Date.now() - t.timestamp.getTime() < 60000
    ).length;
    score *= Math.max(0.3, 1 - (recentTabSwitches * 0.1));

    // Check eye tracking (if available)
    if (this.eyeTracker) {
      const eyeFocus = this.eyeTracker.getFocusScore();
      score *= eyeFocus;
    }

    // Check audio environment
    if (this.audioMonitor) {
      const noiseLevel = this.audioMonitor.getNoiseLevel();
      if (noiseLevel > 70) score *= 0.7; // Noisy environment
      else if (noiseLevel > 50) score *= 0.9; // Moderate noise
    }

    // Check activity (mouse/keyboard)
    const timeSinceActivity = Date.now() - this.lastActivityTime.getTime();
    if (timeSinceActivity > 300000) { // 5 minutes inactive
      score *= 0.3;
    } else if (timeSinceActivity > 120000) { // 2 minutes inactive
      score *= 0.7;
    }

    return Math.max(0, Math.min(1, score));
  }

  // Calculate average focus score
  private calculateAverageFocus(): number {
    if (this.focusHistory.length === 0) return 1;
    
    // Weighted average (recent readings have more weight)
    let weightedSum = 0;
    let weightTotal = 0;
    
    this.focusHistory.forEach((score, index) => {
      const weight = (index + 1) / this.focusHistory.length;
      weightedSum += score * weight;
      weightTotal += weight;
    });

    return weightedSum / weightTotal;
  }

  // Detect and log distractions
  private detectDistraction(): void {
    if (!this.currentSession) return;

    const lastDistraction = this.currentSession.distractions[this.currentSession.distractions.length - 1];
    const now = new Date();

    // Don't log if already in distraction
    if (lastDistraction && now.getTime() - lastDistraction.timestamp.getTime() < 10000) {
      return;
    }

    // Determine distraction type
    let type: Distraction['type'] = 'other';
    
    if (this.tabHistory.length > 0 && 
        this.tabHistory[this.tabHistory.length - 1].url.includes('youtube.com')) {
      type = 'browser';
    } else if (this.audioMonitor && this.audioMonitor.getNoiseLevel() > 70) {
      type = 'noise';
    } else if (this.eyeTracker && this.eyeTracker.getFocusScore() < 0.5) {
      type = 'movement';
    }

    const distraction: Distraction = {
      timestamp: now,
      type,
      duration: 0, // Will be updated when focus returns
    };

    this.currentSession.distractions.push(distraction);
    this.onDistraction(distraction);
  }

  // Update productivity score
  private updateProductivityScore(): void {
    if (!this.currentSession) return;

    const sessionDuration = Date.now() - this.currentSession.startTime.getTime();
    const focusedTime = this.currentSession.focusScore * sessionDuration;
    const breakTime = this.currentSession.breaks.reduce((total, b) => 
      total + (b.endTime.getTime() - b.startTime.getTime()), 0
    );
    const distractionTime = this.currentSession.distractions.reduce((total, d) => 
      total + d.duration, 0
    );

    const productiveTime = focusedTime - distractionTime;
    const totalActiveTime = sessionDuration - breakTime;

    this.currentSession.productivity = totalActiveTime > 0 
      ? Math.round((productiveTime / totalActiveTime) * 100)
      : 100;
  }

  // Browser tracking
  private startBrowserTracking(): void {
    if (typeof chrome === 'undefined' || !chrome.tabs) {
      // Fallback: monitor page visibility
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.tabHistory.push({
            url: 'switched-away',
            title: 'Tab switched',
            timestamp: new Date(),
          });
        }
      });
      return;
    }

    // Chrome extension API (if available)
    chrome.tabs.onActivated.addListener((activeInfo) => {
      chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (tab.url && tab.title) {
          this.tabHistory.push({
            url: tab.url,
            title: tab.title,
            timestamp: new Date(),
          });
        }
      });
    });
  }

  // Environment monitoring
  private startEnvironmentMonitoring(): void {
    if (!this.audioMonitor) return;

    const checkEnvironment = () => {
      if (!this.isTracking || !this.currentSession) return;

      const noiseLevel = this.audioMonitor!.getNoiseLevel();
      
      if (noiseLevel < 40) {
        this.currentSession.environment = 'quiet';
      } else if (noiseLevel < 60) {
        this.currentSession.environment = 'moderate';
      } else {
        this.currentSession.environment = 'noisy';
      }

      setTimeout(checkEnvironment, 30000); // Check every 30 seconds
    };

    checkEnvironment();
  }

  // Pomodoro timer
  private startPomodoro(): void {
    this.pomodoroState.currentPomodoro = 1;
    this.pomodoroState.isBreak = false;
    this.pomodoroState.nextBreakTime = new Date(Date.now() + this.pomodoroConfig.focusTime);

    const checkPomodoro = () => {
      if (!this.isTracking) return;

      const now = new Date();
      
      if (this.pomodoroState.nextBreakTime && now >= this.pomodoroState.nextBreakTime) {
        if (this.pomodoroState.isBreak) {
          // End break, start focus
          this.endBreak();
          this.pomodoroState.isBreak = false;
          this.pomodoroState.currentPomodoro++;
          this.pomodoroState.nextBreakTime = new Date(now.getTime() + this.pomodoroConfig.focusTime);
          this.onPomodoroStart();
        } else {
          // Start break
          const isLongBreak = this.pomodoroState.currentPomodoro % this.pomodoroConfig.sessionsBeforeLongBreak === 0;
          const breakDuration = isLongBreak ? this.pomodoroConfig.longBreak : this.pomodoroConfig.shortBreak;
          
          this.startBreak(isLongBreak ? 'rest' : 'scheduled');
          this.pomodoroState.isBreak = true;
          this.pomodoroState.nextBreakTime = new Date(now.getTime() + breakDuration);
          this.onPomodoroBreak(isLongBreak);
        }
      }

      setTimeout(checkPomodoro, 1000);
    };

    checkPomodoro();
  }

  // Start a break
  private startBreak(type: Break['type']): void {
    if (!this.currentSession) return;

    const breakObj: Break = {
      startTime: new Date(),
      endTime: new Date(), // Will be updated
      type,
    };

    this.currentSession.breaks.push(breakObj);
  }

  // End current break
  private endBreak(): void {
    if (!this.currentSession || this.currentSession.breaks.length === 0) return;

    const currentBreak = this.currentSession.breaks[this.currentSession.breaks.length - 1];
    currentBreak.endTime = new Date();
  }

  // Eye tracking callback
  private onEyeData(data: { focusScore: number; lookingAway: boolean }): void {
    if (data.lookingAway) {
      this.lastActivityTime = new Date(Date.now() - 60000); // Simulate inactivity
    } else {
      this.lastActivityTime = new Date();
    }
  }

  // Activity monitoring
  registerActivity(): void {
    this.lastActivityTime = new Date();
  }

  // Callbacks
  private onDistraction(distraction: Distraction): void {
    window.dispatchEvent(new CustomEvent('studyDistraction', { detail: distraction }));
  }

  private onPomodoroStart(): void {
    window.dispatchEvent(new CustomEvent('pomodoroStart', { 
      detail: { session: this.pomodoroState.currentPomodoro } 
    }));
  }

  private onPomodoroBreak(isLong: boolean): void {
    window.dispatchEvent(new CustomEvent('pomodoroBreak', { 
      detail: { isLong, session: this.pomodoroState.currentPomodoro } 
    }));
  }

  // Complete study session
  completeSession(): StudySession | null {
    if (!this.currentSession) return null;

    this.currentSession.endTime = new Date();
    this.currentSession.duration = this.currentSession.endTime.getTime() - 
                                   this.currentSession.startTime.getTime();

    const session = { ...this.currentSession };
    this.sessionHistory.push(session);
    
    this.reset();
    return session;
  }

  // Reset tracker
  private reset(): void {
    this.currentSession = null;
    this.focusHistory = [];
    this.tabHistory = [];
    this.pomodoroState = {
      currentPomodoro: 0,
      isBreak: false,
      nextBreakTime: null,
    };
  }

  // Stop tracking
  stopTracking(): void {
    this.isTracking = false;
    
    if (this.eyeTracker) {
      this.eyeTracker.stopTracking();
    }
    
    if (this.audioMonitor) {
      this.audioMonitor.stop();
    }

    this.completeSession();
  }

  // Get current stats
  getCurrentStats(): {
    duration: number;
    focusScore: number;
    productivity: number;
    pomodoros: number;
    breaks: number;
    distractions: number;
  } | null {
    if (!this.currentSession) return null;

    return {
      duration: Date.now() - this.currentSession.startTime.getTime(),
      focusScore: this.currentSession.focusScore,
      productivity: this.currentSession.productivity,
      pomodoros: this.pomodoroState.currentPomodoro,
      breaks: this.currentSession.breaks.length,
      distractions: this.currentSession.distractions.length,
    };
  }

  // Get session history
  getSessionHistory(): StudySession[] {
    return this.sessionHistory;
  }
}

// Helper class for eye tracking
class EyeTracker {
  private isTracking: boolean = false;
  private focusScore: number = 1;

  async initialize(): Promise<void> {
    // In production, would initialize actual eye tracking
    // Using webgazer.js or similar
  }

  startTracking(callback: (data: any) => void): void {
    this.isTracking = true;
    // Simulate eye tracking
    setInterval(() => {
      if (!this.isTracking) return;
      
      // Random focus score for demo
      this.focusScore = Math.random() > 0.2 ? 0.9 : 0.3;
      callback({
        focusScore: this.focusScore,
        lookingAway: this.focusScore < 0.5,
      });
    }, 5000);
  }

  stopTracking(): void {
    this.isTracking = false;
  }

  getFocusScore(): number {
    return this.focusScore;
  }
}

// Helper class for audio monitoring
class AudioMonitor {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private noiseLevel: number = 30;

  async initialize(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.microphone = this.audioContext.createMediaStreamSource(stream);
      this.microphone.connect(this.analyser);
      
      this.analyser.fftSize = 256;
      this.startMonitoring();
    } catch (error) {
      console.error('Audio monitoring initialization failed:', error);
    }
  }

  private startMonitoring(): void {
    if (!this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const checkAudio = () => {
      if (!this.analyser) return;

      this.analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
      this.noiseLevel = average;

      requestAnimationFrame(checkAudio);
    };

    checkAudio();
  }

  getNoiseLevel(): number {
    return this.noiseLevel;
  }

  stop(): void {
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}