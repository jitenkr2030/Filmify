import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const createPurchaseSchema = z.object({
  movieId: z.string().min(1),
  userId: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  paymentMethod: z.string().optional(),
  transactionId: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const movieId = searchParams.get('movieId')
    const status = searchParams.get('status')

    const where: any = {}
    
    if (userId) {
      where.userId = userId
    }
    if (movieId) {
      where.movieId = movieId
    }
    if (status) {
      where.status = status
    }

    const purchases = await db.purchase.findMany({
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
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ purchases })
  } catch (error) {
    console.error('Error fetching purchases:', error)
    return NextResponse.json(
      { error: 'Failed to fetch purchases' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createPurchaseSchema.parse(body)

    // Check if user already has an active purchase for this movie
    const existingPurchase = await db.purchase.findFirst({
      where: {
        movieId: validatedData.movieId,
        userId: validatedData.userId,
        status: 'COMPLETED',
        expiresAt: {
          gt: new Date(),
        },
      },
    })

    if (existingPurchase) {
      return NextResponse.json(
        { error: 'User already has an active purchase for this movie' },
        { status: 400 }
      )
    }

    // Get movie details
    const movie = await db.movie.findUnique({
      where: { id: validatedData.movieId },
    })

    if (!movie) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      )
    }

    // Validate purchase amount matches movie price
    if (movie.streamingType === 'PAY_PER_VIEW' && movie.price !== validatedData.amount) {
      return NextResponse.json(
        { error: 'Invalid purchase amount' },
        { status: 400 }
      )
    }

    // Create purchase record
    const purchase = await db.purchase.create({
      data: {
        ...validatedData,
        status: 'COMPLETED', // In production, this would be PENDING initially
        expiresAt: movie.streamingType === 'LIMITED_TIME' 
          ? new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
          : undefined,
      },
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
            email: true,
          },
        },
      },
    })

    // Update movie purchase count
    await db.movie.update({
      where: { id: validatedData.movieId },
      data: { 
        purchases: { increment: 1 },
        userPurchases: { increment: 1 },
      },
    })

    return NextResponse.json(purchase, { status: 201 })
  } catch (error) {
    console.error('Error creating purchase:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create purchase' },
      { status: 500 }
    )
  }
}