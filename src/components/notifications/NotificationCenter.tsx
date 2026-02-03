'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Bell, 
  X, 
  Check, 
  Trash2, 
  Film, 
  Calendar, 
  Star,
  Volume2,
  VolumeX,
  Settings,
  RefreshCw
} from 'lucide-react'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
  movie?: {
    id: string
    title: string
    posterUrl?: string
  }
}

interface NotificationCenterProps {
  userId?: string
  className?: string
}

const NOTIFICATION_ICONS = {
  trailer_release: '🎬',
  movie_release: '🎉',
  streaming_available: '📺',
  ott_release: '🍿',
  announcement: '📢',
  system: '⚙️',
  review_added: '⭐',
  price_drop: '💰',
  new_movie_from_producer: '🎥',
}

const NOTIFICATION_COLORS = {
  trailer_release: 'bg-blue-100 text-blue-800',
  movie_release: 'bg-green-100 text-green-800',
  streaming_available: 'bg-purple-100 text-purple-800',
  ott_release: 'bg-orange-100 text-orange-800',
  announcement: 'bg-gray-100 text-gray-800',
  system: 'bg-red-100 text-red-800',
  review_added: 'bg-yellow-100 text-yellow-800',
  price_drop: 'bg-pink-100 text-pink-800',
  new_movie_from_producer: 'bg-indigo-100 text-indigo-800',
}

export default function NotificationCenter({ userId = 'demo-user-id', className = '' }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (userId) {
      fetchNotifications()
      // Request notification permission
      requestNotificationPermission()
    }
  }, [userId])

  useEffect(() => {
    // Set up periodic polling for new notifications
    const interval = setInterval(() => {
      if (userId) {
        fetchNotifications()
      }
    }, 30000) // Poll every 30 seconds

    return () => clearInterval(interval)
  }, [userId])

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications?userId=${userId}&limit=50`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.notifications?.filter((n: Notification) => !n.read).length || 0)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {
          // Subscribe to push notifications
          subscribeToPushNotifications()
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error)
      }
    }
  }

  const subscribeToPushNotifications = async () => {
    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlB64ToUint8Array('BMxzFTmF3i9j9A5DhxGJ5g0Y7Lz8n7v6V5X4K3J2H1G0F9E8D7C6B5A4Z3Y2X1W0V')
        })

        // Send subscription to server
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'subscribe',
            userId,
            endpoint: subscription.endpoint,
            keys: {
              p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
              auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
            },
          }),
        })
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
    }
  }

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationIds,
          action: 'mark_read',
        }),
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification =>
            notificationIds.includes(notification.id)
              ? { ...notification, read: true }
              : notification
          )
        )
        setUnreadCount(prev => Math.max(0, prev - notificationIds.length))
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    }
  }

  const deleteNotifications = async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationIds,
          action: 'delete',
        }),
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.filter(notification => !notificationIds.includes(notification.id))
        )
        const deletedUnread = notifications.filter(n => 
          notificationIds.includes(n.id) && !n.read
        ).length
        setUnreadCount(prev => Math.max(0, prev - deletedUnread))
      }
    } catch (error) {
      console.error('Error deleting notifications:', error)
    }
  }

  const markAllAsRead = () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
    if (unreadIds.length > 0) {
      markAsRead(unreadIds)
    }
  }

  const clearAll = () => {
    const allIds = notifications.map(n => n.id)
    if (allIds.length > 0) {
      deleteNotifications(allIds)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead([notification.id])
    }

    // Navigate to relevant page
    if (notification.movie) {
      window.location.href = `/movie/${notification.movie.id}`
    }
    setIsOpen(false)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  // Helper function to convert VAPID key
  function urlB64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-96 max-h-96 bg-white shadow-lg border border-gray-200 z-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchNotifications}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <CardDescription className="text-sm">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </CardDescription>
              <div className="flex space-x-2">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    Mark all read
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAll}>
                    Clear all
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
              </div>
            ) : notifications.length > 0 ? (
              <ScrollArea className="h-64">
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm">
                            {NOTIFICATION_ICONS[notification.type as keyof typeof NOTIFICATION_ICONS] || '📢'}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium truncate">
                              {notification.title}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${NOTIFICATION_COLORS[notification.type as keyof typeof NOTIFICATION_COLORS]}`}
                            >
                              {notification.type.replace('_', ' ')}
                            </Badge>
                            <div className="flex space-x-1">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    markAsRead([notification.id])
                                  }}
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteNotifications([notification.id])
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No notifications yet</p>
                <p className="text-sm text-gray-500">
                  We'll notify you about movie updates and news
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}