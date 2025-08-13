import { NextRequest } from 'next/server';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '0');
    const type = searchParams.get('type') || 'workout';
    
    // Determine streak level and styling
    const getStreakLevel = (days: number) => {
      if (days >= 100) return { level: 'legendary', emoji: '🏆', color: '#FFD700', title: 'Legendary' };
      if (days >= 50) return { level: 'epic', emoji: '🔥', color: '#FF6B35', title: 'Epic' };
      if (days >= 30) return { level: 'amazing', emoji: '⚡', color: '#F59E0B', title: 'Amazing' };
      if (days >= 14) return { level: 'great', emoji: '💪', color: '#10B981', title: 'Great' };
      if (days >= 7) return { level: 'good', emoji: '🌟', color: '#3B82F6', title: 'Good' };
      return { level: 'starting', emoji: '✨', color: '#8B5CF6', title: 'Getting Started' };
    };

    const streakInfo = getStreakLevel(days);

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1a1b23',
            backgroundImage: `linear-gradient(135deg, ${streakInfo.color}30 0%, ${streakInfo.color}60 100%)`,
            fontFamily: 'Inter, system-ui, sans-serif',
            position: 'relative',
          }}
        >
          {/* Animated background elements */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.1) 0%, transparent 40%)',
            }}
          />

          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '40px',
              zIndex: 1,
            }}
          >
            <div
              style={{
                fontSize: '48px',
                marginRight: '16px',
              }}
            >
              💪
            </div>
            <div
              style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: 'white',
              }}
            >
              FeelSharper
            </div>
          </div>

          {/* Main Streak Display */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '32px',
              padding: '64px',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              zIndex: 1,
              position: 'relative',
              minWidth: '500px',
            }}
          >
            {/* Streak Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                backgroundColor: streakInfo.color,
                marginBottom: '32px',
                fontSize: '100px',
                boxShadow: `0 0 80px ${streakInfo.color}60`,
                border: '6px solid rgba(255, 255, 255, 0.3)',
                position: 'relative',
              }}
            >
              {streakInfo.emoji}
              
              {/* Pulse effect */}
              <div
                style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '-10px',
                  right: '-10px',
                  bottom: '-10px',
                  borderRadius: '50%',
                  border: `3px solid ${streakInfo.color}40`,
                  animation: 'pulse 2s infinite',
                }}
              />
            </div>

            {/* Days Counter */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  fontSize: '120px',
                  fontWeight: 'bold',
                  color: 'white',
                  lineHeight: '1',
                  textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                }}
              >
                {days}
              </div>
              <div
                style={{
                  fontSize: '48px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  marginLeft: '16px',
                  fontWeight: '600',
                }}
              >
                DAYS
              </div>
            </div>

            {/* Streak Title */}
            <div
              style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: streakInfo.color,
                marginBottom: '16px',
                textAlign: 'center',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              {streakInfo.title} Streak! 🎯
            </div>

            {/* Streak Type */}
            <div
              style={{
                fontSize: '24px',
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '32px',
                textAlign: 'center',
                textTransform: 'capitalize',
              }}
            >
              {type.replace('_', ' ')} consistency
            </div>

            {/* Progress Indicators */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '32px',
              }}
            >
              {Array.from({ length: Math.min(10, days) }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: streakInfo.color,
                    boxShadow: `0 0 8px ${streakInfo.color}60`,
                  }}
                />
              ))}
              {days > 10 && (
                <div
                  style={{
                    fontSize: '16px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    marginLeft: '8px',
                  }}
                >
                  +{days - 10} more!
                </div>
              )}
            </div>

            {/* Motivational Text */}
            <div
              style={{
                fontSize: '20px',
                color: 'rgba(255, 255, 255, 0.9)',
                textAlign: 'center',
                marginBottom: '32px',
                maxWidth: '400px',
                lineHeight: '1.4',
              }}
            >
              Consistency builds champions! 🏆
            </div>

            {/* CTA */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#10B981',
                borderRadius: '12px',
                padding: '16px 32px',
                color: 'white',
                fontSize: '20px',
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              }}
            >
              Start Your Streak 🔥
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: '24px',
              fontSize: '16px',
              color: 'rgba(255, 255, 255, 0.7)',
              zIndex: 1,
            }}
          >
            feelsharper.app • Build Unbreakable Habits
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate image`, {
      status: 500,
    });
  }
}