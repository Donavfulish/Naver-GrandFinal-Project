# AuraSpace

AuraSpace aims to provide personalized digital environments that can help people regulate their emotions. Users emerge into a mood-adaptive space, which is created by AI by inputting prompt text, that instantly visualizes their feelings. Inside, they customize fonts, backgrounds, and music to comfortably capture and dump their emotions. This flexibility fosters deep expression and release. Finally, the system analyzes these notes to provide post-session insights, ensuring users gain meaningful reflection and actionable closure from their experience.

## Features

- **AI-Powered Space Generation**: Generate personalized digital environments based on text prompts using AI.
- **Emotion Capture & Dumping**: A dedicated space for users to express and record their emotions.
- **Mood-Adaptive Environment**: Visuals and atmosphere change to reflect the user's feelings.
- **Emotional loop closure**: Every emotional state and session is captured, analyzed, and integrated into the user's personal profile, providing deep, continuous emotional analytics (insights) and ensuring no experience is 'lost', driving long-term engagement.
- **Customization**:
    - **Backgrounds**: Change backgrounds manually or generate them via AI.
    - **Fonts**: Customize text appearance with various fonts or AI-suggested styles.
    - **Music**: Integrated music streaming to enhance the immersive experience.
- **Post-Session Insights**: AI analysis of user behaviours of that specific space to provide meaningful reflection and actionable closure.

## Tech Stack

### Client
- **Framework**: Next.js 16 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4, Framer Motion, Radix UI
- **State Management**: TanStack Query
- **Forms**: React Hook Form, Zod
- **HTTP Client**: Axios

### Server
- **Runtime**: Node.js
- **Framework**: Express.js 5
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: JWT, Bcryptjs
- **Validation**: Joi
- **Testing**: Jest, Supertest
- **Logging**: Winston

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- PostgreSQL database

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd Naver-GrandFinal-Project
    ```

2.  **Install Client Dependencies:**
    ```bash
    cd client
    npm install
    ```

3.  **Install Server Dependencies:**
    ```bash
    cd ../server
    npm install
    ```

### Database Setup

1.  Navigate to the `server` directory.
2.  Set up your `.env` file with your database connection string.
3.  Run database migrations and seed data:
    ```bash
    npm run db:setup
    ```
    This command runs `db:migrate` and `db:seed`.

4.  Initialize system data (tracks, backgrounds, fonts):
    ```bash
    npm run db:init
    ```

### Running the Application

1.  **Start the Server:**
    ```bash
    cd server
    npm run dev
    ```

2.  **Start the Client:**
    ```bash
    cd client
    npm run dev
    ```
    The client will start at `http://localhost:3000` (or similar).

## Environment Variables

Create a `.env` file in the `server` directory. Common variables include:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/auraspace?schema=public"
PORT=8080
JWT_SECRET="your_jwt_secret"
# Add other necessary API keys (e.g., for AI services like Naver Clova)
```

## Project Structure

```
Naver-GrandFinal-Project/
├── client/                 # Next.js Frontend
│   ├── app/                # App Router
│   ├── components/         # UI Components
│   └── ...
├── server/                 # Express Backend
│   ├── src/
│   │   ├── db/             # Prisma & Seeders
│   │   ├── routes/         # API Routes
│   │   └── ...
│   ├── prisma/             # Prisma Schema
│   └── ...
└── README.md
```