'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Film, Globe, Smartphone, Shield, DollarSign, Star, Users, Zap } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Film className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">Filmify</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/movies">
                <Button variant="ghost" className="text-white hover:text-purple-400">
                  Browse Movies
                </Button>
              </Link>
              <Button variant="ghost" className="text-white hover:text-purple-400">
                Features
              </Button>
              <Button variant="ghost" className="text-white hover:text-purple-400">
                Pricing
              </Button>
              <Button variant="ghost" className="text-white hover:text-purple-400">
                About
              </Button>
              <Link href="/dashboard">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  Producer Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-4 bg-purple-600/20 text-purple-300 border-purple-500/30">
            🎬 Launch Your Movie in Minutes
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Filmify
            </span>
            <br />
            Digital Movie Platform
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Automatically create official movie websites and mobile apps. Enable secure streaming, 
            manage promotions, and analyze performance - all in one powerful platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-6">
              <Zap className="mr-2 h-5 w-5" />
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="border-purple-500 text-purple-300 hover:bg-purple-500/10 text-lg px-8 py-6">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Everything You Need to Launch Your Film
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm text-white">
              <CardHeader>
                <Globe className="h-10 w-10 text-purple-400 mb-2" />
                <CardTitle className="text-xl">Instant Website Generator</CardTitle>
                <CardDescription className="text-gray-300">
                  One-click professional movie website with SEO optimization and custom domains
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm text-white">
              <CardHeader>
                <Smartphone className="h-10 w-10 text-purple-400 mb-2" />
                <CardTitle className="text-xl">Mobile App Creation</CardTitle>
                <CardDescription className="text-gray-300">
                  Auto-generate Android apps and PWAs with offline support and push notifications
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm text-white">
              <CardHeader>
                <Play className="h-10 w-10 text-purple-400 mb-2" />
                <CardTitle className="text-xl">Secure Streaming</CardTitle>
                <CardDescription className="text-gray-300">
                  DRM-protected video player with adaptive streaming and multi-language support
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm text-white">
              <CardHeader>
                <DollarSign className="h-10 w-10 text-purple-400 mb-2" />
                <CardTitle className="text-xl">Monetization Tools</CardTitle>
                <CardDescription className="text-gray-300">
                  Pay-per-view, subscriptions, and ticket booking integrations with revenue analytics
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm text-white">
              <CardHeader>
                <Star className="h-10 w-10 text-purple-400 mb-2" />
                <CardTitle className="text-xl">Review Aggregation</CardTitle>
                <CardDescription className="text-gray-300">
                  Automatic IMDb, Google, and critic review aggregation with rating displays
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm text-white">
              <CardHeader>
                <Shield className="h-10 w-10 text-purple-400 mb-2" />
                <CardTitle className="text-xl">Producer Verification</CardTitle>
                <CardDescription className="text-gray-300">
                  Verified content protection with official badges and anti-piracy measures
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30 backdrop-blur-sm max-w-4xl mx-auto">
            <CardHeader className="pb-8">
              <CardTitle className="text-3xl text-white mb-4">
                Ready to Launch Your Movie?
              </CardTitle>
              <CardDescription className="text-xl text-gray-300">
                Join thousands of filmmakers using Filmify to manage their digital presence
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-6">
                  Get Started Free
                </Button>
                <Button size="lg" variant="outline" className="border-purple-500 text-purple-300 hover:bg-purple-500/10 text-lg px-8 py-6">
                  Schedule Demo
                </Button>
              </div>
              <p className="text-sm text-gray-400">
                No credit card required • Setup in 5 minutes • 14-day free trial
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-sm py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Film className="h-6 w-6 text-purple-400" />
                <span className="text-xl font-bold text-white">Filmify</span>
              </div>
              <p className="text-gray-400">
                The complete digital launch platform for filmmakers
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-purple-400">Features</Link></li>
                <li><Link href="#" className="hover:text-purple-400">Pricing</Link></li>
                <li><Link href="#" className="hover:text-purple-400">API</Link></li>
                <li><Link href="#" className="hover:text-purple-400">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-purple-400">About</Link></li>
                <li><Link href="#" className="hover:text-purple-400">Blog</Link></li>
                <li><Link href="#" className="hover:text-purple-400">Careers</Link></li>
                <li><Link href="#" className="hover:text-purple-400">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-purple-400">Privacy</Link></li>
                <li><Link href="#" className="hover:text-purple-400">Terms</Link></li>
                <li><Link href="#" className="hover:text-purple-400">Security</Link></li>
                <li><Link href="#" className="hover:text-purple-400">DMCA</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Filmify. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}