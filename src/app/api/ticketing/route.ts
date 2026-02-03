import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

// Ticket booking platform configurations
const TICKETING_PLATFORMS = {
  bookmyshow: {
    name: 'BookMyShow',
    baseUrl: 'https://in.bookmyshow.com',
    apiEndpoint: 'https://api.bookmyshow.com',
    regions: ['mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 'pune'],
  },
  paytm: {
    name: 'PayTM Movies',
    baseUrl: 'https://paytm.com/movies',
    apiEndpoint: 'https://paytm.com/v1/api',
    regions: ['mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 'pune'],
  },
  insider: {
    name: 'Insider',
    baseUrl: 'https://insider.in',
    apiEndpoint: 'https://api.insider.in',
    regions: ['mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai'],
  },
  pvr: {
    name: 'PVR Cinemas',
    baseUrl: 'https://www.pvrcinemas.com',
    apiEndpoint: 'https://api.pvrcinemas.com',
    regions: ['mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 'pune'],
  },
  inox: {
    name: 'INOX Cinemas',
    baseUrl: 'https://www.inoxmovies.com',
    apiEndpoint: 'https://api.inoxmovies.com',
    regions: ['mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 'pune'],
  }
}

const updateTicketingSchema = z.object({
  movieId: z.string().min(1),
  platforms: z.array(z.object({
    platform: z.enum(['bookmyshow', 'paytm', 'insider', 'pvr', 'inox']),
    url: z.string().url(),
    region: z.string(),
    showtimes: z.array(z.string()).optional(),
    isActive: z.boolean().default(true),
  })),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const movieId = searchParams.get('movieId')
    const region = searchParams.get('region')
    const platform = searchParams.get('platform')

    if (!movieId) {
      return NextResponse.json(
        { error: 'movieId is required' },
        { status: 400 }
      )
    }

    // Get movie with ticketing URLs
    const movie = await db.movie.findUnique({
      where: { id: movieId },
      select: {
        id: true,
        title: true,
        ticketingUrls: true,
        releaseDate: true,
      },
    })

    if (!movie) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      )
    }

    let ticketingUrls = {}
    
    if (movie.ticketingUrls) {
      try {
        ticketingUrls = JSON.parse(movie.ticketingUrls)
      } catch (error) {
        console.error('Error parsing ticketing URLs:', error)
      }
    }

    // Filter by region and platform if specified
    let filteredUrls = ticketingUrls
    
    if (region && platform) {
      const platformKey = `${platform}_${region}`
      filteredUrls = { [platformKey]: ticketingUrls[platformKey] }
    } else if (region) {
      filteredUrls = Object.fromEntries(
        Object.entries(ticketingUrls).filter(([key]) => key.includes(`_${region}`))
      )
    } else if (platform) {
      filteredUrls = Object.fromEntries(
        Object.entries(ticketingUrls).filter(([key]) => key.startsWith(`${platform}_`))
      )
    }

    return NextResponse.json({
      movie: {
        id: movie.id,
        title: movie.title,
        releaseDate: movie.releaseDate,
      },
      ticketingUrls: filteredUrls,
      platforms: TICKETING_PLATFORMS,
    })
  } catch (error) {
    console.error('Error fetching ticketing info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ticketing information' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = updateTicketingSchema.parse(body)

    // Get movie
    const movie = await db.movie.findUnique({
      where: { id: validatedData.movieId },
    })

    if (!movie) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      )
    }

    // Build ticketing URLs object
    let ticketingUrls: Record<string, any> = {}
    
    if (movie.ticketingUrls) {
      try {
        ticketingUrls = JSON.parse(movie.ticketingUrls)
      } catch (error) {
        console.error('Error parsing existing ticketing URLs:', error)
      }
    }

    // Update ticketing URLs
    validatedData.platforms.forEach((platformData) => {
      const key = `${platformData.platform}_${platformData.region}`
      ticketingUrls[key] = {
        platform: platformData.platform,
        url: platformData.url,
        region: platformData.region,
        showtimes: platformData.showtimes || [],
        isActive: platformData.isActive,
        platformName: TICKETING_PLATFORMS[platformData.platform as keyof typeof TICKETING_PLATFORMS].name,
        updatedAt: new Date().toISOString(),
      }
    })

    // Update movie
    const updatedMovie = await db.movie.update({
      where: { id: validatedData.movieId },
      data: {
        ticketingUrls: JSON.stringify(ticketingUrls),
      },
      select: {
        id: true,
        title: true,
        ticketingUrls: true,
      },
    })

    return NextResponse.json({
      movie: updatedMovie,
      ticketingUrls: JSON.parse(updatedMovie.ticketingUrls || '{}'),
    })
  } catch (error) {
    console.error('Error updating ticketing info:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update ticketing information' },
      { status: 500 }
    )
  }
}

// Sync showtimes from external platforms
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const movieId = searchParams.get('movieId')
    const platform = searchParams.get('platform')
    const region = searchParams.get('region')

    if (!movieId || !platform || !region) {
      return NextResponse.json(
        { error: 'movieId, platform, and region are required' },
        { status: 400 }
      )
    }

    // Get movie
    const movie = await db.movie.findUnique({
      where: { id: movieId },
      select: {
        id: true,
        title: true,
        ticketingUrls: true,
      },
    })

    if (!movie) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      )
    }

    // Simulate API call to external platform
    // In production, this would call actual platform APIs
    const mockShowtimes = await fetchShowtimesFromPlatform(
      platform as keyof typeof TICKETING_PLATFORMS,
      movie.title,
      region
    )

    // Update ticketing URLs with new showtimes
    let ticketingUrls: Record<string, any> = {}
    
    if (movie.ticketingUrls) {
      try {
        ticketingUrls = JSON.parse(movie.ticketingUrls)
      } catch (error) {
        console.error('Error parsing ticketing URLs:', error)
      }
    }

    const key = `${platform}_${region}`
    if (ticketingUrls[key]) {
      ticketingUrls[key].showtimes = mockShowtimes
      ticketingUrls[key].lastSynced = new Date().toISOString()
    }

    // Update movie
    await db.movie.update({
      where: { id: movieId },
      data: {
        ticketingUrls: JSON.stringify(ticketingUrls),
      },
    })

    return NextResponse.json({
      message: 'Showtimes synced successfully',
      platform,
      region,
      showtimes: mockShowtimes,
    })
  } catch (error) {
    console.error('Error syncing showtimes:', error)
    return NextResponse.json(
      { error: 'Failed to sync showtimes' },
      { status: 500 }
    )
  }
}

// Mock function to simulate fetching showtimes from external platforms
async function fetchShowtimesFromPlatform(
  platform: keyof typeof TICKETING_PLATFORMS,
  movieTitle: string,
  region: string
): Promise<string[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Mock showtimes based on platform
  const baseShowtimes = [
    '09:00 AM', '12:00 PM', '03:00 PM', '06:00 PM', '09:00 PM'
  ]

  // Add platform-specific variations
  switch (platform) {
    case 'bookmyshow':
      return baseShowtimes.map(time => `${time} - ${TICKETING_PLATFORMS[platform].name}`)
    case 'paytm':
      return [...baseShowtimes, '11:30 PM'].map(time => `${time} - ${TICKETING_PLATFORMS[platform].name}`)
    case 'insider':
      return baseShowtimes.slice(1, 4).map(time => `${time} - ${TICKETING_PLATFORMS[platform].name}`)
    default:
      return baseShowtimes.map(time => `${time} - ${TICKETING_PLATFORMS[platform].name}`)
  }
}