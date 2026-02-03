import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

// External review platform configurations
const REVIEW_PLATFORMS = {
  imdb: {
    name: 'IMDb',
    baseUrl: 'https://www.imdb.com',
    apiEndpoint: 'https://imdb-api.com/en/API',
    maxRating: 10,
    weight: 0.4, // Weight in aggregated rating
  },
  google: {
    name: 'Google Reviews',
    baseUrl: 'https://www.google.com/search',
    apiEndpoint: 'https://maps.googleapis.com/maps/api/place',
    maxRating: 5,
    weight: 0.3,
  },
  rotten_tomatoes: {
    name: 'Rotten Tomatoes',
    baseUrl: 'https://www.rottentomatoes.com',
    apiEndpoint: 'https://www.rottentomatoes.com/api/private/v1.0',
    maxRating: 100,
    weight: 0.2,
  },
  metacritic: {
    name: 'Metacritic',
    baseUrl: 'https://www.metacritic.com',
    apiEndpoint: 'https://api.metacritic.com',
    maxRating: 100,
    weight: 0.1,
  }
}

const createReviewSchema = z.object({
  movieId: z.string().min(1),
  rating: z.number().min(1).max(10),
  title: z.string().optional(),
  content: z.string().min(1),
  source: z.string().optional(),
  userId: z.string().optional(),
  verified: z.boolean().default(false),
  featured: z.boolean().default(false),
})

const syncReviewsSchema = z.object({
  movieId: z.string().min(1),
  platforms: z.array(z.enum(['imdb', 'google', 'rotten_tomatoes', 'metacritic'])),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const movieId = searchParams.get('movieId')
    const source = searchParams.get('source')
    const featured = searchParams.get('featured')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = {}
    
    if (movieId) {
      where.movieId = movieId
    }
    if (source) {
      where.source = source
    }
    if (featured === 'true') {
      where.featured = true
    }

    const reviews = await db.review.findMany({
      where,
      include: {
        movie: {
          select: {
            id: true,
            title: true,
            posterUrl: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    // Calculate aggregated rating if movieId is provided
    let aggregatedRating = null
    if (movieId && reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
      aggregatedRating = {
        average: totalRating / reviews.length,
        count: reviews.length,
        distribution: calculateRatingDistribution(reviews),
      }
    }

    const total = await db.review.count({ where })

    return NextResponse.json({
      reviews,
      aggregatedRating,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createReviewSchema.parse(body)

    // Check if movie exists
    const movie = await db.movie.findUnique({
      where: { id: validatedData.movieId },
    })

    if (!movie) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      )
    }

    // Create review
    const review = await db.review.create({
      data: validatedData,
      include: {
        movie: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Update movie's review count (this would be handled by a trigger in production)
    await db.movie.update({
      where: { id: validatedData.movieId },
      data: {
        // Update any review-related fields if needed
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}

// Sync reviews from external platforms
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = syncReviewsSchema.parse(body)

    // Get movie
    const movie = await db.movie.findUnique({
      where: { id: validatedData.movieId },
      select: {
        id: true,
        title: true,
        synopsis: true,
      },
    })

    if (!movie) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      )
    }

    const syncedReviews = []

    // Sync from each requested platform
    for (const platform of validatedData.platforms) {
      try {
        const reviews = await fetchReviewsFromPlatform(platform, movie)
        
        // Save reviews to database
        for (const reviewData of reviews) {
          // Check if review already exists
          const existingReview = await db.review.findFirst({
            where: {
              movieId: validatedData.movieId,
              source: platform,
              // Use a unique identifier from the platform if available
            },
          })

          if (!existingReview) {
            const review = await db.review.create({
              data: {
                movieId: validatedData.movieId,
                rating: reviewData.rating,
                title: reviewData.title,
                content: reviewData.content,
                source: platform,
                verified: true, // External platform reviews are verified
                featured: reviewData.featured || false,
              },
            })
            syncedReviews.push(review)
          }
        }
      } catch (error) {
        console.error(`Error syncing reviews from ${platform}:`, error)
      }
    }

    return NextResponse.json({
      message: 'Reviews synced successfully',
      syncedCount: syncedReviews.length,
      platforms: validatedData.platforms,
    })
  } catch (error) {
    console.error('Error syncing reviews:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to sync reviews' },
      { status: 500 }
    )
  }
}

// Mock function to simulate fetching reviews from external platforms
async function fetchReviewsFromPlatform(
  platform: keyof typeof REVIEW_PLATFORMS,
  movie: any
): Promise<Array<any>> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  const platformConfig = REVIEW_PLATFORMS[platform]
  
  // Mock reviews based on platform
  switch (platform) {
    case 'imdb':
      return [
        {
          rating: 8.5,
          title: 'A Masterpiece of Modern Cinema',
          content: 'Absolutely brilliant filmmaking with outstanding performances and a compelling narrative.',
          featured: true,
        },
        {
          rating: 7.2,
          title: 'Good but Not Great',
          content: 'Solid entertainment with some great moments, though it could have been tighter in the second half.',
          featured: false,
        },
        {
          rating: 9.1,
          title: 'Must-Watch Film of the Year',
          content: 'This movie is everything cinema should be - thought-provoking, emotional, and visually stunning.',
          featured: true,
        },
      ]
    
    case 'google':
      return [
        {
          rating: 4.2,
          title: 'Amazing Experience',
          content: 'Great movie with excellent visuals and storyline. Highly recommend!',
          featured: false,
        },
        {
          rating: 3.8,
          title: 'Good Movie',
          content: 'Enjoyed watching it with family. Good entertainment value.',
          featured: false,
        },
      ]
    
    case 'rotten_tomatoes':
      return [
        {
          rating: 85,
          title: 'Fresh',
          content: 'Critics consensus: A triumph of filmmaking that delivers on every level.',
          featured: true,
        },
      ]
    
    case 'metacritic':
      return [
        {
          rating: 78,
          title: 'Generally Favorable',
          content: 'Metacritic score: Strong performances and solid direction make this a worthwhile watch.',
          featured: true,
        },
      ]
    
    default:
      return []
  }
}

// Calculate rating distribution
function calculateRatingDistribution(reviews: any[]) {
  const distribution = {
    5: 0, 4: 0, 3: 0, 2: 0, 1: 0,
  }
  
  reviews.forEach(review => {
    const rating = Math.round(review.rating / 2) // Convert 10-point to 5-point scale
    if (rating >= 1 && rating <= 5) {
      distribution[rating as keyof typeof distribution]++
    }
  })
  
  return distribution
}

// Get aggregated rating across platforms
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const movieId = searchParams.get('movieId')

    if (!movieId) {
      return NextResponse.json(
        { error: 'movieId is required' },
        { status: 400 }
      )
    }

    // Get all reviews for the movie
    const reviews = await db.review.findMany({
      where: { movieId },
      select: {
        rating: true,
        source: true,
        verified: true,
      },
    })

    if (reviews.length === 0) {
      return NextResponse.json({
        averageRating: 0,
        totalReviews: 0,
        platformBreakdown: {},
      })
    }

    // Calculate platform breakdown
    const platformBreakdown: Record<string, any> = {}
    let weightedSum = 0
    let totalWeight = 0

    Object.keys(REVIEW_PLATFORMS).forEach(platform => {
      const platformReviews = reviews.filter(r => r.source === platform)
      if (platformReviews.length > 0) {
        const avgRating = platformReviews.reduce((sum, r) => sum + r.rating, 0) / platformReviews.length
        const weight = REVIEW_PLATFORMS[platform as keyof typeof REVIEW_PLATFORMS].weight
        
        platformBreakdown[platform] = {
          name: REVIEW_PLATFORMS[platform as keyof typeof REVIEW_PLATFORMS].name,
          averageRating: avgRating,
          count: platformReviews.length,
          weight: weight,
        }
        
        weightedSum += avgRating * weight
        totalWeight += weight
      }
    })

    // Add user reviews (non-external platform)
    const userReviews = reviews.filter(r => !r.source || !Object.keys(REVIEW_PLATFORMS).includes(r.source))
    if (userReviews.length > 0) {
      const avgRating = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length
      platformBreakdown['users'] = {
        name: 'User Reviews',
        averageRating: avgRating,
        count: userReviews.length,
        weight: 0.2,
      }
      
      weightedSum += avgRating * 0.2
      totalWeight += 0.2
    }

    const aggregatedRating = totalWeight > 0 ? weightedSum / totalWeight : 0

    return NextResponse.json({
      averageRating: Math.round(aggregatedRating * 10) / 10,
      totalReviews: reviews.length,
      platformBreakdown,
      distribution: calculateRatingDistribution(reviews),
    })
  } catch (error) {
    console.error('Error calculating aggregated rating:', error)
    return NextResponse.json(
      { error: 'Failed to calculate aggregated rating' },
      { status: 500 }
    )
  }
}