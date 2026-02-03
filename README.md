# 🎬 Filmify - Launch Your Movie Online in Minutes

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC)](https://tailwindcss.com/)

**Filmify** is an all-in-one digital launch platform that automatically creates **official movie websites and mobile apps**, and enables **secure in-app movie streaming** for verified content owners — all within minutes.

Filmify empowers producers to manage their film's **entire digital lifecycle**:
**Launch → Promote → Sell → Stream → Analyze**

## ✨ Features

### 🌐 **Instant Movie Website Generator**
- One-click professional movie website creation
- Custom domain or Filmify subdomain support
- Mobile-responsive layouts
- SEO-optimized pages
- Ultra-fast hosting & CDN support

### 📱 **Automatic Mobile App Creation**
- Android App & Progressive Web App (PWA) generation
- Auto-generated app icon & splash screen
- App store–ready builds
- Low-data, low-storage optimized
- Offline content caching

### 🎥 **Secure Video Streaming**
- DRM-protected video player
- Adaptive streaming (low internet friendly)
- Resume watching functionality
- Multi-language subtitle support
- Screen recording detection
- Content watermarking
- Authorized user access only

### 💰 **Monetization Tools**
- **Free streaming**
- **Pay-per-view** options
- **Subscription-based** access
- **Limited-time** viewing (48h rentals)
- **Coupon & access codes**
- Secure payment processing

### 🎟️ **Ticket Booking Integration**
- BookMyShow / Paytm / Insider integration ready
- Region-based showtime redirection
- One-click ticket booking buttons
- Affiliate & commission support

### 📊 **Producer Dashboard**
- Complete content management system
- Enable/disable features instantly
- Streaming controls & analytics
- Audience insights & reports
- Revenue tracking
- Real-time statistics

### 🔐 **Security & Verification**
- Producer & studio verification system
- Content ownership declaration
- Official movie verification badges
- Secure hosting & SSL
- Anti-piracy safeguards

### ⭐ **Review & Rating Aggregation**
- IMDb ratings integration
- Google reviews aggregation
- Critic review highlights
- Audience feedback sections

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Bun (recommended) or npm/yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jitenkr2030/Filmify.git
   cd Filmify
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file:
   ```env
   DATABASE_URL="file:./db/custom.db"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   bun run db:push
   bun run db:generate
   ```

5. **Start the development server**
   ```bash
   bun run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: Prisma ORM with SQLite
- **Authentication**: NextAuth.js v4
- **State Management**: Zustand + TanStack Query
- **PWA**: Service Worker + Web App Manifest

### Project Structure

```
Filmify/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Producer dashboard
│   │   ├── movies/           # Movie listing
│   │   └── movie/[slug]/     # Dynamic movie pages
│   ├── components/            # Reusable components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── video-player/     # Secure video player
│   │   ├── movie-templates/  # Website templates
│   │   └── purchase/         # Purchase flow
│   └── lib/                  # Utilities and configurations
├── prisma/                   # Database schema
├── public/                   # Static assets
└── mini-services/           # Microservices
```

## 📱 PWA Features

Filmify is built as a Progressive Web App with:

- **Offline Support**: Cache movie information for offline viewing
- **Installable**: Add to home screen on mobile devices
- **Push Notifications**: Trailer releases, streaming availability
- **Responsive**: Works seamlessly on all devices

## 🔒 Security Features

- **DRM Protection**: Secure video streaming with encryption
- **Screen Recording Detection**: Prevents unauthorized recording
- **Access Control**: User authentication and authorization
- **Content Verification**: Producer verification system
- **Secure Payments**: Encrypted transaction processing

## 💡 Usage Examples

### Creating a New Movie

```typescript
const movieData = {
  title: "My Awesome Film",
  synopsis: "A thrilling adventure...",
  genre: "Action",
  language: "English",
  duration: 120,
  streamingType: "PAY_PER_VIEW",
  price: 9.99,
  posterUrl: "https://example.com/poster.jpg",
  trailerUrl: "https://example.com/trailer.mp4"
};

// Create movie via API
const response = await fetch('/api/movies', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(movieData)
});
```

### Checking User Access

```typescript
// Check if user can watch a movie
const accessResponse = await fetch(`/api/access?movieId=${movieId}&userId=${userId}`);
const { hasAccess, reason } = await accessResponse.json();

if (hasAccess) {
  // Show video player
} else {
  // Show purchase modal
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `file:./db/custom.db` |
| `NEXTAUTH_SECRET` | Authentication secret | Required |
| `NEXTAUTH_URL` | Base URL for auth | `http://localhost:3000` |
| `STRIPE_SECRET_KEY` | Stripe payment secret | Optional |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Optional |

### Database Schema

The platform uses a comprehensive schema with models for:
- **Users** (Producers, Admins, Viewers)
- **Movies** (Content, metadata, streaming settings)
- **Purchases** (Transactions, access control)
- **Reviews** (Ratings, feedback)
- **Analytics** (Views, engagement metrics)

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

### Docker

```bash
# Build the image
docker build -t filmify .

# Run the container
docker run -p 3000:3000 filmify
```

### Traditional Hosting

```bash
# Build for production
bun run build

# Start production server
bun run start
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 API Documentation

### Movies API

- `GET /api/movies` - List movies with filtering
- `POST /api/movies` - Create new movie
- `GET /api/movies/[slug]` - Get movie details
- `PUT /api/movies/[slug]` - Update movie
- `DELETE /api/movies/[slug]` - Delete movie

### Access API

- `GET /api/access` - Check user access to movie

### Purchases API

- `GET /api/purchases` - List user purchases
- `POST /api/purchases` - Create new purchase

## 🧪 Testing

```bash
# Run linting
bun run lint

# Run type checking
bun run type-check

# Run tests (when implemented)
bun run test
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@filmify.app
- 🐛 Issues: [GitHub Issues](https://github.com/jitenkr2030/Filmify/issues)
- 📖 Documentation: [Filmify Docs](https://docs.filmify.app)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Prisma](https://www.prisma.io/) - Modern database toolkit
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Lucide](https://lucide.dev/) - Icon library

---

<div align="center">
  <p>Made with ❤️ by the Filmify Team</p>
  <p>🎬 Launch Your Movie Online in Minutes</p>
</div>