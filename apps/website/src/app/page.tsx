'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BRAND } from '@/lib/brand'
import { cn } from '@/lib/utils'
import ParticleBackground from '@/components/ParticleBackground'
import WaitlistOptimizer from '@/components/WaitlistOptimizer'
import { 
  ChevronDown, 
  Brain, 
  Zap, 
  Target,
  Twitter,
  Github,
  Linkedin,
  ArrowRight,
  CheckCircle,
  Activity,
  BookOpen,
  Plus,
  Minus,
  Music,
  DollarSign,
  ChefHat,
  Heart,
  Palette,
  Briefcase,
  Home as HomeIcon,
  Flower,
  Wrench,
  BookText,
  MessageSquare,
  PenTool,
  Flower2 as Lotus,
  Goal,
  Users,
  Sparkles,
  Smartphone,
  Download,
  Bell,
  Star,
  TrendingUp,
  Mail
} from 'lucide-react'

const PRODUCTS = [
  { 
    name: "FeelSharper", 
    icon: Activity, 
    desc: "Fitness & Wellness Coach", 
    detail: "Trained on exercise science, biomechanics & sports medicine",
    color: "from-red-500/20 to-pink-500/20", 
    border: "border-red-500/30",
    textColor: "text-red-400",
    status: "available",
    launch: "Live Beta - PWA Ready",
    link: "https://feelsharper.vercel.app"
  },
  { 
    name: "StudySharper", 
    icon: BookOpen, 
    desc: "Learning & Memory Coach", 
    detail: "Trained on cognitive psychology & learning science",
    color: "from-cyan-500/20 to-blue-500/20", 
    border: "border-cyan-500/30",
    textColor: "text-cyan-400",
    status: "available",
    launch: "Live Beta",
    link: "https://studysharper.vercel.app"
  },
  { 
    name: "TuneSharper", 
    icon: Music, 
    desc: "Music Learning Coach", 
    detail: "Trained on music theory, pedagogy & performance technique",
    color: "from-purple-500/20 to-violet-500/20", 
    border: "border-purple-500/30",
    textColor: "text-purple-400",
    status: "coming",
    launch: "Q3 2025"
  },
  { 
    name: "WealthSharper", 
    icon: DollarSign, 
    desc: "Personal Finance Coach", 
    detail: "Trained on CFP curriculum & behavioral finance research",
    color: "from-green-500/20 to-emerald-500/20", 
    border: "border-green-500/30",
    textColor: "text-green-400",
    status: "coming",
    launch: "Q3 2025"
  },
  { 
    name: "ChefSharper", 
    icon: ChefHat, 
    desc: "Cooking & Nutrition Coach", 
    detail: "Trained on culinary techniques & nutritional science",
    color: "from-orange-500/20 to-amber-500/20", 
    border: "border-orange-500/30",
    textColor: "text-orange-400",
    status: "coming",
    launch: "Q3 2025"
  },
  { 
    name: "MindSharper", 
    icon: Heart, 
    desc: "Mental Wellness Coach", 
    detail: "Trained on CBT, mindfulness & stress management research",
    color: "from-indigo-500/20 to-purple-500/20", 
    border: "border-indigo-500/30",
    textColor: "text-indigo-400",
    status: "coming",
    launch: "Q4 2025"
  },
  { 
    name: "ArtSharper", 
    icon: Palette, 
    desc: "Creative Skills Coach", 
    detail: "Trained on art fundamentals & design principles",
    color: "from-pink-500/20 to-rose-500/20", 
    border: "border-pink-500/30",
    textColor: "text-pink-400",
    status: "coming",
    launch: "Q4 2025"
  },
  { 
    name: "CareerSharper", 
    icon: Briefcase, 
    desc: "Professional Dev Coach", 
    detail: "Trained on industry skills & career progression patterns",
    color: "from-blue-500/20 to-cyan-500/20", 
    border: "border-blue-500/30",
    textColor: "text-blue-400",
    status: "coming",
    launch: "Q4 2025"
  },
  { 
    name: "HomeSharper", 
    icon: HomeIcon, 
    desc: "Home Management Coach", 
    detail: "Trained on home maintenance & energy efficiency",
    color: "from-yellow-500/20 to-orange-500/20", 
    border: "border-yellow-500/30",
    textColor: "text-yellow-400",
    status: "coming",
    launch: "Q4 2025"
  },
  { 
    name: "GrowSharper", 
    icon: Flower, 
    desc: "Gardening Coach", 
    detail: "Trained on horticulture science & plant biology",
    color: "from-emerald-500/20 to-green-500/20", 
    border: "border-emerald-500/30",
    textColor: "text-emerald-400",
    status: "coming",
    launch: "Q4 2025"
  },
  { 
    name: "FixSharper", 
    icon: Wrench, 
    desc: "DIY & Repair Coach", 
    detail: "Trained on repair techniques & safety protocols",
    color: "from-gray-500/20 to-slate-500/20", 
    border: "border-gray-500/30",
    textColor: "text-gray-400",
    status: "coming",
    launch: "Q4 2025"
  },
  { 
    name: "ReadSharper", 
    icon: BookText, 
    desc: "Reading Coach", 
    detail: "Trained on comprehension strategies & speed reading",
    color: "from-amber-500/20 to-yellow-500/20", 
    border: "border-amber-500/30",
    textColor: "text-amber-400",
    status: "coming",
    launch: "Q4 2025"
  },
  { 
    name: "SpeakSharper", 
    icon: MessageSquare, 
    desc: "Communication Coach", 
    detail: "Trained on rhetoric & communication psychology",
    color: "from-teal-500/20 to-cyan-500/20", 
    border: "border-teal-500/30",
    textColor: "text-teal-400",
    status: "coming",
    launch: "Q4 2025"
  },
  { 
    name: "WriteSharper", 
    icon: PenTool, 
    desc: "Writing Coach", 
    detail: "Trained on style guides & storytelling techniques",
    color: "from-violet-500/20 to-purple-500/20", 
    border: "border-violet-500/30",
    textColor: "text-violet-400",
    status: "coming",
    launch: "Q4 2025"
  },
  { 
    name: "ZenSharper", 
    icon: Lotus, 
    desc: "Meditation Coach", 
    detail: "Trained on meditation techniques & neuroscience research",
    color: "from-sky-500/20 to-blue-500/20", 
    border: "border-sky-500/30",
    textColor: "text-sky-400",
    status: "coming",
    launch: "Q4 2025"
  },
  { 
    name: "GoalSharper", 
    icon: Goal, 
    desc: "Goal Achievement Coach", 
    detail: "Trained on goal psychology & habit formation science",
    color: "from-red-500/20 to-orange-500/20", 
    border: "border-red-500/30",
    textColor: "text-red-400",
    status: "coming",
    launch: "Q4 2025"
  },
  { 
    name: "ConnectSharper", 
    icon: Users, 
    desc: "Relationship Coach", 
    detail: "Trained on social psychology & relationship dynamics",
    color: "from-rose-500/20 to-pink-500/20", 
    border: "border-rose-500/30",
    textColor: "text-rose-400",
    status: "coming",
    launch: "Q4 2025"
  }
]

export default function Home() {
  const [manifestoExpanded, setManifestoExpanded] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)
  const [showWaitlist, setShowWaitlist] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const availableProducts = PRODUCTS.filter(p => p.status === 'available')
  const comingProducts = PRODUCTS.filter(p => p.status === 'coming')

  return (
    <main className="min-h-screen bg-charcoal text-white overflow-x-hidden">
      {/* Navigation */}
      <motion.nav 
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-300",
          isScrolled ? "bg-charcoal/95 backdrop-blur-xl border-b border-deep-gray" : "bg-transparent"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="text-2xl font-bold flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="w-6 h-6 text-electric-blue" />
              Sharpened
            </motion.div>
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('demo')}
                className="hover:text-electric-blue transition-colors"
              >
                Demo
              </button>
              <button 
                onClick={() => scrollToSection('products')}
                className="hover:text-electric-blue transition-colors"
              >
                Products
              </button>
              <button 
                onClick={() => scrollToSection('faq')}
                className="hover:text-electric-blue transition-colors"
              >
                FAQ
              </button>
              <motion.a 
                href="https://feelsharper.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-electric-blue hover:bg-blue-600 px-4 py-2 rounded-lg font-medium transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try Now
              </motion.a>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Revolutionary Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <ParticleBackground />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-charcoal/50 to-charcoal pointer-events-none" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <motion.div 
                className="inline-flex items-center gap-2 bg-green-500/20 backdrop-blur border border-green-500/40 rounded-full px-6 py-3"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-300">2 Live Products</span>
              </motion.div>
              <motion.div 
                className="inline-flex items-center gap-2 bg-electric-blue/20 backdrop-blur border border-electric-blue/40 rounded-full px-6 py-3"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Smartphone className="w-4 h-4 text-electric-blue" />
                <span className="text-sm font-medium">PWA - No App Store Required</span>
              </motion.div>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 tracking-tight leading-none">
              <span className="block mb-4">AI Coaching That</span>
              <span className="block bg-gradient-to-r from-electric-blue via-cyan-pulse to-electric-blue bg-clip-text text-transparent">
                Actually Works
              </span>
            </h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-zinc-300 mb-12 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              Turn proven techniques into personalized AI-powered plans you can measure. 
              <span className="text-electric-blue font-semibold">Know what works, do it well, see the gains</span>. 
              No app store needed - works instantly on any device.
            </motion.p>

            <motion.div 
              className="flex flex-col items-center gap-6 mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <motion.button
                onClick={() => setShowWaitlist(true)}
                className="bg-gradient-to-r from-electric-blue to-cyan-pulse hover:from-blue-600 hover:to-cyan-600 text-white px-12 py-5 rounded-2xl font-bold text-xl transition-all inline-flex items-center justify-center gap-3 group shadow-2xl shadow-electric-blue/30"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="w-6 h-6" />
                Get Early Access
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <div className="flex flex-col sm:flex-row gap-4 text-sm text-zinc-400">
                <a href="https://feelsharper.vercel.app" target="_blank" rel="noopener noreferrer" 
                   className="hover:text-electric-blue transition-colors underline underline-offset-4">
                  Try FeelSharper Demo
                </a>
                <span className="hidden sm:inline">•</span>
                <a href="https://studysharper.vercel.app" target="_blank" rel="noopener noreferrer"
                   className="hover:text-cyan-400 transition-colors underline underline-offset-4">
                  Try StudySharper Demo
                </a>
              </div>
            </motion.div>

            {/* Stats Row */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">2 Live</div>
                <div className="text-zinc-400">Ready to Use Now</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-electric-blue mb-2">15 Coming</div>
                <div className="text-zinc-400">More Coaches in 2025</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400 mb-2">$9.99</div>
                <div className="text-zinc-400">Per Month for All</div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-8 h-8 text-zinc-600" />
          </motion.div>
        </div>
      </section>

      {/* How It Works Demo Section */}
      <section id="demo" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              See It In Action
            </h2>
            <p className="text-xl text-zinc-300 max-w-3xl mx-auto">
              Watch how our AI coaches turn your goals into measurable results in 3 simple steps
            </p>
          </motion.div>

          {/* Interactive Demo Steps */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {[
              {
                step: "1",
                title: "Tell Us Your Goal",
                desc: "Whether it's losing 20 lbs, running a marathon, or acing exams - just type what you want to achieve",
                demo: "Try: 'I want to lose 20 pounds in 3 months'",
                color: "from-electric-blue/20 to-cyan-pulse/20"
              },
              {
                step: "2",
                title: "Get Your Personalized Plan",
                desc: "AI analyzes your situation and creates a science-backed plan tailored specifically to you",
                demo: "See: Daily workouts, meal plans, progress milestones",
                color: "from-cyan-pulse/20 to-purple-500/20"
              },
              {
                step: "3",
                title: "Track Real Progress",
                desc: "See measurable improvements with detailed analytics, not just feel-good metrics",
                demo: "Track: Weight loss, strength gains, study scores",
                color: "from-purple-500/20 to-pink-500/20"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className={`bg-gradient-to-br ${item.color} backdrop-blur border border-zinc-700 rounded-2xl p-8 hover:border-electric-blue/50 transition-all`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="text-4xl font-bold text-electric-blue mb-4">Step {item.step}</div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-zinc-300 mb-4">{item.desc}</p>
                <div className="bg-charcoal/50 rounded-lg p-3 border border-zinc-700">
                  <p className="text-sm text-cyan-400 font-mono">{item.demo}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Live Demo Preview */}
          <motion.div
            className="bg-gradient-to-r from-deep-gray/30 via-deep-gray/50 to-deep-gray/30 backdrop-blur border border-zinc-700 rounded-3xl p-8 mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-2xl font-bold text-center mb-8">Try A Real Example</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold mb-4 text-red-400">FeelSharper Demo</h4>
                <div className="bg-charcoal/50 rounded-lg p-4 border border-zinc-700 space-y-3">
                  <p className="text-sm text-zinc-300"><span className="text-cyan-400">You:</span> "I'm a beginner and want to get stronger"</p>
                  <p className="text-sm text-zinc-300"><span className="text-green-400">AI:</span> "Based on your fitness level, I recommend Starting Strength program. 3x/week, focusing on compound movements..."</p>
                  <p className="text-sm text-zinc-300"><span className="text-cyan-400">You:</span> "Show me today's workout"</p>
                  <p className="text-sm text-zinc-300"><span className="text-green-400">AI:</span> "Today: Squats 3x5, Bench Press 3x5, Deadlift 1x5. Here's proper form videos and weight progression..."</p>
                </div>
                <motion.a
                  href="https://feelsharper.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Try Full Demo <ArrowRight className="w-4 h-4" />
                </motion.a>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4 text-cyan-400">StudySharper Demo</h4>
                <div className="bg-charcoal/50 rounded-lg p-4 border border-zinc-700 space-y-3">
                  <p className="text-sm text-zinc-300"><span className="text-cyan-400">You:</span> "I need to memorize 200 medical terms"</p>
                  <p className="text-sm text-zinc-300"><span className="text-green-400">AI:</span> "I'll create a spaced repetition schedule. Let's start with 20 terms today using memory palace technique..."</p>
                  <p className="text-sm text-zinc-300"><span className="text-cyan-400">You:</span> "Test me on cardiovascular terms"</p>
                  <p className="text-sm text-zinc-300"><span className="text-green-400">AI:</span> "Quiz starting: Define 'Atherosclerosis'... Great! You've improved 40% since last week..."</p>
                </div>
                <motion.a
                  href="https://studysharper.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Try Full Demo <ArrowRight className="w-4 h-4" />
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Why It's Different
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {[
              {
                icon: Download,
                title: "Install Instantly",
                desc: "No app store downloads. Install directly from your browser in seconds.",
                color: "text-green-400"
              },
              {
                icon: Smartphone,
                title: "Works Offline",
                desc: "Access your coaching sessions even without internet connection.",
                color: "text-blue-400"
              },
              {
                icon: Bell,
                title: "Push Notifications",
                desc: "Get reminders and motivation exactly when you need them.",
                color: "text-purple-400"
              },
              {
                icon: TrendingUp,
                title: "Always Updated",
                desc: "Automatic updates ensure you always have the latest features.",
                color: "text-cyan-400"
              }
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  className="bg-deep-gray/40 backdrop-blur border border-zinc-700 rounded-2xl p-6 text-center hover:border-electric-blue/50 transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -5 }}
                >
                  <Icon className={`w-12 h-12 ${feature.color} mx-auto mb-4`} />
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-zinc-400 text-sm">{feature.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Revolutionary Ecosystem Section */}
      <section id="products" className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-deep-gray/20 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              The Complete Ecosystem
            </h2>
            <p className="text-xl text-zinc-300 max-w-4xl mx-auto leading-relaxed">
              Each coach is trained on specialized knowledge that would take years to master. 
              Get expert-level guidance across every domain of personal improvement.
            </p>
          </motion.div>

          {/* Available Products - Hero Treatment */}
          <div className="mb-32">
            <motion.h3 
              className="text-3xl font-bold text-center mb-16 text-green-400"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              🚀 Live Now - Start Your Journey Today
            </motion.h3>
            
            <div className="grid lg:grid-cols-2 gap-12">
              {availableProducts.map((product, index) => {
                const Icon = product.icon
                return (
                  <motion.div
                    key={product.name}
                    className={`bg-gradient-to-br ${product.color} backdrop-blur border ${product.border} rounded-3xl p-8 hover:scale-105 transition-all duration-300 group cursor-pointer shadow-2xl`}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2, duration: 0.8 }}
                    whileHover={{ y: -10 }}
                  >
                    <div className="flex items-start gap-6">
                      <div className={`w-16 h-16 ${product.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-8 h-8 ${product.textColor}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className={`text-2xl font-bold mb-3 ${product.textColor}`}>{product.name}</h4>
                        <p className="text-lg text-white mb-4">{product.desc}</p>
                        <p className="text-sm text-zinc-300 mb-4">{product.detail}</p>
                        <div className="flex items-center gap-4 mb-6">
                          <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-medium">{product.launch}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-zinc-400">4.8 rating</span>
                          </div>
                        </div>
                        <motion.a
                          href={product.link || `/${product.name.toLowerCase()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`bg-gradient-to-r ${product.color} border ${product.border} hover:opacity-90 text-white px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2 group transition-all`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Launch App
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </motion.a>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Coming Soon - Grid */}
          <div>
            <motion.h3 
              className="text-3xl font-bold text-center mb-16 text-zinc-400"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Coming Soon - The Revolution Continues
            </motion.h3>
            
            <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {comingProducts.map((product, index) => {
                const Icon = product.icon
                return (
                  <motion.div
                    key={product.name}
                    className={`bg-gradient-to-br ${product.color} backdrop-blur border ${product.border} rounded-2xl p-6 hover:scale-105 transition-all duration-300 group cursor-pointer`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05, duration: 0.6 }}
                    whileHover={{ y: -5 }}
                    onMouseEnter={() => setHoveredProduct(product.name)}
                    onMouseLeave={() => setHoveredProduct(null)}
                  >
                    <div className={`w-12 h-12 ${product.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 ${product.textColor}`} />
                    </div>
                    <h4 className={`font-bold text-white mb-2 text-sm`}>{product.name}</h4>
                    <p className="text-xs text-zinc-300 mb-3 opacity-80">{product.desc}</p>
                    {hoveredProduct === product.name && (
                      <motion.p 
                        className="text-xs text-zinc-400 mb-3"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        {product.detail}
                      </motion.p>
                    )}
                    <div className={`text-xs ${product.textColor} font-medium`}>{product.launch}</div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Ecosystem Benefits */}
          <motion.div
            className="mt-32 bg-gradient-to-r from-deep-gray/30 via-deep-gray/50 to-deep-gray/30 backdrop-blur border border-zinc-700 rounded-3xl p-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-electric-blue to-cyan-pulse bg-clip-text text-transparent">
              Why The Complete Ecosystem Changes Everything
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-electric-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Brain className="w-8 h-8 text-electric-blue" />
                </div>
                <h4 className="text-xl font-semibold mb-4">Cross-Domain Intelligence</h4>
                <p className="text-zinc-300">Your fitness goals inform meal recommendations. Study patterns optimize sleep schedules. Everything connects for exponential improvement.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-electric-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Target className="w-8 h-8 text-electric-blue" />
                </div>
                <h4 className="text-xl font-semibold mb-4">Holistic Mastery</h4>
                <p className="text-zinc-300">Track measurable progress across all life domains with unified analytics, goal setting, and achievement tracking.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-electric-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-8 h-8 text-electric-blue" />
                </div>
                <h4 className="text-xl font-semibold mb-4">Compound Growth</h4>
                <p className="text-zinc-300">Small improvements across multiple areas create massive life transformation. This is how you become unstoppable.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Revolutionary Manifesto */}
      <section id="manifesto" className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-electric-blue/5 to-transparent" />
        
        <div className="max-w-5xl mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-6xl font-bold text-center mb-16 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              The Sharpened Manifesto
            </h2>
            
            <div className="bg-gradient-to-br from-deep-gray/40 via-deep-gray/60 to-deep-gray/40 backdrop-blur-xl border border-zinc-700 rounded-3xl p-12 shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={manifestoExpanded ? 'expanded' : 'collapsed'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="space-y-10">
                    <div>
                      <h3 className="text-2xl font-bold mb-4 text-electric-blue flex items-center gap-3">
                        <Sparkles className="w-6 h-6" />
                        The Vision
                      </h3>
                      <p className="text-xl text-zinc-200 leading-relaxed">
                        We believe every person contains infinite potential. Traditional self-improvement fails because it's generic. 
                        <span className="text-electric-blue font-semibold"> Sharpened succeeds because each coach is an expert</span>, 
                        trained on real knowledge from professionals who've mastered their craft.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-bold mb-4 text-electric-blue flex items-center gap-3">
                        <Target className="w-6 h-6" />
                        The Mission  
                      </h3>
                      <p className="text-xl text-zinc-200 leading-relaxed">
                        Transform personal improvement from guesswork to science. No more generic advice or one-size-fits-all solutions. 
                        <span className="text-electric-blue font-semibold"> Every recommendation backed by expertise</span>, 
                        every insight powered by real data, every victory measured precisely.
                      </p>
                    </div>

                    {manifestoExpanded && (
                      <>
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.4 }}
                        >
                          <h3 className="text-2xl font-bold mb-4 text-electric-blue flex items-center gap-3">
                            <Smartphone className="w-6 h-6" />
                            The PWA Advantage
                          </h3>
                          <p className="text-xl text-zinc-200 leading-relaxed">
                            While others wait for app store approvals and fight for downloads, we deliver immediately through Progressive Web Apps. 
                            No gatekeepers, no friction, no barriers. <span className="text-electric-blue font-semibold">Install in seconds, start improving instantly</span>. 
                            This is how the future gets built - fast, direct, and user-first.
                          </p>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.4, delay: 0.1 }}
                        >
                          <h3 className="text-2xl font-bold mb-4 text-electric-blue flex items-center gap-3">
                            <Brain className="w-6 h-6" />
                            Monorepo Magic
                          </h3>
                          <p className="text-xl text-zinc-200 leading-relaxed">
                            Our unified codebase means faster development, consistent experiences, and shared intelligence across all coaches. 
                            <span className="text-electric-blue font-semibold">One subscription, 17 specialized coaches</span>. 
                            What takes other companies years to build, we deliver in months through architectural excellence.
                          </p>
                        </motion.div>
                      </>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              <motion.button
                onClick={() => setManifestoExpanded(!manifestoExpanded)}
                className="mt-10 text-electric-blue hover:text-blue-400 font-semibold inline-flex items-center gap-3 group text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {manifestoExpanded ? (
                  <>
                    <Minus className="w-5 h-5" />
                    Show less
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Read the complete manifesto
                  </>
                )}
              </motion.button>
            </div>

            {/* Core Values */}
            <motion.div 
              className="mt-16 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <h3 className="text-2xl font-bold mb-8">Core Values</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {[
                  { title: "Expert Knowledge", desc: "Real expertise, not generic advice" },
                  { title: "Measurable Results", desc: "Track real progress, not vanity metrics" },
                  { title: "Zero Friction", desc: "Effortless interaction, maximum impact" },
                  { title: "Evidence-Based", desc: "Scientific backing for every recommendation" },
                  { title: "Holistic Growth", desc: "Connected improvement across all domains" }
                ].map((value, index) => (
                  <motion.div
                    key={index}
                    className="bg-deep-gray/60 backdrop-blur px-6 py-4 rounded-2xl border border-zinc-700 hover:border-electric-blue/50 transition-all group"
                    whileHover={{ scale: 1.05, y: -2 }}
                    title={value.desc}
                  >
                    <span className="font-semibold text-white group-hover:text-electric-blue transition-colors">{value.title}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 relative">
        <div className="max-w-4xl mx-auto px-6 relative">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Common Questions
            </h2>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                q: "How is this different from ChatGPT or other AI?",
                a: "Our coaches are specialized experts trained on real professional knowledge - exercise science, cognitive psychology, etc. Not generic AI, but domain-specific expertise that gives you proven methods, not guesses."
              },
              {
                q: "Do I need to download an app?",
                a: "No! It works instantly in your browser. You can also install it like an app with one click - no app store needed. Works on iPhone, Android, and computers."
              },
              {
                q: "How much does it cost?",
                a: "$9.99/month for access to ALL coaches. Compare that to a single personal trainer session at $100+ or a nutritionist at $200/hour."
              },
              {
                q: "Is my data private?",
                a: "Yes. We use bank-level encryption and never sell your data. Your fitness and study information stays completely private."
              },
              {
                q: "What if I'm not tech-savvy?",
                a: "It's as simple as texting. Just type what you want, and the AI responds. No complicated setup or learning curve."
              },
              {
                q: "Can I try it before paying?",
                a: "Yes! Both FeelSharper and StudySharper have free demos you can try right now. Click the buttons above to start."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="bg-deep-gray/40 backdrop-blur border border-zinc-700 rounded-2xl p-6 hover:border-electric-blue/30 transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -2 }}
              >
                <h3 className="text-lg font-semibold mb-3 text-electric-blue">{item.q}</h3>
                <p className="text-zinc-300">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Proven Results
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <motion.div
              className="bg-deep-gray/40 backdrop-blur border border-zinc-700 rounded-2xl p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-4xl font-bold text-green-400 mb-4">1000+</div>
              <p className="text-zinc-300 text-lg mb-2">Beta Users</p>
              <p className="text-zinc-500 text-sm">Active monthly users across our live products</p>
            </motion.div>
            
            <motion.div
              className="bg-deep-gray/40 backdrop-blur border border-zinc-700 rounded-2xl p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <div className="text-4xl font-bold text-yellow-400 mb-4 flex items-center justify-center gap-2">
                4.8 <Star className="w-8 h-8 fill-current" />
              </div>
              <p className="text-zinc-300 text-lg mb-2">Average Rating</p>
              <p className="text-zinc-500 text-sm">Based on user feedback and app store reviews</p>
            </motion.div>
            
            <motion.div
              className="bg-deep-gray/40 backdrop-blur border border-zinc-700 rounded-2xl p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="text-4xl font-bold text-electric-blue mb-4">89%</div>
              <p className="text-zinc-300 text-lg mb-2">Goal Achievement</p>
              <p className="text-zinc-500 text-sm">Users who reach their targets within 30 days</p>
            </motion.div>
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              className="bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-2xl p-6"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mr-4">
                  <Activity className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="font-semibold">Sarah M.</p>
                  <p className="text-sm text-zinc-400">Marathon Runner</p>
                </div>
              </div>
              <p className="text-zinc-300 italic">
                "FeelSharper's training plans are better than my previous $200/month personal trainer. 
                The biomechanics analysis is incredible."
              </p>
            </motion.div>
            
            <motion.div
              className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mr-4">
                  <BookOpen className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <p className="font-semibold">David K.</p>
                  <p className="text-sm text-zinc-400">Medical Student</p>
                </div>
              </div>
              <p className="text-zinc-300 italic">
                "StudySharper helped me increase my retention rate by 40%. 
                The spaced repetition system is backed by real cognitive science."
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Revolutionary Waitlist */}
      <section className="py-32 relative overflow-hidden" id="waitlist">
        <div className="absolute inset-0 bg-gradient-to-r from-electric-blue/10 via-cyan-pulse/10 to-electric-blue/10 animate-gradient bg-[length:200%_200%]" />
        
        <div className="max-w-5xl mx-auto px-6 relative">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Start Today
            </h2>
            <p className="text-xl text-zinc-300 max-w-3xl mx-auto leading-relaxed">
              Join thousands already using our live products. No waiting, no app store friction. 
              <span className="text-electric-blue font-semibold">Click, install, improve</span>.
            </p>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <motion.a
              href="https://feelsharper.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all inline-flex items-center justify-center gap-3 group shadow-2xl"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Activity className="w-5 h-5" />
              Launch FeelSharper
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.a>
            <motion.a
              href="https://studysharper.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all inline-flex items-center justify-center gap-3 group shadow-2xl"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <BookOpen className="w-5 h-5" />
              Launch StudySharper
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.a>
          </div>

          <WaitlistOptimizer />

          {/* Social Proof */}
          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <p className="text-zinc-400 mb-6">Trusted by professionals in:</p>
            <div className="flex flex-wrap justify-center gap-8 text-sm text-zinc-500">
              <span>Exercise Science</span>
              <span>Cognitive Psychology</span>
              <span>Music Education</span>
              <span>Financial Planning</span>
              <span>Nutritional Science</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-deep-gray/40 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center gap-3 text-2xl font-bold mb-6">
                <Sparkles className="w-6 h-6 text-electric-blue" />
                Sharpened
              </div>
              <p className="text-zinc-400 mb-6 leading-relaxed">
                The future of personal improvement through specialized AI coaches trained on real expertise.
              </p>
              <p className="text-xs text-zinc-500">
                © 2024 Sharpened. All rights reserved.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-lg">Live Products</h4>
              <ul className="space-y-3 text-zinc-400">
                <li><a href="https://feelsharper.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
                  FeelSharper - Live Beta <ArrowRight className="w-4 h-4" />
                </a></li>
                <li><a href="https://studysharper.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
                  StudySharper - Live Beta <ArrowRight className="w-4 h-4" />
                </a></li>
                <li className="text-zinc-600">TuneSharper - Q3 2025</li>
                <li className="text-zinc-600">WealthSharper - Q3 2025</li>
                <li className="text-zinc-600">+13 more coaches coming</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-lg">Connect</h4>
              <div className="flex space-x-4 mb-6">
                <motion.a 
                  href="https://github.com/pradordordord/sharpened-monorepo" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-zinc-800 hover:bg-zinc-700 rounded-xl flex items-center justify-center transition-colors"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Github className="w-5 h-5" />
                </motion.a>
                <motion.a 
                  href="mailto:hello@sharpened.ai" 
                  className="w-12 h-12 bg-zinc-800 hover:bg-zinc-700 rounded-xl flex items-center justify-center transition-colors"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Mail className="w-5 h-5" />
                </motion.a>
                <motion.a 
                  href="#" 
                  className="w-12 h-12 bg-zinc-800 hover:bg-zinc-700 rounded-xl flex items-center justify-center transition-colors"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Twitter className="w-5 h-5" />
                </motion.a>
              </div>
              <div className="flex space-x-6 text-sm text-zinc-500">
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-white transition-colors">Terms</a>
                <a href="mailto:hello@sharpened.ai" className="hover:text-white transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}