import type { Metadata } from 'next';
import { Dumbbell, Plus, Calendar, TrendingUp, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Workouts | Feel Sharper',
  description: 'Track your workouts with fast logging and progress insights.',
};

export default function WorkoutsPage() {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Workouts</h1>
            <p className="text-text-secondary text-lg">{today}</p>
          </div>
          <a
            href="/workouts/add"
            className="inline-flex items-center px-6 py-3 bg-navy text-white rounded-xl hover:bg-navy-600 transition-colors focus:outline-none focus:ring-2 focus:ring-focus"
          >
            <Plus className="w-5 h-5 mr-2" />
            Log Workout
          </a>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="text-2xl font-bold text-text-primary">0</div>
            <div className="text-sm text-text-secondary">This Week</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="text-2xl font-bold text-text-primary">0</div>
            <div className="text-sm text-text-secondary">Total Volume</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="text-2xl font-bold text-text-primary">0</div>
            <div className="text-sm text-text-secondary">Duration</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="text-2xl font-bold text-text-primary">0</div>
            <div className="text-sm text-text-secondary">PRs</div>
          </div>
        </div>

        {/* Today's Workout */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Today's Workout</h2>
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="py-12 text-center">
              <Dumbbell className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-secondary mb-2">
                No workout logged yet
              </h3>
              <p className="text-text-muted mb-6">
                Start tracking your workout or paste from your notes app
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <a
                  href="/workouts/add"
                  className="inline-flex items-center px-6 py-3 bg-navy text-white rounded-xl hover:bg-navy-600 transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Manual Entry
                </a>
                <a
                  href="/workouts/add?mode=ai"
                  className="inline-flex items-center px-6 py-3 bg-surface-2 border border-border text-text-primary rounded-xl hover:bg-surface-3 transition-colors"
                >
                  <Dumbbell className="w-5 h-5 mr-2" />
                  AI Parser
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Workouts */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Recent Workouts</h2>
            <button className="text-navy hover:underline">
              View all
            </button>
          </div>
          
          <div className="bg-surface-2 border-2 border-dashed border-border rounded-xl p-12 text-center">
            <Calendar className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-secondary mb-2">
              Start logging workouts
            </h3>
            <p className="text-text-muted mb-6">
              Your recent workouts will appear here once you start tracking
            </p>
            <a
              href="/workouts/add"
              className="inline-flex items-center px-6 py-3 bg-navy text-white rounded-xl hover:bg-navy-600 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Log First Workout
            </a>
          </div>
        </section>

        {/* Exercise Templates */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Popular Exercises */}
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-navy" />
                <h3 className="text-lg font-semibold">Popular Exercises</h3>
              </div>
              <div className="space-y-3">
                <div className="py-8 text-center">
                  <p className="text-text-secondary">No popular exercises yet</p>
                  <p className="text-text-muted text-sm mt-1">
                    Start logging to see your most-used exercises
                  </p>
                </div>
              </div>
            </div>

            {/* Workout Templates */}
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-info" />
                  <h3 className="text-lg font-semibold">Workout Templates</h3>
                </div>
                <button className="text-navy hover:underline text-sm">
                  Create template
                </button>
              </div>
              <div className="space-y-3">
                <div className="py-8 text-center">
                  <p className="text-text-secondary">No templates saved</p>
                  <p className="text-text-muted text-sm mt-1">
                    Save frequently used workouts as templates
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}