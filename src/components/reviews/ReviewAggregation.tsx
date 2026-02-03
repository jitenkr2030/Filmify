'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Star, 
  ExternalLink, 
  RefreshCw, 
  TrendingUp,
  Users,
  ThumbsUp,
  MessageSquare,
  BarChart3
} from 'lucide-react'

interface Review {
  id: string
  rating: number
  title?: string
  content: string
  source?: string
  verified: boolean
  featured: boolean
  user?: {
    id: string
    name: string
  }
  createdAt: string
}

interface PlatformBreakdown {
  [platform: string]: {
    name: string
    averageRating: number
    count: number
    weight: number
  }
}

interface ReviewAggregationProps {
  movieId: string
  movieTitle: string
  className?: string
}

const PLATFORM_COLORS = {
  imdb: 'bg-yellow-500',
  google: 'bg-blue-500',
  rotten_tomatoes: 'bg-red-500',
  metacritic: 'bg-green-500',
  users: 'bg-purple-500',
}

const PLATFORM_ICONS = {
  imdb: '🎬',
  google: '🔍',
  rotten_tomatoes: '🍅',
  metacritic: '📊',
  users: '👥',
}

export default function ReviewAggregation({ movieId, movieTitle, className = '' }: ReviewAggregationProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [aggregatedRating, setAggregatedRating] = useState<any>(null)
  const [platformBreakdown, setPlatformBreakdown] = useState<PlatformBreakdown>({})
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'analytics'>('overview')

  useEffect(() => {
    fetchReviewData()
  }, [movieId])

  const fetchReviewData = async () => {
    try {
      setLoading(true)
      
      // Fetch reviews and aggregated rating
      const [reviewsResponse, aggregationResponse] = await Promise.all([
        fetch(`/api/reviews?movieId=${movieId}&limit=20`),
        fetch(`/api/reviews?movieId=${movieId}`, { method: 'PATCH' }),
      ])

      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json()
        setReviews(reviewsData.reviews || [])
        setAggregatedRating(reviewsData.aggregatedRating)
      }

      if (aggregationResponse.ok) {
        const aggregationData = await aggregationResponse.json()
        setPlatformBreakdown(aggregationData.platformBreakdown || {})
      }
    } catch (error) {
      console.error('Error fetching review data:', error)
    } finally {
      setLoading(false)
    }
  }

  const syncReviews = async () => {
    try {
      setSyncing(true)
      const response = await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieId,
          platforms: ['imdb', 'google', 'rotten_tomatoes', 'metacritic'],
        }),
      })

      if (response.ok) {
        await fetchReviewData()
      }
    } catch (error) {
      console.error('Error syncing reviews:', error)
    } finally {
      setSyncing(false)
    }
  }

  const renderStars = (rating: number, maxRating: number = 5) => {
    const stars = []
    const normalizedRating = (rating / 10) * maxRating
    
    for (let i = 1; i <= maxRating; i++) {
      if (i <= Math.floor(normalizedRating)) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
      } else if (i - 0.5 <= normalizedRating) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-200 text-yellow-400" />)
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-gray-300" />)
      }
    }
    
    return stars
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-600'
    if (rating >= 6) return 'text-yellow-600'
    if (rating >= 4) return 'text-orange-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-500" />
              Reviews & Ratings
            </CardTitle>
            <CardDescription>
              What critics and audiences are saying about "{movieTitle}"
            </CardDescription>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={syncReviews}
            disabled={syncing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            Sync Reviews
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1">
          {(['overview', 'reviews', 'analytics'] as const).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab)}
              className="capitalize"
            >
              {tab === 'overview' && <BarChart3 className="h-4 w-4 mr-2" />}
              {tab === 'reviews' && <MessageSquare className="h-4 w-4 mr-2" />}
              {tab === 'analytics' && <TrendingUp className="h-4 w-4 mr-2" />}
              {tab}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Aggregated Rating */}
            {aggregatedRating && (
              <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  {renderStars(aggregatedRating.average)}
                </div>
                <div className={`text-4xl font-bold mb-2 ${getRatingColor(aggregatedRating.average)}`}>
                  {aggregatedRating.average.toFixed(1)}
                </div>
                <p className="text-gray-600">
                  Based on {aggregatedRating.count} reviews
                </p>
              </div>
            )}

            {/* Platform Breakdown */}
            {Object.keys(platformBreakdown).length > 0 && (
              <div>
                <h3 className="font-semibold mb-4">Rating Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(platformBreakdown).map(([platform, data]) => (
                    <div key={platform} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className={`w-10 h-10 ${PLATFORM_COLORS[platform as keyof typeof PLATFORM_COLORS]} rounded-lg flex items-center justify-center text-white font-bold`}>
                        {PLATFORM_ICONS[platform as keyof typeof PLATFORM_ICONS]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{data.name}</span>
                          <span className={`font-bold ${getRatingColor(data.averageRating)}`}>
                            {data.averageRating.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>{data.count} reviews</span>
                          <span>Weight: {(data.weight * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rating Distribution */}
            {aggregatedRating?.distribution && (
              <div>
                <h3 className="font-semibold mb-4">Rating Distribution</h3>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = aggregatedRating.distribution[rating] || 0
                    const percentage = aggregatedRating.count > 0 ? (count / aggregatedRating.count) * 100 : 0
                    
                    return (
                      <div key={rating} className="flex items-center space-x-3">
                        <div className="flex items-center w-16">
                          <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{rating}</span>
                        </div>
                        <Progress value={percentage} className="flex-1" />
                        <span className="text-sm text-gray-600 w-12 text-right">
                          {count}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <Card key={review.id} className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {review.user?.name?.charAt(0) || review.source?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">
                              {review.user?.name || review.source || 'Anonymous'}
                            </span>
                            {review.verified && (
                              <Badge className="bg-green-100 text-green-800 text-xs">Verified</Badge>
                            )}
                            {review.featured && (
                              <Badge className="bg-purple-100 text-purple-800 text-xs">Featured</Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {renderStars(review.rating)}
                            <span className="text-sm text-gray-600">{review.rating}/10</span>
                          </div>
                        </div>
                      </div>
                      
                      {review.source && (
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    {review.title && (
                      <h4 className="font-semibold mb-2">{review.title}</h4>
                    )}
                    
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {review.content}
                    </p>
                    
                    <p className="text-xs text-gray-500 mt-3">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No reviews yet. Be the first to review!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{reviews.length}</div>
                  <p className="text-sm text-gray-600">Total Reviews</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">
                    {aggregatedRating?.average?.toFixed(1) || '0.0'}
                  </div>
                  <p className="text-sm text-gray-600">Average Rating</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <ThumbsUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">
                    {reviews.filter(r => r.rating >= 7).length}
                  </div>
                  <p className="text-sm text-gray-600">Positive Reviews</p>
                </CardContent>
              </Card>
            </div>

            {/* Platform Insights */}
            <div>
              <h3 className="font-semibold mb-4">Platform Insights</h3>
              <div className="space-y-3">
                {Object.entries(platformBreakdown).map(([platform, data]) => (
                  <div key={platform} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 ${PLATFORM_COLORS[platform as keyof typeof PLATFORM_COLORS]} rounded flex items-center justify-center text-white text-xs`}>
                          {PLATFORM_ICONS[platform as keyof typeof PLATFORM_ICONS]}
                        </div>
                        <span className="font-medium">{data.name}</span>
                      </div>
                      <span className={`font-bold ${getRatingColor(data.averageRating)}`}>
                        {data.averageRating.toFixed(1)}/10
                      </span>
                    </div>
                    <Progress value={(data.averageRating / 10) * 100} className="mb-2" />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{data.count} reviews</span>
                      <span>{(data.weight * 100).toFixed(0)}% weight</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}