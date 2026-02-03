import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

// Notification types
const NOTIFICATION_TYPES = {
  TRAILER_RELEASE: 'trailer_release',
  MOVIE_RELEASE: 'movie_release',
  STREAMING_AVAILABLE: 'streaming_available',
  OTT_RELEASE: 'ott_release',
  ANNOUNCEMENT: 'announcement',
  SYSTEM: 'system',
  REVIEW_ADDED: 'review_added',
  PRICE_DROP: 'price_drop',
  NEW_MOVIE_FROM_PRODUCER: 'new_movie_from_producer',
} as const

const createNotificationSchema = z.object({
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
  type: z.enum(Object.values(NOTIFICATION_TYPES)),
  userId: z.string().min(1),
  movieId: z.string().optional(),
  actionUrl: z.string().optional(),
  imageUrl: z.string().url().optional(),
  scheduledFor: z.string().optional(), // ISO datetime for scheduled notifications
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
})

const subscribeSchema = z.object({
  userId: z.string().min(1),
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
})

// In-memory store for push subscriptions (in production, use Redis or database)
const pushSubscriptions = new Map<string, any[]>()

// VAPID keys (in production, get from environment variables)
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BMxzFTmF3i9j9A5DhxGJ5g0Y7Lz8n7v6V5X4K3J2H1G0F9E8D7C6B5A4Z3Y2X1W0V'
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'x9J8K7L6M5N4O3P2Q1R0S9T8U7V6W5X4Y3Z2A1B2C3D4E5F6G7H8I9J0K1L2'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')
    const unread = searchParams.get('unread')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}
    
    if (userId) {
      where.userId = userId
    }
    if (type) {
      where.type = type
    }
    if (unread === 'true') {
      where.read = false
    }

    const notifications = await db.notification.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        movie: {
          select: {
            id: true,
            title: true,
            posterUrl: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    })

    const total = await db.notification.count({ where })

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'subscribe') {
      // Handle push notification subscription
      const validatedData = subscribeSchema.parse(body)
      
      const userSubscriptions = pushSubscriptions.get(validatedData.userId) || []
      userSubscriptions.push(validatedData)
      pushSubscriptions.set(validatedData.userId, userSubscriptions)

      return NextResponse.json({
        message: 'Subscribed to push notifications successfully',
        vapidPublicKey: VAPID_PUBLIC_KEY,
      })
    }

    if (action === 'unsubscribe') {
      // Handle unsubscribe
      const { userId, endpoint } = body
      const userSubscriptions = pushSubscriptions.get(userId) || []
      const filtered = userSubscriptions.filter((sub: any) => sub.endpoint !== endpoint)
      pushSubscriptions.set(userId, filtered)

      return NextResponse.json({
        message: 'Unsubscribed successfully',
      })
    }

    // Create notification
    const validatedData = createNotificationSchema.parse(body)

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: validatedData.userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Handle scheduled notifications
    if (validatedData.scheduledFor) {
      const scheduledTime = new Date(validatedData.scheduledFor)
      if (scheduledTime > new Date()) {
        // Schedule notification (in production, use a job queue like Bull or Agenda)
        setTimeout(() => {
          createNotification(validatedData)
        }, scheduledTime.getTime() - Date.now())

        return NextResponse.json({
          message: 'Notification scheduled successfully',
          scheduledFor: validatedData.scheduledFor,
        })
      }
    }

    // Create notification immediately
    const notification = await createNotification(validatedData)

    // Send push notification
    await sendPushNotification(validatedData.userId, {
      title: validatedData.title,
      message: validatedData.message,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: `filmify-${validatedData.type}`,
      data: {
        movieId: validatedData.movieId,
        actionUrl: validatedData.actionUrl,
        notificationId: notification.id,
      },
      actions: [
        {
          action: 'view',
          title: 'View',
          icon: '/icons/view.png',
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icons/dismiss.png',
        },
      ],
    })

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error('Error creating notification:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { notificationIds, action } = body

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: 'notificationIds array is required' },
        { status: 400 }
      )
    }

    let updateData: any = {}

    switch (action) {
      case 'mark_read':
        updateData = { read: true }
        break
      case 'mark_unread':
        updateData = { read: false }
        break
      case 'delete':
        // Handle delete separately
        const deletedCount = await db.notification.deleteMany({
          where: {
            id: { in: notificationIds },
          },
        })
        return NextResponse.json({
          message: `Deleted ${deletedCount.count} notifications`,
        })
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    const result = await db.notification.updateMany({
      where: {
        id: { in: notificationIds },
      },
      data: updateData,
    })

    return NextResponse.json({
      message: `Updated ${result.count} notifications`,
      count: result.count,
    })
  } catch (error) {
    console.error('Error updating notifications:', error)
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    )
  }
}

// Helper function to create notification
async function createNotification(data: any) {
  return await db.notification.create({
    data: {
      title: data.title,
      message: data.message,
      type: data.type,
      userId: data.userId,
      movieId: data.movieId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      movie: {
        select: {
          id: true,
          title: true,
          posterUrl: true,
        },
      },
    },
  })
}

// Helper function to send push notification
async function sendPushNotification(userId: string, payload: any) {
  const subscriptions = pushSubscriptions.get(userId) || []
  
  for (const subscription of subscriptions) {
    try {
      // In production, use a proper push service library like web-push
      console.log(`Sending push notification to user ${userId}:`, payload)
      
      // Mock push notification send
      // await webpush.sendNotification(subscription, JSON.stringify(payload), {
      //   vapidDetails: {
      //     subject: 'mailto:notifications@filmify.app',
      //     publicKey: VAPID_PUBLIC_KEY,
      //     privateKey: VAPID_PRIVATE_KEY,
      //   },
      // })
    } catch (error) {
      console.error('Error sending push notification:', error)
      
      // Remove invalid subscription
      const userSubscriptions = pushSubscriptions.get(userId) || []
      const filtered = userSubscriptions.filter((sub: any) => sub.endpoint !== subscription.endpoint)
      pushSubscriptions.set(userId, filtered)
    }
  }
}

// Bulk notification for movie events
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { movieId, eventType, customMessage } = body

    if (!movieId || !eventType) {
      return NextResponse.json(
        { error: 'movieId and eventType are required' },
        { status: 400 }
      )
    }

    // Get movie details
    const movie = await db.movie.findUnique({
      where: { id: movieId },
      include: {
        producer: {
          select: {
            id: true,
            name: true,
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

    // Get users who might be interested (in production, this would be more sophisticated)
    const users = await db.user.findMany({
      where: {
        OR: [
          { role: 'USER' },
          { id: movie.producer.id },
        ],
      },
      select: {
        id: true,
        name: true,
      },
    })

    let notificationData: any = {
      type: NOTIFICATION_TYPES[eventType.toUpperCase()] || NOTIFICATION_TYPES.ANNOUNCEMENT,
      movieId,
      priority: 'normal',
    }

    // Create event-specific notifications
    switch (eventType) {
      case 'trailer_release':
        notificationData.title = `🎬 New Trailer: ${movie.title}`
        notificationData.message = customMessage || `The trailer for "${movie.title}" is now available!`
        break
      case 'movie_release':
        notificationData.title = `🎉 Now Playing: ${movie.title}`
        notificationData.message = customMessage || `"${movie.title}" is now in theaters!`
        notificationData.priority = 'high'
        break
      case 'streaming_available':
        notificationData.title = `📺 Now Streaming: ${movie.title}`
        notificationData.message = customMessage || `Watch "${movie.title}" now on Filmify!`
        notificationData.priority = 'high'
        break
      case 'ott_release':
        notificationData.title = `🍿 On OTT: ${movie.title}`
        notificationData.message = customMessage || `"${movie.title}" is now available on OTT platforms!`
        break
      default:
        notificationData.title = `📢 Update: ${movie.title}`
        notificationData.message = customMessage || `New update for "${movie.title}"`
    }

    // Create notifications for all users
    const notifications = await Promise.all(
      users.map((user) =>
        createNotification({
          ...notificationData,
          userId: user.id,
        })
      )
    )

    // Send push notifications
    await Promise.all(
      users.map((user) =>
        sendPushNotification(user.id, {
          title: notificationData.title,
          message: notificationData.message,
          icon: movie.posterUrl || '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          tag: `filmify-${notificationData.type}`,
          data: {
            movieId,
            actionUrl: `/movie/${movie.slug}`,
            type: notificationData.type,
          },
        })
      )
    )

    return NextResponse.json({
      message: `Sent ${notifications.length} notifications`,
      eventType,
      movieTitle: movie.title,
    })
  } catch (error) {
    console.error('Error sending bulk notifications:', error)
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    )
  }
}