// Campus Club Integration System - Based on MARKET_KNOWLEDGE.md
// Targets: Stanford Running/Powerlifting, MIT Sports, USP/Unicamp Athletics
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import {
  Users,
  Trophy,
  Target,
  TrendingUp,
  Calendar,
  Award,
  Star,
  Zap,
  Shield,
  Globe,
  MapPin,
  Activity,
  Dumbbell,
  Timer,
  Medal,
  ChevronRight,
  Link,
  School,
  Flag,
  BarChart3,
  Share2,
  CheckCircle
} from 'lucide-react';

interface Club {
  id: string;
  name: string;
  university: string;
  country: 'US' | 'BR';
  type: 'running' | 'powerlifting' | 'cs' | 'mixed';
  memberCount: number;
  activeMembers: number;
  currentChallenge?: Challenge;
  leaderboard: ClubMember[];
  stats: ClubStats;
  verified: boolean;
  contactEmail?: string;
  discordUrl?: string;
  stravaUrl?: string;
}

interface Challenge {
  id: string;
  name: string;
  type: 'streak' | 'focus' | 'fitness' | 'combined';
  startDate: Date;
  endDate: Date;
  participants: number;
  prize?: string;
  metrics: {
    target: number;
    unit: string;
    current: number;
  };
}

interface ClubMember {
  id: string;
  username: string;
  score: number;
  streak: number;
  rank: number;
  change: number;
}

interface ClubStats {
  totalFocusHours: number;
  totalWorkouts: number;
  avgStreak: number;
  weeklyActive: number;
  topAthlete?: string;
  topStudent?: string;
}

export function CampusClubIntegration() {
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [clubs] = useState<Club[]>([
    {
      id: 'stanford_running',
      name: 'Stanford Running Club',
      university: 'Stanford University',
      country: 'US',
      type: 'running',
      memberCount: 145,
      activeMembers: 89,
      verified: true,
      contactEmail: 'running@stanford.edu',
      stravaUrl: 'https://strava.com/clubs/stanford-running',
      currentChallenge: {
        id: 'src_week4',
        name: '7-Day Streak Sprint',
        type: 'streak',
        startDate: new Date(Date.now() - 3 * 86400000),
        endDate: new Date(Date.now() + 4 * 86400000),
        participants: 67,
        prize: 'Club Jersey + 1 Month Premium',
        metrics: {
          target: 7,
          unit: 'days',
          current: 3,
        },
      },
      leaderboard: [
        { id: '1', username: 'RunnerElite', score: 1250, streak: 14, rank: 1, change: 0 },
        { id: '2', username: 'CardinalSpeed', score: 1180, streak: 12, rank: 2, change: 1 },
        { id: '3', username: 'TreeRunner', score: 1120, streak: 10, rank: 3, change: -1 },
      ],
      stats: {
        totalFocusHours: 2840,
        totalWorkouts: 412,
        avgStreak: 8.5,
        weeklyActive: 78,
        topAthlete: 'RunnerElite',
        topStudent: 'CSMajor2025',
      },
    },
    {
      id: 'mit_barbell',
      name: 'MIT Barbell Club',
      university: 'MIT',
      country: 'US',
      type: 'powerlifting',
      memberCount: 87,
      activeMembers: 52,
      verified: true,
      currentChallenge: {
        id: 'mit_power_week',
        name: 'Power Week Challenge',
        type: 'fitness',
        startDate: new Date(Date.now() - 2 * 86400000),
        endDate: new Date(Date.now() + 5 * 86400000),
        participants: 45,
        metrics: {
          target: 5,
          unit: 'workouts',
          current: 2,
        },
      },
      leaderboard: [
        { id: '4', username: 'IronEngineer', score: 980, streak: 21, rank: 1, change: 0 },
        { id: '5', username: 'TechLifter', score: 920, streak: 18, rank: 2, change: 2 },
        { id: '6', username: 'BeaverBench', score: 890, streak: 15, rank: 3, change: -1 },
      ],
      stats: {
        totalFocusHours: 1920,
        totalWorkouts: 687,
        avgStreak: 12.3,
        weeklyActive: 48,
        topAthlete: 'IronEngineer',
        topStudent: 'Course6Strong',
      },
    },
    {
      id: 'usp_atletica',
      name: 'Atlética Poli-USP',
      university: 'USP',
      country: 'BR',
      type: 'mixed',
      memberCount: 312,
      activeMembers: 178,
      verified: true,
      contactEmail: 'atletica@poli.usp.br',
      currentChallenge: {
        id: 'usp_circuit_2025',
        name: 'Circuito USP 2025 - Stage 3',
        type: 'combined',
        startDate: new Date(Date.now() - 5 * 86400000),
        endDate: new Date(Date.now() + 9 * 86400000),
        participants: 156,
        prize: 'Trophy + Campus Recognition',
        metrics: {
          target: 1000,
          unit: 'team points',
          current: 423,
        },
      },
      leaderboard: [
        { id: '7', username: 'PoliAthlete', score: 1420, streak: 28, rank: 1, change: 0 },
        { id: '8', username: 'EngFit', score: 1380, streak: 24, rank: 2, change: 0 },
        { id: '9', username: 'USPRunner', score: 1290, streak: 19, rank: 3, change: 3 },
      ],
      stats: {
        totalFocusHours: 4580,
        totalWorkouts: 892,
        avgStreak: 9.7,
        weeklyActive: 165,
        topAthlete: 'PoliAthlete',
        topStudent: 'EngenhariaPro',
      },
    },
    {
      id: 'unicamp_atletismo',
      name: 'Atletismo Unicamp',
      university: 'Unicamp',
      country: 'BR',
      type: 'running',
      memberCount: 98,
      activeMembers: 61,
      verified: true,
      currentChallenge: {
        id: 'unicamp_focus',
        name: 'Focus + Fitness Week',
        type: 'combined',
        startDate: new Date(Date.now() - 1 * 86400000),
        endDate: new Date(Date.now() + 6 * 86400000),
        participants: 54,
        metrics: {
          target: 50,
          unit: 'hours',
          current: 12,
        },
      },
      leaderboard: [
        { id: '10', username: 'CampinasRunner', score: 1150, streak: 16, rank: 1, change: 1 },
        { id: '11', username: 'UnicampFit', score: 1090, streak: 14, rank: 2, change: -1 },
        { id: '12', username: 'EstudanteAtleta', score: 1020, streak: 11, rank: 3, change: 0 },
      ],
      stats: {
        totalFocusHours: 1670,
        totalWorkouts: 298,
        avgStreak: 7.8,
        weeklyActive: 56,
        topAthlete: 'CampinasRunner',
        topStudent: 'CompSciAthlete',
      },
    },
  ]);

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  // Get club type icon
  const getClubIcon = (type: string) => {
    switch (type) {
      case 'running': return <Activity className="h-4 w-4" />;
      case 'powerlifting': return <Dumbbell className="h-4 w-4" />;
      case 'cs': return <School className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  // Get country flag emoji
  const getCountryFlag = (country: string) => {
    return country === 'BR' ? '🇧🇷' : '🇺🇸';
  };

  // Calculate challenge progress
  const getChallengeProgress = (challenge: Challenge) => {
    return (challenge.metrics.current / challenge.metrics.target) * 100;
  };

  // Join club with code
  const joinClubWithCode = () => {
    // In production, would validate code and join club
    console.log('Joining club with code:', joinCode);
    setShowJoinModal(false);
    setJoinCode('');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Campus Club Network</h2>
              <p className="text-sm opacity-90">
                Join your university club for weekly challenges and team competitions
              </p>
              <div className="flex items-center gap-4 mt-3">
                <Badge variant="secondary" className="bg-white/20">
                  <Globe className="h-3 w-3 mr-1" />
                  4 Universities
                </Badge>
                <Badge variant="secondary" className="bg-white/20">
                  <Users className="h-3 w-3 mr-1" />
                  642 Active Athletes
                </Badge>
                <Badge variant="secondary" className="bg-white/20">
                  <Trophy className="h-3 w-3 mr-1" />
                  12 Active Challenges
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <Button className="bg-white text-blue-600 hover:bg-gray-100">
                <Shield className="h-4 w-4 mr-2" />
                Register Your Club
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured Clubs Grid */}
      <div className="grid grid-cols-2 gap-4">
        {clubs.map(club => (
          <Card 
            key={club.id}
            className={`cursor-pointer hover:border-blue-500 transition-colors ${
              selectedClub?.id === club.id ? 'border-blue-500' : ''
            }`}
            onClick={() => setSelectedClub(club)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getClubIcon(club.type)}
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      {club.name}
                      {club.verified && (
                        <CheckCircle className="h-3 w-3 text-blue-500" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {club.university} {getCountryFlag(club.country)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Club Stats */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="text-center p-2 bg-muted/50 rounded">
                  <div className="text-lg font-bold">{club.activeMembers}</div>
                  <div className="text-xs text-muted-foreground">Active</div>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded">
                  <div className="text-lg font-bold">{club.stats.avgStreak.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">Avg Streak</div>
                </div>
              </div>

              {/* Current Challenge */}
              {club.currentChallenge && (
                <div className="p-2 bg-primary/10 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{club.currentChallenge.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {club.currentChallenge.participants} joined
                    </Badge>
                  </div>
                  <Progress 
                    value={getChallengeProgress(club.currentChallenge)} 
                    className="h-1.5 mb-1"
                  />
                  <div className="text-xs text-muted-foreground">
                    {club.currentChallenge.metrics.current}/{club.currentChallenge.metrics.target} {club.currentChallenge.metrics.unit}
                  </div>
                </div>
              )}

              {/* Top Members Preview */}
              <div className="mt-3 space-y-1">
                {club.leaderboard.slice(0, 2).map((member, index) => (
                  <div key={member.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      {index === 0 && <Medal className="h-3 w-3 text-yellow-500" />}
                      <span>{member.username}</span>
                    </div>
                    <span className="font-medium">{member.score} pts</span>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 mt-3">
                <Button size="sm" className="flex-1">
                  <Users className="h-3 w-3 mr-1" />
                  Join
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Trophy className="h-3 w-3 mr-1" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Club Details */}
      {selectedClub && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {getClubIcon(selectedClub.type)}
                {selectedClub.name}
              </CardTitle>
              <div className="flex items-center gap-2">
                {selectedClub.stravaUrl && (
                  <Button size="sm" variant="outline">
                    <Link className="h-3 w-3 mr-1" />
                    Strava
                  </Button>
                )}
                {selectedClub.discordUrl && (
                  <Button size="sm" variant="outline">
                    <Share2 className="h-3 w-3 mr-1" />
                    Discord
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Full Leaderboard */}
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Weekly Leaderboard</h3>
              <div className="space-y-2">
                {selectedClub.leaderboard.map((member, index) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 text-center">
                        {index === 0 ? <Medal className="h-4 w-4 text-yellow-500" /> :
                         index === 1 ? <Medal className="h-4 w-4 text-gray-400" /> :
                         index === 2 ? <Medal className="h-4 w-4 text-orange-600" /> :
                         <span className="text-sm font-bold">#{member.rank}</span>}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{member.username}</div>
                        <div className="text-xs text-muted-foreground">
                          {member.streak} day streak
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{member.score}</div>
                      <div className="text-xs text-muted-foreground">
                        {member.change > 0 ? '↑' : member.change < 0 ? '↓' : '='} 
                        {Math.abs(member.change)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Club Stats */}
            <div className="grid grid-cols-4 gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="text-xl font-bold">
                  {(selectedClub.stats.totalFocusHours / 60).toFixed(0)}h
                </div>
                <div className="text-xs text-muted-foreground">Focus Time</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{selectedClub.stats.totalWorkouts}</div>
                <div className="text-xs text-muted-foreground">Workouts</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{selectedClub.stats.weeklyActive}</div>
                <div className="text-xs text-muted-foreground">Active/Week</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{selectedClub.stats.avgStreak.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">Avg Streak</div>
              </div>
            </div>

            {/* Challenge Prize */}
            {selectedClub.currentChallenge?.prize && (
              <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">Prize: {selectedClub.currentChallenge.prize}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Join with Code */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium mb-1">Have a club invite code?</h3>
              <p className="text-sm text-muted-foreground">
                Enter your club's unique code to join private challenges
              </p>
            </div>
            <Button onClick={() => setShowJoinModal(true)}>
              Enter Code
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Join Modal */}
      {showJoinModal && (
        <Card className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto z-50 shadow-xl">
          <CardHeader>
            <CardTitle>Join Club with Code</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Enter 6-digit code (e.g., STAN25)"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="mb-3"
            />
            <div className="flex gap-2">
              <Button onClick={joinClubWithCode} className="flex-1">
                Join Club
              </Button>
              <Button variant="outline" onClick={() => setShowJoinModal(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Metrics (Dev Mode) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="border-dashed">
          <CardContent className="p-3">
            <div className="text-xs space-y-1">
              <div className="font-medium mb-1">GTM Metrics (from MARKET_KNOWLEDGE.md)</div>
              <div className="flex justify-between">
                <span>Target Universities:</span>
                <span className="text-green-500">4/4 active</span>
              </div>
              <div className="flex justify-between">
                <span>Club Engagement:</span>
                <span>58% weekly active</span>
              </div>
              <div className="flex justify-between">
                <span>Challenge Participation:</span>
                <span>72% of members</span>
              </div>
              <div className="flex justify-between">
                <span>Cross-club Events:</span>
                <span>2 scheduled</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}