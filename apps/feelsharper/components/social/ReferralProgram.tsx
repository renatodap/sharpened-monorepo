'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Gift, 
  Copy, 
  Share2, 
  Users, 
  Trophy, 
  Crown,
  Check,
  ExternalLink,
  ChevronRight,
  Star,
  Sparkles,
  Target,
  TrendingUp,
  Award,
  Zap,
  Heart
} from 'lucide-react';

interface ReferralStats {
  total_referrals: number;
  pending_referrals: number;
  activated_referrals: number;
  total_rewards: number;
  pending_rewards: number;
}

interface Referral {
  id: string;
  status: 'pending' | 'accepted' | 'activated';
  created_at: string;
  accepted_at?: string;
  activated_at?: string;
  reward_claimed: boolean;
}

interface ReferralData {
  referral_code: string;
  referrals: Referral[];
  stats: ReferralStats;
}

interface LeaderboardEntry {
  rank: number;
  display_name: string;
  total_referrals: number;
  referral_code: string;
}

export function ReferralProgram() {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [applyCode, setApplyCode] = useState('');
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'leaderboard' | 'apply'>('overview');

  useEffect(() => {
    fetchReferralData();
    fetchLeaderboard();
  }, []);

  const fetchReferralData = async () => {
    try {
      const response = await fetch('/api/referrals');
      if (response.ok) {
        const data = await response.json();
        setReferralData(data);
      }
    } catch (error) {
      console.error('Failed to fetch referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/referrals/leaderboard');
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  const copyReferralLink = async () => {
    if (referralData?.referral_code) {
      const referralLink = `${window.location.origin}?ref=${referralData.referral_code}`;
      try {
        await navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  const shareReferralLink = async () => {
    if (referralData?.referral_code && navigator.share) {
      const referralLink = `${window.location.origin}?ref=${referralData.referral_code}`;
      try {
        await navigator.share({
          title: 'Join me on FeelSharper!',
          text: 'I\'ve been crushing my fitness goals with FeelSharper. Join me and we both get rewards!',
          url: referralLink,
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    }
  };

  const applyReferralCode = async () => {
    if (!applyCode.trim()) return;
    
    setApplying(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'apply_referral',
          referral_code: applyCode.trim()
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('✅ Referral code applied successfully!');
        setApplyCode('');
        fetchReferralData(); // Refresh data
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Failed to apply referral code');
    } finally {
      setApplying(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600">Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="text-blue-600">Accepted</Badge>;
      case 'activated':
        return <Badge className="bg-green-600">Activated</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-orange-500" />;
      default:
        return <span className="font-bold text-sm">#{rank}</span>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Gift className="h-8 w-8 text-primary" />
          Referral Program
        </h1>
        <p className="text-muted-foreground">
          Invite friends and earn rewards together! Get 1 month free for every 3 friends who join.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="flex p-1 bg-muted rounded-lg">
          {[
            { id: 'overview', label: 'Overview', icon: Target },
            { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
            { id: 'apply', label: 'Apply Code', icon: Star }
          ].map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id as any)}
              className="flex items-center gap-2"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && referralData && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full -translate-y-4 translate-x-4"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Referrals</p>
                    <p className="text-3xl font-bold text-blue-600">{referralData.stats.total_referrals}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full -translate-y-4 translate-x-4"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Activated</p>
                    <p className="text-3xl font-bold text-green-600">{referralData.stats.activated_referrals}</p>
                  </div>
                  <Zap className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full -translate-y-4 translate-x-4"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Rewards Earned</p>
                    <p className="text-3xl font-bold text-yellow-600">{referralData.stats.total_rewards}</p>
                    <p className="text-xs text-muted-foreground">months free</p>
                  </div>
                  <Gift className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Your Referral Link */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Your Referral Link
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={`${window.location.origin}?ref=${referralData.referral_code}`}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button onClick={copyReferralLink} variant="outline">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                {navigator.share && (
                  <Button onClick={shareReferralLink} variant="outline">
                    <Share2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-dashed border-primary/30">
                  <CardContent className="p-4 text-center">
                    <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <h3 className="font-semibold">How it Works</h3>
                    <p className="text-sm text-muted-foreground">
                      Friends sign up → They get started → You both get rewards!
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-dashed border-green-500/30">
                  <CardContent className="p-4 text-center">
                    <Sparkles className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <h3 className="font-semibold">Rewards</h3>
                    <p className="text-sm text-muted-foreground">
                      Get 1 month free for every 3 friends who activate their accounts
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Recent Referrals */}
          {referralData.referrals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {referralData.referrals.slice(0, 5).map((referral, index) => (
                    <div key={referral.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold">#{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium">Friend {index + 1}</div>
                          <div className="text-sm text-muted-foreground">
                            Referred {new Date(referral.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(referral.status)}
                        {referral.status === 'activated' && !referral.reward_claimed && (
                          <Button size="sm" variant="outline">
                            Claim Reward
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Top Referrers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div
                  key={entry.referral_code}
                  className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                    entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30' : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {getRankIcon(entry.rank)}
                    </div>
                    <div>
                      <div className="font-medium">{entry.display_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {entry.total_referrals} successful referrals
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="font-bold text-lg">{entry.total_referrals}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Apply Code Tab */}
      {activeTab === 'apply' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Apply Referral Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="referral-code">Enter a friend's referral code</Label>
              <div className="flex gap-2">
                <Input
                  id="referral-code"
                  value={applyCode}
                  onChange={(e) => setApplyCode(e.target.value)}
                  placeholder="Enter referral code"
                  className="font-mono"
                />
                <Button 
                  onClick={applyReferralCode} 
                  disabled={applying || !applyCode.trim()}
                >
                  {applying ? 'Applying...' : 'Apply'}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>

            {message && (
              <Card className={`border ${message.includes('✅') ? 'border-green-500/30 bg-green-50 dark:bg-green-950/30' : 'border-red-500/30 bg-red-50 dark:bg-red-950/30'}`}>
                <CardContent className="p-4">
                  <p className="text-sm">{message}</p>
                </CardContent>
              </Card>
            )}

            <Card className="border-dashed">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Benefits of Using a Referral Code:</h3>
                <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                  <li>Support a friend on their fitness journey</li>
                  <li>Join a community of motivated users</li>
                  <li>Get tips and encouragement from your referrer</li>
                  <li>Unlock special friend challenges</li>
                </ul>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}
    </div>
  );
}