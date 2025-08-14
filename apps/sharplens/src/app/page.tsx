'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera,
  Upload,
  Play,
  Pause,
  Video,
  Image,
  Activity,
  Zap,
  Eye,
  Brain,
  Shield,
  Users,
  Target,
  Layers,
  BarChart3,
  Settings,
  Download,
  Share2,
  AlertCircle,
  CheckCircle,
  Clock,
  Cpu,
  Database,
  Globe,
  Lock,
  Sparkles
} from 'lucide-react'

interface DetectionResult {
  id: string
  type: 'object' | 'face' | 'pose' | 'motion'
  label: string
  confidence: number
  bbox?: { x: number; y: number; width: number; height: number }
  timestamp: number
  metadata?: any
}

interface AnalyticsData {
  totalDetections: number
  averageConfidence: number
  processingTime: number
  detectionsByType: { [key: string]: number }
  timeline: { time: string; count: number }[]
}

const DETECTION_MODELS = [
  {
    id: 'object-detection',
    name: 'Object Detection',
    description: 'Detect and classify objects in real-time',
    icon: Target,
    color: 'from-blue-500 to-cyan-500',
    features: ['90+ object classes', 'Bounding boxes', 'Real-time tracking']
  },
  {
    id: 'face-detection',
    name: 'Face Detection',
    description: 'Detect faces and facial landmarks',
    icon: Users,
    color: 'from-purple-500 to-pink-500',
    features: ['Face recognition', 'Emotion analysis', 'Age estimation']
  },
  {
    id: 'pose-estimation',
    name: 'Pose Estimation',
    description: 'Track human body keypoints and movements',
    icon: Activity,
    color: 'from-green-500 to-emerald-500',
    features: ['17 keypoints', 'Movement tracking', 'Exercise analysis']
  },
  {
    id: 'motion-detection',
    name: 'Motion Detection',
    description: 'Detect and analyze motion patterns',
    icon: Zap,
    color: 'from-orange-500 to-red-500',
    features: ['Motion heatmaps', 'Speed analysis', 'Alert triggers']
  }
]

const SAMPLE_DETECTIONS: DetectionResult[] = [
  {
    id: '1',
    type: 'object',
    label: 'Person',
    confidence: 0.95,
    bbox: { x: 100, y: 50, width: 200, height: 400 },
    timestamp: Date.now() - 1000
  },
  {
    id: '2',
    type: 'object',
    label: 'Car',
    confidence: 0.88,
    bbox: { x: 400, y: 200, width: 300, height: 200 },
    timestamp: Date.now() - 2000
  },
  {
    id: '3',
    type: 'face',
    label: 'Face #1',
    confidence: 0.92,
    bbox: { x: 150, y: 80, width: 100, height: 120 },
    timestamp: Date.now() - 500,
    metadata: { emotion: 'happy', age: 25 }
  }
]

export default function SharpLensPage() {
  const [selectedModel, setSelectedModel] = useState(DETECTION_MODELS[0])
  const [isProcessing, setIsProcessing] = useState(false)
  const [detections, setDetections] = useState<DetectionResult[]>([])
  const [sourceType, setSourceType] = useState<'camera' | 'upload' | 'stream'>('camera')
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalDetections: 0,
    averageConfidence: 0,
    processingTime: 0,
    detectionsByType: {},
    timeline: []
  })
  const [showDemo, setShowDemo] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Simulate detection processing
  const startDetection = useCallback(() => {
    setIsProcessing(true)
    setDetections([])

    // Simulate real-time detections
    const interval = setInterval(() => {
      const newDetection: DetectionResult = {
        id: Date.now().toString(),
        type: ['object', 'face', 'pose', 'motion'][Math.floor(Math.random() * 4)] as any,
        label: ['Person', 'Car', 'Dog', 'Chair', 'Face #1'][Math.floor(Math.random() * 5)],
        confidence: 0.7 + Math.random() * 0.3,
        bbox: {
          x: Math.random() * 500,
          y: Math.random() * 300,
          width: 50 + Math.random() * 200,
          height: 50 + Math.random() * 200
        },
        timestamp: Date.now()
      }

      setDetections(prev => [...prev.slice(-9), newDetection])
      
      // Update analytics
      setAnalyticsData(prev => ({
        totalDetections: prev.totalDetections + 1,
        averageConfidence: (prev.averageConfidence * prev.totalDetections + newDetection.confidence) / (prev.totalDetections + 1),
        processingTime: 15 + Math.random() * 10,
        detectionsByType: {
          ...prev.detectionsByType,
          [newDetection.type]: (prev.detectionsByType[newDetection.type] || 0) + 1
        },
        timeline: [...prev.timeline, { time: new Date().toLocaleTimeString(), count: prev.totalDetections + 1 }].slice(-20)
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const stopDetection = () => {
    setIsProcessing(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">SharpLens</h1>
                <p className="text-sm text-gray-400">Computer Vision Analytics Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors">
                <Settings className="h-5 w-5" />
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all">
                <Share2 className="h-5 w-5 inline mr-2" />
                Share
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Video/Input Source */}
          <div className="lg:col-span-2 space-y-6">
            {/* Input Source Selector */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-4">Input Source</h2>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <button
                  onClick={() => setSourceType('camera')}
                  className={`p-4 rounded-lg border transition-all ${
                    sourceType === 'camera'
                      ? 'bg-purple-500/20 border-purple-500 text-white'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <Camera className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-sm">Camera</span>
                </button>
                <button
                  onClick={() => setSourceType('upload')}
                  className={`p-4 rounded-lg border transition-all ${
                    sourceType === 'upload'
                      ? 'bg-purple-500/20 border-purple-500 text-white'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <Upload className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-sm">Upload</span>
                </button>
                <button
                  onClick={() => setSourceType('stream')}
                  className={`p-4 rounded-lg border transition-all ${
                    sourceType === 'stream'
                      ? 'bg-purple-500/20 border-purple-500 text-white'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <Globe className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-sm">Stream</span>
                </button>
              </div>

              {/* Video Display */}
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                />
                
                {/* Overlay Controls */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                  <div className="flex gap-2">
                    {!isProcessing ? (
                      <button
                        onClick={startDetection}
                        className="px-4 py-2 bg-green-500 rounded-lg text-white font-medium hover:bg-green-600 transition-colors flex items-center gap-2"
                      >
                        <Play className="h-4 w-4" />
                        Start Analysis
                      </button>
                    ) : (
                      <button
                        onClick={stopDetection}
                        className="px-4 py-2 bg-red-500 rounded-lg text-white font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
                      >
                        <Pause className="h-4 w-4" />
                        Stop
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-black/50 rounded-lg">
                    <div className={`h-2 w-2 rounded-full ${
                      isProcessing ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                    }`} />
                    <span className="text-sm text-white">
                      {isProcessing ? 'Processing' : 'Ready'}
                    </span>
                  </div>
                </div>

                {/* Detection Overlay */}
                {isProcessing && detections.length > 0 && (
                  <div className="absolute inset-0 pointer-events-none">
                    {detections.map((detection) => (
                      <div
                        key={detection.id}
                        className="absolute border-2 border-green-500"
                        style={{
                          left: detection.bbox?.x,
                          top: detection.bbox?.y,
                          width: detection.bbox?.width,
                          height: detection.bbox?.height
                        }}
                      >
                        <span className="absolute -top-6 left-0 px-2 py-1 bg-green-500 text-white text-xs rounded">
                          {detection.label} ({(detection.confidence * 100).toFixed(0)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Real-time Detections */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-4">Real-time Detections</h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {detections.length > 0 ? (
                  detections.map((detection) => (
                    <motion.div
                      key={detection.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          detection.type === 'object' ? 'bg-blue-500/20 text-blue-400' :
                          detection.type === 'face' ? 'bg-purple-500/20 text-purple-400' :
                          detection.type === 'pose' ? 'bg-green-500/20 text-green-400' :
                          'bg-orange-500/20 text-orange-400'
                        }`}>
                          {detection.type === 'object' ? <Target className="h-4 w-4" /> :
                           detection.type === 'face' ? <Users className="h-4 w-4" /> :
                           detection.type === 'pose' ? <Activity className="h-4 w-4" /> :
                           <Zap className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="text-white font-medium">{detection.label}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(detection.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">
                          {(detection.confidence * 100).toFixed(0)}%
                        </p>
                        <p className="text-xs text-gray-400">confidence</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No detections yet</p>
                    <p className="text-sm mt-1">Start analysis to see results</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Models & Analytics */}
          <div className="space-y-6">
            {/* Detection Models */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-4">Detection Models</h2>
              <div className="space-y-3">
                {DETECTION_MODELS.map((model) => {
                  const Icon = model.icon
                  return (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModel(model)}
                      className={`w-full p-4 rounded-lg border transition-all ${
                        selectedModel.id === model.id
                          ? 'bg-gradient-to-r ' + model.color + ' bg-opacity-20 border-white/30'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="h-5 w-5 text-white mt-0.5" />
                        <div className="flex-1 text-left">
                          <h3 className="text-white font-medium">{model.name}</h3>
                          <p className="text-xs text-gray-400 mt-1">{model.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {model.features.map((feature) => (
                              <span key={feature} className="text-xs px-2 py-1 bg-white/10 rounded text-gray-300">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Analytics Dashboard */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-4">Analytics</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Total Detections</p>
                    <p className="text-2xl font-bold text-white">{analyticsData.totalDetections}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Avg Confidence</p>
                    <p className="text-2xl font-bold text-white">
                      {analyticsData.averageConfidence ? (analyticsData.averageConfidence * 100).toFixed(0) : 0}%
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Processing Time</p>
                    <p className="text-2xl font-bold text-white">
                      {analyticsData.processingTime.toFixed(0)}ms
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">FPS</p>
                    <p className="text-2xl font-bold text-white">30</p>
                  </div>
                </div>

                {/* Detection Types Chart */}
                <div>
                  <p className="text-xs text-gray-400 mb-2">Detection Types</p>
                  <div className="space-y-2">
                    {Object.entries(analyticsData.detectionsByType).map(([type, count]) => (
                      <div key={type} className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-16">{type}</span>
                        <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-violet-500"
                            style={{ width: `${(count / analyticsData.totalDetections) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-white">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-4">Export</h2>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                  <Download className="h-4 w-4" />
                  Export Video
                </button>
                <button className="w-full px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                  <Database className="h-4 w-4" />
                  Export Data (JSON)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
          >
            <Cpu className="h-8 w-8 text-purple-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Edge Computing</h3>
            <p className="text-sm text-gray-400">
              Process video streams locally with optimized models for real-time performance.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
          >
            <Shield className="h-8 w-8 text-green-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Privacy First</h3>
            <p className="text-sm text-gray-400">
              All processing happens on-device. Your data never leaves your infrastructure.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
          >
            <Sparkles className="h-8 w-8 text-yellow-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Custom Models</h3>
            <p className="text-sm text-gray-400">
              Train and deploy custom models tailored to your specific use case.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}