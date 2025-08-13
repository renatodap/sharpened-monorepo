"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Camera, FlipHorizontal, Download, X, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CameraCaptureProps {
  onCapture: (imageData: string, file: File) => void;
  onClose?: () => void;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  className?: string;
}

export function CameraCapture({
  onCapture,
  onClose,
  maxWidth = 1080,
  maxHeight = 1080,
  quality = 0.8,
  className
}: CameraCaptureProps) {
  const [isActive, setIsActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      
      // Check if camera is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setIsSupported(false);
        setError('Camera is not supported in this browser');
        return;
      }

      const constraints = {
        video: {
          facingMode,
          width: { ideal: maxWidth },
          height: { ideal: maxHeight }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsActive(true);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Unable to access camera. Please check permissions.');
      setIsSupported(false);
    }
  }, [facingMode, maxWidth, maxHeight]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsActive(false);
  }, []);

  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    if (isActive) {
      stopCamera();
      setTimeout(startCamera, 100);
    }
  }, [isActive, startCamera, stopCamera]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0);

    // Convert to blob with compression
    canvas.toBlob((blob) => {
      if (blob) {
        const reader = new FileReader();
        reader.onload = () => {
          const imageData = reader.result as string;
          setCapturedImage(imageData);
          
          // Create file object
          const file = new File([blob], `food-photo-${Date.now()}.jpg`, {
            type: 'image/jpeg'
          });
          
          onCapture(imageData, file);
        };
        reader.readAsDataURL(blob);
      }
    }, 'image/jpeg', quality);

    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }
  }, [quality, onCapture]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const handleFileInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const imageData = reader.result as string;
        setCapturedImage(imageData);
        onCapture(imageData, file);
      };
      reader.readAsDataURL(file);
    }
  }, [onCapture]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  if (!isSupported) {
    return (
      <div className={cn("bg-surface rounded-xl p-6 border border-border", className)}>
        <div className="text-center space-y-4">
          <ImageIcon className="w-16 h-16 mx-auto text-text-muted" />
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Camera Not Available
            </h3>
            <p className="text-text-secondary mb-4">
              {error || 'Camera is not supported in this browser.'}
            </p>
          </div>

          {/* File input fallback */}
          <div className="space-y-2">
            <label
              htmlFor="file-input"
              className="inline-flex items-center gap-2 bg-navy text-white py-3 px-6 rounded-xl font-medium hover:bg-navy-600 transition-colors cursor-pointer"
            >
              <ImageIcon className="w-5 h-5" />
              Choose Photo from Gallery
            </label>
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    );
  }

  if (capturedImage) {
    return (
      <div className={cn("bg-surface rounded-xl overflow-hidden border border-border", className)}>
        <div className="relative">
          <img
            src={capturedImage}
            alt="Captured food"
            className="w-full h-64 object-cover"
          />
          
          {/* Actions overlay */}
          <div className="absolute inset-0 bg-black/20 flex items-end">
            <div className="w-full p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex gap-3">
                <button
                  onClick={retakePhoto}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-surface/90 text-text-primary rounded-xl hover:bg-surface transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retake
                </button>
                
                <button
                  onClick={() => {
                    // Photo is already captured, just close
                    onClose?.();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-success text-white rounded-xl hover:bg-green-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Use Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-surface rounded-xl overflow-hidden border border-border", className)}>
      {/* Camera view */}
      <div className="relative">
        <video
          ref={videoRef}
          className="w-full h-64 object-cover bg-black"
          playsInline
          muted
        />
        
        <canvas
          ref={canvasRef}
          className="hidden"
        />
        
        {/* Camera controls overlay */}
        <div className="absolute inset-0 bg-black/20 flex flex-col">
          {/* Top controls */}
          <div className="flex items-center justify-between p-4">
            <button
              onClick={switchCamera}
              className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              aria-label="Switch camera"
            >
              <FlipHorizontal className="w-5 h-5" />
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                aria-label="Close camera"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Bottom controls */}
          <div className="flex-1 flex items-end justify-center pb-6">
            <div className="flex items-center gap-4">
              {/* File input */}
              <label
                htmlFor="gallery-input"
                className="p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors cursor-pointer"
              >
                <ImageIcon className="w-6 h-6" />
              </label>
              <input
                id="gallery-input"
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />

              {/* Capture button */}
              <button
                onClick={isActive ? capturePhoto : startCamera}
                className="w-16 h-16 bg-white text-navy rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center"
                aria-label={isActive ? "Capture photo" : "Start camera"}
              >
                <Camera className="w-8 h-8" />
              </button>

              {/* Placeholder for symmetry */}
              <div className="w-12 h-12"></div>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {!isActive && !error && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="text-center text-white">
              <Camera className="w-12 h-12 mx-auto mb-2" />
              <p>Tap to start camera</p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="p-4 text-center">
        <p className="text-text-secondary text-sm">
          📸 Position your food in the frame and tap capture
        </p>
      </div>
    </div>
  );
}