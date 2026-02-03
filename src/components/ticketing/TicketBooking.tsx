'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ExternalLink, 
  RefreshCw,
  Ticket,
  Users,
  Star
} from 'lucide-react'

interface TicketingPlatform {
  platform: string
  platformName: string
  url: string
  region: string
  showtimes: string[]
  isActive: boolean
  lastSynced?: string
}

interface TicketBookingProps {
  movieId: string
  movieTitle: string
  className?: string
}

const REGIONS = [
  { value: 'mumbai', label: 'Mumbai' },
  { value: 'delhi', label: 'Delhi-NCR' },
  { value: 'bangalore', label: 'Bangalore' },
  { value: 'hyderabad', label: 'Hyderabad' },
  { value: 'chennai', label: 'Chennai' },
  { value: 'kolkata', label: 'Kolkata' },
  { value: 'pune', label: 'Pune' },
]

const PLATFORM_COLORS = {
  bookmyshow: 'bg-red-500',
  paytm: 'bg-blue-500',
  insider: 'bg-purple-500',
  pvr: 'bg-orange-500',
  inox: 'bg-cyan-500',
}

export default function TicketBooking({ movieId, movieTitle, className = '' }: TicketBookingProps) {
  const [ticketingData, setTicketingData] = useState<any>(null)
  const [selectedRegion, setSelectedRegion] = useState('mumbai')
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState<string | null>(null)

  useEffect(() => {
    fetchTicketingInfo()
  }, [movieId, selectedRegion])

  const fetchTicketingInfo = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/ticketing?movieId=${movieId}&region=${selectedRegion}`)
      if (response.ok) {
        const data = await response.json()
        setTicketingData(data)
      }
    } catch (error) {
      console.error('Error fetching ticketing info:', error)
    } finally {
      setLoading(false)
    }
  }

  const syncShowtimes = async (platform: string) => {
    try {
      setSyncing(platform)
      const response = await fetch(
        `/api/ticketing?movieId=${movieId}&platform=${platform}&region=${selectedRegion}`,
        { method: 'PUT' }
      )
      if (response.ok) {
        await fetchTicketingInfo()
      }
    } catch (error) {
      console.error('Error syncing showtimes:', error)
    } finally {
      setSyncing(null)
    }
  }

  const handleBookTickets = (url: string, platform: string) => {
    // Open in new tab
    window.open(url, '_blank', 'noopener,noreferrer')
    
    // Track booking click (in production, this would send analytics)
    console.log(`Booking clicked for ${platform} in ${selectedRegion}`)
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'bookmyshow':
        return '🎬'
      case 'paytm':
        return '💰'
      case 'insider':
        return '🎟️'
      case 'pvr':
        return '🎪'
      case 'inox':
        return '🏢'
      default:
        return '🎭'
    }
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

  const ticketingUrls = ticketingData?.ticketingUrls || {}
  const activePlatforms = Object.entries(ticketingUrls).filter(
    ([_, data]: [string, any]) => data.isActive
  )

  if (activePlatforms.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Ticket className="h-5 w-5 mr-2" />
            Book Tickets
          </CardTitle>
          <CardDescription>
            Ticket booking not available for this movie yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Ticket booking will be available closer to the release date
            </p>
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
              <Ticket className="h-5 w-5 mr-2" />
              Book Tickets
            </CardTitle>
            <CardDescription>
              Book your tickets for "{movieTitle}" in your city
            </CardDescription>
          </div>
          
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-40">
              <MapPin className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REGIONS.map((region) => (
                <SelectItem key={region.value} value={region.value}>
                  {region.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {activePlatforms.map(([key, platformData]: [string, any]) => (
          <Card key={key} className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${PLATFORM_COLORS[platformData.platform as keyof typeof PLATFORM_COLORS]} rounded-lg flex items-center justify-center text-white font-bold`}>
                    {getPlatformIcon(platformData.platform)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{platformData.platformName}</h3>
                    <p className="text-sm text-gray-600 capitalize">
                      {platformData.region} • {platformData.showtimes.length} showtimes
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => syncShowtimes(platformData.platform)}
                  disabled={syncing === platformData.platform}
                >
                  <RefreshCw className={`h-4 w-4 ${syncing === platformData.platform ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              {/* Showtimes */}
              {platformData.showtimes.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm font-medium">Today's Showtimes</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {platformData.showtimes.slice(0, 6).map((showtime: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {showtime}
                      </Badge>
                    ))}
                    {platformData.showtimes.length > 6 && (
                      <Badge variant="outline" className="text-xs">
                        +{platformData.showtimes.length - 6} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Special Offers */}
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <Star className="h-4 w-4 mr-2 text-yellow-500" />
                  <span className="text-sm font-medium">Special Offers</span>
                </div>
                <div className="space-y-1">
                  <Badge variant="outline" className="text-xs mr-2">
                    🍿 Combo Offers Available
                  </Badge>
                  <Badge variant="outline" className="text-xs mr-2">
                    💳 10% Cashback on Cards
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    👥 Group Discounts
                  </Badge>
                </div>
              </div>

              {/* Book Button */}
              <Button 
                onClick={() => handleBookTickets(platformData.url, platformData.platform)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                size="lg"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Book on {platformData.platformName}
              </Button>

              {platformData.lastSynced && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Last updated: {new Date(platformData.lastSynced).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Why Book Through Filmify?</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Compare prices across all platforms</li>
            <li>• Real-time showtime updates</li>
            <li>• Exclusive offers and discounts</li>
            <li>• No booking fees</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}