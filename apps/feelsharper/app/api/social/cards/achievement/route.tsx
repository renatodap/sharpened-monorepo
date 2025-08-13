import { NextRequest } from 'next/server';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const badgeName = searchParams.get('badgeName') || 'Achievement Unlocked';
    const badgeIcon = searchParams.get('icon') || '🏆';
    const badgeColor = searchParams.get('color') || '#F59E0B';
    const description = searchParams.get('description') || 'New milestone reached!';

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
            backgroundImage: `linear-gradient(135deg, ${badgeColor}20 0%, ${badgeColor}40 100%)`,
            fontFamily: 'Inter, system-ui, sans-serif',
            position: 'relative',
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)',
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

          {/* Achievement Badge */}
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
            }}
          >
            {/* Badge Icon with Glow Effect */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                backgroundColor: badgeColor,
                marginBottom: '32px',
                fontSize: '80px',
                boxShadow: `0 0 60px ${badgeColor}60`,
                border: '4px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              {badgeIcon}
            </div>

            <h1
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: 'white',
                margin: '0 0 16px 0',
                textAlign: 'center',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              Achievement Unlocked! 🎉
            </h1>
            
            <div
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: badgeColor,
                marginBottom: '16px',
                textAlign: 'center',
              }}
            >
              {badgeName}
            </div>

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
              {description}
            </div>

            {/* Sparkle Effects */}
            <div
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                fontSize: '24px',
                animation: 'twinkle 2s infinite',
              }}
            >
              ✨
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: '30px',
                left: '30px',
                fontSize: '20px',
                animation: 'twinkle 2s infinite 0.5s',
              }}
            >
              ⭐
            </div>
            <div
              style={{
                position: 'absolute',
                top: '40px',
                left: '50px',
                fontSize: '16px',
                animation: 'twinkle 2s infinite 1s',
              }}
            >
              💫
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
              Start Your Journey 🚀
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
            feelsharper.app • Unlock Your Potential
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