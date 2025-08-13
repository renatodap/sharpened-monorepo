// AI-powered workout tracking with automatic exercise detection
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@mediapipe/pose';

interface Exercise {
  name: string;
  reps: number;
  sets: number;
  weight?: number;
  duration?: number;
  restTime?: number;
  form: number; // 0-1 form quality score
}

interface WorkoutSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  exercises: Exercise[];
  totalVolume: number;
  caloriesBurned: number;
  averageHeartRate?: number;
  notes?: string;
  autoDetected: boolean;
}

export class WorkoutTracker {
  private detector: poseDetection.PoseDetector | null = null;
  private isTracking: boolean = false;
  private currentExercise: string | null = null;
  private repCount: number = 0;
  private setCount: number = 0;
  private exerciseHistory: Exercise[] = [];
  private poseHistory: any[] = [];
  private formAnalysis: { score: number; feedback: string[] } = { score: 1, feedback: [] };
  
  // Exercise detection patterns
  private exercisePatterns = {
    squat: {
      keyPoints: ['left_hip', 'left_knee', 'left_ankle', 'right_hip', 'right_knee', 'right_ankle'],
      angleThresholds: { knee: { min: 70, max: 170 }, hip: { min: 70, max: 170 } },
      repPattern: 'down-up',
    },
    pushup: {
      keyPoints: ['left_shoulder', 'left_elbow', 'left_wrist', 'right_shoulder', 'right_elbow', 'right_wrist'],
      angleThresholds: { elbow: { min: 60, max: 170 } },
      repPattern: 'down-up',
    },
    benchPress: {
      keyPoints: ['left_shoulder', 'left_elbow', 'left_wrist', 'right_shoulder', 'right_elbow', 'right_wrist'],
      angleThresholds: { elbow: { min: 80, max: 170 } },
      repPattern: 'down-up',
    },
    deadlift: {
      keyPoints: ['left_hip', 'left_knee', 'left_ankle', 'spine', 'left_shoulder'],
      angleThresholds: { hip: { min: 45, max: 170 }, knee: { min: 90, max: 170 } },
      repPattern: 'down-up',
    },
    bicepCurl: {
      keyPoints: ['left_shoulder', 'left_elbow', 'left_wrist', 'right_shoulder', 'right_elbow', 'right_wrist'],
      angleThresholds: { elbow: { min: 30, max: 160 } },
      repPattern: 'up-down',
    },
  };

  constructor() {
    this.initializeDetector();
  }

  // Initialize pose detection model
  private async initializeDetector(): Promise<void> {
    try {
      const detectorConfig: poseDetection.PoseDetectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        enableSmoothing: true,
        minPoseScore: 0.3,
      };

      this.detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        detectorConfig
      );
    } catch (error) {
      console.error('Failed to initialize pose detector:', error);
    }
  }

  // Start tracking workout from camera
  async startTracking(videoElement: HTMLVideoElement): Promise<void> {
    if (!this.detector) {
      await this.initializeDetector();
    }

    this.isTracking = true;
    this.trackPoses(videoElement);
  }

  // Main tracking loop
  private async trackPoses(videoElement: HTMLVideoElement): Promise<void> {
    if (!this.isTracking || !this.detector) return;

    try {
      const poses = await this.detector.estimatePoses(videoElement);
      
      if (poses.length > 0) {
        const pose = poses[0];
        this.analyzePose(pose);
        this.poseHistory.push({ pose, timestamp: Date.now() });
        
        // Keep only last 60 poses (2 seconds at 30fps)
        if (this.poseHistory.length > 60) {
          this.poseHistory.shift();
        }
      }
    } catch (error) {
      console.error('Pose tracking error:', error);
    }

    // Continue tracking
    if (this.isTracking) {
      requestAnimationFrame(() => this.trackPoses(videoElement));
    }
  }

  // Analyze pose to detect exercise and count reps
  private analyzePose(pose: poseDetection.Pose): void {
    // Detect current exercise type
    const detectedExercise = this.detectExercise(pose);
    
    if (detectedExercise && detectedExercise !== this.currentExercise) {
      // Exercise changed
      if (this.currentExercise) {
        this.completeExercise();
      }
      this.currentExercise = detectedExercise;
      this.repCount = 0;
      this.setCount = 1;
    }

    // Count reps for current exercise
    if (this.currentExercise) {
      const repDetected = this.detectRep(pose, this.currentExercise);
      if (repDetected) {
        this.repCount++;
        this.onRepCompleted();
      }

      // Analyze form
      this.formAnalysis = this.analyzeForm(pose, this.currentExercise);
    }
  }

  // Detect exercise type from pose
  private detectExercise(pose: poseDetection.Pose): string | null {
    let bestMatch: { exercise: string; confidence: number } | null = null;

    for (const [exercise, pattern] of Object.entries(this.exercisePatterns)) {
      const confidence = this.calculateExerciseConfidence(pose, pattern);
      
      if (confidence > 0.7 && (!bestMatch || confidence > bestMatch.confidence)) {
        bestMatch = { exercise, confidence };
      }
    }

    return bestMatch?.exercise || null;
  }

  // Calculate confidence for exercise match
  private calculateExerciseConfidence(pose: poseDetection.Pose, pattern: any): number {
    let totalScore = 0;
    let validPoints = 0;

    for (const pointName of pattern.keyPoints) {
      const keypoint = pose.keypoints.find(kp => kp.name === pointName);
      if (keypoint && keypoint.score && keypoint.score > 0.3) {
        totalScore += keypoint.score;
        validPoints++;
      }
    }

    if (validPoints === 0) return 0;
    
    const avgScore = totalScore / validPoints;
    const coverage = validPoints / pattern.keyPoints.length;
    
    return avgScore * coverage;
  }

  // Detect rep completion
  private detectRep(pose: poseDetection.Pose, exercise: string): boolean {
    if (this.poseHistory.length < 30) return false;

    const pattern = this.exercisePatterns[exercise as keyof typeof this.exercisePatterns];
    if (!pattern) return false;

    // Analyze joint angles over time
    const recentPoses = this.poseHistory.slice(-30);
    const angles = recentPoses.map(ph => this.calculateAngles(ph.pose, pattern));

    // Simple rep detection: look for angle crossing threshold
    // In production, this would be more sophisticated
    const currentAngle = angles[angles.length - 1];
    const prevAngle = angles[angles.length - 2];

    if (!currentAngle || !prevAngle) return false;

    // Detect based on primary joint angle
    const primaryJoint = Object.keys(pattern.angleThresholds)[0];
    const threshold = pattern.angleThresholds[primaryJoint];

    if (pattern.repPattern === 'down-up') {
      // Check if went down then up
      return prevAngle[primaryJoint] < threshold.min + 20 && 
             currentAngle[primaryJoint] > threshold.max - 20;
    } else {
      // Check if went up then down
      return prevAngle[primaryJoint] > threshold.max - 20 && 
             currentAngle[primaryJoint] < threshold.min + 20;
    }
  }

  // Calculate joint angles from pose
  private calculateAngles(pose: poseDetection.Pose, pattern: any): Record<string, number> {
    const angles: Record<string, number> = {};

    // Calculate knee angle for squats
    if (pattern.angleThresholds.knee) {
      const leftHip = pose.keypoints.find(kp => kp.name === 'left_hip');
      const leftKnee = pose.keypoints.find(kp => kp.name === 'left_knee');
      const leftAnkle = pose.keypoints.find(kp => kp.name === 'left_ankle');

      if (leftHip && leftKnee && leftAnkle) {
        angles.knee = this.calculateAngle(
          leftHip,
          leftKnee,
          leftAnkle
        );
      }
    }

    // Calculate elbow angle for upper body
    if (pattern.angleThresholds.elbow) {
      const leftShoulder = pose.keypoints.find(kp => kp.name === 'left_shoulder');
      const leftElbow = pose.keypoints.find(kp => kp.name === 'left_elbow');
      const leftWrist = pose.keypoints.find(kp => kp.name === 'left_wrist');

      if (leftShoulder && leftElbow && leftWrist) {
        angles.elbow = this.calculateAngle(
          leftShoulder,
          leftElbow,
          leftWrist
        );
      }
    }

    return angles;
  }

  // Calculate angle between three points
  private calculateAngle(p1: any, p2: any, p3: any): number {
    const rad = Math.atan2(p3.y - p2.y, p3.x - p2.x) - 
                Math.atan2(p1.y - p2.y, p1.x - p2.x);
    let deg = Math.abs(rad * 180 / Math.PI);
    
    if (deg > 180) {
      deg = 360 - deg;
    }
    
    return deg;
  }

  // Analyze exercise form
  private analyzeForm(pose: poseDetection.Pose, exercise: string): { score: number; feedback: string[] } {
    const feedback: string[] = [];
    let score = 1.0;

    // Check spine alignment for squats and deadlifts
    if (exercise === 'squat' || exercise === 'deadlift') {
      const spineAlignment = this.checkSpineAlignment(pose);
      if (spineAlignment < 0.8) {
        feedback.push('Keep your back straight');
        score *= spineAlignment;
      }
    }

    // Check depth for squats
    if (exercise === 'squat') {
      const depth = this.checkSquatDepth(pose);
      if (depth < 0.7) {
        feedback.push('Go deeper on your squats');
        score *= 0.8;
      }
    }

    // Check elbow position for bench press
    if (exercise === 'benchPress' || exercise === 'pushup') {
      const elbowPosition = this.checkElbowPosition(pose);
      if (elbowPosition < 0.8) {
        feedback.push('Keep elbows at 45-degree angle');
        score *= 0.9;
      }
    }

    return { score, feedback };
  }

  // Form check helpers
  private checkSpineAlignment(pose: poseDetection.Pose): number {
    // Simplified spine check - in production would be more sophisticated
    const neck = pose.keypoints.find(kp => kp.name === 'nose');
    const hip = pose.keypoints.find(kp => kp.name === 'left_hip');
    
    if (!neck || !hip) return 1;
    
    // Check if spine is relatively straight (simplified)
    return neck.score || 0 * (hip.score || 0);
  }

  private checkSquatDepth(pose: poseDetection.Pose): number {
    const hip = pose.keypoints.find(kp => kp.name === 'left_hip');
    const knee = pose.keypoints.find(kp => kp.name === 'left_knee');
    
    if (!hip || !knee) return 1;
    
    // Check if hips are below knees (proper depth)
    return hip.y > knee.y ? 1 : 0.5;
  }

  private checkElbowPosition(pose: poseDetection.Pose): number {
    const shoulder = pose.keypoints.find(kp => kp.name === 'left_shoulder');
    const elbow = pose.keypoints.find(kp => kp.name === 'left_elbow');
    
    if (!shoulder || !elbow) return 1;
    
    // Check elbow position relative to shoulder
    const angle = Math.abs(Math.atan2(elbow.y - shoulder.y, elbow.x - shoulder.x) * 180 / Math.PI);
    return angle > 30 && angle < 60 ? 1 : 0.7;
  }

  // Complete current exercise
  private completeExercise(): void {
    if (!this.currentExercise || this.repCount === 0) return;

    const exercise: Exercise = {
      name: this.currentExercise,
      reps: this.repCount,
      sets: this.setCount,
      form: this.formAnalysis.score,
    };

    this.exerciseHistory.push(exercise);
    this.onExerciseCompleted(exercise);
  }

  // Callbacks
  private onRepCompleted(): void {
    console.log(`Rep ${this.repCount} completed!`);
    window.dispatchEvent(new CustomEvent('repCompleted', { 
      detail: { 
        exercise: this.currentExercise, 
        rep: this.repCount,
        form: this.formAnalysis 
      } 
    }));

    // Provide form feedback
    if (this.formAnalysis.feedback.length > 0) {
      window.dispatchEvent(new CustomEvent('formFeedback', { 
        detail: this.formAnalysis.feedback 
      }));
    }
  }

  private onExerciseCompleted(exercise: Exercise): void {
    console.log('Exercise completed:', exercise);
    window.dispatchEvent(new CustomEvent('exerciseCompleted', { detail: exercise }));
  }

  // Manual controls
  incrementSet(): void {
    this.setCount++;
    this.repCount = 0;
  }

  completeWorkout(): WorkoutSession {
    if (this.currentExercise) {
      this.completeExercise();
    }

    const session: WorkoutSession = {
      id: `workout_${Date.now()}`,
      startTime: new Date(Date.now() - this.poseHistory.length * 33), // Approximate
      endTime: new Date(),
      exercises: this.exerciseHistory,
      totalVolume: this.calculateTotalVolume(),
      caloriesBurned: this.estimateCaloriesBurned(),
      autoDetected: true,
    };

    this.reset();
    return session;
  }

  // Calculate total volume lifted
  private calculateTotalVolume(): number {
    return this.exerciseHistory.reduce((total, exercise) => {
      const weight = exercise.weight || 0; // Bodyweight exercises = 0
      return total + (weight * exercise.reps * exercise.sets);
    }, 0);
  }

  // Estimate calories burned
  private estimateCaloriesBurned(): number {
    // Simplified calculation - would use MET values in production
    const totalReps = this.exerciseHistory.reduce((total, ex) => 
      total + (ex.reps * ex.sets), 0
    );
    
    return Math.round(totalReps * 2.5); // ~2.5 calories per rep average
  }

  // Reset tracker
  private reset(): void {
    this.currentExercise = null;
    this.repCount = 0;
    this.setCount = 0;
    this.exerciseHistory = [];
    this.poseHistory = [];
    this.formAnalysis = { score: 1, feedback: [] };
  }

  // Stop tracking
  stopTracking(): void {
    this.isTracking = false;
  }

  // Get current stats
  getCurrentStats(): {
    exercise: string | null;
    reps: number;
    sets: number;
    form: number;
    feedback: string[];
  } {
    return {
      exercise: this.currentExercise,
      reps: this.repCount,
      sets: this.setCount,
      form: this.formAnalysis.score,
      feedback: this.formAnalysis.feedback,
    };
  }
}