'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Play, Calendar, Clock, Star, Users, Film, Globe, Ticket, Music } from 'lucide-react'
import Image from 'next/image'

interface MovieWebsiteTemplateProps {
  movie: any
  onWatchTrailer?: () => void
  onWatchMovie?: () => void
  onBookTickets?: () => void
}

export default function MovieWebsiteTemplate({
  movie,
  onWatchTrailer,
  onWatchMovie,
  onBookTickets,
}: MovieWebsiteTemplateProps) {
  const averageRating = movie.reviews.length > 0
    ? movie.reviews.reduce((acc: number, review: any) => acc + review.rating, 0) / movie.reviews.length
    : 0

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {movie.posterUrl && (
          <div className="absolute inset-0 z-0">
            <Image
              src={movie.posterUrl}
              alt={movie.title}
              fill
              className="object-cover opacity-40"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </div>
        )}
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-red-600 text-white">
            {movie.certification || 'U/A'}
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            {movie.title}
          </h1>
          
          <div className="flex flex-wrap justify-center gap-4 mb-6 text-lg">
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'Coming Soon'}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {movie.duration} min
            </span>
            <span className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {movie.language}
            </span>
            <span className="flex items-center gap-2">
              <Film className="h-5 w-5" />
              {movie.genre}
            </span>
          </div>

          {averageRating > 0 && (
            <div className="flex items-center justify-center gap-2 mb-6">
              <Star className="h-6 w-6 text-yellow-400 fill-current" />
              <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
              <span className="text-gray-400">({movie._count.reviews} reviews)</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {movie.trailerUrl && (
              <Button 
                size="lg" 
                className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-6"
                onClick={onWatchTrailer}
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Trailer
              </Button>
            )}
            
            {movie.streamingEnabled && (
              <Button 
                size="lg" 
                className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-6"
                onClick={onWatchMovie}
              >
                <Play className="mr-2 h-5 w-5" />
                {movie.streamingType === 'FREE' ? 'Watch Now' : `Watch for $${movie.price}`}
              </Button>
            )}
            
            {movie.ticketingUrls && Object.keys(movie.ticketingUrls).length > 0 && (
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-black text-lg px-8 py-6"
                onClick={onBookTickets}
              >
                <Ticket className="mr-2 h-5 w-5" />
                Book Tickets
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Synopsis Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-8 text-center">Synopsis</h2>
            <p className="text-xl text-gray-300 leading-relaxed text-center">
              {movie.synopsis}
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      {movie.story && (
        <section className="py-20 px-4 bg-gray-900">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-8 text-center">The Story</h2>
              <p className="text-xl text-gray-300 leading-relaxed text-center">
                {movie.story}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Cast & Crew Section */}
      {(movie.cast && movie.cast.length > 0) || (movie.crew && movie.crew.length > 0) ? (
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center">Cast & Crew</h2>
            
            <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {movie.directorName && (
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold mb-2">Director</h3>
                    <p className="text-xl text-gray-300">{movie.directorName}</p>
                  </CardContent>
                </Card>
              )}
              
              {movie.producerName && (
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold mb-2">Producer</h3>
                    <p className="text-xl text-gray-300">{movie.producerName}</p>
                  </CardContent>
                </Card>
              )}
              
              {movie.cast && movie.cast.length > 0 && (
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold mb-4">Cast</h3>
                    <div className="space-y-2">
                      {movie.cast.map((actor: string, index: number) => (
                        <p key={index} className="text-lg text-gray-300">{actor}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {movie.crew && movie.crew.length > 0 && (
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold mb-4">Crew</h3>
                    <div className="space-y-2">
                      {movie.crew.map((member: string, index: number) => (
                        <p key={index} className="text-lg text-gray-300">{member}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {/* Media Gallery */}
      {movie.mediaAssets && movie.mediaAssets.length > 0 && (
        <section className="py-20 px-4 bg-gray-900">
          <div className="container mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center">Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {movie.mediaAssets.map((asset: any, index: number) => (
                <Card key={index} className="bg-gray-800 border-gray-700 overflow-hidden">
                  <CardContent className="p-0">
                    {asset.type === 'GALLERY_IMAGE' ? (
                      <Image
                        src={asset.url}
                        alt={asset.title || `Gallery image ${index + 1}`}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
                        <Music className="h-12 w-12 text-gray-500" />
                      </div>
                    )}
                    {asset.title && (
                      <div className="p-4">
                        <h4 className="font-semibold">{asset.title}</h4>
                        {asset.description && (
                          <p className="text-sm text-gray-400 mt-1">{asset.description}</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews Section */}
      {movie.reviews && movie.reviews.length > 0 && (
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center">Reviews & Ratings</h2>
            
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Star className="h-8 w-8 text-yellow-400 fill-current" />
                  <span className="text-4xl font-bold">{averageRating.toFixed(1)}</span>
                  <span className="text-xl text-gray-400">/10</span>
                </div>
                <p className="text-gray-400">Based on {movie._count.reviews} reviews</p>
              </div>

              <div className="space-y-6">
                {movie.reviews.slice(0, 3).map((review: any, index: number) => (
                  <Card key={index} className="bg-gray-900 border-gray-800">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {[...Array(10)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-400">{review.rating}/10</span>
                          </div>
                          {review.title && (
                            <h4 className="text-xl font-bold mb-2">{review.title}</h4>
                          )}
                        </div>
                        {review.verified && (
                          <Badge className="bg-green-600 text-white">Verified</Badge>
                        )}
                      </div>
                      <p className="text-gray-300 leading-relaxed">{review.content}</p>
                      {review.source && (
                        <p className="text-sm text-gray-500 mt-4">- {review.source}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Producer Info */}
      {movie.producer && (
        <section className="py-20 px-4 bg-gray-900">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-8">About the Producer</h2>
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold">{movie.producer.name}</h3>
                {movie.producer.studio && (
                  <p className="text-xl text-gray-300">{movie.producer.studio}</p>
                )}
                {movie.producer.bio && (
                  <p className="text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto">
                    {movie.producer.bio}
                  </p>
                )}
                {movie.producer.verified && (
                  <Badge className="bg-blue-600 text-white mt-4">
                    ✓ Verified Producer
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* OTT Platforms */}
      {movie.ottPlatforms && movie.ottPlatforms.length > 0 && (
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-bold mb-8">Watch On</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {movie.ottPlatforms.map((platform: string, index: number) => (
                <Badge key={index} className="bg-purple-600 text-white text-lg px-6 py-3">
                  {platform}
                </Badge>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-black py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Film className="h-6 w-6 text-purple-400" />
            <span className="text-xl font-bold">Powered by Filmify</span>
          </div>
          <p className="text-gray-400">
            Official movie website • © {new Date().getFullYear()} {movie.producer?.name || 'Studio'}
          </p>
          {movie.producer?.verified && (
            <Badge className="bg-green-600 text-white mt-4">
              ✓ Verified Content on Filmify
            </Badge>
          )}
        </div>
      </footer>
    </div>
  )
}