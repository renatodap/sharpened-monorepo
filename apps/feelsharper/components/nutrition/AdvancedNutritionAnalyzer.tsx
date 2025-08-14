'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Activity,
  Zap,
  Shield,
  Brain,
  Bone,
  Eye,
  Heart,
  Droplets,
  Pill,
  Target,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface NutrientData {
  name: string;
  amount: number;
  unit: string;
  dailyValue: number;
  rda: number;
  status: 'optimal' | 'adequate' | 'low' | 'deficient' | 'excess';
  healthImpact: string;
  foodSources: string[];
  icon: React.ReactNode;
  category: 'macros' | 'vitamins' | 'minerals' | 'other';
}

interface NutritionAnalysis {
  totalCalories: number;
  macros: {
    protein: { grams: number; percentage: number; quality_score: number };
    carbs: { grams: number; percentage: number; fiber: number; sugar: number };
    fat: { grams: number; percentage: number; saturated: number; unsaturated: number };
  };
  micronutrients: NutrientData[];
  hydration: {
    water_ml: number;
    target_ml: number;
    status: string;
  };
  meal_timing: {
    score: number;
    recommendations: string[];
  };
  nutrient_density_score: number;
  inflammatory_index: number;
  glycemic_load: number;
}

export default function AdvancedNutritionAnalyzer() {
  const [analysis, setAnalysis] = useState<NutritionAnalysis | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedNutrients, setExpandedNutrients] = useState<Set<string>>(new Set());
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    performAnalysis();
  }, []);

  const performAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulate comprehensive nutrient analysis
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const mockAnalysis: NutritionAnalysis = {
      totalCalories: 2247,
      macros: {
        protein: { grams: 156, percentage: 28, quality_score: 87 },
        carbs: { grams: 245, percentage: 44, fiber: 38, sugar: 67 },
        fat: { grams: 78, percentage: 31, saturated: 22, unsaturated: 56 }
      },
      micronutrients: [
        {
          name: 'Vitamin D',
          amount: 12.5,
          unit: 'μg',
          dailyValue: 62,
          rda: 20,
          status: 'low',
          healthImpact: 'Critical for bone health, immune function, and mood regulation',
          foodSources: ['Fatty fish', 'Fortified dairy', 'Egg yolks', 'Mushrooms'],
          icon: <Bone className="w-4 h-4" />,
          category: 'vitamins'
        },
        {
          name: 'Vitamin B12',
          amount: 8.2,
          unit: 'μg',
          dailyValue: 342,
          rda: 2.4,
          status: 'optimal',
          healthImpact: 'Essential for nerve function, DNA synthesis, and red blood cell formation',
          foodSources: ['Meat', 'Fish', 'Dairy', 'Fortified cereals'],
          icon: <Brain className="w-4 h-4" />,
          category: 'vitamins'
        },
        {
          name: 'Iron',
          amount: 18.7,
          unit: 'mg',
          dailyValue: 104,
          rda: 18,
          status: 'optimal',
          healthImpact: 'Vital for oxygen transport, energy production, and cognitive function',
          foodSources: ['Red meat', 'Spinach', 'Lentils', 'Dark chocolate'],
          icon: <Droplets className="w-4 h-4" />,
          category: 'minerals'
        },
        {
          name: 'Magnesium',
          amount: 267,
          unit: 'mg',
          dailyValue: 64,
          rda: 420,
          status: 'low',
          healthImpact: 'Crucial for muscle function, bone health, and energy metabolism',
          foodSources: ['Nuts', 'Seeds', 'Dark leafy greens', 'Whole grains'],
          icon: <Zap className="w-4 h-4" />,
          category: 'minerals'
        },
        {
          name: 'Omega-3 EPA+DHA',
          amount: 1.8,
          unit: 'g',
          dailyValue: 90,
          rda: 2.0,
          status: 'adequate',
          healthImpact: 'Anti-inflammatory, supports heart and brain health',
          foodSources: ['Fatty fish', 'Algae oil', 'Walnuts', 'Flax seeds'],
          icon: <Heart className="w-4 h-4" />,
          category: 'other'
        },
        {
          name: 'Vitamin C',
          amount: 156,
          unit: 'mg',
          dailyValue: 173,
          rda: 90,
          status: 'optimal',
          healthImpact: 'Powerful antioxidant, supports immune system and collagen synthesis',
          foodSources: ['Citrus fruits', 'Berries', 'Bell peppers', 'Broccoli'],
          icon: <Shield className="w-4 h-4" />,
          category: 'vitamins'
        },
        {
          name: 'Zinc',
          amount: 8.9,
          unit: 'mg',
          dailyValue: 81,
          rda: 11,
          status: 'adequate',
          healthImpact: 'Essential for immune function, wound healing, and protein synthesis',
          foodSources: ['Oysters', 'Red meat', 'Pumpkin seeds', 'Chickpeas'],
          icon: <Shield className="w-4 h-4" />,
          category: 'minerals'
        },
        {
          name: 'Folate',
          amount: 387,
          unit: 'μg',
          dailyValue: 97,
          rda: 400,
          status: 'adequate',
          healthImpact: 'Critical for DNA synthesis, cell division, and neural tube development',
          foodSources: ['Leafy greens', 'Legumes', 'Fortified grains', 'Avocado'],
          icon: <Brain className="w-4 h-4" />,
          category: 'vitamins'
        }
      ],
      hydration: {
        water_ml: 2100,
        target_ml: 2500,
        status: 'slightly_low'
      },
      meal_timing: {
        score: 78,
        recommendations: [
          'Consider eating protein within 2 hours post-workout',
          'Spread fiber intake throughout the day',
          'Time carbohydrates around training sessions'
        ]
      },
      nutrient_density_score: 82,
      inflammatory_index: 2.1,
      glycemic_load: 89
    };
    
    setAnalysis(mockAnalysis);
    setIsAnalyzing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-400 bg-green-500/20';
      case 'adequate': return 'text-blue-400 bg-blue-500/20';
      case 'low': return 'text-yellow-400 bg-yellow-500/20';
      case 'deficient': return 'text-red-400 bg-red-500/20';
      case 'excess': return 'text-orange-400 bg-orange-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal': return <CheckCircle className="w-4 h-4" />;
      case 'adequate': return <Activity className="w-4 h-4" />;
      case 'low': return <TrendingDown className="w-4 h-4" />;
      case 'deficient': return <AlertTriangle className="w-4 h-4" />;
      case 'excess': return <TrendingUp className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const filteredNutrients = analysis?.micronutrients.filter(nutrient => 
    selectedCategory === 'all' || nutrient.category === selectedCategory
  ) || [];

  const toggleNutrientExpansion = (nutrientName: string) => {
    const newExpanded = new Set(expandedNutrients);
    if (newExpanded.has(nutrientName)) {
      newExpanded.delete(nutrientName);
    } else {
      newExpanded.add(nutrientName);
    }
    setExpandedNutrients(newExpanded);
  };

  if (isAnalyzing) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-white mb-2">Analyzing Nutrition Profile</h3>
            <p className="text-text-secondary">Processing micronutrients, bioavailability, and health impacts...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Advanced Nutrition Analysis</h1>
          <p className="text-text-secondary">Comprehensive micronutrient tracking and health insights</p>
        </div>
        <Button onClick={performAnalysis} className="flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Reanalyze
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{analysis.totalCalories}</div>
            <div className="text-sm text-text-secondary">Total Calories</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">{analysis.nutrient_density_score}</div>
            <div className="text-sm text-text-secondary">Nutrient Density</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-navy">{analysis.inflammatory_index}</div>
            <div className="text-sm text-text-secondary">Inflammatory Index</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">{analysis.glycemic_load}</div>
            <div className="text-sm text-text-secondary">Glycemic Load</div>
          </CardContent>
        </Card>
      </div>

      {/* Macronutrient Breakdown */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-white">Macronutrient Distribution</h3>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white">Protein</span>
                <span className="text-text-secondary">{analysis.macros.protein.grams}g ({analysis.macros.protein.percentage}%)</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${analysis.macros.protein.percentage}%` }}></div>
              </div>
              <div className="text-sm text-text-secondary">Quality Score: {analysis.macros.protein.quality_score}/100</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white">Carbohydrates</span>
                <span className="text-text-secondary">{analysis.macros.carbs.grams}g ({analysis.macros.carbs.percentage}%)</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${analysis.macros.carbs.percentage}%` }}></div>
              </div>
              <div className="text-sm text-text-secondary">Fiber: {analysis.macros.carbs.fiber}g | Sugar: {analysis.macros.carbs.sugar}g</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white">Fat</span>
                <span className="text-text-secondary">{analysis.macros.fat.grams}g ({analysis.macros.fat.percentage}%)</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${analysis.macros.fat.percentage}%` }}></div>
              </div>
              <div className="text-sm text-text-secondary">Sat: {analysis.macros.fat.saturated}g | Unsat: {analysis.macros.fat.unsaturated}g</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Micronutrient Analysis */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Micronutrient Analysis</h3>
            <div className="flex gap-2">
              {['all', 'vitamins', 'minerals', 'other'].map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredNutrients.map((nutrient) => (
              <div key={nutrient.name} className="border border-border rounded-lg p-4">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleNutrientExpansion(nutrient.name)}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-navy">{nutrient.icon}</div>
                    <div>
                      <div className="font-semibold text-white">{nutrient.name}</div>
                      <div className="text-sm text-text-secondary">
                        {nutrient.amount} {nutrient.unit} ({nutrient.dailyValue}% DV)
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(nutrient.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(nutrient.status)}
                        {nutrient.status}
                      </span>
                    </Badge>
                    {expandedNutrients.has(nutrient.name) ? 
                      <ChevronUp className="w-4 h-4 text-text-secondary" /> : 
                      <ChevronDown className="w-4 h-4 text-text-secondary" />
                    }
                  </div>
                </div>
                
                {expandedNutrients.has(nutrient.name) && (
                  <div className="mt-4 space-y-3 border-t border-border pt-4">
                    <div>
                      <h5 className="font-medium text-white mb-1">Health Impact</h5>
                      <p className="text-sm text-text-secondary">{nutrient.healthImpact}</p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-white mb-2">Best Food Sources</h5>
                      <div className="flex flex-wrap gap-2">
                        {nutrient.foodSources.map((source) => (
                          <Badge key={source} variant="secondary" className="text-xs">
                            {source}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-text-secondary">Current: </span>
                        <span className="text-white">{nutrient.amount} {nutrient.unit}</span>
                      </div>
                      <div>
                        <span className="text-text-secondary">RDA: </span>
                        <span className="text-white">{nutrient.rda} {nutrient.unit}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hydration & Timing */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Droplets className="w-5 h-5" />
              Hydration Status
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Current intake</span>
                <span className="text-white">{analysis.hydration.water_ml} ml</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min((analysis.hydration.water_ml / analysis.hydration.target_ml) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Target: {analysis.hydration.target_ml} ml</span>
                <span className="text-text-secondary">
                  {Math.round((analysis.hydration.water_ml / analysis.hydration.target_ml) * 100)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Target className="w-5 h-5" />
              Meal Timing
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Timing Score</span>
                <span className="text-white">{analysis.meal_timing.score}/100</span>
              </div>
              <div className="space-y-2">
                {analysis.meal_timing.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <Target className="w-3 h-3 text-navy mt-0.5 flex-shrink-0" />
                    <span className="text-text-secondary">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}