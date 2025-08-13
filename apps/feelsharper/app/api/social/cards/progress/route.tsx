import { NextRequest } from 'next/server';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workouts = searchParams.get('workouts') || '0';
    const streak = searchParams.get('streak') || '0';
    const userName = searchParams.get('userName') || 'Fitness Enthusiast';

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
            backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '40px',
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

          {/* Main Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              padding: '48px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <h1
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: 'white',
                margin: '0 0 24px 0',
                textAlign: 'center',
              }}
            >
              Crushing My Goals! 🔥
            </h1>
            
            <div
              style={{
                display: 'flex',
                gap: '48px',
                marginBottom: '32px',
              }}
            >
              {/* Workouts Stat */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '16px',
                  padding: '24px',
                  minWidth: '160px',
                }}
              >
                <div
                  style={{
                    fontSize: '64px',
                    fontWeight: 'bold',
                    color: '#10B981',
                    lineHeight: '1',
                  }}
                >
                  {workouts}
                </div>
                <div
                  style={{
                    fontSize: '20px',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: '500',
                  }}
                >
                  Workouts
                </div>
                <div
                  style={{
                    fontSize: '16px',
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}
                >
                  this month
                </div>
              </div>

              {/* Streak Stat */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '16px',
                  padding: '24px',
                  minWidth: '160px',
                }}
              >
                <div
                  style={{
                    fontSize: '64px',
                    fontWeight: 'bold',
                    color: '#F59E0B',
                    lineHeight: '1',
                  }}
                >
                  {streak}
                </div>
                <div
                  style={{
                    fontSize: '20px',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: '500',
                  }}
                >
                  Day Streak
                </div>
                <div
                  style={{
                    fontSize: '16px',
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}
                >
                  and counting! 🔥
                </div>
              </div>
            </div>

            <div
              style={{
                fontSize: '24px',
                color: 'rgba(255, 255, 255, 0.9)',
                textAlign: 'center',
                marginBottom: '24px',
              }}
            >
              Join me on the journey to better health!
            </div>

            {/* CTA Button */}
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
              }}
            >
              Download FeelSharper 📱
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: '24px',
              fontSize: '16px',
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            feelsharper.app • Track, Achieve, Thrive
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