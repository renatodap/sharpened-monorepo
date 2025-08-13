'use client';

import { useState, useEffect } from 'react';
import { Flag, Plus, Edit, Trash2, ToggleLeft, ToggleRight, Settings, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  conditions?: any[];
  createdAt: string;
  updatedAt: string;
}

export default function FeatureFlagsAdmin() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);

  useEffect(() => {
    fetchFlags();
  }, []);

  const fetchFlags = async () => {
    try {
      const response = await fetch('/api/admin/feature-flags');
      if (response.ok) {
        const data = await response.json();
        setFlags(data.flags || []);
      }
    } catch (error) {
      console.error('Error fetching feature flags:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFlag = async (flagKey: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/admin/feature-flags/${flagKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });

      if (response.ok) {
        setFlags(prev => prev.map(flag => 
          flag.key === flagKey ? { ...flag, enabled } : flag
        ));
      }
    } catch (error) {
      console.error('Error toggling feature flag:', error);
    }
  };

  const updateRollout = async (flagKey: string, rolloutPercentage: number) => {
    try {
      const response = await fetch(`/api/admin/feature-flags/${flagKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rolloutPercentage }),
      });

      if (response.ok) {
        setFlags(prev => prev.map(flag => 
          flag.key === flagKey ? { ...flag, rolloutPercentage } : flag
        ));
      }
    } catch (error) {
      console.error('Error updating rollout percentage:', error);
    }
  };

  const deleteFlag = async (flagKey: string) => {
    if (!confirm(`Are you sure you want to delete the '${flagKey}' flag?`)) return;

    try {
      const response = await fetch(`/api/admin/feature-flags/${flagKey}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFlags(prev => prev.filter(flag => flag.key !== flagKey));
      }
    } catch (error) {
      console.error('Error deleting feature flag:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg text-text-primary">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-border rounded mb-8 w-64"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-border rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Flag className="w-10 h-10 text-navy" />
              Feature Flags
            </h1>
            <p className="text-text-secondary text-lg">
              Manage feature rollouts and A/B tests
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-navy hover:bg-navy/80"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Flag
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="text-2xl font-bold text-navy mb-1">{flags.length}</div>
            <div className="text-sm text-text-secondary">Total Flags</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="text-2xl font-bold text-success mb-1">
              {flags.filter(f => f.enabled).length}
            </div>
            <div className="text-sm text-text-secondary">Enabled</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {flags.filter(f => f.enabled && f.rolloutPercentage < 100).length}
            </div>
            <div className="text-sm text-text-secondary">Partial Rollout</div>
          </div>
        </div>

        {/* Feature Flags List */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-lg font-semibold">All Feature Flags</h3>
          </div>

          {flags.length === 0 ? (
            <div className="text-center py-12">
              <Flag className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No feature flags yet</h3>
              <p className="text-text-secondary mb-6">
                Create your first feature flag to start managing rollouts
              </p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-navy hover:bg-navy/80"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Feature Flag
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {flags.map((flag) => (
                <div key={flag.key} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-lg">{flag.name}</h4>
                        <code className="px-2 py-1 bg-bg border border-border rounded text-sm text-text-muted">
                          {flag.key}
                        </code>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          flag.enabled 
                            ? 'bg-success/20 text-success' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {flag.enabled ? 'Enabled' : 'Disabled'}
                        </div>
                      </div>
                      <p className="text-text-secondary mb-3">{flag.description}</p>
                      
                      {/* Conditions */}
                      {flag.conditions && flag.conditions.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-text-muted">
                          <Settings className="w-4 h-4" />
                          <span>{flag.conditions.length} condition{flag.conditions.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingFlag(flag)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteFlag(flag.key)}
                        className="text-red-400 hover:text-red-500 border-red-400/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Toggle Control */}
                    <div className="flex items-center justify-between p-4 bg-bg border border-border rounded-lg">
                      <div>
                        <div className="font-medium mb-1">Status</div>
                        <div className="text-sm text-text-secondary">
                          {flag.enabled ? 'Flag is active' : 'Flag is disabled'}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleFlag(flag.key, !flag.enabled)}
                        className={`p-1 rounded-full transition-colors ${
                          flag.enabled ? 'text-success' : 'text-text-muted'
                        }`}
                      >
                        {flag.enabled ? (
                          <ToggleRight className="w-8 h-8" />
                        ) : (
                          <ToggleLeft className="w-8 h-8" />
                        )}
                      </button>
                    </div>

                    {/* Rollout Percentage */}
                    <div className="p-4 bg-bg border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-medium mb-1">Rollout</div>
                          <div className="text-sm text-text-secondary">
                            {flag.rolloutPercentage}% of users
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-navy">
                          {flag.rolloutPercentage}%
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="w-full bg-border rounded-full h-2">
                          <div 
                            className="bg-navy h-2 rounded-full transition-all duration-300"
                            style={{ width: `${flag.rolloutPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={flag.rolloutPercentage}
                        onChange={(e) => {
                          const newValue = parseInt(e.target.value);
                          updateRollout(flag.key, newValue);
                        }}
                        className="w-full accent-navy"
                      />
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="mt-4 flex items-center gap-6 text-xs text-text-muted">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Created: {new Date(flag.createdAt).toLocaleDateString()}
                    </div>
                    {flag.updatedAt !== flag.createdAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Updated: {new Date(flag.updatedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-surface border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => {
                flags.forEach(flag => {
                  if (!flag.enabled) toggleFlag(flag.key, true);
                });
              }}
            >
              Enable All Flags
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                flags.forEach(flag => {
                  if (flag.enabled) toggleFlag(flag.key, false);
                });
              }}
            >
              Disable All Flags
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const confirmed = confirm('This will reset all rollout percentages to 0%. Continue?');
                if (confirmed) {
                  flags.forEach(flag => {
                    if (flag.rolloutPercentage > 0) {
                      updateRollout(flag.key, 0);
                    }
                  });
                }
              }}
            >
              Reset All Rollouts
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}