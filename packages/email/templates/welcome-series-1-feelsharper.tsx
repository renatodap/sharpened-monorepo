// Welcome Series Email 1: Instant welcome + quick win tip
// Sent immediately after signup

import { Html, Head, Body, Container, Text, Heading, Button, Section, Hr, Link } from '@react-email/components';

interface WelcomeSeries1Props {
  firstName: string;
  appName: string;
  quickLogUrl: string;
  unsubscribeUrl?: string;
  personalizedTip?: string;
}

export default function WelcomeSeries1Email({
  firstName = 'Friend',
  appName = 'Feel Sharper',
  quickLogUrl = 'https://feelsharper.com/today',
  unsubscribeUrl = 'https://feelsharper.com/unsubscribe',
  personalizedTip = "Even a 5-minute walk counts as a win! 🚶‍♀️",
}: WelcomeSeries1Props) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>🎯 {appName}</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>Welcome! Here's your first win 🚀</Heading>
            
            <Text style={text}>
              Hi {firstName},
            </Text>
            
            <Text style={text}>
              You just made the most important step: starting. 🎉
            </Text>

            {/* Quick Win Section */}
            <Section style={quickWin}>
              <Text style={quickWinTitle}>Your 30-second quick win:</Text>
              <Text style={quickWinTip}>{personalizedTip}</Text>
              <Text style={quickWinSubtext}>
                Small steps lead to big changes. Let's log your first activity right now!
              </Text>
            </Section>

            {/* Call to Action */}
            <Section style={buttonContainer}>
              <Button style={button} href={quickLogUrl}>
                Log Your First Activity ⚡
              </Button>
            </Section>

            {/* Why This Matters */}
            <Section style={whySection}>
              <Text style={whyTitle}>Why start small?</Text>
              <Text style={whyText}>
                Research shows that consistency beats intensity. People who start with tiny habits 
                are <strong>3x more likely</strong> to stick with them long-term.
              </Text>
              <Text style={whyText}>
                Your brain loves quick wins - they release dopamine and create momentum for bigger changes.
              </Text>
            </Section>

            {/* What's Coming Next */}
            <Section style={preview}>
              <Hr style={hr} />
              <Text style={previewTitle}>What's coming next:</Text>
              <Text style={previewText}>
                📧 <strong>Tomorrow:</strong> I'll show you the easiest way to log workouts (takes 10 seconds)<br/>
                📧 <strong>Day 3:</strong> Meet your AI coach - it's like having a personal trainer in your pocket<br/>
                📧 <strong>Day 7:</strong> Success story from someone just like you<br/>
                📧 <strong>Day 14:</strong> Unlock premium features that supercharge your results
              </Text>
            </Section>

            {/* Support */}
            <Section style={support}>
              <Text style={text}>
                Questions? Just reply to this email - I read every single one.
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
              You're receiving this as part of our welcome series for new {appName} members.
            </Text>
            {unsubscribeUrl && (
              <Text style={footerText}>
                <Link style={unsubscribeLink} href={unsubscribeUrl}>
                  Unsubscribe
                </Link> | <Link style={link} href="https://feelsharper.com/preferences">Email preferences</Link>
              </Text>
            )}
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

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px 0',
};

const quickWin = {
  backgroundColor: '#FEF3C7',
  border: '2px solid #F59E0B',
  borderRadius: '8px',
  margin: '32px 0',
  padding: '24px',
  textAlign: 'center' as const,
};

const quickWinTitle = {
  color: '#92400E',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 12px 0',
};

const quickWinTip = {
  color: '#92400E',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const quickWinSubtext = {
  color: '#A16207',
  fontSize: '14px',
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

const whySection = {
  margin: '32px 0',
};

const whyTitle = {
  color: '#0B2A4A',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 12px 0',
};

const whyText = {
  color: '#6B7280',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 12px 0',
};

const preview = {
  margin: '32px 0',
};

const hr = {
  borderColor: '#E5E7EB',
  borderStyle: 'solid',
  borderWidth: '1px 0 0 0',
  margin: '24px 0',
};

const previewTitle = {
  color: '#0B2A4A',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px 0',
};

const previewText = {
  color: '#6B7280',
  fontSize: '14px',
  lineHeight: '1.6',
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