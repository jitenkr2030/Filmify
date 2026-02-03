import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const movieId = searchParams.get('movieId')
    const userId = searchParams.get('userId')

    if (!movieId || !userId) {
      return NextResponse.json(
        { error: 'movieId and userId are required' },
        { status: 400 }
      )
    }

    // Get movie details
    const movie = await db.movie.findUnique({
      where: { id: movieId },
    })

    if (!movie) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      )
    }

    // Check if streaming is enabled
    if (!movie.streamingEnabled) {
      return NextResponse.json({
        hasAccess: false,
        reason: 'Streaming not enabled',
        streamingType: movie.streamingType,
        price: movie.price,
      })
    }

    // If streaming is free, grant access
    if (movie.streamingType === 'FREE') {
      return NextResponse.json({
        hasAccess: true,
        reason: 'Free content',
        streamingType: movie.streamingType,
        price: null,
      })
    }

    // For paid content, check purchase
    const purchase = await db.purchase.findFirst({
      where: {
        movieId,
        userId,
        status: 'COMPLETED',
        expiresAt: {
          gt: new Date(),
        },
      },
    })

    if (purchase) {
      return NextResponse.json({
        hasAccess: true,
        reason: 'Valid purchase',
        streamingType: movie.streamingType,
        price: movie.price,
        purchase: {
          id: purchase.id,
          expiresAt: purchase.expiresAt,
        },
      })
    }

    // No access found
    return NextResponse.json({
      hasAccess: false,
      reason: 'Purchase required',
      streamingType: movie.streamingType,
      price: movie.price,
    })
  } catch (error) {
    console.error('Error checking access:', error)
    return NextResponse.json(
      { error: 'Failed to check access' },
      { status: 500 }
    )
  }
}