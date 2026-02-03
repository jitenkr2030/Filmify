'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Film, 
  Plus, 
  Eye, 
  Star, 
  DollarSign, 
  Users, 
  TrendingUp,
  Play,
  Edit,
  Trash2,
  Settings,
  BarChart3,
  Bell
} from 'lucide-react'

interface Movie {
  id: string
  title: string
  slug: string
  synopsis: string
  genre: string
  language: string
  duration: number
  status: string
  featured: boolean
  streamingEnabled: boolean
  streamingType: string
  price?: number
  views: number
  purchases: number
  createdAt: string
  _count: {
    reviews: number
    userPurchases: number
  }
}

interface DashboardStats {
  totalMovies: number
  totalViews: number
  totalPurchases: number
  totalRevenue: number
  recentViews: number
  activeMovies: number
}

export default function ProducerDashboard() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch movies
      const moviesResponse = await fetch('/api/movies?limit=10')
      if (moviesResponse.ok) {
        const moviesData = await moviesResponse.json()
        setMovies(moviesData.movies || [])
      }

      // Calculate stats (in production, this would come from a dedicated API)
      const calculatedStats: DashboardStats = {
        totalMovies: movies.length,
        totalViews: movies.reduce((acc, movie) => acc + movie.views, 0),
        totalPurchases: movies.reduce((acc, movie) => acc + movie.userPurchases, 0),
        totalRevenue: movies.reduce((acc, movie) => acc + (movie.purchases * (movie.price || 0)), 0),
        recentViews: movies.reduce((acc, movie) => acc + movie.views, 0), // Simplified
        activeMovies: movies.filter(movie => movie.status === 'PUBLISHED').length,
      }
      setStats(calculatedStats)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMovie = async (formData: FormData) => {
    try {
      const movieData = {
        title: formData.get('title'),
        synopsis: formData.get('synopsis'),
        genre: formData.get('genre'),
        language: formData.get('language'),
        duration: parseInt(formData.get('duration') as string),
        certification: formData.get('certification'),
        directorName: formData.get('director'),
        producerName: formData.get('producer'),
        cast: formData.get('cast') ? formData.get('cast')?.toString().split(',').map(s => s.trim()) : [],
        crew: formData.get('crew') ? formData.get('crew')?.toString().split(',').map(s => s.trim()) : [],
        posterUrl: formData.get('posterUrl'),
        trailerUrl: formData.get('trailerUrl'),
        streamingEnabled: formData.get('streamingEnabled') === 'on',
        streamingType: formData.get('streamingType') || 'FREE',
        price: formData.get('price') ? parseFloat(formData.get('price') as string) : undefined,
        producerId: 'demo-producer-id', // In production, this would come from auth
      }

      const response = await fetch('/api/movies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(movieData),
      })

      if (response.ok) {
        setShowCreateForm(false)
        fetchDashboardData()
      }
    } catch (error) {
      console.error('Error creating movie:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Film className="h-8 w-8 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">Filmify Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                P
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Movies</CardTitle>
                <Film className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalMovies}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeMovies} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.recentViews} this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Purchases</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPurchases}</div>
                <p className="text-xs text-muted-foreground">
                  ${stats.totalRevenue.toFixed(2)} revenue
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reviews</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {movies.reduce((acc, movie) => acc + movie._count.reviews, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all movies
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="movies" className="space-y-6">
          <TabsList>
            <TabsTrigger value="movies">My Movies</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="movies" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Movies</h2>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Movie
              </Button>
            </div>

            {/* Create Movie Form */}
            {showCreateForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Movie</CardTitle>
                  <CardDescription>
                    Add a new movie to your Filmify portfolio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form action={handleCreateMovie} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Title *</Label>
                        <Input id="title" name="title" required />
                      </div>
                      <div>
                        <Label htmlFor="genre">Genre *</Label>
                        <Select name="genre" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select genre" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Action">Action</SelectItem>
                            <SelectItem value="Comedy">Comedy</SelectItem>
                            <SelectItem value="Drama">Drama</SelectItem>
                            <SelectItem value="Horror">Horror</SelectItem>
                            <SelectItem value="Romance">Romance</SelectItem>
                            <SelectItem value="Thriller">Thriller</SelectItem>
                            <SelectItem value="Documentary">Documentary</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="language">Language *</Label>
                        <Input id="language" name="language" placeholder="English, Hindi, etc." required />
                      </div>
                      <div>
                        <Label htmlFor="duration">Duration (minutes) *</Label>
                        <Input id="duration" name="duration" type="number" required />
                      </div>
                      <div>
                        <Label htmlFor="certification">Certification</Label>
                        <Input id="certification" name="certification" placeholder="U/A, R, etc." />
                      </div>
                      <div>
                        <Label htmlFor="director">Director</Label>
                        <Input id="director" name="director" placeholder="Director name" />
                      </div>
                      <div>
                        <Label htmlFor="producer">Producer</Label>
                        <Input id="producer" name="producer" placeholder="Producer name" />
                      </div>
                      <div>
                        <Label htmlFor="posterUrl">Poster URL</Label>
                        <Input id="posterUrl" name="posterUrl" type="url" placeholder="https://..." />
                      </div>
                      <div>
                        <Label htmlFor="trailerUrl">Trailer URL</Label>
                        <Input id="trailerUrl" name="trailerUrl" type="url" placeholder="https://..." />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="synopsis">Synopsis *</Label>
                      <Textarea id="synopsis" name="synopsis" required />
                    </div>
                    
                    <div>
                      <Label htmlFor="cast">Cast (comma-separated)</Label>
                      <Input id="cast" name="cast" placeholder="Actor 1, Actor 2, Actor 3" />
                    </div>
                    
                    <div>
                      <Label htmlFor="crew">Crew (comma-separated)</Label>
                      <Input id="crew" name="crew" placeholder="Cinematographer, Editor, Music Director" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="streamingEnabled" name="streamingEnabled" />
                        <Label htmlFor="streamingEnabled">Enable Streaming</Label>
                      </div>
                      <div>
                        <Label htmlFor="streamingType">Streaming Type</Label>
                        <Select name="streamingType">
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FREE">Free</SelectItem>
                            <SelectItem value="PAY_PER_VIEW">Pay Per View</SelectItem>
                            <SelectItem value="SUBSCRIPTION">Subscription</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="price">Price ($)</Label>
                        <Input id="price" name="price" type="number" step="0.01" placeholder="9.99" />
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
                        Create Movie
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowCreateForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Movies List */}
            <div className="grid gap-4">
              {movies.map((movie) => (
                <Card key={movie.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{movie.title}</h3>
                          <Badge variant={movie.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                            {movie.status}
                          </Badge>
                          {movie.featured && (
                            <Badge className="bg-purple-600 text-white">Featured</Badge>
                          )}
                          {movie.streamingEnabled && (
                            <Badge className="bg-green-600 text-white">Streaming</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-2 line-clamp-2">{movie.synopsis}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{movie.genre}</span>
                          <span>•</span>
                          <span>{movie.language}</span>
                          <span>•</span>
                          <span>{movie.duration} min</span>
                          <span>•</span>
                          <span>{movie.views} views</span>
                          <span>•</span>
                          <span>{movie._count.reviews} reviews</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analytics
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
                <CardDescription>
                  Track your movie performance and audience engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
                  <p className="text-gray-600">
                    Detailed analytics and insights will be available here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Settings Coming Soon</h3>
                  <p className="text-gray-600">
                    Account settings and preferences will be available here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}