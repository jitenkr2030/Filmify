import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const createMovieSchema = z.object({
  title: z.string().min(1),
  synopsis: z.string().min(1),
  story: z.string().optional(),
  genre: z.string().min(1),
  language: z.string().min(1),
  duration: z.number().min(1),
  certification: z.string().optional(),
  releaseDate: z.string().optional(),
  directorName: z.string().optional(),
  producerName: z.string().optional(),
  cast: z.array(z.string()).optional(),
  crew: z.array(z.string()).optional(),
  posterUrl: z.string().url().optional(),
  trailerUrl: z.string().url().optional(),
  streamingEnabled: z.boolean().default(false),
  streamingType: z.enum(['FREE', 'PAY_PER_VIEW', 'SUBSCRIPTION', 'LIMITED_TIME']).default('FREE'),
  price: z.number().optional(),
  producerId: z.string().min(1),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const featured = searchParams.get('featured')
    const genre = searchParams.get('genre')

    const where: any = {}
    
    if (status) {
      where.status = status
    }
    if (featured === 'true') {
      where.featured = true
    }
    if (genre) {
      where.genre = genre
    }

    const movies = await db.movie.findMany({
      where,
      include: {
        producer: {
          select: {
            id: true,
            name: true,
            studio: true,
            verified: true,
          },
        },
        reviews: {
          select: {
            rating: true,
            verified: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            userPurchases: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    const total = await db.movie.count({ where })

    return NextResponse.json({
      movies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching movies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch movies' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createMovieSchema.parse(body)

    // Generate unique slug
    const baseSlug = validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    
    let slug = baseSlug
    let counter = 1
    
    while (await db.movie.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const movie = await db.movie.create({
      data: {
        ...validatedData,
        slug,
        cast: validatedData.cast ? JSON.stringify(validatedData.cast) : null,
        crew: validatedData.crew ? JSON.stringify(validatedData.crew) : null,
        releaseDate: validatedData.releaseDate ? new Date(validatedData.releaseDate) : null,
      },
      include: {
        producer: {
          select: {
            id: true,
            name: true,
            studio: true,
            verified: true,
          },
        },
      },
    })

    return NextResponse.json(movie, { status: 201 })
  } catch (error) {
    console.error('Error creating movie:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create movie' },
      { status: 500 }
    )
  }
}