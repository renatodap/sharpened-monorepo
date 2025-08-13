"use client";

import { useState } from 'react';
import { Activity, Plus, TrendingDown, TrendingUp, Minus } from 'lucide-react';

export default function WeightPage() {
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState<'kg' | 'lb'>('kg');
  const [isAdding, setIsAdding] = useState(false);

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });

  const handleSave = async () => {
    if (!weight) return;
    
    const weightInKg = unit === 'lb' ? parseFloat(weight) * 0.453592 : parseFloat(weight);
    
    // In real app, save to Supabase here
    console.log('Saving weight:', {
      weight: weightInKg,
      unit,
      date: new Date().toISOString().split('T')[0]
    });
    
    setWeight('');
    setIsAdding(false);
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Weight</h1>
            <p className="text-text-secondary text-lg">{today}</p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center px-6 py-3 bg-info text-white rounded-xl hover:bg-info/90 transition-colors focus:outline-none focus:ring-2 focus:ring-focus"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Weight
          </button>
        </div>

        {/* Quick Add Weight */}
        {isAdding && (
          <div className="bg-surface border border-border rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Add Today's Weight</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1 max-w-xs">
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Enter weight"
                  className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-text-primary text-2xl font-semibold text-center focus:outline-none focus:ring-2 focus:ring-focus"
                  step="0.1"
                  autoFocus
                />
              </div>
              <div className="flex bg-surface-2 border border-border rounded-xl">
                <button
                  onClick={() => setUnit('kg')}
                  className={`px-4 py-3 rounded-l-xl transition-colors ${
                    unit === 'kg' ? 'bg-info text-white' : 'text-text-primary hover:bg-surface-3'
                  }`}
                >
                  kg
                </button>
                <button
                  onClick={() => setUnit('lb')}
                  className={`px-4 py-3 rounded-r-xl transition-colors ${
                    unit === 'lb' ? 'bg-info text-white' : 'text-text-primary hover:bg-surface-3'
                  }`}
                >
                  lb
                </button>
              </div>
              <button
                onClick={handleSave}
                disabled={!weight || parseFloat(weight) <= 0}
                className="px-6 py-3 bg-success text-white rounded-xl hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Save
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="p-3 text-text-muted hover:text-text-primary transition-colors"
              >
                <Minus className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Current Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-6 h-6 text-info" />
              <h3 className="font-semibold text-text-secondary">Current</h3>
            </div>
            <div className="text-3xl font-bold">--</div>
            <div className="text-text-muted text-sm">No weight logged yet</div>
          </div>
          
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown className="w-6 h-6 text-success" />
              <h3 className="font-semibold text-text-secondary">7-Day Avg</h3>
            </div>
            <div className="text-3xl font-bold">--</div>
            <div className="text-text-muted text-sm">Need more data</div>
          </div>
          
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-warning" />
              <h3 className="font-semibold text-text-secondary">Trend</h3>
            </div>
            <div className="text-3xl font-bold">--</div>
            <div className="text-text-muted text-sm">Need more data</div>
          </div>
        </div>

        {/* Weight Chart Placeholder */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Weight Trend</h2>
          <div className="bg-surface border border-border rounded-xl p-8">
            <div className="bg-surface-2 border-2 border-dashed border-border rounded-xl p-12 text-center">
              <Activity className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-secondary mb-2">
                Start tracking to see your progress
              </h3>
              <p className="text-text-muted mb-6">
                Log your weight regularly to see trends and progress over time
              </p>
              <button
                onClick={() => setIsAdding(true)}
                className="inline-flex items-center px-6 py-3 bg-info text-white rounded-xl hover:bg-info/90 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add First Weight
              </button>
            </div>
          </div>
        </section>

        {/* Weight History */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Recent Entries</h2>
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="py-8 text-center">
              <Activity className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-secondary">No weight entries yet</p>
              <p className="text-text-muted text-sm mt-1">
                Your weight logs will appear here
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}