// Human Verification Queue for Low-Confidence Photo Logs
// Based on MARKET_KNOWLEDGE.md - SnapCalorie pattern with human verifiers
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Camera,
  Edit3,
  Users,
  Clock,
  TrendingUp,
  Award,
  ChevronRight,
  ChevronLeft,
  Search,
  BarChart3,
  Zap,
  Shield,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Info
} from 'lucide-react';

interface FoodItem {
  id: string;
  name: string;
  amount: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number;
  suggestedCorrections?: {
    name?: string;
    amount?: string;
    calories?: number;
  };
}

interface VerificationItem {
  id: string;
  userId: string;
  timestamp: Date;
  photoUrl: string;
  aiParse: {
    items: FoodItem[];
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    overallConfidence: number;
  };
  status: 'pending' | 'verified' | 'corrected' | 'rejected';
  verifierId?: string;
  verifiedAt?: Date;
  corrections?: any;
  priority: 'low' | 'medium' | 'high';
  turnaroundTime?: number; // minutes
}

interface Verifier {
  id: string;
  username: string;
  level: number;
  accuracy: number;
  itemsVerified: number;
  avgTime: number; // seconds per item
  streak: number;
  earnings: number;
}

export function HumanVerificationQueue() {
  const [queueItems, setQueueItems] = useState<VerificationItem[]>([
    {
      id: 'verify_001',
      userId: 'user_123',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      photoUrl: '/meal-photo-1.jpg',
      aiParse: {
        items: [
          {
            id: 'item_1',
            name: 'Chicken Breast',
            amount: '150g',
            calories: 248,
            protein: 46,
            carbs: 0,
            fat: 5.6,
            confidence: 0.65, // Low confidence
          },
          {
            id: 'item_2',
            name: 'White Rice',
            amount: '200g',
            calories: 260,
            protein: 5.5,
            carbs: 56,
            fat: 0.6,
            confidence: 0.72,
          },
          {
            id: 'item_3',
            name: 'Mixed Vegetables',
            amount: '100g',
            calories: 38,
            protein: 2.5,
            carbs: 7,
            fat: 0.3,
            confidence: 0.55, // Very low - needs verification
          },
        ],
        totalCalories: 546,
        totalProtein: 54,
        totalCarbs: 63,
        totalFat: 6.5,
        overallConfidence: 0.64,
      },
      status: 'pending',
      priority: 'high',
    },
    {
      id: 'verify_002',
      userId: 'user_456',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      photoUrl: '/meal-photo-2.jpg',
      aiParse: {
        items: [
          {
            id: 'item_4',
            name: 'Protein Shake',
            amount: '400ml',
            calories: 280,
            protein: 40,
            carbs: 12,
            fat: 8,
            confidence: 0.78,
          },
          {
            id: 'item_5',
            name: 'Banana',
            amount: '1 medium',
            calories: 105,
            protein: 1.3,
            carbs: 27,
            fat: 0.4,
            confidence: 0.92,
          },
        ],
        totalCalories: 385,
        totalProtein: 41.3,
        totalCarbs: 39,
        totalFat: 8.4,
        overallConfidence: 0.85,
      },
      status: 'pending',
      priority: 'low',
    },
  ]);

  const [currentVerifier, setCurrentVerifier] = useState<Verifier>({
    id: 'verifier_current',
    username: 'NutritionPro',
    level: 3,
    accuracy: 94.5,
    itemsVerified: 287,
    avgTime: 18,
    streak: 7,
    earnings: 28.70,
  });

  const [selectedItem, setSelectedItem] = useState<VerificationItem | null>(null);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [editValues, setEditValues] = useState<Partial<FoodItem>>({});
  const [verificationStats, setVerificationStats] = useState({
    queueLength: 12,
    avgWaitTime: 8, // minutes
    verifiersOnline: 3,
    accuracyToday: 96.2,
  });

  // Confidence thresholds
  const CONFIDENCE_THRESHOLDS = {
    AUTO_APPROVE: 0.9,
    NEEDS_VERIFICATION: 0.8,
    HIGH_PRIORITY: 0.6,
  };

  // Calculate queue metrics
  const getQueueMetrics = () => {
    const pending = queueItems.filter(item => item.status === 'pending');
    const highPriority = pending.filter(item => item.priority === 'high');
    const avgConfidence = pending.reduce((sum, item) => sum + item.aiParse.overallConfidence, 0) / pending.length;
    
    return {
      pendingCount: pending.length,
      highPriorityCount: highPriority.length,
      avgConfidence: avgConfidence || 0,
      oldestItem: pending.length > 0 ? 
        Math.floor((Date.now() - pending[0].timestamp.getTime()) / 60000) : 0,
    };
  };

  const metrics = getQueueMetrics();

  // Start verification of an item
  const startVerification = (item: VerificationItem) => {
    setSelectedItem(item);
  };

  // Approve AI parse as correct
  const approveItem = () => {
    if (!selectedItem) return;
    
    const turnaroundTime = Math.floor((Date.now() - selectedItem.timestamp.getTime()) / 60000);
    
    setQueueItems(prev => prev.map(item => 
      item.id === selectedItem.id 
        ? {
            ...item,
            status: 'verified' as const,
            verifierId: currentVerifier.id,
            verifiedAt: new Date(),
            turnaroundTime,
          }
        : item
    ));
    
    // Update verifier stats
    setCurrentVerifier(prev => ({
      ...prev,
      itemsVerified: prev.itemsVerified + 1,
      earnings: prev.earnings + 0.10, // $0.10 per verification
    }));
    
    // Move to next item
    moveToNext();
  };

  // Start editing a food item
  const startEditingItem = (foodItem: FoodItem) => {
    setEditingItem(foodItem);
    setEditValues({
      name: foodItem.name,
      amount: foodItem.amount,
      calories: foodItem.calories,
      protein: foodItem.protein,
      carbs: foodItem.carbs,
      fat: foodItem.fat,
    });
  };

  // Save edited item
  const saveEditedItem = () => {
    if (!selectedItem || !editingItem) return;
    
    const updatedItems = selectedItem.aiParse.items.map(item =>
      item.id === editingItem.id
        ? { ...item, ...editValues, confidence: 1.0 } // Human verified = 100% confidence
        : item
    );
    
    // Recalculate totals
    const totals = updatedItems.reduce((acc, item) => ({
      calories: acc.calories + (item.calories || 0),
      protein: acc.protein + (item.protein || 0),
      carbs: acc.carbs + (item.carbs || 0),
      fat: acc.fat + (item.fat || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    
    setSelectedItem({
      ...selectedItem,
      aiParse: {
        ...selectedItem.aiParse,
        items: updatedItems,
        totalCalories: totals.calories,
        totalProtein: totals.protein,
        totalCarbs: totals.carbs,
        totalFat: totals.fat,
        overallConfidence: 1.0, // Human verified
      },
    });
    
    setEditingItem(null);
    setEditValues({});
  };

  // Reject item (major issues)
  const rejectItem = () => {
    if (!selectedItem) return;
    
    setQueueItems(prev => prev.map(item => 
      item.id === selectedItem.id 
        ? {
            ...item,
            status: 'rejected' as const,
            verifierId: currentVerifier.id,
            verifiedAt: new Date(),
          }
        : item
    ));
    
    moveToNext();
  };

  // Move to next item in queue
  const moveToNext = () => {
    const pending = queueItems.filter(item => item.status === 'pending');
    if (pending.length > 0) {
      setSelectedItem(pending[0]);
    } else {
      setSelectedItem(null);
    }
  };

  // Gamification: Calculate verifier level progress
  const getLevelProgress = () => {
    const itemsForNextLevel = (currentVerifier.level + 1) * 100;
    const progress = (currentVerifier.itemsVerified % 100) / 100 * 100;
    return progress;
  };

  const levelProgress = getLevelProgress();

  return (
    <div className="space-y-4">
      {/* Queue Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Verification Queue
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {verificationStats.verifiersOnline} verifiers online
              </Badge>
              <Badge variant={metrics.highPriorityCount > 0 ? 'destructive' : 'secondary'}>
                {metrics.pendingCount} pending
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics.pendingCount}</div>
              <div className="text-xs text-muted-foreground">In Queue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{metrics.highPriorityCount}</div>
              <div className="text-xs text-muted-foreground">High Priority</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{verificationStats.avgWaitTime}m</div>
              <div className="text-xs text-muted-foreground">Avg Wait</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{(metrics.avgConfidence * 100).toFixed(0)}%</div>
              <div className="text-xs text-muted-foreground">Avg Confidence</div>
            </div>
          </div>

          {/* Queue Items */}
          <div className="space-y-2">
            {queueItems.filter(item => item.status === 'pending').slice(0, 3).map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                onClick={() => startVerification(item)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                    {item.priority === 'high' && (
                      <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-sm">
                      {item.aiParse.items.length} items • {item.aiParse.totalCalories} cal
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Math.floor((Date.now() - item.timestamp.getTime()) / 60000)}m ago • 
                      Confidence: {(item.aiParse.overallConfidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Verification Interface */}
      {selectedItem && (
        <Card className="border-blue-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Verify Food Items</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  {Math.floor((Date.now() - selectedItem.timestamp.getTime()) / 60000)}m old
                </Badge>
                <Badge variant={selectedItem.aiParse.overallConfidence < 0.7 ? 'destructive' : 'secondary'}>
                  {(selectedItem.aiParse.overallConfidence * 100).toFixed(0)}% confidence
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {/* Photo */}
              <div>
                <div className="aspect-square bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center mb-2">
                  <Camera className="h-12 w-12 text-muted-foreground" />
                  {/* In production, would display actual photo */}
                </div>
                <div className="text-xs text-muted-foreground text-center">
                  Tap to zoom • Swipe for more angles
                </div>
              </div>

              {/* AI Parse Results */}
              <div className="space-y-2">
                <div className="text-sm font-medium mb-2">AI Detection</div>
                {selectedItem.aiParse.items.map(item => (
                  <div
                    key={item.id}
                    className={`p-2 rounded-lg border ${
                      item.confidence < 0.7 ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium text-sm">{item.name}</div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditingItem(item)}
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.amount} • {item.calories} cal
                    </div>
                    <div className="text-xs">
                      P: {item.protein}g • C: {item.carbs}g • F: {item.fat}g
                    </div>
                    {item.confidence < 0.7 && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs text-yellow-600">Low confidence</span>
                      </div>
                    )}
                  </div>
                ))}

                {/* Totals */}
                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Total</span>
                    <span>{selectedItem.aiParse.totalCalories} cal</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    P: {selectedItem.aiParse.totalProtein}g • 
                    C: {selectedItem.aiParse.totalCarbs}g • 
                    F: {selectedItem.aiParse.totalFat}g
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Form */}
            {editingItem && (
              <div className="mt-4 p-3 border rounded-lg bg-muted/50">
                <div className="text-sm font-medium mb-2">Edit Item</div>
                <div className="space-y-2">
                  <Input
                    placeholder="Food name"
                    value={editValues.name || ''}
                    onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                  />
                  <Input
                    placeholder="Amount"
                    value={editValues.amount || ''}
                    onChange={(e) => setEditValues({ ...editValues, amount: e.target.value })}
                  />
                  <div className="grid grid-cols-4 gap-2">
                    <Input
                      type="number"
                      placeholder="Cal"
                      value={editValues.calories || ''}
                      onChange={(e) => setEditValues({ ...editValues, calories: Number(e.target.value) })}
                    />
                    <Input
                      type="number"
                      placeholder="P(g)"
                      value={editValues.protein || ''}
                      onChange={(e) => setEditValues({ ...editValues, protein: Number(e.target.value) })}
                    />
                    <Input
                      type="number"
                      placeholder="C(g)"
                      value={editValues.carbs || ''}
                      onChange={(e) => setEditValues({ ...editValues, carbs: Number(e.target.value) })}
                    />
                    <Input
                      type="number"
                      placeholder="F(g)"
                      value={editValues.fat || ''}
                      onChange={(e) => setEditValues({ ...editValues, fat: Number(e.target.value) })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveEditedItem}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <Button 
                className="flex-1 bg-green-500 hover:bg-green-600"
                onClick={approveItem}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button 
                className="flex-1"
                variant="outline"
                onClick={() => {
                  // Mark as corrected after edits
                  if (selectedItem.aiParse.overallConfidence < 1.0) {
                    alert('Please correct items before submitting');
                  } else {
                    approveItem();
                  }
                }}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Submit Corrections
              </Button>
              <Button 
                variant="secondary"
                onClick={rejectItem}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verifier Stats & Gamification */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-5 w-5" />
            Your Verifier Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                <span className="font-bold text-sm">L{currentVerifier.level}</span>
              </div>
              <div>
                <div className="font-medium">{currentVerifier.username}</div>
                <div className="text-xs text-muted-foreground">
                  Level {currentVerifier.level} Verifier
                </div>
              </div>
            </div>
            <Badge variant="outline" className="text-green-600">
              ${currentVerifier.earnings.toFixed(2)} earned
            </Badge>
          </div>

          <div className="space-y-2 mb-3">
            <div className="flex justify-between text-sm">
              <span>Level Progress</span>
              <span>{currentVerifier.itemsVerified % 100}/100</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-xl font-bold">{currentVerifier.accuracy}%</div>
              <div className="text-xs text-muted-foreground">Accuracy</div>
            </div>
            <div>
              <div className="text-xl font-bold">{currentVerifier.itemsVerified}</div>
              <div className="text-xs text-muted-foreground">Verified</div>
            </div>
            <div>
              <div className="text-xl font-bold flex items-center justify-center gap-1">
                <Zap className="h-4 w-4 text-yellow-500" />
                {currentVerifier.streak}
              </div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics (Dev Mode) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="border-dashed">
          <CardContent className="p-3">
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>Parse Failure Rate:</span>
                <span className="text-green-500">0.8% (target: &lt;1%)</span>
              </div>
              <div className="flex justify-between">
                <span>Human Verify Rate:</span>
                <span>15% of logs</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Turnaround:</span>
                <span className="text-green-500">8 min (target: &lt;15m)</span>
              </div>
              <div className="flex justify-between">
                <span>Verifier Cost:</span>
                <span>$0.10/item</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}