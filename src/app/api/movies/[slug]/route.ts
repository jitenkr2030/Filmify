import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const movie = await db.movie.findUnique({
      where: { slug: params.slug },
      include: {
        producer: {
          select: {
            id: true,
            name: true,
            studio: true,
            verified: true,
            bio: true,
          },
        },
        reviews: {
          include: {
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
        },
        mediaAssets: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
        _count: {
          select: {
            reviews: true,
            userPurchases: true,
          },
        },
      },
    })

    if (!movie) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      )
    }

    // Increment view count
    await db.movie.update({
      where: { id: movie.id },
      data: { views: { increment: 1 } },
    })

    // Parse JSON fields
    const parsedMovie = {
      ...movie,
      cast: movie.cast ? JSON.parse(movie.cast) : [],
      crew: movie.crew ? JSON.parse(movie.crew) : [],
      ottPlatforms: movie.ottPlatforms ? JSON.parse(movie.ottPlatforms) : [],
      ticketingUrls: movie.ticketingUrls ? JSON.parse(movie.ticketingUrls) : {},
    }

    return NextResponse.json(parsedMovie)
  } catch (error) {
    console.error('Error fetching movie:', error)
    return NextResponse.json(
      { error: 'Failed to fetch movie' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json()
    
    const movie = await db.movie.update({
      where: { slug: params.slug },
      data: {
        ...body,
        cast: body.cast ? JSON.stringify(body.cast) : undefined,
        crew: body.crew ? JSON.stringify(body.crew) : undefined,
        ottPlatforms: body.ottPlatforms ? JSON.stringify(body.ottPlatforms) : undefined,
        ticketingUrls: body.ticketingUrls ? JSON.stringify(body.ticketingUrls) : undefined,
        releaseDate: body.releaseDate ? new Date(body.releaseDate) : undefined,
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

    return NextResponse.json(movie)
  } catch (error) {
    console.error('Error updating movie:', error)
    return NextResponse.json(
      { error: 'Failed to update movie' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await db.movie.delete({
      where: { slug: params.slug },
    })

    return NextResponse.json({ message: 'Movie deleted successfully' })
  } catch (error) {
    console.error('Error deleting movie:', error)
    return NextResponse.json(
      { error: 'Failed to delete movie' },
      { status: 500 }
    )
  }
}