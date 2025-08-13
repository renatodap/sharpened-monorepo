'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { 
  Share2, 
  Copy, 
  Instagram, 
  Twitter, 
  Facebook,
  MessageCircle,
  Link,
  Download,
  Smartphone,
  X,
  Check,
  Sparkles
} from 'lucide-react';

interface ShareData {
  title: string;
  subtitle: string;
  text: string;
  hashtags: string;
  image: string;
  url: string;
}

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareType: 'progress_card' | 'achievement' | 'workout' | 'streak' | 'pr';
  contentId?: string;
  metadata?: any;
}

export function SocialShareModal({ 
  isOpen, 
  onClose, 
  shareType, 
  contentId,
  metadata = {} 
}: SocialShareModalProps) {
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      generateShareData();
    }
  }, [isOpen, shareType, contentId]);

  const generateShareData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/social/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shareType,
          contentId,
          metadata
        })
      });

      if (response.ok) {
        const data = await response.json();
        setShareData(data.shareData);
      }
    } catch (error) {
      console.error('Failed to generate share data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareToInstagram = () => {
    // Instagram doesn't support direct sharing, so we'll copy the text and show instructions
    if (shareData) {
      copyToClipboard(`${shareData.text}\n\n${shareData.hashtags}`);
      setSelectedPlatform('instagram');
      // Could also save image to downloads for manual posting
    }
  };

  const shareToTwitter = () => {
    if (shareData) {
      const tweetText = `${shareData.text}\n\n${shareData.hashtags}`;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareData.url)}`;
      window.open(url, '_blank', 'width=600,height=400');
      logShare('twitter');
    }
  };

  const shareToFacebook = () => {
    if (shareData) {
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}&quote=${encodeURIComponent(shareData.text)}`;
      window.open(url, '_blank', 'width=600,height=400');
      logShare('facebook');
    }
  };

  const shareToWhatsApp = () => {
    if (shareData) {
      const text = `${shareData.text}\n\n${shareData.url}`;
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
      logShare('whatsapp');
    }
  };

  const shareNative = async () => {
    if (shareData && navigator.share) {
      try {
        await navigator.share({
          title: shareData.title,
          text: shareData.text,
          url: shareData.url,
        });
        logShare('native');
      } catch (error) {
        console.log('Native sharing cancelled or failed');
      }
    }
  };

  const logShare = async (platform: string) => {
    try {
      await fetch('/api/social/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shareType,
          platform,
          contentId,
          metadata
        })
      });
    } catch (error) {
      console.error('Failed to log share:', error);
    }
  };

  const downloadImage = async () => {
    if (shareData) {
      try {
        const response = await fetch(shareData.image);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `feelsharper-${shareType}-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error('Failed to download image:', error);
      }
    }
  };

  const platforms = [
    {
      name: 'Instagram',
      icon: Instagram,
      action: shareToInstagram,
      color: 'bg-gradient-to-br from-purple-500 to-pink-500',
      description: 'Post to Stories or Feed'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      action: shareToTwitter,
      color: 'bg-blue-500',
      description: 'Tweet your achievement'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      action: shareToFacebook,
      color: 'bg-blue-600',
      description: 'Share with friends'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      action: shareToWhatsApp,
      color: 'bg-green-500',
      description: 'Send to contacts'
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Share Your Achievement
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Generating your share card...</p>
            </div>
          ) : shareData ? (
            <>
              {/* Preview Card */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Preview</h3>
                <div 
                  ref={previewRef}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border"
                >
                  <img 
                    src={shareData.image} 
                    alt="Share preview" 
                    className="w-full rounded-lg mb-3"
                    style={{ aspectRatio: '1200/630' }}
                  />
                  <div className="space-y-2">
                    <h4 className="font-bold text-lg">{shareData.title}</h4>
                    <p className="text-muted-foreground">{shareData.subtitle}</p>
                    <p className="text-sm">{shareData.text}</p>
                    <p className="text-xs text-primary">{shareData.hashtags}</p>
                  </div>
                </div>
              </div>

              {/* Platform Selection */}
              <div>
                <h3 className="font-semibold mb-3">Choose Platform</h3>
                <div className="grid grid-cols-2 gap-3">
                  {platforms.map((platform) => (
                    <Button
                      key={platform.name}
                      variant="outline"
                      className={`h-auto p-4 flex-col gap-2 hover:scale-105 transition-transform ${
                        selectedPlatform === platform.name.toLowerCase() ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={platform.action}
                    >
                      <div className={`w-8 h-8 rounded-lg ${platform.color} flex items-center justify-center`}>
                        <platform.icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{platform.name}</div>
                        <div className="text-xs text-muted-foreground">{platform.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Native Share (Mobile) */}
              {navigator.share && (
                <Button
                  onClick={shareNative}
                  className="w-full"
                  variant="outline"
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  Share via Mobile
                </Button>
              )}

              {/* Manual Options */}
              <div className="space-y-3">
                <h3 className="font-semibold">Manual Options</h3>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(shareData.url)}
                    className="flex-1"
                  >
                    {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(`${shareData.text}\n\n${shareData.hashtags}`)}
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Text
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadImage}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>

              {/* Instagram Instructions */}
              {selectedPlatform === 'instagram' && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="pt-4">
                    <h4 className="font-semibold mb-2">Instagram Sharing Steps:</h4>
                    <ol className="text-sm space-y-1 list-decimal list-inside">
                      <li>Text has been copied to your clipboard</li>
                      <li>Download the image above</li>
                      <li>Open Instagram and create a new post</li>
                      <li>Upload the downloaded image</li>
                      <li>Paste the copied text as your caption</li>
                      <li>Tag @feelsharper for a chance to be featured!</li>
                    </ol>
                  </CardContent>
                </Card>
              )}

              {/* Pro Tips */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-none">
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Pro Tips for Maximum Engagement
                  </h4>
                  <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                    <li>Post during peak hours (6-9 AM or 7-9 PM)</li>
                    <li>Tag fitness friends to inspire them</li>
                    <li>Add your own personal message</li>
                    <li>Use location tags if posting publicly</li>
                  </ul>
                </CardContent>
              </Card>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}