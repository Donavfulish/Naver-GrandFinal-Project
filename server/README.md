# Server Setup

## Prerequisites

- Node.js (v18+)
- PostgreSQL (v14+)

## Database Setup

### 1. Create Database

```bash
# Using PostgreSQL CLI
createdb naver_spaces

# Or using psql
psql -U postgres -c "CREATE DATABASE naver_spaces;"
```

### 2. Environment Variables

Create a `.env` file in the `server` directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/naver_spaces?schema=public"
NAVER_CLOVA_STUDIO_API_KEY="your-naver-clova-studio-api-key"
```

Replace `username` and `password` with your PostgreSQL credentials.
Replace `your-naver-clova-studio-api-key` with your NAVER CLOVA Studio API key from NAVER Cloud Platform.

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Migrations

```bash
```

This will:
- Apply all database migrations
- Generate Prisma Client
- Create all tables and relationships

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run db:migrate` | Run database migrations |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:studio` | Open Prisma Studio (database GUI) |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:reset` | Reset database (⚠️ deletes all data) |

## Database Schema

The database includes the following models:
- **User** - User accounts with authentication
- **Space** - User workspaces with customization
- **Playlist** - Music playlists with Spotify integration
- **Track** - Individual songs
- **Tag** - Emotion/mood categorization
- **Clock** - Clock widget customization
- **Widget Position** - UI state persistence

See `prisma/schema.prisma` for the complete schema.

## Troubleshooting

**Migration issues:**
```bash
npx prisma migrate status  # Check migration status
npx prisma migrate resolve --applied <migration_name>  # Mark migration as applied
```

**Database connection issues:**
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Ensure database exists
