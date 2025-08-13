// Resend Email Configuration
// Based on owner decision DG-007: Email service approved

import { Resend } from 'resend';

export const RESEND_CONFIG = {
  // API Configuration
  api: {
    baseUrl: 'https://api.resend.com',
    version: 'v1',
  },
  
  // Email domains (to be configured after domain verification)
  domains: {
    feelsharper: 'feelsharper.com',
    studysharper: 'studysharper.com', 
    sharpened: 'sharpened.app',
    // Fallback to resend domain if custom domains not set up
    default: 'no-reply@resend.dev',
  },
  
  // From addresses for different email types
  senders: {
    noreply: 'no-reply@{domain}',
    support: 'support@{domain}',
    notifications: 'notifications@{domain}',
    marketing: 'updates@{domain}',
  },
  
  // Email templates configuration
  templates: {
    // Authentication emails
    welcome: {
      subject: 'Welcome to {appName}! 🎯',
      templateId: 'welcome-{app}',
    },
    emailVerification: {
      subject: 'Verify your {appName} account',
      templateId: 'email-verification-{app}',
    },
    passwordReset: {
      subject: 'Reset your {appName} password',
      templateId: 'password-reset-{app}',
    },
    
    // Subscription emails
    subscriptionWelcome: {
      subject: 'Welcome to {appName} Premium! ✨',
      templateId: 'subscription-welcome-{app}',
    },
    subscriptionCancelled: {
      subject: 'We\'re sorry to see you go 😔',
      templateId: 'subscription-cancelled-{app}',
    },
    subscriptionExpired: {
      subject: 'Your {appName} Premium has expired',
      templateId: 'subscription-expired-{app}',
    },
    paymentFailed: {
      subject: 'Payment issue with your {appName} subscription',
      templateId: 'payment-failed-{app}',
    },
    refundConfirmed: {
      subject: 'Refund confirmed for {appName}',
      templateId: 'refund-confirmed-{app}',
    },
    
    // Engagement emails
    streakReminder: {
      subject: 'Don\'t break your {streakLength}-day streak! 🔥',
      templateId: 'streak-reminder-feelsharper',
    },
    weeklyProgress: {
      subject: 'Your weekly progress summary 📊',
      templateId: 'weekly-progress-{app}',
    },
    goalAchieved: {
      subject: 'Congratulations! Goal achieved! 🎉',
      templateId: 'goal-achieved-{app}',
    },
    leagueUpdate: {
      subject: 'League update: You\'re #{rank}! 🏆',
      templateId: 'league-update-studysharper',
    },
    
    // Re-engagement emails
    winbackOffer: {
      subject: 'We miss you! Come back for 50% off 💝',
      templateId: 'winback-offer-{app}',
    },
    dormantUser: {
      subject: 'Your {appName} data is waiting for you 🌱',
      templateId: 'dormant-user-{app}',
    },
  },
  
  // Email scheduling and frequency limits
  frequency: {
    // Prevent email fatigue
    maxPerDay: 3,
    maxPerWeek: 10,
    
    // Minimum intervals between email types (hours)
    intervals: {
      promotional: 72, // 3 days between promotional emails
      reminder: 24,    // 1 day between reminders
      transactional: 0, // No limit on transactional emails
    },
  },
  
  // Segmentation rules
  segmentation: {
    newUsers: {
      daysFromSignup: 0,
      maxDaysFromSignup: 7,
      subscriptionTier: 'any',
    },
    
    activeUsers: {
      daysFromLastActivity: 0,
      maxDaysFromLastActivity: 7,
      subscriptionTier: 'any',
    },
    
    premiumUsers: {
      subscriptionTier: 'premium',
      subscriptionStatus: 'active',
    },
    
    atRiskUsers: {
      daysFromLastActivity: 7,
      maxDaysFromLastActivity: 30,
      subscriptionTier: 'premium',
    },
    
    churnedUsers: {
      daysFromLastActivity: 30,
      subscriptionTier: 'any',
    },
  },
  
  // Email preferences defaults
  preferences: {
    transactional: true,     // Always enabled
    product_updates: true,   // Product announcements
    weekly_summary: true,    // Weekly progress reports
    streak_reminders: true,  // Streak break prevention
    league_updates: false,   // League ranking changes
    promotional: false,      // Marketing and offers
    tips_coaching: true,     // AI coaching tips
  },
  
  // A/B testing configuration
  experiments: {
    subjectLines: {
      enabled: true,
      variants: ['control', 'variant_a', 'variant_b'],
      splitPercentage: [50, 25, 25],
    },
    
    sendTime: {
      enabled: true,
      variants: ['morning', 'afternoon', 'evening'],
      timeZones: ['user_timezone', 'optimal_time'],
    },
    
    frequency: {
      enabled: true,
      variants: ['normal', 'reduced', 'increased'],
    },
  },
  
  // Analytics and tracking
  tracking: {
    openTracking: true,
    clickTracking: true,
    unsubscribeTracking: true,
    
    // UTM parameters for email links
    utm: {
      source: 'email',
      medium: 'email',
      campaign: '{templateId}',
      content: '{variant}',
    },
  },
  
  // Compliance settings
  compliance: {
    // Required unsubscribe link in all non-transactional emails
    unsubscribeRequired: true,
    unsubscribeText: 'Unsubscribe from these emails',
    
    // GDPR compliance
    gdprCompliant: true,
    dataRetentionDays: 90, // Align with owner's data retention decision
    
    // CAN-SPAM compliance
    physicalAddress: 'To be updated with business address',
    
    // Privacy policy link
    privacyPolicyUrl: 'https://{domain}/privacy',
  },
};

// Resend client wrapper
export class ResendEmailService {
  private resend: Resend;
  private domain: string;
  
  constructor(apiKey: string, domain: string = 'default') {
    this.resend = new Resend(apiKey);
    this.domain = domain;
  }
  
  // Get appropriate from address based on email type
  private getFromAddress(type: keyof typeof RESEND_CONFIG.senders, app: string): string {
    const senderTemplate = RESEND_CONFIG.senders[type];
    const actualDomain = RESEND_CONFIG.domains[app as keyof typeof RESEND_CONFIG.domains] || 
                        RESEND_CONFIG.domains.default;
    
    return senderTemplate.replace('{domain}', actualDomain);
  }
  
  // Send transactional email
  async sendTransactional(params: {
    templateId: string;
    to: string;
    app: 'feelsharper' | 'studysharper' | 'sharpened';
    variables?: Record<string, any>;
    attachments?: Array<{
      filename: string;
      content: string | Buffer;
      contentType?: string;
    }>;
  }) {
    const { templateId, to, app, variables = {}, attachments } = params;
    
    // Get template configuration
    const templateKey = Object.keys(RESEND_CONFIG.templates).find(key => 
      RESEND_CONFIG.templates[key as keyof typeof RESEND_CONFIG.templates].templateId.includes(templateId)
    );
    
    if (!templateKey) {
      throw new Error(`Template ${templateId} not found`);
    }
    
    const template = RESEND_CONFIG.templates[templateKey as keyof typeof RESEND_CONFIG.templates];
    
    // Prepare email data
    const emailData = {
      from: this.getFromAddress('noreply', app),
      to,
      subject: this.interpolateString(template.subject, { 
        appName: this.getAppName(app),
        ...variables 
      }),
      html: await this.renderTemplate(templateId, { 
        appName: this.getAppName(app),
        app,
        ...variables 
      }),
      attachments,
      tags: [
        { name: 'app', value: app },
        { name: 'template', value: templateId },
        { name: 'type', value: 'transactional' },
      ],
    };
    
    return await this.resend.emails.send(emailData);
  }
  
  // Send marketing email with frequency checks
  async sendMarketing(params: {
    templateId: string;
    to: string;
    app: 'feelsharper' | 'studysharper' | 'sharpened';
    variables?: Record<string, any>;
    segment?: string;
    experimentVariant?: string;
  }) {
    const { templateId, to, app, variables = {}, segment, experimentVariant } = params;
    
    // Check if user can receive marketing emails
    const canSend = await this.checkEmailFrequency(to, 'promotional');
    if (!canSend) {
      throw new Error('Email frequency limit exceeded');
    }
    
    // Check user preferences
    const preferences = await this.getUserPreferences(to);
    if (!preferences.promotional) {
      throw new Error('User has opted out of promotional emails');
    }
    
    // Get template configuration
    const templateKey = Object.keys(RESEND_CONFIG.templates).find(key =>
      RESEND_CONFIG.templates[key as keyof typeof RESEND_CONFIG.templates].templateId.includes(templateId)
    );
    
    if (!templateKey) {
      throw new Error(`Template ${templateId} not found`);
    }
    
    const template = RESEND_CONFIG.templates[templateKey as keyof typeof RESEND_CONFIG.templates];
    
    // Apply A/B testing variants
    let subject = template.subject;
    if (experimentVariant && RESEND_CONFIG.experiments.subjectLines.enabled) {
      subject = await this.getExperimentVariant(templateId, 'subject', experimentVariant) || subject;
    }
    
    const emailData = {
      from: this.getFromAddress('marketing', app),
      to,
      subject: this.interpolateString(subject, { 
        appName: this.getAppName(app),
        ...variables 
      }),
      html: await this.renderTemplate(templateId, {
        appName: this.getAppName(app),
        app,
        unsubscribeUrl: await this.getUnsubscribeUrl(to, app),
        ...variables
      }),
      tags: [
        { name: 'app', value: app },
        { name: 'template', value: templateId },
        { name: 'type', value: 'marketing' },
        { name: 'segment', value: segment || 'general' },
        { name: 'variant', value: experimentVariant || 'control' },
      ],
    };
    
    const result = await this.resend.emails.send(emailData);
    
    // Track email send for frequency limiting
    await this.trackEmailSend(to, 'promotional');
    
    return result;
  }
  
  // Send reminder email
  async sendReminder(params: {
    templateId: string;
    to: string;
    app: 'feelsharper' | 'studysharper' | 'sharpened';
    variables?: Record<string, any>;
  }) {
    const { templateId, to, app, variables = {} } = params;
    
    // Check frequency limits
    const canSend = await this.checkEmailFrequency(to, 'reminder');
    if (!canSend) {
      return { error: 'Frequency limit exceeded' };
    }
    
    // Check user preferences
    const preferences = await this.getUserPreferences(to);
    const templateKey = Object.keys(RESEND_CONFIG.templates).find(key =>
      RESEND_CONFIG.templates[key as keyof typeof RESEND_CONFIG.templates].templateId.includes(templateId)
    );
    
    // Check specific preference based on template
    if (templateId.includes('streak') && !preferences.streak_reminders) {
      return { error: 'User opted out of streak reminders' };
    }
    
    const template = RESEND_CONFIG.templates[templateKey as keyof typeof RESEND_CONFIG.templates];
    
    const emailData = {
      from: this.getFromAddress('notifications', app),
      to,
      subject: this.interpolateString(template.subject, {
        appName: this.getAppName(app),
        ...variables
      }),
      html: await this.renderTemplate(templateId, {
        appName: this.getAppName(app),
        app,
        ...variables
      }),
      tags: [
        { name: 'app', value: app },
        { name: 'template', value: templateId },
        { name: 'type', value: 'reminder' },
      ],
    };
    
    const result = await this.resend.emails.send(emailData);
    
    // Track for frequency limiting
    await this.trackEmailSend(to, 'reminder');
    
    return result;
  }
  
  // Batch email sending for campaigns
  async sendBatch(emails: Array<{
    templateId: string;
    to: string;
    app: 'feelsharper' | 'studysharper' | 'sharpened';
    variables?: Record<string, any>;
    segment?: string;
  }>) {
    const results = [];
    
    for (const email of emails) {
      try {
        const result = await this.sendMarketing(email);
        results.push({ success: true, email: email.to, result });
      } catch (error) {
        results.push({ success: false, email: email.to, error: error.message });
      }
      
      // Rate limiting - space out sends
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }
  
  // Helper methods
  private getAppName(app: string): string {
    const appNames = {
      feelsharper: 'Feel Sharper',
      studysharper: 'Study Sharper',
      sharpened: 'Sharpened',
    };
    return appNames[app as keyof typeof appNames] || app;
  }
  
  private interpolateString(template: string, variables: Record<string, any>): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return variables[key] !== undefined ? variables[key] : match;
    });
  }
  
  private async renderTemplate(templateId: string, variables: Record<string, any>): Promise<string> {
    // This would integrate with a template engine or load from files
    // For now, return a placeholder
    return `<p>Email template ${templateId} with variables: ${JSON.stringify(variables)}</p>`;
  }
  
  private async checkEmailFrequency(email: string, type: string): Promise<boolean> {
    // This would check against a database of sent emails
    // Implementation depends on your tracking system
    return true; // Placeholder
  }
  
  private async trackEmailSend(email: string, type: string): Promise<void> {
    // This would record the email send for frequency tracking
    // Implementation depends on your tracking system
    console.log(`Tracked email send: ${email}, type: ${type}`);
  }
  
  private async getUserPreferences(email: string): Promise<typeof RESEND_CONFIG.preferences> {
    // This would fetch from user preferences database
    // Return defaults for now
    return RESEND_CONFIG.preferences;
  }
  
  private async getUnsubscribeUrl(email: string, app: string): Promise<string> {
    // Generate unsubscribe URL with token
    const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');
    const domain = RESEND_CONFIG.domains[app as keyof typeof RESEND_CONFIG.domains];
    return `https://${domain}/unsubscribe?token=${token}`;
  }
  
  private async getExperimentVariant(templateId: string, type: string, variant: string): Promise<string | null> {
    // This would fetch A/B test variants from database
    return null; // Placeholder
  }
}

// Export singleton instance
let emailService: ResendEmailService | null = null;

export function getEmailService(app: 'feelsharper' | 'studysharper' | 'sharpened' = 'sharpened'): ResendEmailService {
  if (!emailService) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable not set');
    }
    emailService = new ResendEmailService(apiKey, app);
  }
  return emailService;
}

// Utility function for common email patterns
export const EmailUtils = {
  // Send welcome series for new users
  async sendWelcomeSeries(email: string, app: 'feelsharper' | 'studysharper', userVariables: Record<string, any>) {
    const service = getEmailService(app);
    
    // Immediate welcome email
    await service.sendTransactional({
      templateId: `welcome-${app}`,
      to: email,
      app,
      variables: userVariables,
    });
    
    // Schedule follow-up emails (would use a job queue in production)
    // Day 2: Getting started tips
    // Day 7: Progress check-in
    // Day 30: Upgrade prompt for free users
  },
  
  // Send streak maintenance reminder
  async sendStreakReminder(email: string, streakLength: number, appName: string) {
    const service = getEmailService('feelsharper');
    
    return await service.sendReminder({
      templateId: 'streak-reminder-feelsharper',
      to: email,
      app: 'feelsharper',
      variables: {
        streakLength,
        appName,
      },
    });
  },
  
  // Send weekly progress summary
  async sendWeeklyProgress(email: string, app: 'feelsharper' | 'studysharper', progressData: Record<string, any>) {
    const service = getEmailService(app);
    
    return await service.sendMarketing({
      templateId: `weekly-progress-${app}`,
      to: email,
      app,
      variables: progressData,
      segment: 'active_users',
    });
  },
};