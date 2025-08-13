import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

// Configure web-push (you'll need to set these environment variables)
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || '',
};

if (vapidKeys.publicKey && vapidKeys.privateKey) {
  webpush.setVapidDetails(
    'mailto:support@feelsharper.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
}

export async function POST(request: NextRequest) {
  try {
    const { title, body, icon, actions, data } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // TODO: Get subscriptions from database for the user(s)
    // const subscriptions = await getUserSubscriptions(userId);
    
    // For demo purposes, we'll use a mock subscription
    const mockSubscriptions: any[] = [];

    const notificationPayload = {
      title,
      body: body || '',
      icon: icon || '/icons/icon-192x192.png.svg',
      badge: '/icons/badge-72x72.png.svg',
      actions: actions || [
        {
          action: 'view',
          title: 'View',
          icon: '/icons/view-action.png'
        }
      ],
      data: {
        url: '/today',
        ...data
      },
      timestamp: Date.now(),
      requireInteraction: false,
      silent: false
    };

    const results = await Promise.allSettled(
      mockSubscriptions.map(subscription =>
        webpush.sendNotification(
          subscription,
          JSON.stringify(notificationPayload)
        )
      )
    );

    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    console.log(`Notifications sent: ${successful} successful, ${failed} failed`);

    return NextResponse.json({
      success: true,
      sent: successful,
      failed: failed,
      message: `Sent ${successful} notifications`
    });

  } catch (error) {
    console.error('Failed to send push notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get user subscriptions from database
async function getUserSubscriptions(userId: string) {
  // Example with Supabase:
  // const { data, error } = await supabase
  //   .from('push_subscriptions')
  //   .select('*')
  //   .eq('user_id', userId);
  
  // return data?.map(sub => ({
  //   endpoint: sub.endpoint,
  //   keys: {
  //     p256dh: sub.p256dh_key,
  //     auth: sub.auth_key
  //   }
  // })) || [];
  
  return [];
}

// Example scheduled notification endpoint
export async function GET(request: NextRequest) {
  try {
    // This could be called by a cron job to send scheduled notifications
    const url = new URL(request.url);
    const type = url.searchParams.get('type');

    const notifications: Record<string, any> = {
      'workout-reminder': {
        title: 'Time to Work Out! 💪',
        body: "You've got this! Let's log that workout.",
        actions: [
          {
            action: 'log-workout',
            title: 'Log Workout',
            icon: '/icons/workout-action.png'
          }
        ],
        data: { url: '/log/workout' }
      },
      'meal-reminder': {
        title: 'Meal Time! 🍽️',
        body: "Don't forget to log your meals to stay on track.",
        actions: [
          {
            action: 'log-meal',
            title: 'Log Meal',
            icon: '/icons/meal-action.png'
          }
        ],
        data: { url: '/log/meal' }
      },
      'progress-update': {
        title: 'Great Progress! 📈',
        body: "You're 70% closer to your weekly goal. Keep it up!",
        data: { url: '/progress' }
      }
    };

    if (type && notifications[type]) {
      // Send the specific notification type
      const notification = notifications[type];
      
      // This would typically be called for specific users
      // For now, just return the notification data
      return NextResponse.json({
        success: true,
        notification,
        message: `${type} notification ready to send`
      });
    }

    return NextResponse.json({
      success: true,
      availableTypes: Object.keys(notifications),
      message: 'Notification service is running'
    });

  } catch (error) {
    console.error('Failed to process scheduled notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}