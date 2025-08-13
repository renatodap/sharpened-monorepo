"use client";

import React from 'react';
import { X, Download, Smartphone } from 'lucide-react';

interface PWAInstallPromptProps {
  onInstall: () => void;
  onDismiss: () => void;
}

export function PWAInstallPrompt({ onInstall, onDismiss }: PWAInstallPromptProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-2xl max-w-md w-full mx-auto shadow-xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-navy rounded-xl flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">Install Feel Sharper</h3>
              <p className="text-sm text-text-secondary">Add to your home screen</p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-2 hover:bg-surface-2 rounded-lg transition-colors"
            aria-label="Dismiss install prompt"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-4">
          <p className="text-text-secondary text-sm leading-relaxed mb-4">
            Get the full Feel Sharper experience with faster loading, offline access, 
            and native app features right from your home screen.
          </p>

          {/* Benefits */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-text-secondary">Works offline</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-text-secondary">Faster loading</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-text-secondary">Push notifications</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-text-secondary">Home screen access</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onDismiss}
              className="flex-1 py-3 px-4 text-text-secondary border border-border rounded-xl hover:bg-surface-2 transition-colors font-medium"
            >
              Not now
            </button>
            <button
              onClick={onInstall}
              className="flex-1 py-3 px-4 bg-navy text-white rounded-xl hover:bg-navy-600 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Install
            </button>
          </div>
        </div>

        {/* Footer tip */}
        <div className="px-6 py-4 bg-surface-2 rounded-b-2xl">
          <p className="text-xs text-text-muted text-center">
            💡 Tip: Look for the install icon in your browser's address bar
          </p>
        </div>
      </div>
    </div>
  );
}