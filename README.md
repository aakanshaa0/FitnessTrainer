# AI Fitness Trainer

A Next.js application that generates personalized fitness programs using AI. The app creates custom workout and diet plans based on user input, including age, fitness level, goals, and dietary restrictions.

## Features

- **AI-Generated Workout Plans**: Custom exercise routines tailored to your fitness level and goals
- **Personalized Diet Plans**: Nutrition recommendations with calorie targets and meal suggestions
- **Voice Interface**: Interactive voice conversations to collect fitness information
- **User Authentication**: Secure login and profile management
- **Progress Tracking**: Save and view your generated fitness programs

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **Authentication**: Clerk
- **AI**: Google Gemini API
- **Voice**: Vapi AI
- **Database**: MongoDB
- **UI Components**: Radix UI, Lucide React

## Getting Started

### Installation

1. Clone the repository
```bash
git clone [<repository-url>](https://github.com/aakanshaa0/FitnessTrainer.git)
cd FitnessTrainer
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

# Vapi AI (Voice Interface)
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_vapi_assistant_id
NEXT_PUBLIC_VAPI_API_KEY=your_vapi_api_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Environment
NODE_ENV=development
```

4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Usage

1. **Sign up/Login**: Create an account or sign in to access the app
2. **Generate Program**: Click "Build Your Program" to start creating your fitness plan
3. **Voice Input**: Use the voice interface to provide your fitness information
4. **Review Plan**: Get your personalized workout and diet plan
5. **Save & Track**: Save your program and track your progress

## API Endpoints

- `POST /api/generate-program` - Generate fitness programs using AI
- `GET /api/user-plans` - Retrieve user's saved fitness plans

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── (auth)/           # Authentication pages
│   ├── api/              # API routes
│   ├── generate-program/ # Program generation page
│   └── profile/          # User profile page
├── components/            # React components
├── constants/             # App constants and sample data
├── lib/                   # Utility libraries
└── middleware.ts          # Auth middleware
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
