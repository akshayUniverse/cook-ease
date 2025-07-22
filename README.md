# 🍽️ FoodToday - Smart Recipe App

A modern, multi-language recipe application with personalized suggestions, ingredient-based search, and worldwide recipe discovery.

## ✨ Features

- 🌍 **Multi-Language Support** - English and Hindi
- 🎯 **Personalized Suggestions** - AI-powered recipe recommendations
- 🔍 **Smart Search** - Search by ingredients, cuisine, or preferences
- 📱 **PWA Ready** - Install as mobile app
- 🥗 **Dietary Preferences** - Vegetarian, vegan, allergy filtering
- 💾 **Save & Like** - Personal recipe library
- 🛒 **Shopping Lists** - Plan your grocery shopping
- 🌐 **Worldwide Recipes** - Access to global cuisine

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd cook-ease

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Set up database
npx prisma db push
npm run seed-real

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** SQLite (dev) / PostgreSQL (prod)
- **Authentication:** JWT
- **External APIs:** TheMealDB, Spoonacular, Pexels, Unsplash
- **Deployment:** Vercel

## 📱 PWA Features

- Offline functionality
- App-like experience
- Install prompt
- Push notifications (coming soon)

## 🌍 Multi-Language

Currently supports:
- 🇺🇸 English
- 🇮🇳 हिन्दी (Hindi)

More languages coming soon!

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel:
```bash
npm i -g vercel
vercel login
vercel
```

## 📁 Project Structure

See [PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md) for detailed architecture documentation.

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with sample data
- `npm run seed-real` - Seed database with real API data

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [TheMealDB](https://www.themealdb.com/) for recipe data
- [Spoonacular](https://spoonacular.com/) for nutrition information
- [Pexels](https://pexels.com/) and [Unsplash](https://unsplash.com/) for images
- [Vercel](https://vercel.com/) for hosting
- [Prisma](https://prisma.io/) for database management

---

**Made with ❤️ for food lovers around the world!**
