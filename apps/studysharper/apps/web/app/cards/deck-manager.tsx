'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Brain, Clock, TrendingUp, Edit, Trash2, Play, Upload, Download, Share2, Users, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Deck {
  id: string
  name: string
  description?: string
  card_count: number
  due_count: number
  new_count: number
  created_at: string
  updated_at: string
  is_public: boolean
  creator_id: string
  tags?: string[]
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  category?: string
  last_studied?: string
  mastery_score?: number
}

interface DeckManagerProps {
  userId: string
  onDeckSelect?: (deck: Deck) => void
}

export function DeckManager({ userId, onDeckSelect }: DeckManagerProps) {
  const [decks, setDecks] = useState<Deck[]>([
    {
      id: '1',
      name: 'Organic Chemistry',
      description: 'Key concepts and reactions in organic chemistry',
      card_count: 150,
      due_count: 12,
      new_count: 8,
      created_at: '2024-01-15',
      updated_at: '2024-02-01',
      is_public: false,
      creator_id: userId,
      tags: ['chemistry', 'science', 'pre-med'],
      difficulty: 'intermediate',
      category: 'Science',
      last_studied: '2024-02-01',
      mastery_score: 72,
    },
    {
      id: '2',
      name: 'Spanish Vocabulary',
      description: 'Common Spanish words and phrases',
      card_count: 300,
      due_count: 25,
      new_count: 15,
      created_at: '2024-01-10',
      updated_at: '2024-01-30',
      is_public: true,
      creator_id: userId,
      tags: ['spanish', 'language', 'vocabulary'],
      difficulty: 'beginner',
      category: 'Language',
      last_studied: '2024-01-30',
      mastery_score: 85,
    },
    {
      id: '3',
      name: 'Machine Learning Concepts',
      description: 'Fundamental ML algorithms and theory',
      card_count: 200,
      due_count: 30,
      new_count: 20,
      created_at: '2024-01-20',
      updated_at: '2024-02-02',
      is_public: true,
      creator_id: userId,
      tags: ['ml', 'ai', 'computer-science'],
      difficulty: 'advanced',
      category: 'Technology',
      last_studied: '2024-02-02',
      mastery_score: 65,
    },
  ])

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newDeck, setNewDeck] = useState({
    name: '',
    description: '',
    category: '',
    difficulty: 'beginner' as const,
    is_public: false,
  })

  const [selectedTab, setSelectedTab] = useState('my-decks')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredDecks = decks.filter(deck => 
    deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deck.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deck.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleCreateDeck = () => {
    const deck: Deck = {
      id: String(decks.length + 1),
      name: newDeck.name,
      description: newDeck.description,
      card_count: 0,
      due_count: 0,
      new_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_public: newDeck.is_public,
      creator_id: userId,
      difficulty: newDeck.difficulty,
      category: newDeck.category,
      mastery_score: 0,
    }
    setDecks([...decks, deck])
    setIsCreateDialogOpen(false)
    setNewDeck({
      name: '',
      description: '',
      category: '',
      difficulty: 'beginner',
      is_public: false,
    })
  }

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100'
      case 'intermediate': return 'text-yellow-600 bg-yellow-100'
      case 'advanced': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getMasteryColor = (score?: number) => {
    if (!score) return 'bg-gray-200'
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    if (score >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Flashcard Decks</h2>
          <p className="text-muted-foreground">Manage and study your flashcard collections</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Deck
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Deck</DialogTitle>
              <DialogDescription>
                Create a new flashcard deck to organize your study materials
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Deck Name</Label>
                <Input
                  id="name"
                  value={newDeck.name}
                  onChange={(e) => setNewDeck({ ...newDeck, name: e.target.value })}
                  placeholder="e.g., Biology Chapter 5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newDeck.description}
                  onChange={(e) => setNewDeck({ ...newDeck, description: e.target.value })}
                  placeholder="Brief description of the deck contents"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={newDeck.category}
                  onChange={(e) => setNewDeck({ ...newDeck, category: e.target.value })}
                  placeholder="e.g., Science, Language, Math"
                />
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <div className="flex gap-2">
                  {['beginner', 'intermediate', 'advanced'].map((level) => (
                    <Button
                      key={level}
                      variant={newDeck.difficulty === level ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNewDeck({ ...newDeck, difficulty: level as any })}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="public"
                  checked={newDeck.is_public}
                  onChange={(e) => setNewDeck({ ...newDeck, is_public: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="public" className="font-normal">
                  Make this deck public for others to use
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateDeck} disabled={!newDeck.name}>
                Create Deck
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Tabs */}
      <div className="space-y-4">
        <Input
          placeholder="Search decks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="my-decks">My Decks</TabsTrigger>
            <TabsTrigger value="shared">Shared with Me</TabsTrigger>
            <TabsTrigger value="public">Public Library</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="mt-6">
            {/* Deck Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredDecks.map((deck) => (
                <Card key={deck.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{deck.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {deck.description}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        {deck.is_public ? (
                          <Users className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-2xl font-bold">{deck.card_count}</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-orange-600">{deck.due_count}</p>
                        <p className="text-xs text-muted-foreground">Due</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{deck.new_count}</p>
                        <p className="text-xs text-muted-foreground">New</p>
                      </div>
                    </div>

                    {/* Mastery Progress */}
                    {deck.mastery_score !== undefined && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Mastery</span>
                          <span className="font-medium">{deck.mastery_score}%</span>
                        </div>
                        <Progress 
                          value={deck.mastery_score} 
                          className="h-2"
                        />
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {deck.difficulty && (
                        <Badge 
                          variant="secondary" 
                          className={cn('text-xs', getDifficultyColor(deck.difficulty))}
                        >
                          {deck.difficulty}
                        </Badge>
                      )}
                      {deck.category && (
                        <Badge variant="outline" className="text-xs">
                          {deck.category}
                        </Badge>
                      )}
                      {deck.tags?.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Last Studied */}
                    {deck.last_studied && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Last studied: {new Date(deck.last_studied).toLocaleDateString()}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      size="sm"
                      onClick={() => onDeckSelect?.(deck)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Study
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {filteredDecks.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No decks found matching your search' : 'No decks yet. Create your first deck to get started!'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Study Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-2xl font-bold">{decks.length}</p>
              <p className="text-sm text-muted-foreground">Total Decks</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {decks.reduce((sum, deck) => sum + deck.card_count, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Cards</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {decks.reduce((sum, deck) => sum + deck.due_count, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Cards Due</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {Math.round(decks.reduce((sum, deck) => sum + (deck.mastery_score || 0), 0) / decks.length)}%
              </p>
              <p className="text-sm text-muted-foreground">Avg Mastery</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DeckManager