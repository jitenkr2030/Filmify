'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Lock, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  Shield,
  Play,
  Calendar
} from 'lucide-react'

interface PurchaseModalProps {
  movie: {
    id: string
    title: string
    posterUrl?: string
    streamingType: 'FREE' | 'PAY_PER_VIEW' | 'SUBSCRIPTION' | 'LIMITED_TIME'
    price?: number
    duration: number
    synopsis: string
  }
  isOpen: boolean
  onClose: () => void
  onPurchaseComplete: (purchaseData: any) => void
}

export default function PurchaseModal({
  movie,
  isOpen,
  onClose,
  onPurchaseComplete,
}: PurchaseModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [purchaseStep, setPurchaseStep] = useState<'details' | 'payment' | 'complete'>('details')

  if (!isOpen) return null

  const handlePurchase = async () => {
    setIsProcessing(true)
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In production, this would call a real payment API
      const purchaseData = {
        movieId: movie.id,
        userId: 'demo-user-id', // Would come from auth
        amount: movie.price || 0,
        currency: 'USD',
        paymentMethod: 'credit_card',
        transactionId: `txn_${Date.now()}`,
        status: 'COMPLETED',
      }

      // Call purchase API
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(purchaseData),
      })

      if (response.ok) {
        const purchase = await response.json()
        setPurchaseStep('complete')
        onPurchaseComplete(purchase)
      } else {
        throw new Error('Purchase failed')
      }
    } catch (error) {
      console.error('Purchase error:', error)
      // Handle error
    } finally {
      setIsProcessing(false)
    }
  }

  const getStreamingTypeLabel = (type: string) => {
    switch (type) {
      case 'PAY_PER_VIEW':
        return 'Pay Per View'
      case 'SUBSCRIPTION':
        return 'Subscription Required'
      case 'LIMITED_TIME':
        return 'Limited Time Access'
      default:
        return type
    }
  }

  const getStreamingTypeDescription = (type: string) => {
    switch (type) {
      case 'PAY_PER_VIEW':
        return 'Buy once, watch forever'
      case 'SUBSCRIPTION':
        return 'Watch with Filmify Premium'
      case 'LIMITED_TIME':
        return '48-hour rental period'
      default:
        return ''
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Unlock This Movie</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
          <CardDescription>
            Get instant access to watch this movie
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Movie Info */}
          <div className="flex space-x-4">
            {movie.posterUrl && (
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-20 h-28 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <h3 className="font-bold text-lg">{movie.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">{movie.synopsis}</p>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>{movie.duration} min</span>
              </div>
            </div>
          </div>

          {purchaseStep === 'details' && (
            <>
              {/* Access Type */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant="outline">
                        {getStreamingTypeLabel(movie.streamingType)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {getStreamingTypeDescription(movie.streamingType)}
                    </p>
                  </div>
                  <div className="text-right">
                    {movie.streamingType === 'PAY_PER_VIEW' && (
                      <div className="text-2xl font-bold">${movie.price}</div>
                    )}
                    {movie.streamingType === 'SUBSCRIPTION' && (
                      <div className="text-sm text-gray-500">Premium</div>
                    )}
                    {movie.streamingType === 'LIMITED_TIME' && (
                      <div className="text-2xl font-bold">${movie.price}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <h4 className="font-semibold">What you get:</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>HD quality streaming</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Watch on any device</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Download for offline viewing</span>
                  </div>
                  {movie.streamingType === 'LIMITED_TIME' && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span>48-hour access period</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Security Badge */}
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Secure payment powered by Filmify. Your payment information is encrypted and protected.
                </AlertDescription>
              </Alert>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button 
                  onClick={() => setPurchaseStep('payment')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  size="lg"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {movie.streamingType === 'PAY_PER_VIEW' || movie.streamingType === 'LIMITED_TIME' 
                    ? `Pay $${movie.price}` 
                    : 'Subscribe to Watch'
                  }
                </Button>
                <Button variant="outline" onClick={onClose} className="w-full">
                  Maybe Later
                </Button>
              </div>
            </>
          )}

          {purchaseStep === 'payment' && (
            <div className="space-y-4">
              <div className="text-center">
                <CreditCard className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Secure Payment</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Enter your payment details to complete the purchase
                </p>
              </div>

              {/* Payment Form (Simplified) */}
              <div className="space-y-3">
                <div className="p-3 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Demo Payment Form</p>
                  <p className="text-xs text-gray-500">
                    In production, this would integrate with Stripe, PayPal, or other payment providers
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={handlePurchase}
                  disabled={isProcessing}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Complete Purchase
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setPurchaseStep('details')}
                  className="w-full"
                >
                  Back
                </Button>
              </div>
            </div>
          )}

          {purchaseStep === 'complete' && (
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h3 className="text-xl font-bold">Purchase Complete!</h3>
              <p className="text-gray-600">
                You now have access to watch "{movie.title}"
              </p>
              {movie.streamingType === 'LIMITED_TIME' && (
                <Alert>
                  <Calendar className="h-4 w-4" />
                  <AlertDescription>
                    Your access expires in 48 hours. Enjoy the movie!
                  </AlertDescription>
                </Alert>
              )}
              <Button 
                onClick={() => {
                  onClose()
                  setPurchaseStep('details')
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                Watch Now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}