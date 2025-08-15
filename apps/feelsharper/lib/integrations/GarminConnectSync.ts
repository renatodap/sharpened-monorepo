/**
 * GarminConnectSync - Garmin Connect integration for fitness data
 * Maps to PRD: Wearables Integration (Garmin)
 */

export interface GarminAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
}

export interface GarminActivity {
  activityId: number;
  activityName: string;
  activityType: GarminActivityType;
  startTimeLocal: Date;
  startTimeGMT: Date;
  duration: number; // seconds
  distance?: number; // meters
  calories?: number;
  averageHR?: number;
  maxHR?: number;
  aerobicTrainingEffect?: number;
  anaerobicTrainingEffect?: number;
  averageSpeed?: number; // m/s
  maxSpeed?: number;
  elevationGain?: number; // meters
  elevationLoss?: number;
  averageCadence?: number;
  maxCadence?: number;
  strokes?: number;
  poolLength?: number;
  deviceName?: string;
  gear?: string;
}

export interface GarminActivityType {
  typeId: number;
  typeKey: string;
  parentTypeId?: number;
  isMultiSportParent?: boolean;
}

export interface GarminHeartRateData {
  timestamp: Date;
  restingHeartRate?: number;
  minHeartRate?: number;
  maxHeartRate?: number;
  heartRateValues?: Array<{
    timestamp: Date;
    value: number;
  }>;
  heartRateVariability?: number;
}

export interface GarminSleepData {
  summaryId: string;
  calendarDate: Date;
  startTimeGMT: Date;
  endTimeGMT: Date;
  durationInSeconds: number;
  unmeasurableSleepInSeconds?: number;
  deepSleepDurationInSeconds?: number;
  lightSleepDurationInSeconds?: number;
  remSleepDurationInSeconds?: number;
  awakeDurationInSeconds?: number;
  sleepLevels?: Array<{
    startTimeGMT: Date;
    endTimeGMT: Date;
    activityLevel: number;
  }>;
  restlessMomentsCount?: number;
  averageSpO2?: number;
  lowestSpO2?: number;
  highestSpO2?: number;
  averageRespiration?: number;
  lowestRespiration?: number;
  highestRespiration?: number;
}

export interface GarminStressData {
  summaryId: string;
  calendarDate: Date;
  startTimeGMT: Date;
  endTimeGMT: Date;
  maxStressLevel?: number;
  avgStressLevel?: number;
  stressValueDescriptorsDTOList?: Array<{
    key: string;
    value: number;
  }>;
  bodyBatteryValueDescriptorsDTOList?: Array<{
    key: string;
    value: number;
  }>;
}

export interface GarminBodyComposition {
  summaryId: string;
  measurementTimeGMT: Date;
  measurementTimeLocal: Date;
  weight?: number; // kg
  bodyFatPercentage?: number;
  bodyWater?: number;
  boneMass?: number; // kg
  muscleMass?: number; // kg
  physiqueRating?: number;
  visceralFatRating?: number;
  metabolicAge?: number;
  bodyMassIndex?: number;
}

export class GarminConnectSync {
  private static instance: GarminConnectSync;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private config: GarminAuthConfig;
  private baseUrl = 'https://connect.garmin.com/modern/proxy';
  private oauthUrl = 'https://connect.garmin.com/oauthConfirm';

  private constructor() {
    this.config = {
      clientId: process.env.NEXT_PUBLIC_GARMIN_CLIENT_ID || '',
      clientSecret: process.env.NEXT_PUBLIC_GARMIN_CLIENT_SECRET || '',
      redirectUri: process.env.NEXT_PUBLIC_GARMIN_REDIRECT_URI || 'http://localhost:3000/auth/garmin',
      scope: ['activity_read', 'health_read', 'sleep_read', 'body_composition_read']
    };
    this.loadTokens();
  }

  static getInstance(): GarminConnectSync {
    if (!GarminConnectSync.instance) {
      GarminConnectSync.instance = new GarminConnectSync();
    }
    return GarminConnectSync.instance;
  }

  /**
   * Initiate OAuth2 flow
   */
  getAuthorizationUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      redirect_uri: this.config.redirectUri,
      scope: this.config.scope.join(' '),
      state: this.generateState()
    });

    return `${this.oauthUrl}?${params.toString()}`;
  }

  /**
   * Handle OAuth callback and exchange code for tokens
   */
  async handleCallback(code: string): Promise<boolean> {
    try {
      const response = await fetch('https://connect.garmin.com/oauth-service/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.config.clientId}:${this.config.clientSecret}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.config.redirectUri
        })
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for tokens');
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token;
      this.tokenExpiry = new Date(Date.now() + data.expires_in * 1000);
      
      this.saveTokens();
      return true;
    } catch (error) {
      console.error('OAuth callback error:', error);
      return false;
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch('https://connect.garmin.com/oauth-service/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.config.clientId}:${this.config.clientSecret}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken
        })
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = new Date(Date.now() + data.expires_in * 1000);
      
      if (data.refresh_token) {
        this.refreshToken = data.refresh_token;
      }
      
      this.saveTokens();
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return !!(this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date());
  }

  /**
   * Sync all Garmin data
   */
  async syncAll(startDate?: Date, endDate?: Date): Promise<{
    activities: number;
    sleep: number;
    stress: number;
    body: number;
  }> {
    if (!await this.ensureAuthenticated()) {
      throw new Error('Not authenticated with Garmin Connect');
    }

    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    const results = {
      activities: 0,
      sleep: 0,
      stress: 0,
      body: 0
    };

    // Sync activities
    const activities = await this.getActivities(start, end);
    for (const activity of activities) {
      await this.saveActivityToDatabase(activity);
      results.activities++;
    }

    // Sync sleep data
    const sleepData = await this.getSleepData(start, end);
    for (const sleep of sleepData) {
      await this.saveSleepToDatabase(sleep);
      results.sleep++;
    }

    // Sync stress data
    const stressData = await this.getStressData(start, end);
    for (const stress of stressData) {
      await this.saveStressToDatabase(stress);
      results.stress++;
    }

    // Sync body composition
    const bodyData = await this.getBodyComposition(start, end);
    for (const body of bodyData) {
      await this.saveBodyCompositionToDatabase(body);
      results.body++;
    }

    return results;
  }

  /**
   * Get activities from Garmin
   */
  async getActivities(startDate: Date, endDate: Date): Promise<GarminActivity[]> {
    if (!await this.ensureAuthenticated()) return [];

    try {
      const response = await this.makeRequest(
        `/activitylist-service/activities/search/activities`,
        {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          limit: 100
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }

      const data = await response.json();
      return data.map((activity: any) => this.mapActivity(activity));
    } catch (error) {
      console.error('Error fetching activities:', error);
      return [];
    }
  }

  /**
   * Get activity details
   */
  async getActivityDetails(activityId: number): Promise<any> {
    if (!await this.ensureAuthenticated()) return null;

    try {
      const response = await this.makeRequest(
        `/activity-service/activity/${activityId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch activity details');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching activity details:', error);
      return null;
    }
  }

  /**
   * Get heart rate data
   */
  async getHeartRateData(date: Date): Promise<GarminHeartRateData | null> {
    if (!await this.ensureAuthenticated()) return null;

    try {
      const dateStr = date.toISOString().split('T')[0];
      const response = await this.makeRequest(
        `/wellness-service/wellness/dailyHeartRate/${dateStr}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch heart rate data');
      }

      const data = await response.json();
      return this.mapHeartRateData(data);
    } catch (error) {
      console.error('Error fetching heart rate data:', error);
      return null;
    }
  }

  /**
   * Get sleep data
   */
  async getSleepData(startDate: Date, endDate: Date): Promise<GarminSleepData[]> {
    if (!await this.ensureAuthenticated()) return [];

    try {
      const response = await this.makeRequest(
        `/wellness-service/wellness/dailySleepData`,
        {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch sleep data');
      }

      const data = await response.json();
      return data.map((sleep: any) => this.mapSleepData(sleep));
    } catch (error) {
      console.error('Error fetching sleep data:', error);
      return [];
    }
  }

  /**
   * Get stress data
   */
  async getStressData(startDate: Date, endDate: Date): Promise<GarminStressData[]> {
    if (!await this.ensureAuthenticated()) return [];

    try {
      const response = await this.makeRequest(
        `/wellness-service/wellness/dailyStress`,
        {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch stress data');
      }

      const data = await response.json();
      return data.map((stress: any) => this.mapStressData(stress));
    } catch (error) {
      console.error('Error fetching stress data:', error);
      return [];
    }
  }

  /**
   * Get body composition data
   */
  async getBodyComposition(startDate: Date, endDate: Date): Promise<GarminBodyComposition[]> {
    if (!await this.ensureAuthenticated()) return [];

    try {
      const response = await this.makeRequest(
        `/weight-service/weight/dateRange`,
        {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch body composition');
      }

      const data = await response.json();
      return data.map((body: any) => this.mapBodyComposition(body));
    } catch (error) {
      console.error('Error fetching body composition:', error);
      return [];
    }
  }

  /**
   * Private helper methods
   */
  private async ensureAuthenticated(): Promise<boolean> {
    if (this.isAuthenticated()) return true;
    
    if (this.refreshToken) {
      return await this.refreshAccessToken();
    }
    
    return false;
  }

  private async makeRequest(endpoint: string, params?: Record<string, any>): Promise<Response> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    return fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/json'
      }
    });
  }

  private mapActivity(data: any): GarminActivity {
    return {
      activityId: data.activityId,
      activityName: data.activityName,
      activityType: {
        typeId: data.activityType?.typeId,
        typeKey: data.activityType?.typeKey,
        parentTypeId: data.activityType?.parentTypeId,
        isMultiSportParent: data.activityType?.isMultiSportParent
      },
      startTimeLocal: new Date(data.startTimeLocal),
      startTimeGMT: new Date(data.startTimeGMT),
      duration: data.duration,
      distance: data.distance,
      calories: data.calories,
      averageHR: data.averageHR,
      maxHR: data.maxHR,
      aerobicTrainingEffect: data.aerobicTrainingEffect,
      anaerobicTrainingEffect: data.anaerobicTrainingEffect,
      averageSpeed: data.averageSpeed,
      maxSpeed: data.maxSpeed,
      elevationGain: data.elevationGain,
      elevationLoss: data.elevationLoss,
      averageCadence: data.averageCadence,
      maxCadence: data.maxCadence,
      strokes: data.strokes,
      poolLength: data.poolLength,
      deviceName: data.deviceName,
      gear: data.gear
    };
  }

  private mapHeartRateData(data: any): GarminHeartRateData {
    return {
      timestamp: new Date(data.calendarDate),
      restingHeartRate: data.restingHeartRate,
      minHeartRate: data.minHeartRate,
      maxHeartRate: data.maxHeartRate,
      heartRateValues: data.heartRateValues?.map((hr: any) => ({
        timestamp: new Date(hr.timestamp),
        value: hr.value
      })),
      heartRateVariability: data.hrv
    };
  }

  private mapSleepData(data: any): GarminSleepData {
    return {
      summaryId: data.summaryId,
      calendarDate: new Date(data.calendarDate),
      startTimeGMT: new Date(data.startTimeGMT),
      endTimeGMT: new Date(data.endTimeGMT),
      durationInSeconds: data.durationInSeconds,
      unmeasurableSleepInSeconds: data.unmeasurableSleepInSeconds,
      deepSleepDurationInSeconds: data.deepSleepDurationInSeconds,
      lightSleepDurationInSeconds: data.lightSleepDurationInSeconds,
      remSleepDurationInSeconds: data.remSleepInSeconds,
      awakeDurationInSeconds: data.awakeDurationInSeconds,
      sleepLevels: data.sleepLevels?.map((level: any) => ({
        startTimeGMT: new Date(level.startTimeGMT),
        endTimeGMT: new Date(level.endTimeGMT),
        activityLevel: level.activityLevel
      })),
      restlessMomentsCount: data.restlessMomentsCount,
      averageSpO2: data.averageSpO2,
      lowestSpO2: data.lowestSpO2,
      highestSpO2: data.highestSpO2,
      averageRespiration: data.averageRespiration,
      lowestRespiration: data.lowestRespiration,
      highestRespiration: data.highestRespiration
    };
  }

  private mapStressData(data: any): GarminStressData {
    return {
      summaryId: data.summaryId,
      calendarDate: new Date(data.calendarDate),
      startTimeGMT: new Date(data.startTimeGMT),
      endTimeGMT: new Date(data.endTimeGMT),
      maxStressLevel: data.maxStressLevel,
      avgStressLevel: data.avgStressLevel,
      stressValueDescriptorsDTOList: data.stressValueDescriptorsDTOList,
      bodyBatteryValueDescriptorsDTOList: data.bodyBatteryValueDescriptorsDTOList
    };
  }

  private mapBodyComposition(data: any): GarminBodyComposition {
    return {
      summaryId: data.summaryId,
      measurementTimeGMT: new Date(data.measurementTimeGMT),
      measurementTimeLocal: new Date(data.measurementTimeLocal),
      weight: data.weight / 1000, // Convert grams to kg
      bodyFatPercentage: data.bodyFatPercentage,
      bodyWater: data.bodyWater,
      boneMass: data.boneMass / 1000,
      muscleMass: data.muscleMass / 1000,
      physiqueRating: data.physiqueRating,
      visceralFatRating: data.visceralFatRating,
      metabolicAge: data.metabolicAge,
      bodyMassIndex: data.bmi
    };
  }

  private async saveActivityToDatabase(activity: GarminActivity): Promise<void> {
    console.log('Saving Garmin activity:', activity);
    // Save to Supabase
  }

  private async saveSleepToDatabase(sleep: GarminSleepData): Promise<void> {
    console.log('Saving Garmin sleep data:', sleep);
  }

  private async saveStressToDatabase(stress: GarminStressData): Promise<void> {
    console.log('Saving Garmin stress data:', stress);
  }

  private async saveBodyCompositionToDatabase(body: GarminBodyComposition): Promise<void> {
    console.log('Saving Garmin body composition:', body);
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private saveTokens(): void {
    if (this.accessToken) {
      localStorage.setItem('garmin_access_token', this.accessToken);
    }
    if (this.refreshToken) {
      localStorage.setItem('garmin_refresh_token', this.refreshToken);
    }
    if (this.tokenExpiry) {
      localStorage.setItem('garmin_token_expiry', this.tokenExpiry.toISOString());
    }
  }

  private loadTokens(): void {
    this.accessToken = localStorage.getItem('garmin_access_token');
    this.refreshToken = localStorage.getItem('garmin_refresh_token');
    const expiry = localStorage.getItem('garmin_token_expiry');
    if (expiry) {
      this.tokenExpiry = new Date(expiry);
    }
  }

  /**
   * Disconnect from Garmin
   */
  disconnect(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    localStorage.removeItem('garmin_access_token');
    localStorage.removeItem('garmin_refresh_token');
    localStorage.removeItem('garmin_token_expiry');
  }
}

// Export singleton instance
export const garminSync = GarminConnectSync.getInstance();