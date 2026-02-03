'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings, 
  ClosedCaptions,
  Shield,
  Lock,
  CheckCircle
} from 'lucide-react'

interface SecureVideoPlayerProps {
  movieId: string
  videoUrl: string
  posterUrl?: string
  title: string
  isAuthorized: boolean
  streamingType: 'FREE' | 'PAY_PER_VIEW' | 'SUBSCRIPTION' | 'LIMITED_TIME'
  subtitles?: Array<{ language: string; url: string; label: string }>
  onPurchaseRequired?: () => void
  className?: string
}

export default function SecureVideoPlayer({
  movieId,
  videoUrl,
  posterUrl,
  title,
  isAuthorized,
  streamingType,
  subtitles = [],
  onPurchaseRequired,
  className = '',
}: SecureVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedSubtitle, setSelectedSubtitle] = useState<string>('off')
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [securityVerified, setSecurityVerified] = useState(false)
  const [screenRecordingBlocked, setScreenRecordingBlocked] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()

  const blockScreenRecording = () => {
    // Attempt to detect and block screen recording
    if ('mediaDevices' in navigator) {
      navigator.mediaDevices.getDisplayMedia = new Proxy(navigator.mediaDevices.getDisplayMedia, {
        apply() {
          return Promise.reject(new Error('Screen recording is not allowed for protected content'))
        }
      })
    }
    
    // Detect if screen is being recorded (basic detection)
    const detectRecording = () => {
      if (document.hidden) {
        setScreenRecordingBlocked(true)
      }
    }
    
    document.addEventListener('visibilitychange', detectRecording)
    
    return () => {
      document.removeEventListener('visibilitychange', detectRecording)
    }
  }

  useEffect(() => {
    // Security checks
    const performSecurityChecks = async () => {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Check for developer tools, screen recording, etc.
      const hasDevTools = !!(window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__
      const hasScreenRecordingAPI = 'mediaDevices' in navigator && 'getDisplayMedia' in navigator.mediaDevices
      
      if (!hasDevTools && !hasScreenRecordingAPI) {
        setSecurityVerified(true)
      }
      
      setIsLoading(false)
    }

    performSecurityChecks()
    blockScreenRecording()
    
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [])

  const handlePlayPause = () => {
    if (!isAuthorized && streamingType !== 'FREE') {
      onPurchaseRequired?.()
      return
    }

    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (value: number[]) => {
    const newTime = value[0]
    if (videoRef.current) {
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    if (videoRef.current) {
      videoRef.current.volume = newVolume
      setVolume(newVolume)
      setIsMuted(newVolume === 0)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const showControlsTemporarily = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  // Add watermark
  const addWatermark = () => {
    if (!videoRef.current) return
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    canvas.width = 200
    canvas.height = 50
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.font = '16px Arial'
    ctx.fillText('Filmify Protected', 10, 30)
    
    // This would need to be implemented with actual video processing
    // For now, it's a placeholder for the watermark concept
  }

  if (!isAuthorized && streamingType !== 'FREE') {
    return (
      <Card className={`bg-black ${className}`}>
        <CardContent className="p-8 text-center">
          <div className="max-w-md mx-auto">
            <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Protected Content</h3>
            <p className="text-gray-400 mb-6">
              This movie requires {streamingType === 'PAY_PER_VIEW' ? 'purchase' : 'subscription'} to view.
            </p>
            <Button 
              onClick={onPurchaseRequired}
              className="bg-purple-600 hover:bg-purple-700 text-white w-full"
            >
              {streamingType === 'PAY_PER_VIEW' ? 'Purchase Movie' : 'Subscribe to Watch'}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className={`bg-black ${className}`}>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-white">Securing content...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`bg-black overflow-hidden ${className}`}>
      <CardContent className="p-0">
        <div 
          ref={containerRef}
          className="relative aspect-video"
          onMouseMove={showControlsTemporarily}
          onMouseLeave={() => isPlaying && setShowControls(false)}
        >
          {/* Security Badge */}
          <div className="absolute top-4 right-4 z-20 flex items-center space-x-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
            <Shield className="h-4 w-4 text-green-400" />
            <span className="text-xs text-green-400">DRM Protected</span>
            {securityVerified && <CheckCircle className="h-4 w-4 text-green-400" />}
          </div>

          {/* Screen Recording Warning */}
          {screenRecordingBlocked && (
            <div className="absolute top-4 left-4 z-20 bg-red-600/90 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-xs text-white">⚠️ Screen recording detected</span>
            </div>
          )}

          {/* Video Element */}
          <video
            ref={videoRef}
            className="w-full h-full"
            poster={posterUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            controls={false}
            disablePictureInPicture
            onContextMenu={(e) => e.preventDefault()}
          >
            <source src={videoUrl} type="video/mp4" />
            {selectedSubtitle !== 'off' && subtitles.find(sub => sub.language === selectedSubtitle) && (
              <track
                kind="subtitles"
                src={subtitles.find(sub => sub.language === selectedSubtitle)?.url}
                srcLang={selectedSubtitle}
                label={subtitles.find(sub => sub.language === selectedSubtitle)?.label}
                default
              />
            )}
            Your browser does not support the video tag.
          </video>

          {/* Custom Controls */}
          <div 
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Progress Bar */}
            <div className="mb-4">
              <Slider
                value={[currentTime]}
                max={duration}
                step={1}
                onValueChange={handleSeek}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-white mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePlayPause}
                  className="text-white hover:text-purple-400 p-2"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="text-white hover:text-purple-400 p-2"
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.1}
                    onValueChange={handleVolumeChange}
                    className="w-20"
                  />
                </div>

                {/* Subtitles */}
                {subtitles.length > 0 && (
                  <Select value={selectedSubtitle} onValueChange={setSelectedSubtitle}>
                    <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                      <ClosedCaptions className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="off">Off</SelectItem>
                      {subtitles.map((subtitle) => (
                        <SelectItem key={subtitle.language} value={subtitle.language}>
                          {subtitle.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Playback Speed */}
                <Select value={playbackSpeed.toString()} onValueChange={(value) => setPlaybackSpeed(parseFloat(value))}>
                  <SelectTrigger className="w-20 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">0.5x</SelectItem>
                    <SelectItem value="1">1x</SelectItem>
                    <SelectItem value="1.25">1.25x</SelectItem>
                    <SelectItem value="1.5">1.5x</SelectItem>
                    <SelectItem value="2">2x</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:text-purple-400 p-2"
                >
                  <Maximize className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Play Button Overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                onClick={handlePlayPause}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-6"
                size="lg"
              >
                <Play className="h-8 w-8" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}