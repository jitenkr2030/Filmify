'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import MovieWebsiteTemplate from '@/components/movie-templates/MovieWebsiteTemplate'
import SecureVideoPlayer from '@/components/video-player/SecureVideoPlayer'
import PurchaseModal from '@/components/purchase/PurchaseModal'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Movie {
  id: string
  title: string
  slug: string
  synopsis: string
  story?: string
  genre: string
  language: string
  duration: number
  certification?: string
  releaseDate?: string
  directorName?: string
  producerName?: string
  cast?: string[]
  crew?: string[]
  posterUrl?: string
  trailerUrl?: string
  fullMovieUrl?: string
  streamingEnabled: boolean
  streamingType: string
  price?: number
  ottPlatforms?: string[]
  ticketingUrls?: Record<string, string>
  producer: {
    id: string
    name: string
    studio?: string
    verified: boolean
    bio?: string
  }
  reviews: Array<{
    id: string
    rating: number
    title?: string
    content: string
    source?: string
    verified: boolean
    user?: {
      id: string
      name: string
    }
  }>
  mediaAssets: Array<{
    id: string
    type: string
    url: string
    title?: string
    description?: string
  }>
  _count: {
    reviews: number
    userPurchases: number
  }
}

export default function MoviePage() {
  const params = useParams()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [accessChecked, setAccessChecked] = useState(false)

  useEffect(() => {
    if (params.slug) {
      fetchMovie()
    }
  }, [params.slug])

  useEffect(() => {
    if (movie && movie.streamingEnabled && movie.streamingType !== 'FREE') {
      checkAccess()
    } else if (movie && movie.streamingEnabled && movie.streamingType === 'FREE') {
      setIsAuthorized(true)
      setAccessChecked(true)
    }
  }, [movie])

  const fetchMovie = async () => {
    try {
      const response = await fetch(`/api/movies/${params.slug}`)
      if (!response.ok) {
        throw new Error('Movie not found')
      }
      const data = await response.json()
      setMovie(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load movie')
    } finally {
      setLoading(false)
    }
  }

  const checkAccess = async () => {
    if (!movie) return

    try {
      const response = await fetch(`/api/access?movieId=${movie.id}&userId=demo-user-id`)
      if (response.ok) {
        const accessData = await response.json()
        setIsAuthorized(accessData.hasAccess)
      }
    } catch (error) {
      console.error('Error checking access:', error)
    } finally {
      setAccessChecked(true)
    }
  }

  const handleWatchTrailer = () => {
    if (movie?.trailerUrl) {
      window.open(movie.trailerUrl, '_blank')
    }
  }

  const handleWatchMovie = () => {
    if (isAuthorized) {
      // Scroll to video player or open player modal
      document.getElementById('video-player')?.scrollIntoView({ behavior: 'smooth' })
    } else {
      setShowPurchaseModal(true)
    }
  }

  const handleBookTickets = () => {
    if (movie?.ticketingUrls && Object.keys(movie.ticketingUrls).length > 0) {
      // For now, open first available ticketing URL
      const firstUrl = Object.values(movie.ticketingUrls)[0]
      if (firstUrl) {
        window.open(firstUrl, '_blank')
      }
    }
  }

  const handlePurchaseComplete = (purchaseData: any) => {
    setIsAuthorized(true)
    setShowPurchaseModal(false)
    // Scroll to video player
    setTimeout(() => {
      document.getElementById('video-player')?.scrollIntoView({ behavior: 'smooth' })
    }, 500)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading movie...</p>
        </div>
      </div>
    )
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="bg-gray-900 border-gray-800 max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Movie Not Found</h1>
            <p className="text-gray-400 mb-6">
              {error || 'The movie you\'re looking for doesn\'t exist or has been removed.'}
            </p>
            <Button 
              onClick={() => window.history.back()}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <MovieWebsiteTemplate
        movie={movie}
        onWatchTrailer={handleWatchTrailer}
        onWatchMovie={handleWatchMovie}
        onBookTickets={handleBookTickets}
      />

      {/* Video Player Section */}
      {movie.streamingEnabled && accessChecked && (
        <section className="py-20 px-4 bg-gray-900">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-8 text-center">
                {isAuthorized ? 'Watch Movie' : 'Unlock Full Movie'}
              </h2>
              
              <div id="video-player">
                <SecureVideoPlayer
                  movieId={movie.id}
                  videoUrl={movie.fullMovieUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
                  posterUrl={movie.posterUrl}
                  title={movie.title}
                  isAuthorized={isAuthorized}
                  streamingType={movie.streamingType as any}
                  subtitles={[
                    { language: 'en', url: '/subtitles/en.vtt', label: 'English' },
                    { language: 'es', url: '/subtitles/es.vtt', label: 'Spanish' },
                  ]}
                  onPurchaseRequired={() => setShowPurchaseModal(true)}
                />
              </div>

              {!isAuthorized && (
                <div className="text-center mt-8">
                  <p className="text-gray-400 mb-4">
                    Purchase access to watch the full movie in HD quality
                  </p>
                  <Button 
                    onClick={() => setShowPurchaseModal(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    size="lg"
                  >
                    Get Instant Access
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Purchase Modal */}
      <PurchaseModal
        movie={{
          id: movie.id,
          title: movie.title,
          posterUrl: movie.posterUrl,
          streamingType: movie.streamingType as any,
          price: movie.price,
          duration: movie.duration,
          synopsis: movie.synopsis,
        }}
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onPurchaseComplete={handlePurchaseComplete}
      />
    </>
  )
}