# Study Group Finder

A modern university collaboration platform built with a robust Full-Stack environment.

## Technologies
- **Frontend**: React 19, TypeScript, Tailwind CSS, shadcn/ui, Zustand, React Router, React Hook Form
- **Backend**: Express, Socket.io, Prisma ORM, JWT Authentication
- **Database**: Prisma + SQLite (Configurable to PostgreSQL)

## Setup instructions

### Local AI Studio Preview
The preview is running using an in-memory SQLite database via Prisma to allow hot-reloading and instant access.
Just press 'Run' or preview to see the app!
For local interactions, create a new account in the app and log in. You can also create groups or test chat functionality in real-time if multiple users join.

### Migration to PostgreSQL & Docker (Local/Production)
If you want to pull this code down and run it on a secure enterprise-level architecture:

1. Update `prisma/schema.prisma` provider:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Setup `docker-compose.yml` for PostgreSQL:
```yaml
version: '3.8'
services:
  db:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_USER: studygroup
      POSTGRES_PASSWORD: securepassword
      POSTGRES_DB: study_finder
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

3. Setup `.env`:
```env
DATABASE_URL="postgresql://studygroup:securepassword@localhost:5432/study_finder?schema=public"
JWT_SECRET="your-super-secret-key"
NODE_ENV="development"
```

4. Run migrations:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

5. Run Prisma Studio to view database:
```bash
npx prisma studio
```

Enjoy finding your study groups!
