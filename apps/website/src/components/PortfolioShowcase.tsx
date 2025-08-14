'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Monitor, 
  Smartphone, 
  Globe, 
  Zap, 
  Database, 
  Brain,
  ChevronRight,
  ExternalLink,
  Github,
  Star,
  Users,
  TrendingUp,
  Award,
  Code,
  Layers,
  Shield,
  Rocket
} from 'lucide-react'

interface Project {
  id: string
  name: string
  tagline: string
  description: string
  status: 'live' | 'beta' | 'development' | 'planned'
  category: string
  technologies: string[]
  metrics?: {
    users?: string
    growth?: string
    rating?: string
    uptime?: string
  }
  features: string[]
  image?: string
  demoUrl?: string
  githubUrl?: string
  color: string
  icon: any
}

const PORTFOLIO_PROJECTS: Project[] = [
  {
    id: 'feelsharper',
    name: 'FeelSharper',
    tagline: 'AI-Powered Fitness & Wellness Platform',
    description: 'Revolutionary fitness tracking with natural language processing. Just type your workout like "3x12 bench press at 135lbs" and watch the AI parse, track, and analyze your progress.',
    status: 'live',
    category: 'Health & Fitness',
    technologies: ['Next.js 15', 'TypeScript', 'Supabase', 'Claude AI', 'PWA', 'Tailwind CSS'],
    metrics: {
      users: '1,000+',
      growth: '+25% MoM',
      rating: '4.8/5',
      uptime: '99.9%'
    },
    features: [
      'Natural language workout parsing',
      'AI coaching recommendations',
      'Progressive Web App',
      'Real-time sync across devices',
      'Advanced analytics dashboard'
    ],
    demoUrl: 'https://feelsharper.vercel.app',
    color: 'from-red-500 to-pink-500',
    icon: Monitor
  },
  {
    id: 'studysharper',
    name: 'StudySharper',
    tagline: 'Intelligent Study Assistant with RAG',
    description: 'Advanced learning platform using Retrieval-Augmented Generation. Upload any document, get AI-powered Q&A, generate study plans, and master any subject with spaced repetition.',
    status: 'beta',
    category: 'Education',
    technologies: ['Next.js 14', 'OpenAI', 'PostgreSQL', 'pgvector', 'PDF Processing', 'React'],
    metrics: {
      users: '500+',
      growth: '+40% MoM',
      rating: '4.9/5',
      uptime: '99.7%'
    },
    features: [
      'PDF upload and processing',
      'RAG-powered Q&A system',
      'Spaced repetition algorithm',
      'AI study plan generation',
      'Progress analytics'
    ],
    demoUrl: 'https://studysharper.vercel.app',
    color: 'from-cyan-500 to-blue-500',
    icon: Brain
  },
  {
    id: 'sharplens',
    name: 'SharpLens',
    tagline: 'Computer Vision Analytics Platform',
    description: 'Enterprise-grade computer vision platform for real-time video analysis. Detect objects, track movements, analyze patterns, and generate insights from visual data.',
    status: 'development',
    category: 'AI & Analytics',
    technologies: ['Python', 'TensorFlow', 'OpenCV', 'FastAPI', 'WebRTC', 'Docker'],
    metrics: {
      users: 'Private Beta',
      growth: 'Coming Q2 2025',
      rating: 'TBD',
      uptime: 'Testing'
    },
    features: [
      'Real-time object detection',
      'Movement pattern analysis',
      'Multi-camera support',
      'Custom model training',
      'API-first architecture'
    ],
    color: 'from-purple-500 to-violet-500',
    icon: Layers
  },
  {
    id: 'sharpflow',
    name: 'SharpFlow',
    tagline: 'Workflow Automation & Integration Hub',
    description: 'No-code automation platform connecting your favorite tools. Build complex workflows with AI assistance, schedule tasks, and streamline your business processes.',
    status: 'planned',
    category: 'Productivity',
    technologies: ['Node.js', 'React Flow', 'Redis', 'Temporal', 'GraphQL', 'Kubernetes'],
    metrics: {
      users: 'Coming Q3 2025',
      growth: 'Planned',
      rating: 'TBD',
      uptime: 'TBD'
    },
    features: [
      'Visual workflow builder',
      '500+ app integrations',
      'AI workflow suggestions',
      'Real-time monitoring',
      'Enterprise security'
    ],
    color: 'from-green-500 to-emerald-500',
    icon: Zap
  }
]

const StatusBadge = ({ status }: { status: Project['status'] }) => {
  const config = {
    live: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Live' },
    beta: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Beta' },
    development: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'In Development' },
    planned: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Planned' }
  }
  const { bg, text, label } = config[status]
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      {label}
    </span>
  )
}

export default function PortfolioShowcase() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Portfolio Showcase
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Cutting-edge AI products built with modern technologies. From fitness tracking to computer vision, 
            we're pushing the boundaries of what's possible.
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {[
            { icon: Rocket, label: 'Products Launched', value: '2' },
            { icon: Users, label: 'Active Users', value: '1,500+' },
            { icon: Code, label: 'Lines of Code', value: '100K+' },
            { icon: Award, label: 'User Rating', value: '4.85/5' }
          ].map((stat, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <stat.icon className="h-5 w-5 text-blue-400 mb-2" />
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Project Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {PORTFOLIO_PROJECTS.map((project, index) => {
            const Icon = project.icon
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onHoverStart={() => setHoveredId(project.id)}
                onHoverEnd={() => setHoveredId(null)}
                onClick={() => setSelectedProject(project)}
                className="relative group cursor-pointer"
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${project.color} bg-opacity-20`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{project.name}</h3>
                        <p className="text-sm text-gray-400">{project.tagline}</p>
                      </div>
                    </div>
                    <StatusBadge status={project.status} />
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 mb-4 line-clamp-2">{project.description}</p>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.slice(0, 4).map((tech) => (
                      <span key={tech} className="px-2 py-1 bg-white/10 rounded-md text-xs text-gray-300">
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span className="px-2 py-1 bg-white/10 rounded-md text-xs text-gray-300">
                        +{project.technologies.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Metrics */}
                  {project.metrics && project.status !== 'planned' && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {Object.entries(project.metrics).slice(0, 2).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2 text-sm">
                          {key === 'users' && <Users className="h-3 w-3 text-blue-400" />}
                          {key === 'growth' && <TrendingUp className="h-3 w-3 text-green-400" />}
                          {key === 'rating' && <Star className="h-3 w-3 text-yellow-400" />}
                          {key === 'uptime' && <Shield className="h-3 w-3 text-purple-400" />}
                          <span className="text-gray-300">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <button className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1 transition-colors">
                      View Details
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <div className="flex gap-2">
                      {project.demoUrl && (
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4 text-gray-300" />
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                        >
                          <Github className="h-4 w-4 text-gray-300" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Hover Effect */}
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, transparent, ${project.color.includes('red') ? 'rgba(239, 68, 68, 0.1)' : project.color.includes('cyan') ? 'rgba(6, 182, 212, 0.1)' : project.color.includes('purple') ? 'rgba(168, 85, 247, 0.1)' : 'rgba(34, 197, 94, 0.1)'})`,
                    }}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-gray-400 mb-4">
            Want to collaborate or learn more about our projects?
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="https://github.com/sharpened"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Github className="h-5 w-5" />
              View on GitHub
            </a>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Get in Touch
            </button>
          </div>
        </motion.div>
      </div>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{selectedProject.name}</h3>
                  <p className="text-gray-400">{selectedProject.tagline}</p>
                </div>
                <StatusBadge status={selectedProject.status} />
              </div>

              <p className="text-gray-300 mb-6">{selectedProject.description}</p>

              <div className="space-y-6">
                {/* Features */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Key Features</h4>
                  <ul className="space-y-2">
                    {selectedProject.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-gray-300">
                        <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Technologies */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Technologies</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.technologies.map((tech) => (
                      <span key={tech} className="px-3 py-1 bg-white/10 rounded-lg text-sm text-gray-300">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Metrics */}
                {selectedProject.metrics && selectedProject.status !== 'planned' && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Metrics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(selectedProject.metrics).map(([key, value]) => (
                        <div key={key} className="bg-white/5 rounded-lg p-3">
                          <div className="text-sm text-gray-400 capitalize mb-1">
                            {key.replace('_', ' ')}
                          </div>
                          <div className="text-xl font-bold text-white">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-6">
                {selectedProject.demoUrl && (
                  <a
                    href={selectedProject.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-medium text-center hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                  >
                    Visit Live Demo
                  </a>
                )}
                <button
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-2 bg-white/10 rounded-lg font-medium hover:bg-white/20 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}