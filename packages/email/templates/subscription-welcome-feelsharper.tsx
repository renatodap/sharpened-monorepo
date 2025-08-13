// Premium Welcome Email Template for Feel Sharper
// Sent after successful premium subscription

import { Html, Head, Body, Container, Text, Heading, Button, Section, Hr, Link } from '@react-email/components';

interface PremiumWelcomeEmailProps {
  firstName: string;
  appName: string;
  planName: string;
  planPrice: string;
  loginUrl: string;
  customerPortalUrl: string;
  unsubscribeUrl?: string;
}

export default function SubscriptionWelcomeFeelSharperEmail({
  firstName = 'Friend',
  appName = 'Feel Sharper',
  planName = 'Premium',
  planPrice = '$9.99/month',
  loginUrl = 'https://feelsharper.com/login',
  customerPortalUrl = 'https://feelsharper.com/account',
  unsubscribeUrl = 'https://feelsharper.com/unsubscribe',
}: PremiumWelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>💪 {appName} Premium</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>Welcome to {appName} Premium! ✨</Heading>
            
            <Text style={text}>
              Hi {firstName},
            </Text>
            
            <Text style={text}>
              🎉 <strong>You're now a Premium member!</strong> Thank you for choosing {planName} at {planPrice}. 
              You've just unlocked the full potential of {appName}.
            </Text>

            {/* Premium Benefits */}
            <Section style={benefits}>
              <Text style={benefitsTitle}>🚀 Your Premium superpowers are now active:</Text>
              
              <div style={benefitItem}>
                <Text style={benefitIcon}>🤖</Text>
                <div>
                  <Text style={benefitTitle}>AI Coaching</Text>
                  <Text style={benefitDesc}>Get personalized workout recommendations and meal suggestions based on your progress and goals.</Text>
                </div>
              </div>
              
              <div style={benefitItem}>
                <Text style={benefitIcon}>📊</Text>
                <div>
                  <Text style={benefitTitle}>Advanced Analytics</Text>
                  <Text style={benefitDesc}>Deep insights into your patterns, trends, and progress across all activities with beautiful charts.</Text>
                </div>
              </div>
              
              <div style={benefitItem}>
                <Text style={benefitIcon}>🏆</Text>
                <div>
                  <Text style={benefitTitle}>Unlimited Micro-Leagues</Text>
                  <Text style={benefitDesc}>Create and join as many leagues as you want. Build your fitness community!</Text>
                </div>
              </div>
              
              <div style={benefitItem}>
                <Text style={benefitIcon}>📱</Text>
                <div>
                  <Text style={benefitTitle}>Export Your Data</Text>
                  <Text style={benefitDesc}>Download your complete fitness history anytime in CSV format. Your data, your way.</Text>
                </div>
              </div>
              
              <div style={benefitItem}>
                <Text style={benefitIcon}>🎨</Text>
                <div>
                  <Text style={benefitTitle}>Custom Themes</Text>
                  <Text style={benefitDesc}>Personalize your interface with premium themes and dark mode options.</Text>
                </div>
              </div>
              
              <div style={benefitItem}>
                <Text style={benefitIcon}>⚡</Text>
                <div>
                  <Text style={benefitTitle}>Priority Support</Text>
                  <Text style={benefitDesc}>Get faster responses to questions and priority access to new features.</Text>
                </div>
              </div>
            </Section>

            {/* Call to Action */}
            <Section style={buttonContainer}>
              <Button style={button} href={loginUrl}>
                Explore Premium Features 🚀
              </Button>
            </Section>

            {/* First Steps */}
            <Section style={tips}>
              <Heading style={h2}>🎯 Make the most of Premium:</Heading>
              
              <Text style={tipText}>
                <strong>1. Set up AI Coaching</strong> - Visit your profile to set fitness goals and get personalized recommendations
              </Text>
              
              <Text style={tipText}>
                <strong>2. Check your Analytics</strong> - See detailed insights about your workout patterns and progress trends
              </Text>
              
              <Text style={tipText}>
                <strong>3. Customize your experience</strong> - Try the premium themes in Settings → Appearance
              </Text>
              
              <Text style={tipText}>
                <strong>4. Create a micro-league</strong> - Invite friends or find training partners in your area
              </Text>
            </Section>

            {/* Exclusive Tip */}
            <Section style={exclusiveTip}>
              <Heading style={h3}>💡 Premium Exclusive Tip</Heading>
              <Text style={tipText}>
                The AI Coach learns from your patterns. Log at least 7 activities this week to get your first 
                personalized workout recommendations! Early data shows Premium users who engage with AI Coaching 
                maintain <strong>2.3x longer streaks</strong>.
              </Text>
            </Section>

            {/* Account Management */}
            <Section style={accountSection}>
              <Hr style={hr} />
              <Heading style={h3}>Manage Your Subscription</Heading>
              <Text style={text}>
                You can view your billing details, update payment methods, or modify your subscription anytime:
              </Text>
              <Section style={buttonContainer}>
                <Button style={secondaryButton} href={customerPortalUrl}>
                  Manage Account
                </Button>
              </Section>
            </Section>

            {/* Support */}
            <Section style={support}>
              <Text style={text}>
                Questions about Premium features? Just reply to this email or check our 
                <Link style={link} href="https://feelsharper.com/help/premium"> Premium help guide</Link>.
              </Text>
              
              <Text style={text}>
                Here to support your fitness journey,<br />
                The {appName} Team 💪
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You received this email because you subscribed to {appName} {planName}.
            </Text>
            <Text style={footerText}>
              <Link style={link} href={customerPortalUrl}>Manage subscription</Link> • 
              <Link style={link} href="https://feelsharper.com/help"> Help center</Link>
            </Text>
            {unsubscribeUrl && (
              <Text style={footerText}>
                <Link style={unsubscribeLink} href={unsubscribeUrl}>
                  Unsubscribe from promotional emails
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
  background: 'linear-gradient(135deg, #0B2A4A 0%, #1E40AF 100%)',
  borderRadius: '8px 8px 0 0',
  padding: '24px 32px',
  textAlign: 'center' as const,
};

const logo = {
  color: '#ffffff',
  fontSize: '26px',
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

const h3 = {
  color: '#0B2A4A',
  fontSize: '18px',
  fontWeight: '600',
  lineHeight: '1.4',
  margin: '24px 0 12px 0',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px 0',
};

const benefits = {
  margin: '32px 0',
};

const benefitsTitle = {
  color: '#0B2A4A',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 24px 0',
};

const benefitItem = {
  alignItems: 'flex-start',
  display: 'flex',
  marginBottom: '20px',
  padding: '16px',
  backgroundColor: '#F8FAFC',
  borderRadius: '8px',
  border: '1px solid #E2E8F0',
};

const benefitIcon = {
  fontSize: '24px',
  marginRight: '16px',
  marginTop: '2px',
  minWidth: '40px',
};

const benefitTitle = {
  color: '#0B2A4A',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 6px 0',
};

const benefitDesc = {
  color: '#6B7280',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
};

const buttonContainer = {
  margin: '32px 0',
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

const secondaryButton = {
  backgroundColor: '#ffffff',
  border: '2px solid #0B2A4A',
  borderRadius: '6px',
  color: '#0B2A4A',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  padding: '14px 32px',
  textDecoration: 'none',
};

const tips = {
  backgroundColor: '#F0FDF4',
  borderRadius: '8px',
  margin: '32px 0',
  padding: '24px',
  border: '1px solid #BBF7D0',
};

const exclusiveTip = {
  backgroundColor: '#FEF3C7',
  borderRadius: '8px',
  margin: '32px 0',
  padding: '20px',
  border: '1px solid #FCD34D',
};

const tipText = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 12px 0',
};

const accountSection = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const hr = {
  borderColor: '#E5E7EB',
  borderStyle: 'solid',
  borderWidth: '1px 0 0 0',
  margin: '32px 0 24px 0',
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