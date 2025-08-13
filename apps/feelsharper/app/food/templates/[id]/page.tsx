'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Coffee, Sun, Moon, Cookie, Star, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { MealTemplateWithItems } from '@/lib/types/database';

const MEAL_TYPE_ICONS = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
  snack: Cookie,
};

const MEAL_TYPE_LABELS = {
  breakfast: 'Breakfast',
  lunch: 'Lunch', 
  dinner: 'Dinner',
  snack: 'Snack',
};

export default function MealTemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [template, setTemplate] = useState<MealTemplateWithItems | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchTemplate(params.id as string);
    }
  }, [params.id]);

  const fetchTemplate = async (id: string) => {
    try {
      const response = await fetch(`/api/meal-templates/${id}`);
      if (response.ok) {
        const data = await response.json();
        setTemplate(data);
      } else {
        console.error('Template not found');
        router.push('/food/templates');
      }
    } catch (error) {
      console.error('Error fetching template:', error);
      router.push('/food/templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyTemplate = async () => {
    if (!template) return;
    
    setIsApplying(true);
    const today = new Date().toISOString().split('T')[0];

    try {
      const response = await fetch(`/api/meal-templates/${template.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: today,
          meal_type: template.meal_type || 'breakfast',
        }),
      });

      if (response.ok) {
        router.push('/food');
      } else {
        throw new Error('Failed to apply template');
      }
    } catch (error) {
      console.error('Error applying template:', error);
      alert('Failed to apply template to food diary');
    } finally {
      setIsApplying(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!template || !confirm('Are you sure you want to delete this meal template?')) return;

    try {
      const response = await fetch(`/api/meal-templates/${template.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/food/templates');
      } else {
        throw new Error('Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template');
    }
  };

  const calculateTotalNutrition = () => {
    if (!template?.meal_template_items) return null;

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    template.meal_template_items.forEach(item => {
      const food = item.foods || item.custom_foods;
      if (food) {
        const multiplier = item.amount / 100; // Convert to per gram
        totalCalories += (food.calories || 0) * multiplier;
        totalProtein += (food.protein || 0) * multiplier;
        totalCarbs += (food.carbs || 0) * multiplier;
        totalFat += (food.fat || 0) * multiplier;
      }
    });

    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg text-text-primary">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-border rounded mb-4 w-1/4"></div>
            <div className="h-12 bg-border rounded mb-6 w-3/4"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-border rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-bg text-text-primary flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Template not found</h1>
          <Button onClick={() => router.push('/food/templates')}>
            Back to Templates
          </Button>
        </div>
      </div>
    );
  }

  const MealIcon = template.meal_type ? MEAL_TYPE_ICONS[template.meal_type as keyof typeof MEAL_TYPE_ICONS] : Coffee;
  const nutrition = calculateTotalNutrition();

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/food/templates')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        {/* Template Header */}
        <div className="bg-surface border border-border rounded-xl p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${template.is_favorite ? 'bg-yellow-500/20' : 'bg-navy/20'}`}>
                {template.is_favorite ? (
                  <Star className="w-8 h-8 text-yellow-400 fill-current" />
                ) : (
                  <MealIcon className="w-8 h-8 text-navy" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{template.name}</h1>
                {template.meal_type && (
                  <p className="text-text-muted text-lg">
                    {MEAL_TYPE_LABELS[template.meal_type as keyof typeof MEAL_TYPE_LABELS]}
                  </p>
                )}
                {template.description && (
                  <p className="text-text-secondary mt-2">{template.description}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteTemplate}
                className="text-red-400 hover:text-red-500 border-red-400/30"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleApplyTemplate}
              disabled={isApplying}
              className="bg-success hover:bg-success/80"
            >
              {isApplying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Applying...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Apply to Today's Diary
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Nutrition Summary */}
        {nutrition && (
          <div className="bg-surface border border-border rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Nutrition Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-navy">{nutrition.calories}</div>
                <div className="text-sm text-text-muted">Calories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{nutrition.protein}g</div>
                <div className="text-sm text-text-muted">Protein</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{nutrition.carbs}g</div>
                <div className="text-sm text-text-muted">Carbs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{nutrition.fat}g</div>
                <div className="text-sm text-text-muted">Fat</div>
              </div>
            </div>
          </div>
        )}

        {/* Template Items */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-6">Items in Template</h2>
          
          {(!template.meal_template_items || template.meal_template_items.length === 0) ? (
            <div className="text-center py-8 text-text-muted">
              <p>No items in this template</p>
            </div>
          ) : (
            <div className="space-y-4">
              {template.meal_template_items.map((item, index) => {
                const food = item.foods || item.custom_foods;
                const recipe = item.recipes;
                
                if (!food && !recipe) return null;

                const name = food?.name || food?.description || recipe?.name || 'Unknown item';
                const brand = food?.brand;
                const amount = item.amount;
                const unit = item.unit || 'g';

                // Calculate nutrition for this item
                let itemCalories = 0;
                let itemProtein = 0;
                let itemCarbs = 0;
                let itemFat = 0;

                if (food) {
                  const multiplier = amount / 100;
                  itemCalories = (food.calories || 0) * multiplier;
                  itemProtein = (food.protein || 0) * multiplier;
                  itemCarbs = (food.carbs || 0) * multiplier;
                  itemFat = (food.fat || 0) * multiplier;
                }

                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-bg border border-border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{name}</div>
                      {brand && <div className="text-sm text-text-muted">{brand}</div>}
                      <div className="text-sm text-text-secondary">{amount}{unit}</div>
                    </div>
                    {food && (
                      <div className="flex gap-4 text-sm text-text-muted">
                        <span>{Math.round(itemCalories)} cal</span>
                        <span>{Math.round(itemProtein * 10) / 10}p</span>
                        <span>{Math.round(itemCarbs * 10) / 10}c</span>
                        <span>{Math.round(itemFat * 10) / 10}f</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Template Meta */}
        <div className="mt-8 text-center text-text-muted text-sm">
          Created on {new Date(template.created_at).toLocaleDateString()}
          {template.updated_at !== template.created_at && (
            <> • Updated on {new Date(template.updated_at).toLocaleDateString()}</>
          )}
        </div>
      </div>
    </div>
  );
}