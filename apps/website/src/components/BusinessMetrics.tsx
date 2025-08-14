'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Target,
  Award,
  Globe,
  Zap,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface Metric {
  label: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: any
  color: string
  trend?: 'up' | 'down' | 'neutral'
}

interface Milestone {
  date: string
  title: string
  description: string
  type: 'product' | 'business' | 'technical' | 'team'
  completed: boolean
}

const BUSINESS_METRICS: Metric[] = [
  {
    label: 'Monthly Active Users',
    value: '1,547',
    change: 25.3,
    changeLabel: 'vs last month',
    icon: Users,
    color: 'text-blue-400',
    trend: 'up'
  },
  {
    label: 'Monthly Recurring Revenue',
    value: '$3,249',
    change: 42.1,
    changeLabel: 'MoM growth',
    icon: DollarSign,
    color: 'text-green-400',
    trend: 'up'
  },
  {
    label: 'Product Velocity',
    value: '8.5',
    change: 15,
    changeLabel: 'features/week',
    icon: Zap,
    color: 'text-yellow-400',
    trend: 'up'
  },
  {
    label: 'User Retention',
    value: '87%',
    change: 5.2,
    changeLabel: '30-day retention',
    icon: Target,
    color: 'text-purple-400',
    trend: 'up'
  },
  {
    label: 'NPS Score',
    value: '72',
    change: 8,
    changeLabel: 'promoter score',
    icon: Award,
    color: 'text-pink-400',
    trend: 'up'
  },
  {
    label: 'API Uptime',
    value: '99.9%',
    change: 0.1,
    changeLabel: 'SLA target',
    icon: Activity,
    color: 'text-cyan-400',
    trend: 'neutral'
  }
]

const PRODUCT_METRICS = [
  { product: 'FeelSharper', users: 823, revenue: 1647, growth: 28, status: 'live' },
  { product: 'StudySharper', users: 512, revenue: 1024, growth: 45, status: 'beta' },
  { product: 'SharpLens', users: 89, revenue: 445, growth: 120, status: 'alpha' },
  { product: 'SharpFlow', users: 123, revenue: 133, growth: 67, status: 'development' }
]

const ROADMAP_MILESTONES: Milestone[] = [
  {
    date: '2025 Q1',
    title: 'FeelSharper PWA Launch',
    description: 'Full Progressive Web App with offline support',
    type: 'product',
    completed: true
  },
  {
    date: '2025 Q1',
    title: 'StudySharper Beta Release',
    description: 'Public beta with RAG and spaced repetition',
    type: 'product',
    completed: true
  },
  {
    date: '2025 Q2',
    title: 'Series Seed Funding',
    description: '$500K seed round to accelerate growth',
    type: 'business',
    completed: false
  },
  {
    date: '2025 Q2',
    title: 'SharpLens Alpha',
    description: 'Computer vision platform private alpha',
    type: 'product',
    completed: false
  },
  {
    date: '2025 Q3',
    title: '10K Active Users',
    description: 'Reach 10,000 monthly active users',
    type: 'business',
    completed: false
  },
  {
    date: '2025 Q3',
    title: 'AI Model v2.0',
    description: 'Enhanced AI with multi-modal capabilities',
    type: 'technical',
    completed: false
  },
  {
    date: '2025 Q4',
    title: '$100K MRR',
    description: 'Achieve $100K monthly recurring revenue',
    type: 'business',
    completed: false
  },
  {
    date: '2025 Q4',
    title: 'Enterprise Launch',
    description: 'B2B offering for corporate wellness',
    type: 'product',
    completed: false
  }
]

const TECH_STACK = [
  { category: 'Frontend', techs: ['Next.js 15', 'React 19', 'TypeScript', 'Tailwind CSS'] },
  { category: 'Backend', techs: ['Node.js', 'Python', 'FastAPI', 'PostgreSQL'] },
  { category: 'AI/ML', techs: ['Claude AI', 'OpenAI', 'TensorFlow', 'LangChain'] },
  { category: 'Infrastructure', techs: ['Vercel', 'Supabase', 'Docker', 'Redis'] }
]

export default function BusinessMetrics() {
  const [selectedMetricIndex, setSelectedMetricIndex] = useState(0)
  const [animatedValues, setAnimatedValues] = useState<{ [key: string]: number }>({})

  // Animate numbers on mount
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []
    
    BUSINESS_METRICS.forEach((metric, index) => {
      const numericValue = typeof metric.value === 'string' 
        ? parseFloat(metric.value.replace(/[^0-9.-]/g, '')) 
        : metric.value
      
      const timer = setTimeout(() => {
        const interval = setInterval(() => {
          setAnimatedValues(prev => {
            const current = prev[metric.label] || 0
            const increment = numericValue / 20
            const newValue = Math.min(current + increment, numericValue)
            
            if (newValue >= numericValue) {
              clearInterval(interval)
            }
            
            return { ...prev, [metric.label]: newValue }
          })
        }, 50)
      }, index * 100)
      
      timers.push(timer)
    })
    
    return () => timers.forEach(clearTimeout)
  }, [])

  const formatValue = (metric: Metric) => {
    const animated = animatedValues[metric.label] || 0
    if (typeof metric.value === 'string') {
      if (metric.value.includes('$')) {
        return `$${Math.round(animated).toLocaleString()}`
      }
      if (metric.value.includes('%')) {
        return `${Math.round(animated)}%`
      }
      if (metric.value.includes(',')) {
        return Math.round(animated).toLocaleString()
      }
      return animated.toFixed(1)
    }
    return Math.round(animated)
  }

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-purple-500/5" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Business Metrics & Growth
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Real-time insights into our rapid growth trajectory. Building the future of personal improvement, one metric at a time.
          </p>
        </motion.div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {BUSINESS_METRICS.map((metric, index) => {
            const Icon = metric.icon
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                onClick={() => setSelectedMetricIndex(index)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2 rounded-lg bg-white/10 ${metric.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {metric.trend && (
                    <div className="flex items-center gap-1">
                      {metric.trend === 'up' ? (
                        <ArrowUp className="h-4 w-4 text-green-400" />
                      ) : metric.trend === 'down' ? (
                        <ArrowDown className="h-4 w-4 text-red-400" />
                      ) : (
                        <div className="h-4 w-4 bg-gray-400 rounded-full" />
                      )}
                      <span className={`text-sm font-medium ${
                        metric.trend === 'up' ? 'text-green-400' : 
                        metric.trend === 'down' ? 'text-red-400' : 
                        'text-gray-400'
                      }`}>
                        {metric.change && metric.change > 0 ? '+' : ''}{metric.change}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-white">
                    {formatValue(metric)}
                  </div>
                  <div className="text-sm text-gray-400">{metric.label}</div>
                  {metric.changeLabel && (
                    <div className="text-xs text-gray-500">{metric.changeLabel}</div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Product Performance Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-12"
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            Product Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Product</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Users</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Revenue</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Growth</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {PRODUCT_METRICS.map((product) => (
                  <tr key={product.product} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-white font-medium">{product.product}</td>
                    <td className="py-3 px-4 text-right text-gray-300">{product.users.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-gray-300">${product.revenue.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-green-400 font-medium">+{product.growth}%</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.status === 'live' ? 'bg-green-500/20 text-green-400' :
                        product.status === 'beta' ? 'bg-blue-500/20 text-blue-400' :
                        product.status === 'alpha' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Roadmap and Tech Stack */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Roadmap */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-400" />
              2025 Roadmap
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {ROADMAP_MILESTONES.map((milestone, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="mt-1">
                    {milestone.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-white font-medium">{milestone.title}</h4>
                        <p className="text-sm text-gray-400 mt-1">{milestone.description}</p>
                      </div>
                      <span className="text-xs text-gray-500 ml-2">{milestone.date}</span>
                    </div>
                    <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                      milestone.type === 'product' ? 'bg-blue-500/20 text-blue-400' :
                      milestone.type === 'business' ? 'bg-green-500/20 text-green-400' :
                      milestone.type === 'technical' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {milestone.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Tech Stack */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Globe className="h-5 w-5 text-cyan-400" />
              Technology Stack
            </h3>
            <div className="space-y-4">
              {TECH_STACK.map((stack) => (
                <div key={stack.category}>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">{stack.category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {stack.techs.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-white/10 rounded-lg text-sm text-gray-300 hover:bg-white/20 transition-colors cursor-pointer"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Growth Stats */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Engineering Velocity</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-white">127</div>
                  <div className="text-xs text-gray-400">Commits/Week</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">8.5</div>
                  <div className="text-xs text-gray-400">Features/Week</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">2.3</div>
                  <div className="text-xs text-gray-400">Deploy/Day</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">99.9%</div>
                  <div className="text-xs text-gray-400">Uptime</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Growth Trajectory */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full border border-white/10">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            <span className="text-white font-medium">
              On track to reach $1M ARR by Q1 2026
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}