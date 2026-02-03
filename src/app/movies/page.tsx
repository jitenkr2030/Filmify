'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Film, 
  Play, 
  Eye, 
  Star, 
  Clock, 
  Globe, 
  Search,
  Filter,
  Grid,
  List,
  Calendar
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Movie {
  id: string
  title: string
  slug: string
  synopsis: string
  genre: string
  language: string
  duration: number
  certification?: string
  releaseDate?: string
  posterUrl?: string
  trailerUrl?: string
  streamingEnabled: boolean
  streamingType: string
  price?: number
  views: number
  featured: boolean
  status: string
  createdAt: string
  producer: {
    id: string
    name: string
    studio?: string
    verified: boolean
  }
  _count: {
    reviews: number
    userPurchases: number
  }
}

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [selectedLanguage, setSelectedLanguage] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Thriller', 'Documentary', 'Animation']
  const languages = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Japanese', 'Korean', 'Chinese']

  useEffect(() => {
    fetchMovies()
  }, [selectedGenre, selectedLanguage, sortBy])

  const fetchMovies = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        limit: '20',
        ...(selectedGenre !== 'all' && { genre: selectedGenre }),
        ...(selectedLanguage !== 'all' && { language: selectedLanguage }),
        ...(sortBy === 'featured' && { featured: 'true' }),
        ...(sortBy === 'published' && { status: 'PUBLISHED' }),
      })

      const response = await fetch(`/api/movies?${params}`)
      if (response.ok) {
        const data = await response.json()
        let sortedMovies = data.movies || []

        // Client-side sorting for more complex cases
        if (sortBy === 'popular') {
          sortedMovies.sort((a: Movie, b: Movie) => b.views - a.views)
        } else if (sortBy === 'rating') {
          sortedMovies.sort((a: Movie, b: Movie) => b._count.reviews - a._count.reviews)
        }

        setMovies(sortedMovies)
      }
    } catch (error) {
      console.error('Error fetching movies:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movie.synopsis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movie.producer.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const MovieCard = ({ movie }: { movie: Movie }) => (
    <Card className="bg-white border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative aspect-video">
        {movie.posterUrl ? (
          <Image
            src={movie.posterUrl}
            alt={movie.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <Film className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {/* Overlay badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {movie.featured && (
            <Badge className="bg-purple-600 text-white">Featured</Badge>
          )}
          {movie.streamingEnabled && (
            <Badge className="bg-green-600 text-white">Streaming</Badge>
          )}
          {movie.producer.verified && (
            <Badge className="bg-blue-600 text-white">Verified</Badge>
          )}
        </div>

        {/* Play button overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Link href={`/movie/${movie.slug}`}>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <Play className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </Link>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="mb-2">
          <h3 className="font-bold text-lg mb-1 line-clamp-1">{movie.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{movie.synopsis}</p>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span>{movie.genre}</span>
          <span>{movie.duration} min</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <span className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              {movie.views}
            </span>
            <span className="flex items-center">
              <Star className="h-4 w-4 mr-1" />
              {movie._count.reviews}
            </span>
          </div>
          
          {movie.streamingEnabled && (
            <Badge variant={movie.streamingType === 'FREE' ? 'default' : 'secondary'}>
              {movie.streamingType === 'FREE' ? 'Free' : `$${movie.price}`}
            </Badge>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            {movie.producer.studio || movie.producer.name}
          </p>
        </div>
      </CardContent>
    </Card>
  )

  const MovieListItem = ({ movie }: { movie: Movie }) => (
    <Card className="bg-white border-gray-200 hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-4">
        <div className="flex space-x-4">
          <div className="relative w-24 h-16 flex-shrink-0">
            {movie.posterUrl ? (
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                fill
                className="object-cover rounded"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                <Film className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold text-lg mb-1">{movie.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{movie.synopsis}</p>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                {movie.featured && <Badge className="bg-purple-600 text-white">Featured</Badge>}
                {movie.streamingEnabled && (
                  <Badge className="bg-green-600 text-white">Streaming</Badge>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{movie.genre}</span>
                <span>{movie.language}</span>
                <span>{movie.duration} min</span>
                <span className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {movie.views}
                </span>
                <span className="flex items-center">
                  <Star className="h-4 w-4 mr-1" />
                  {movie._count.reviews}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {movie.streamingEnabled && (
                  <Badge variant={movie.streamingType === 'FREE' ? 'default' : 'secondary'}>
                    {movie.streamingType === 'FREE' ? 'Free' : `$${movie.price}`}
                  </Badge>
                )}
                <Link href={`/movie/${movie.slug}`}>
                  <Button size="sm" variant="outline">
                    View
                  </Button>
                </Link>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              {movie.producer.studio || movie.producer.name}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg">Loading movies...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Discover Movies</h1>
              <p className="text-gray-600 mt-1">Explore the latest films from independent creators</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="bg-white border-gray-200 mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search movies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger>
                  <SelectValue placeholder="Genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  {genres.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {languages.map((language) => (
                    <SelectItem key={language} value={language}>
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setSelectedGenre('all')
                  setSelectedLanguage('all')
                  setSortBy('newest')
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredMovies.length} of {movies.length} movies
          </p>
        </div>

        {/* Movies Grid/List */}
        {filteredMovies.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
            : 'space-y-4'
          }>
            {filteredMovies.map((movie) => (
              viewMode === 'grid' ? (
                <MovieCard key={movie.id} movie={movie} />
              ) : (
                <MovieListItem key={movie.id} movie={movie} />
              )
            ))}
          </div>
        ) : (
          <Card className="bg-white border-gray-200">
            <CardContent className="p-12 text-center">
              <Film className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No movies found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or search terms
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm('')
                  setSelectedGenre('all')
                  setSelectedLanguage('all')
                  setSortBy('newest')
                }}
                variant="outline"
              >
                Clear all filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}