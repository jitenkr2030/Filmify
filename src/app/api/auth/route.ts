import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { randomBytes } from 'crypto'

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['USER', 'PRODUCER']).default('USER'),
  studio: z.string().optional(),
  website: z.string().url().optional(),
  bio: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type } = body

    if (type === 'register') {
      const validatedData = registerSchema.parse(body)
      
      // Check if user already exists
      const existingUser = await db.user.findUnique({
        where: { email: validatedData.email },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 400 }
        )
      }

      // Generate verification token
      const verificationToken = randomBytes(32).toString('hex')

      const user = await db.user.create({
        data: {
          ...validatedData,
          verificationToken,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          verified: true,
          studio: true,
          website: true,
          createdAt: true,
        },
      })

      return NextResponse.json({
        user,
        message: 'Registration successful. Please check your email for verification.',
      }, { status: 201 })

    } else if (type === 'login') {
      const validatedData = loginSchema.parse(body)
      
      const user = await db.user.findUnique({
        where: { email: validatedData.email },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          verified: true,
          studio: true,
          website: true,
          createdAt: true,
        },
      })

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        user,
        message: 'Login successful',
      })

    } else {
      return NextResponse.json(
        { error: 'Invalid request type' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Auth error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}