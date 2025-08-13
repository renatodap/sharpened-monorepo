import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Offline - Feel Sharper',
  description: 'You are currently offline. Feel Sharper will work again when your connection is restored.',
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md mx-auto">
        {/* Offline Icon */}
        <div className="mb-8">
          <svg 
            className="w-24 h-24 mx-auto text-navy-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728M3 12h18m-9-9v18" 
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-text-primary mb-4">
          You're Offline
        </h1>

        {/* Description */}
        <p className="text-text-secondary mb-6 leading-relaxed">
          Feel Sharper is currently offline. Check your internet connection and try again. 
          Some features may still be available from your cached data.
        </p>

        {/* Available Features */}
        <div className="bg-surface rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-text-primary mb-3">
            Available Offline:
          </h3>
          <ul className="text-text-secondary text-sm space-y-2">
            <li>• View recently cached workouts</li>
            <li>• Browse saved meal templates</li>
            <li>• Check progress from last sync</li>
            <li>• Log data (syncs when online)</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-navy text-white py-3 px-6 rounded-lg font-semibold hover:bg-navy-600 transition-colors"
          >
            Try Again
          </button>

          <button
            onClick={() => window.history.back()}
            className="w-full border border-border text-text-secondary py-3 px-6 rounded-lg font-semibold hover:bg-surface transition-colors"
          >
            Go Back
          </button>
        </div>

        {/* Tips */}
        <div className="mt-8 text-xs text-text-muted">
          <p>💡 Tip: Add Feel Sharper to your home screen for faster access!</p>
        </div>
      </div>
    </div>
  );
}