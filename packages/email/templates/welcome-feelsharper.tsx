// Welcome Email Template for Feel Sharper
// Sent immediately after successful signup

import { Html, Head, Body, Container, Text, Heading, Button, Section, Hr, Link } from '@react-email/components';

interface WelcomeEmailProps {
  firstName: string;
  appName: string;
  loginUrl: string;
  unsubscribeUrl?: string;
}

export default function WelcomeFeelSharperEmail({
  firstName = 'Friend',
  appName = 'Feel Sharper',
  loginUrl = 'https://feelsharper.com/login',
  unsubscribeUrl = 'https://feelsharper.com/unsubscribe',
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>💪 {appName}</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>Welcome to your fitness journey! 🎯</Heading>
            
            <Text style={text}>
              Hi {firstName},
            </Text>
            
            <Text style={text}>
              Welcome to <strong>{appName}</strong>! You just joined thousands of people who are 
              building sustainable fitness habits that actually stick.
            </Text>

            {/* Key Features */}
            <Section style={features}>
              <Text style={featuresTitle}>Here's what makes {appName} different:</Text>
              
              <div style={featureItem}>
                <Text style={featureIcon}>🔥</Text>
                <div>
                  <Text style={featureTitle}>Smart Streak System</Text>
                  <Text style={featureDesc}>Build momentum with our psychology-backed streak tracking. We even give you "joker tokens" for those inevitable busy days!</Text>
                </div>
              </div>
              
              <div style={featureItem}>
                <Text style={featureIcon}>📊</Text>
                <div>
                  <Text style={featureTitle}>Zero-Friction Logging</Text>
                  <Text style={featureDesc}>Log workouts and meals in seconds. No complicated forms, just quick wins that add up.</Text>
                </div>
              </div>
              
              <div style={featureItem}>
                <Text style={featureIcon}>🏆</Text>
                <div>
                  <Text style={featureTitle}>Micro-Leagues</Text>
                  <Text style={featureDesc}>Compete with people at your level in small, encouraging groups. No intimidating mega-leaderboards!</Text>
                </div>
              </div>
            </Section>

            {/* Call to Action */}
            <Section style={buttonContainer}>
              <Button style={button} href={loginUrl}>
                Start Your First Day 🚀
              </Button>
            </Section>

            {/* Quick Start Tips */}
            <Section style={tips}>
              <Heading style={h2}>Your 5-Minute Quick Start:</Heading>
              
              <Text style={tipText}>
                <strong>1. Log your first activity</strong> - Even a 5-minute walk counts! 🚶‍♀️
              </Text>
              
              <Text style={tipText}>
                <strong>2. Set your daily goal</strong> - Start small. Consistency beats intensity. 🎯
              </Text>
              
              <Text style={tipText}>
                <strong>3. Join a micro-league</strong> - Find your tribe and stay motivated! 👥
              </Text>
            </Section>

            {/* Social Proof */}
            <Section style={socialProof}>
              <Hr style={hr} />
              <Text style={testimonial}>
                <em>"Feel Sharper helped me build a 45-day workout streak without burnout. The joker tokens saved me during finals week!"</em>
              </Text>
              <Text style={testimonialAuthor}>- Sarah K., Student</Text>
            </Section>

            {/* Support */}
            <Section style={support}>
              <Text style={text}>
                Questions? Just reply to this email or check out our <Link style={link} href="https://feelsharper.com/help">help center</Link>.
              </Text>
              
              <Text style={text}>
                Cheering you on,<br />
                The {appName} Team 💪
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You received this email because you signed up for {appName}.
            </Text>
            {unsubscribeUrl && (
              <Text style={footerText}>
                <Link style={unsubscribeLink} href={unsubscribeUrl}>
                  Unsubscribe from these emails
                </Link>
              </Text>
            )}
            <Text style={footerText}>
              {appName} • Built with ❤️ for sustainable fitness habits
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  margin: 0,
  padding: 0,
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #f0f0f0',
  borderRadius: '8px',
  margin: '0 auto',
  maxWidth: '600px',
  padding: '0',
};

const header = {
  backgroundColor: '#0B2A4A',
  borderRadius: '8px 8px 0 0',
  padding: '20px 32px',
  textAlign: 'center' as const,
};

const logo = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
};

const content = {
  padding: '32px',
};

const h1 = {
  color: '#0B2A4A',
  fontSize: '28px',
  fontWeight: 'bold',
  lineHeight: '1.3',
  margin: '0 0 24px 0',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#0B2A4A',
  fontSize: '20px',
  fontWeight: 'bold',
  lineHeight: '1.4',
  margin: '32px 0 16px 0',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px 0',
};

const features = {
  margin: '32px 0',
};

const featuresTitle = {
  color: '#0B2A4A',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 20px 0',
};

const featureItem = {
  alignItems: 'flex-start',
  display: 'flex',
  marginBottom: '20px',
};

const featureIcon = {
  fontSize: '24px',
  marginRight: '16px',
  marginTop: '4px',
  minWidth: '40px',
};

const featureTitle = {
  color: '#0B2A4A',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 4px 0',
};

const featureDesc = {
  color: '#6B7280',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
};

const buttonContainer = {
  margin: '40px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#0B2A4A',
  borderRadius: '6px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  padding: '16px 32px',
  textDecoration: 'none',
};

const tips = {
  backgroundColor: '#F8FAFC',
  borderRadius: '8px',
  margin: '32px 0',
  padding: '24px',
};

const tipText = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 12px 0',
};

const socialProof = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const hr = {
  borderColor: '#E5E7EB',
  borderStyle: 'solid',
  borderWidth: '1px 0 0 0',
  margin: '32px 0',
};

const testimonial = {
  color: '#6B7280',
  fontSize: '16px',
  fontStyle: 'italic',
  lineHeight: '1.6',
  margin: '0 0 8px 0',
};

const testimonialAuthor = {
  color: '#9CA3AF',
  fontSize: '14px',
  margin: '0',
};

const support = {
  margin: '32px 0',
};

const link = {
  color: '#0B2A4A',
  textDecoration: 'underline',
};

const footer = {
  backgroundColor: '#F9FAFB',
  borderRadius: '0 0 8px 8px',
  padding: '24px 32px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#6B7280',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '0 0 8px 0',
};

const unsubscribeLink = {
  color: '#9CA3AF',
  textDecoration: 'underline',
};