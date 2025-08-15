/**
 * PhotoFoodScanner - Photo-based food recognition and logging
 * Maps to PRD: Photo Analysis + Food Parsing
 */

"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, Check, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { EnhancedFoodParser, type PhotoAnalysisResult, type FoodParseResult } from '@/lib/ai/parsers/EnhancedFoodParser';
import { Button } from '@/components/ui/Button';
import { useFeatureGate } from '@/hooks/useFeatureGate';

interface PhotoFoodScannerProps {
  onFoodsDetected: (result: FoodParseResult) => void;
  className?: string;
}

export function PhotoFoodScanner({ onFoodsDetected, className = '' }: PhotoFoodScannerProps) {
  const [parser] = useState(() => new EnhancedFoodParser());
  const [isCapturing, setIsCapturing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<PhotoAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { canUse, trackUsage } = useFeatureGate();
  const canUsePhotoAnalysis = canUse('photo_analysis');

  /**
   * Start camera capture
   */
  const startCamera = useCallback(async () => {
    if (!canUsePhotoAnalysis) {
      setError('Upgrade to Pro for photo food scanning');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
        setError(null);
      }
    } catch (err) {
      console.error('Camera access failed:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  }, [canUsePhotoAnalysis]);

  /**
   * Stop camera capture
   */
  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  }, []);

  /**
   * Capture photo from camera
   */
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0);

    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setImagePreview(imageData);
    stopCamera();
    analyzeImage(imageData);
  }, [stopCamera]);

  /**
   * Handle file upload
   */
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!canUsePhotoAnalysis) {
      setError('Upgrade to Pro for photo food scanning');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Read file as base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setImagePreview(imageData);
      analyzeImage(imageData);
    };
    reader.readAsDataURL(file);
  }, [canUsePhotoAnalysis]);

  /**
   * Analyze image for food
   */
  const analyzeImage = useCallback(async (imageBase64: string) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      // Track feature usage
      await trackUsage('photo_analysis');

      // Analyze photo
      const photoResult = await parser.analyzePhoto(imageBase64);
      setAnalysisResult(photoResult);

      // Convert to food parse result
      const foodNames = photoResult.detected_foods.map(f => f.name).join(', ');
      const parseResult = await parser.parseNaturalLanguage(foodNames);
      
      // Add portion estimates from photo analysis
      const enhancedResult: FoodParseResult = {
        ...parseResult,
        foods: parseResult.foods.map((food, index) => {
          const estimate = photoResult.portion_estimates[index];
          if (estimate) {
            return {
              ...food,
              quantity: estimate.estimated_amount,
              unit: estimate.unit
            };
          }
          return food;
        })
      };

      onFoodsDetected(enhancedResult);
    } catch (err) {
      console.error('Image analysis failed:', err);
      setError('Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [parser, trackUsage, onFoodsDetected]);

  /**
   * Reset scanner
   */
  const reset = useCallback(() => {
    setImagePreview(null);
    setAnalysisResult(null);
    setError(null);
    stopCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [stopCamera]);

  return (
    <div className={`bg-surface border border-border rounded-lg p-4 ${className}`}>
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Camera className="w-5 h-5 text-primary" />
        Photo Food Scanner
      </h3>

      {/* Camera/Upload Options */}
      {!imagePreview && !isCapturing && (
        <div className="space-y-3">
          <Button
            onClick={startCamera}
            disabled={!canUsePhotoAnalysis}
            className="w-full"
          >
            <Camera className="w-4 h-4 mr-2" />
            Take Photo
          </Button>

          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={!canUsePhotoAnalysis}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              disabled={!canUsePhotoAnalysis}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Photo
            </Button>
          </div>

          {!canUsePhotoAnalysis && (
            <p className="text-xs text-text-secondary text-center">
              Photo scanning is a Pro feature
            </p>
          )}
        </div>
      )}

      {/* Camera View */}
      {isCapturing && (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <Button
              onClick={capturePhoto}
              size="lg"
              className="rounded-full"
            >
              <Camera className="w-6 h-6" />
            </Button>
            <Button
              onClick={stopCamera}
              variant="outline"
              size="lg"
              className="rounded-full"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>
      )}

      {/* Image Preview */}
      {imagePreview && (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Food photo"
              className="w-full rounded-lg"
            />
            
            {/* Detected food overlays */}
            {analysisResult?.detected_foods.map((food, index) => (
              <div
                key={index}
                className="absolute bg-primary/80 text-white text-xs px-2 py-1 rounded"
                style={{
                  left: `${(index * 100) / analysisResult.detected_foods.length}%`,
                  top: '10px'
                }}
              >
                {food.name}
              </div>
            ))}

            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <div className="bg-white rounded-lg p-4 flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-sm">Analyzing food...</span>
                </div>
              </div>
            )}
          </div>

          {/* Analysis Results */}
          {analysisResult && !isAnalyzing && (
            <div className="space-y-3">
              {/* Detected Foods */}
              <div className="bg-surface-2 rounded-lg p-3">
                <h4 className="text-sm font-medium mb-2">Detected Foods</h4>
                <div className="space-y-2">
                  {analysisResult.detected_foods.map((food, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>{food.name}</span>
                      <span className="text-xs text-text-secondary">
                        {Math.round(food.confidence * 100)}% confident
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Portion Estimates */}
              <div className="bg-surface-2 rounded-lg p-3">
                <h4 className="text-sm font-medium mb-2">Portion Sizes</h4>
                <div className="space-y-2">
                  {analysisResult.portion_estimates.map((portion, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>{portion.food_name}</span>
                      <span className="text-xs">
                        {portion.estimated_amount} {portion.unit} ({portion.reference})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plate Analysis */}
              {analysisResult.plate_analysis && (
                <div className="bg-surface-2 rounded-lg p-3">
                  <h4 className="text-sm font-medium mb-2">Plate Balance</h4>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>Protein: {Math.round(analysisResult.plate_analysis.plate_composition.protein_percentage)}%</div>
                      <div>Carbs: {Math.round(analysisResult.plate_analysis.plate_composition.carbs_percentage)}%</div>
                      <div>Vegetables: {Math.round(analysisResult.plate_analysis.plate_composition.vegetables_percentage)}%</div>
                      <div>Fats: {Math.round(analysisResult.plate_analysis.plate_composition.fats_percentage)}%</div>
                    </div>
                    <div className="text-sm font-medium">
                      Balance Score: {Math.round(analysisResult.plate_analysis.meal_balance_score)}/100
                    </div>
                    {analysisResult.plate_analysis.recommendations.map((rec, index) => (
                      <p key={index} className="text-xs text-text-secondary">{rec}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Confidence Score */}
              <div className="text-center">
                <span className="text-sm text-text-secondary">
                  Overall Confidence: {Math.round(analysisResult.confidence * 100)}%
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={reset}
              variant="outline"
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Retake
            </Button>
            {analysisResult && (
              <Button
                onClick={() => {
                  // Results already sent via onFoodsDetected
                  reset();
                }}
                className="flex-1"
              >
                <Check className="w-4 h-4 mr-2" />
                Confirm
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}

// Compact photo button for forms
export function PhotoFoodButton({ 
  onFoodsDetected,
  className = '' 
}: { 
  onFoodsDetected: (result: FoodParseResult) => void;
  className?: string;
}) {
  const [showScanner, setShowScanner] = useState(false);

  if (showScanner) {
    return (
      <PhotoFoodScanner
        onFoodsDetected={(result) => {
          onFoodsDetected(result);
          setShowScanner(false);
        }}
        className={className}
      />
    );
  }

  return (
    <Button
      onClick={() => setShowScanner(true)}
      variant="outline"
      size="sm"
      className={className}
    >
      <Camera className="w-4 h-4 mr-2" />
      Scan Food Photo
    </Button>
  );
}