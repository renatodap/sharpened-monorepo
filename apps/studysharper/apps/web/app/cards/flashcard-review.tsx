'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Brain, Check, X, RotateCcw, Clock, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Flashcard {
  id: string
  front: string
  back: string
  deck_id: string
  created_at: string
  last_reviewed?: string
  next_review?: string
  ease_factor: number
  interval: number
  repetitions: number
  quality?: number
}

interface FlashcardReviewProps {
  cards: Flashcard[]
  deckName: string
  onComplete?: (reviewedCards: Map<string, number>) => void
}

const QUALITY_RATINGS = [
  { value: 0, label: 'Complete Blackout', color: 'text-red-600' },
  { value: 1, label: 'Incorrect', color: 'text-red-500' },
  { value: 2, label: 'Incorrect, Easy After', color: 'text-orange-500' },
  { value: 3, label: 'Correct, Difficult', color: 'text-yellow-500' },
  { value: 4, label: 'Correct', color: 'text-green-500' },
  { value: 5, label: 'Perfect', color: 'text-green-600' },
]

export function FlashcardReview({ cards, deckName, onComplete }: FlashcardReviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [reviewedCards, setReviewedCards] = useState<Map<string, number>>(new Map())
  const [startTime, setStartTime] = useState<Date>(new Date())
  const [cardStartTime, setCardStartTime] = useState<Date>(new Date())
  const [showStats, setShowStats] = useState(false)

  const currentCard = cards[currentIndex]
  const progress = ((currentIndex + 1) / cards.length) * 100
  const isLastCard = currentIndex === cards.length - 1

  // Calculate SM-2 algorithm parameters
  const calculateNextReview = (quality: number, card: Flashcard) => {
    let { ease_factor, interval, repetitions } = card

    if (quality >= 3) {
      // Correct response
      if (repetitions === 0) {
        interval = 1
      } else if (repetitions === 1) {
        interval = 6
      } else {
        interval = Math.round(interval * ease_factor)
      }
      repetitions += 1
    } else {
      // Incorrect response
      repetitions = 0
      interval = 1
    }

    // Update ease factor
    ease_factor = Math.max(1.3, ease_factor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

    // Calculate next review date
    const nextReview = new Date()
    nextReview.setDate(nextReview.getDate() + interval)

    return {
      ease_factor,
      interval,
      repetitions,
      next_review: nextReview.toISOString(),
      quality,
    }
  }

  const handleQualityRating = (quality: number) => {
    if (!currentCard) return

    // Record the review
    const newReviewedCards = new Map(reviewedCards)
    newReviewedCards.set(currentCard.id, quality)
    setReviewedCards(newReviewedCards)

    // Calculate time spent
    const timeSpent = new Date().getTime() - cardStartTime.getTime()
    console.log(`Card reviewed in ${timeSpent / 1000}s with quality ${quality}`)

    if (isLastCard) {
      // Complete the review session
      setShowStats(true)
      if (onComplete) {
        onComplete(newReviewedCards)
      }
    } else {
      // Move to next card
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
      setCardStartTime(new Date())
    }
  }

  const handlePreviousCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  const handleNextCard = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setReviewedCards(new Map())
    setStartTime(new Date())
    setCardStartTime(new Date())
    setShowStats(false)
  }

  const getStats = () => {
    const totalTime = new Date().getTime() - startTime.getTime()
    const avgQuality = Array.from(reviewedCards.values()).reduce((a, b) => a + b, 0) / reviewedCards.size
    const correctCount = Array.from(reviewedCards.values()).filter(q => q >= 3).length
    const accuracy = (correctCount / reviewedCards.size) * 100

    return {
      totalTime: Math.round(totalTime / 1000),
      avgQuality: avgQuality.toFixed(1),
      correctCount,
      totalCount: reviewedCards.size,
      accuracy: accuracy.toFixed(0),
    }
  }

  if (showStats) {
    const stats = getStats()
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Review Complete!
          </CardTitle>
          <CardDescription>Great job completing your review session</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Cards Reviewed</p>
              <p className="text-2xl font-bold">{stats.totalCount}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Accuracy</p>
              <p className="text-2xl font-bold">{stats.accuracy}%</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Average Quality</p>
              <p className="text-2xl font-bold">{stats.avgQuality}/5</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Time Spent</p>
              <p className="text-2xl font-bold">{stats.totalTime}s</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Performance Breakdown</p>
            <div className="space-y-1">
              {QUALITY_RATINGS.map(rating => {
                const count = Array.from(reviewedCards.values()).filter(q => q === rating.value).length
                const percentage = (count / reviewedCards.size) * 100
                return (
                  <div key={rating.value} className="flex items-center justify-between">
                    <span className={cn('text-sm', rating.color)}>{rating.label}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={percentage} className="w-20 h-2" />
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleRestart}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Review Again
          </Button>
          <Button>
            <Check className="h-4 w-4 mr-2" />
            Continue Studying
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (!currentCard) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="py-12 text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No cards to review</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{deckName}</span>
          <span>{currentIndex + 1} / {cards.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Flashcard */}
      <Card 
        className="min-h-[400px] cursor-pointer transition-all hover:shadow-lg"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <CardContent className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4 w-full">
            {!isFlipped ? (
              <>
                <Badge variant="outline" className="mb-4">Front</Badge>
                <p className="text-2xl font-medium">{currentCard.front}</p>
                <p className="text-sm text-muted-foreground mt-8">
                  Click to reveal answer
                </p>
              </>
            ) : (
              <>
                <Badge variant="outline" className="mb-4">Back</Badge>
                <p className="text-2xl font-medium">{currentCard.back}</p>
                
                {/* Quality Rating Buttons */}
                <div className="mt-8 space-y-4">
                  <p className="text-sm text-muted-foreground">How well did you know this?</p>
                  <div className="grid grid-cols-3 gap-2">
                    {QUALITY_RATINGS.map((rating) => (
                      <Button
                        key={rating.value}
                        variant="outline"
                        size="sm"
                        className={cn('text-xs', rating.color)}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleQualityRating(rating.value)
                        }}
                      >
                        {rating.value}: {rating.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousCard}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Space to flip</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNextCard}
          disabled={currentIndex >= cards.length - 1}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}

export default FlashcardReview