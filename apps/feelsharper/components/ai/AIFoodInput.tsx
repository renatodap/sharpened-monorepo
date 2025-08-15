'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Camera, Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface AIFoodInputProps {
  onParse: (food: any) => void;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  className?: string;
}

export function AIFoodInput({ onParse, mealType, className }: AIFoodInputProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextParse = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/parse-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, meal_type: mealType, save: false })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.upgrade_required) {
          setShowUpgrade(true);
          setError(data.error);
        } else {
          setError(data.error || 'Failed to parse food');
        }
        return;
      }
      
      if (data.prompt_upgrade) {
        setShowUpgrade(true);
      }
      
      onParse(data.food);
      setInput('');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Upload and analyze
    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      if (mealType) formData.append('meal_type', mealType);
      
      const response = await fetch('/api/ai/analyze-food-photo', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.upgrade_required) {
          setShowUpgrade(true);
          setError(data.error);
        } else {
          setError(data.error || 'Failed to analyze photo');
        }
        return;
      }
      
      onParse(data.food);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError('Failed to analyze photo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-surface rounded-lg p-4 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">AI Food Logger</h3>
        </div>
        
        <div className="space-y-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe what you ate...
Examples:
• Bowl of oatmeal with banana and almond butter
• Grilled chicken breast with rice and broccoli
• 2 eggs scrambled with cheese and toast
• Chipotle bowl with chicken, rice, beans, salsa"
            className="w-full h-32 px-3 py-2 bg-bg border border-border rounded-lg text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            disabled={isLoading}
          />
          
          <div className="flex gap-2">
            <Button
              onClick={handleTextParse}
              disabled={!input.trim() || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Log Food
                </>
              )}
            </Button>
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              disabled={isLoading}
              className="px-3"
              title="Upload food photo"
            >
              <Camera className="w-4 h-4" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          
          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Food preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              {isLoading && (
                <div className="absolute inset-0 bg-bg/80 flex items-center justify-center rounded-lg">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}
            </div>
          )}
        </div>
        
        {error && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-500">{error}</p>
              {showUpgrade && (
                <Button
                  variant="link"
                  className="p-0 h-auto text-primary hover:text-primary/80 text-sm mt-1"
                  onClick={() => window.location.href = '/settings/subscription'}
                >
                  Upgrade to Pro →
                </Button>
              )}
            </div>
          </div>
        )}
        
        <div className="mt-3 text-xs text-muted">
          <p>✓ Automatically matches to USDA database</p>
          <p>✓ Estimates portions from descriptions</p>
          <p>✓ Learns your eating patterns</p>
        </div>
      </div>
    </div>
  );
}