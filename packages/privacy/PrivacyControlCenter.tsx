// Privacy Control Center - Full Transparency and User Control
// Based on GPT_DEEP_RESEARCH_02: Clear privacy controls, data transparency
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Switch } from '@/components/ui/Switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Database,
  Download,
  Trash2,
  Settings,
  Info,
  CheckCircle,
  AlertCircle,
  Users,
  Globe,
  FileText,
  Activity,
  Camera,
  Mic,
  Monitor,
  Keyboard,
  MousePointer,
  Clock,
  Cloud,
  HardDrive,
  Share2,
  UserX,
  Key,
  RefreshCw
} from 'lucide-react';

interface PrivacySettings {
  // Data Collection
  collectAnalytics: boolean;
  collectCrashReports: boolean;
  collectUsagePatterns: boolean;
  
  // Focus Tracking
  trackTabVisibility: boolean;
  trackIdleTime: boolean;
  trackKeyboardMouse: boolean; // Only counts, not content
  trackApplications: boolean;
  
  // Photo/Media
  processPhotosLocally: boolean;
  sendPhotosForVerification: boolean;
  autoDeletePhotos: boolean;
  photoRetentionDays: number;
  
  // Sharing
  shareProgressPublicly: boolean;
  shareWithLeague: boolean;
  anonymousLeaderboard: boolean;
  
  // Storage
  localStorageOnly: boolean;
  encryptLocalData: boolean;
  autoBackup: boolean;
  
  // Account
  twoFactorAuth: boolean;
  sessionTimeout: number; // minutes
  requireReauthForChanges: boolean;
}

interface DataUsage {
  category: string;
  description: string;
  amount: string;
  lastAccessed: Date;
  purpose: string;
  canDelete: boolean;
}

interface DataExport {
  workouts: boolean;
  meals: boolean;
  weight: boolean;
  focusSessions: boolean;
  achievements: boolean;
  settings: boolean;
}

export function PrivacyControlCenter() {
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    collectAnalytics: true,
    collectCrashReports: true,
    collectUsagePatterns: false,
    trackTabVisibility: true,
    trackIdleTime: true,
    trackKeyboardMouse: false,
    trackApplications: true,
    processPhotosLocally: true,
    sendPhotosForVerification: false,
    autoDeletePhotos: true,
    photoRetentionDays: 7,
    shareProgressPublicly: false,
    shareWithLeague: true,
    anonymousLeaderboard: false,
    localStorageOnly: false,
    encryptLocalData: true,
    autoBackup: true,
    twoFactorAuth: false,
    sessionTimeout: 30,
    requireReauthForChanges: true,
  });

  const [dataUsage] = useState<DataUsage[]>([
    {
      category: 'Workout Logs',
      description: 'Exercise data, sets, reps, duration',
      amount: '2.3 MB',
      lastAccessed: new Date(Date.now() - 3600000),
      purpose: 'Track fitness progress, generate insights',
      canDelete: true,
    },
    {
      category: 'Meal Photos',
      description: 'Food images for AI processing',
      amount: '145 MB',
      lastAccessed: new Date(Date.now() - 86400000),
      purpose: 'Nutrition tracking, calorie estimation',
      canDelete: true,
    },
    {
      category: 'Focus Sessions',
      description: 'Study time, applications used',
      amount: '0.8 MB',
      lastAccessed: new Date(),
      purpose: 'Productivity tracking, league competitions',
      canDelete: true,
    },
    {
      category: 'Account Info',
      description: 'Email, preferences, settings',
      amount: '0.1 MB',
      lastAccessed: new Date(),
      purpose: 'Account management, authentication',
      canDelete: false,
    },
  ]);

  const [dataExportOptions, setDataExportOptions] = useState<DataExport>({
    workouts: true,
    meals: true,
    weight: true,
    focusSessions: true,
    achievements: true,
    settings: true,
  });

  const [activeTab, setActiveTab] = useState('collection');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Privacy score calculation
  const calculatePrivacyScore = (): number => {
    let score = 100;
    
    // Deduct points for data collection
    if (privacySettings.collectAnalytics) score -= 5;
    if (privacySettings.collectUsagePatterns) score -= 10;
    if (privacySettings.trackKeyboardMouse) score -= 15;
    if (privacySettings.sendPhotosForVerification) score -= 10;
    if (privacySettings.shareProgressPublicly) score -= 15;
    if (!privacySettings.localStorageOnly) score -= 10;
    if (!privacySettings.encryptLocalData) score -= 10;
    if (!privacySettings.twoFactorAuth) score -= 5;
    
    // Add points for privacy features
    if (privacySettings.processPhotosLocally) score += 5;
    if (privacySettings.autoDeletePhotos) score += 5;
    if (privacySettings.anonymousLeaderboard) score += 5;
    
    return Math.max(0, Math.min(100, score));
  };

  const privacyScore = calculatePrivacyScore();

  // Get privacy level label
  const getPrivacyLevel = () => {
    if (privacyScore >= 80) return { label: 'Maximum Privacy', color: 'green' };
    if (privacyScore >= 60) return { label: 'High Privacy', color: 'blue' };
    if (privacyScore >= 40) return { label: 'Moderate Privacy', color: 'yellow' };
    return { label: 'Basic Privacy', color: 'red' };
  };

  const privacyLevel = getPrivacyLevel();

  // Export user data
  const exportData = () => {
    console.log('Exporting data:', dataExportOptions);
    // In production, would generate and download a ZIP file
    alert('Your data export is being prepared. You will receive an email with the download link.');
  };

  // Delete all user data
  const deleteAllData = () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    console.log('Deleting all user data...');
    // In production, would initiate account deletion process
    alert('Account deletion initiated. You will receive a confirmation email.');
  };

  return (
    <div className="space-y-4">
      {/* Privacy Score Overview */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy Control Center
            </CardTitle>
            <Badge 
              variant={privacyScore >= 60 ? 'default' : 'destructive'}
              className="text-lg px-3 py-1"
            >
              {privacyScore}/100
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold flex items-center gap-2">
                {privacyLevel.label}
                <Badge variant="outline" className={`
                  ${privacyLevel.color === 'green' ? 'text-green-600 border-green-600' : ''}
                  ${privacyLevel.color === 'blue' ? 'text-blue-600 border-blue-600' : ''}
                  ${privacyLevel.color === 'yellow' ? 'text-yellow-600 border-yellow-600' : ''}
                  ${privacyLevel.color === 'red' ? 'text-red-600 border-red-600' : ''}
                `}>
                  {privacyLevel.color.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Your data is {privacySettings.localStorageOnly ? 'stored locally only' : 'synced to secure servers'}
                {privacySettings.encryptLocalData && ' with encryption'}.
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Info className="h-4 w-4 mr-2" />
              Privacy Policy
            </Button>
          </div>

          {/* Quick Privacy Presets */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPrivacySettings({
                ...privacySettings,
                collectAnalytics: false,
                collectUsagePatterns: false,
                trackKeyboardMouse: false,
                sendPhotosForVerification: false,
                shareProgressPublicly: false,
                localStorageOnly: true,
              })}
            >
              <Lock className="h-4 w-4 mr-2" />
              Maximum
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPrivacySettings({
                ...privacySettings,
                collectAnalytics: true,
                collectUsagePatterns: false,
                trackKeyboardMouse: false,
                sendPhotosForVerification: false,
                shareProgressPublicly: false,
                localStorageOnly: false,
              })}
            >
              <Shield className="h-4 w-4 mr-2" />
              Balanced
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPrivacySettings({
                ...privacySettings,
                collectAnalytics: true,
                collectUsagePatterns: true,
                trackKeyboardMouse: true,
                sendPhotosForVerification: true,
                shareProgressPublicly: true,
                localStorageOnly: false,
              })}
            >
              <Users className="h-4 w-4 mr-2" />
              Social
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Privacy Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="collection">Collection</TabsTrigger>
              <TabsTrigger value="tracking">Tracking</TabsTrigger>
              <TabsTrigger value="sharing">Sharing</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="collection" className="space-y-3 mt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-sm">Usage Analytics</div>
                      <div className="text-xs text-muted-foreground">Help improve the app with anonymous data</div>
                    </div>
                  </div>
                  <Switch
                    checked={privacySettings.collectAnalytics}
                    onCheckedChange={(checked) => 
                      setPrivacySettings({ ...privacySettings, collectAnalytics: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-sm">Crash Reports</div>
                      <div className="text-xs text-muted-foreground">Send error reports to fix bugs</div>
                    </div>
                  </div>
                  <Switch
                    checked={privacySettings.collectCrashReports}
                    onCheckedChange={(checked) => 
                      setPrivacySettings({ ...privacySettings, collectCrashReports: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Camera className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-sm">Process Photos Locally</div>
                      <div className="text-xs text-muted-foreground">AI processes photos on your device</div>
                    </div>
                  </div>
                  <Switch
                    checked={privacySettings.processPhotosLocally}
                    onCheckedChange={(checked) => 
                      setPrivacySettings({ ...privacySettings, processPhotosLocally: checked })
                    }
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tracking" className="space-y-3 mt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-sm">Tab Visibility</div>
                      <div className="text-xs text-muted-foreground">Track when focus tab is active</div>
                    </div>
                  </div>
                  <Switch
                    checked={privacySettings.trackTabVisibility}
                    onCheckedChange={(checked) => 
                      setPrivacySettings({ ...privacySettings, trackTabVisibility: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-sm">Idle Detection</div>
                      <div className="text-xs text-muted-foreground">Detect when you're away from computer</div>
                    </div>
                  </div>
                  <Switch
                    checked={privacySettings.trackIdleTime}
                    onCheckedChange={(checked) => 
                      setPrivacySettings({ ...privacySettings, trackIdleTime: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Keyboard className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-sm">Activity Detection</div>
                      <div className="text-xs text-muted-foreground">Count keyboard/mouse activity (not content)</div>
                    </div>
                  </div>
                  <Switch
                    checked={privacySettings.trackKeyboardMouse}
                    onCheckedChange={(checked) => 
                      setPrivacySettings({ ...privacySettings, trackKeyboardMouse: checked })
                    }
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sharing" className="space-y-3 mt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-sm">Public Profile</div>
                      <div className="text-xs text-muted-foreground">Share progress publicly</div>
                    </div>
                  </div>
                  <Switch
                    checked={privacySettings.shareProgressPublicly}
                    onCheckedChange={(checked) => 
                      setPrivacySettings({ ...privacySettings, shareProgressPublicly: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-sm">League Sharing</div>
                      <div className="text-xs text-muted-foreground">Share with your league members</div>
                    </div>
                  </div>
                  <Switch
                    checked={privacySettings.shareWithLeague}
                    onCheckedChange={(checked) => 
                      setPrivacySettings({ ...privacySettings, shareWithLeague: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <UserX className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-sm">Anonymous Mode</div>
                      <div className="text-xs text-muted-foreground">Hide username in leaderboards</div>
                    </div>
                  </div>
                  <Switch
                    checked={privacySettings.anonymousLeaderboard}
                    onCheckedChange={(checked) => 
                      setPrivacySettings({ ...privacySettings, anonymousLeaderboard: checked })
                    }
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-3 mt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-sm">Two-Factor Auth</div>
                      <div className="text-xs text-muted-foreground">Extra security for your account</div>
                    </div>
                  </div>
                  <Switch
                    checked={privacySettings.twoFactorAuth}
                    onCheckedChange={(checked) => 
                      setPrivacySettings({ ...privacySettings, twoFactorAuth: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-sm">Encrypt Local Data</div>
                      <div className="text-xs text-muted-foreground">Encrypt data stored on device</div>
                    </div>
                  </div>
                  <Switch
                    checked={privacySettings.encryptLocalData}
                    onCheckedChange={(checked) => 
                      setPrivacySettings({ ...privacySettings, encryptLocalData: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-sm">Local Storage Only</div>
                      <div className="text-xs text-muted-foreground">Never sync to cloud</div>
                    </div>
                  </div>
                  <Switch
                    checked={privacySettings.localStorageOnly}
                    onCheckedChange={(checked) => 
                      setPrivacySettings({ ...privacySettings, localStorageOnly: checked })
                    }
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Data Usage Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-5 w-5" />
            Your Data Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {dataUsage.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex-1">
                  <div className="font-medium text-sm">{item.category}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Purpose: {item.purpose}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-sm">{item.amount}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(item.lastAccessed).toLocaleDateString()}
                  </div>
                  {item.canDelete && (
                    <Button size="sm" variant="ghost" className="mt-1">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <span className="font-medium">Total Storage Used</span>
            <span className="font-bold">148.2 MB</span>
          </div>
        </CardContent>
      </Card>

      {/* Data Export & Deletion */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Export Options */}
          <div>
            <h3 className="font-medium text-sm mb-2">Export Your Data</h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {Object.entries(dataExportOptions).map(([key, value]) => (
                <label key={key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setDataExportOptions({
                      ...dataExportOptions,
                      [key]: e.target.checked
                    })}
                    className="rounded"
                  />
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
              ))}
            </div>
            <Button onClick={exportData} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download My Data
            </Button>
          </div>

          {/* Delete Account */}
          <div>
            <h3 className="font-medium text-sm mb-2">Delete Account</h3>
            <Alert className="mb-3 border-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                This will permanently delete your account and all associated data. This action cannot be undone.
              </AlertDescription>
            </Alert>
            
            {showDeleteConfirm ? (
              <div className="space-y-2">
                <p className="text-sm text-red-600">Are you absolutely sure? Type "DELETE" to confirm:</p>
                <input
                  type="text"
                  placeholder="Type DELETE"
                  className="w-full p-2 border rounded"
                  onChange={(e) => {
                    if (e.target.value === 'DELETE') {
                      // Enable delete button
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button 
                    variant="destructive" 
                    className="flex-1"
                    onClick={deleteAllData}
                  >
                    Confirm Delete
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete My Account
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}