# Mensa Süd | Uni Rostock

A modern, minimalist web application for viewing the daily menu of **Mensa Süd** at the University of Rostock. This project provides a clean, user-friendly interface to navigate daily meals, allergies, and pricing information.

## 🌟 Features

- **Real-time Scraper**: Automatically fetches the latest menu data from the official Studentwerk Rostock website.
- **AI-Powered Refinement**: Integrates with Google Gemini to process and categorize raw menu data for better accuracy and readability.
- **Detailed Information**: Provides pricing (Student/Staff/Guest) and allergen labels for every meal.
- **Fully Responsive**: Optimized for both desktop and mobile devices.

## 🛠️ Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Scraping**: [Cheerio](https://cheerio.js.org/)
- **AI Engine**: [Google Gemini Pro API (@google/genai)](https://ai.google.dev/docs)
- **Deployment**: Ready for Docker and Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A Google Gemini API Key

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/kankaku/mensa-menu.git
   cd mensa-menu
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory:

   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🐳 Docker Support

To run the application using Docker:

```bash
docker-compose up -d
```

## 📄 License

This project is private and intended for use within the **Kankaku** organization.

---

Built with ❤️ from [Kankaku](https://github.com/kankaku)
