// Notion Streak Template Integration
// Based on MARKET_KNOWLEDGE.md - distribute templates for top-of-funnel acquisition

export const NOTION_STREAK_TEMPLATE = {
  version: '1.0.0',
  name: 'Sharpened Streak Tracker',
  description: 'Builder-Athlete streak tracking with Sharpened integration',
  
  // Notion database schema
  database: {
    title: '🔥 Sharpened Streaks',
    icon: '🎯',
    properties: {
      Date: {
        type: 'date',
        description: 'Log date'
      },
      'Fitness Logged': {
        type: 'checkbox',
        description: 'Weight, workout, or meal logged'
      },
      'Study Session': {
        type: 'checkbox', 
        description: 'Focus session completed'
      },
      'Streak Count': {
        type: 'formula',
        formula: 'if(and(prop("Fitness Logged"), prop("Study Session")), prop("Previous Streak") + 1, 0)',
        description: 'Current streak count'
      },
      'Previous Streak': {
        type: 'rollup',
        relation: 'Previous Day',
        property: 'Streak Count',
        calculate: 'sum'
      },
      'Focus Minutes': {
        type: 'number',
        description: 'Minutes focused today'
      },
      'Calories': {
        type: 'number',
        description: 'Total calories logged'
      },
      'Protein (g)': {
        type: 'number',
        description: 'Protein intake'
      },
      'Weight (kg)': {
        type: 'number',
        description: 'Morning weight'
      },
      'Workout': {
        type: 'multi_select',
        options: ['Push', 'Pull', 'Legs', 'Cardio', 'Rest'],
        description: 'Workout type'
      },
      'Energy Level': {
        type: 'select',
        options: ['🔥 Peak', '💪 Strong', '👍 Good', '😴 Tired', '💤 Exhausted'],
        description: 'Daily energy'
      },
      'Notes': {
        type: 'rich_text',
        description: 'Daily reflection'
      },
      'Sharpened Sync': {
        type: 'url',
        description: 'Deep link to Sharpened app'
      },
      'Week': {
        type: 'formula',
        formula: 'formatDate(prop("Date"), "W")',
        description: 'Week number'
      },
      'Month': {
        type: 'formula',
        formula: 'formatDate(prop("Date"), "MMM")',
        description: 'Month'
      }
    }
  },

  // Pre-built views
  views: [
    {
      name: '📅 Current Week',
      type: 'table',
      filter: {
        property: 'Date',
        condition: 'this_week'
      },
      sort: {
        property: 'Date',
        direction: 'descending'
      }
    },
    {
      name: '🔥 Streak Calendar',
      type: 'calendar',
      property: 'Date'
    },
    {
      name: '📊 Monthly Stats',
      type: 'board',
      groupBy: 'Month',
      sort: {
        property: 'Streak Count',
        direction: 'descending'
      }
    },
    {
      name: '💪 Workout Log',
      type: 'gallery',
      filter: {
        property: 'Workout',
        condition: 'is_not_empty'
      },
      coverProperty: 'Workout'
    },
    {
      name: '🎯 Focus Sessions',
      type: 'timeline',
      filter: {
        property: 'Focus Minutes',
        condition: 'greater_than',
        value: 0
      }
    }
  ],

  // Template pages with content
  templates: [
    {
      title: '📝 Daily Log Template',
      content: `
## Morning Routine
- [ ] Weight logged
- [ ] Plan workout
- [ ] Set focus goals

## Fitness
### Meals
- **Breakfast**: 
- **Lunch**: 
- **Dinner**: 
- **Snacks**: 

### Workout
- **Type**: 
- **Duration**: 
- **Notes**: 

## Study/Work
### Focus Sessions
- **Session 1**: 
- **Session 2**: 
- **Session 3**: 

### Key Accomplishments
- 

## Evening Reflection
### What went well?
- 

### What to improve?
- 

### Tomorrow's priority:
- 

---
[Sync with Sharpened →](sharpened://sync/today)
      `
    },
    {
      title: '📊 Weekly Review Template',
      content: `
## Week of {{date}}

### 📈 Metrics
- **Streak**: X days
- **Focus Hours**: X
- **Workouts**: X
- **Avg Calories**: X
- **Avg Protein**: Xg

### 💪 Fitness
#### Best Workout
- 

#### Progress
- Weight trend: 
- Strength gains: 
- Cardio improvements: 

### 🧠 Study/Work
#### Top Achievements
1. 
2. 
3. 

#### Focus Quality
- Best session: 
- Distractions faced: 
- Improvements made: 

### 🎯 Next Week Goals
- [ ] 
- [ ] 
- [ ] 

---
[View in Sharpened →](sharpened://week/review)
      `
    }
  ],

  // Automation rules
  automations: [
    {
      trigger: 'page_created',
      condition: 'date_is_today',
      action: 'apply_template',
      template: 'Daily Log Template'
    },
    {
      trigger: 'property_updated',
      condition: 'streak_count_reaches_7',
      action: 'add_badge',
      badge: '🏆 Week Warrior'
    },
    {
      trigger: 'property_updated',
      condition: 'streak_count_reaches_30',
      action: 'add_badge',
      badge: '🔥 Monthly Master'
    }
  ],

  // Integration deeplinks
  deeplinks: {
    syncToday: 'sharpened://sync/notion/today',
    importTemplate: 'sharpened://import/notion/template',
    viewStats: 'sharpened://stats/notion',
    joinLeague: 'sharpened://league/notion-users'
  },

  // Export format for Notion
  exportFormat: 'notion-template-v2',
  
  // Installation instructions
  installation: {
    steps: [
      'Click "Duplicate" on this template',
      'Allow Sharpened integration (optional for auto-sync)',
      'Customize properties to match your routine',
      'Set up daily reminder at your preferred time',
      'Start logging! First entry creates your streak'
    ],
    videoUrl: 'https://sharpened.app/notion-setup',
    supportEmail: 'notion@sharpened.app'
  },

  // Marketing copy for distribution
  marketing: {
    headline: '🔥 The Builder-Athlete Notion Template',
    subheadline: 'Track fitness + focus in one place. Sync with Sharpened for auto-logging.',
    bullets: [
      '✅ Automatic streak calculation',
      '📊 Weekly/monthly dashboards',
      '🔄 2-way Sharpened sync',
      '🏆 Achievement badges',
      '📱 Mobile-friendly views'
    ],
    cta: 'Duplicate Template (Free)',
    targetAudience: [
      'CS students who lift',
      'Engineers training for marathons',
      'Startup founders who prioritize fitness',
      'Remote workers building habits'
    ],
    distributionChannels: [
      'Notion Template Gallery',
      'Product Hunt',
      'Reddit (r/Notion, r/getdisciplined)',
      'Twitter/X Notion community',
      'University Discord servers'
    ]
  }
};

// Helper function to generate Notion API payload
export function generateNotionPayload(data: any) {
  return {
    parent: { database_id: process.env.NOTION_DATABASE_ID },
    properties: {
      Date: {
        date: { start: data.date }
      },
      'Fitness Logged': {
        checkbox: data.fitnessLogged
      },
      'Study Session': {
        checkbox: data.studySession
      },
      'Focus Minutes': {
        number: data.focusMinutes
      },
      'Calories': {
        number: data.calories
      },
      'Protein (g)': {
        number: data.protein
      },
      'Weight (kg)': {
        number: data.weight
      },
      'Workout': {
        multi_select: data.workout?.map((w: string) => ({ name: w })) || []
      },
      'Energy Level': {
        select: { name: data.energyLevel }
      },
      'Notes': {
        rich_text: [{
          text: { content: data.notes || '' }
        }]
      },
      'Sharpened Sync': {
        url: `sharpened://day/${data.date}`
      }
    }
  };
}

// Export template as downloadable file
export function exportTemplate() {
  const templateData = JSON.stringify(NOTION_STREAK_TEMPLATE, null, 2);
  const blob = new Blob([templateData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sharpened-notion-template.json';
  a.click();
  
  URL.revokeObjectURL(url);
}

// Generate sharing URL with pre-filled template
export function generateSharingUrl(userRef?: string) {
  const baseUrl = 'https://notion.so/templates/sharpened-streak-tracker';
  const params = new URLSearchParams({
    ref: userRef || 'organic',
    utm_source: 'sharpened',
    utm_medium: 'template',
    utm_campaign: 'notion_integration'
  });
  
  return `${baseUrl}?${params.toString()}`;
}