### ApniDukaan

Modern Next.js application with stateless JWT auth and Prisma PostgreSQL on Prisma Data Platform.

- **Production (Web App)**: `https://apnidukan-blue.vercel.app`
- **Backend**: Next.js App Router API routes (same domain as frontend)
- **Database**: Prisma PostgreSQL (hosted on Prisma Data Platform)

### Overview

- **Framework**: Next.js App Router (TypeScript, React 19)
- **Auth**: Stateless JWT (Bearer in Authorization header). Tokens stored client-side (localStorage)
- **DB**: Prisma ORM with PostgreSQL; Prisma Accelerate extension enabled
- **UI**: Radix components, Tailwind utilities, custom components

### Project Structure

```
app/
  api/
    auth/
      login/route.ts     # POST /api/auth/login
      signup/route.ts    # POST /api/auth/signup
      verify/route.ts    # GET  /api/auth/verify (Authorization: Bearer <token>)
      logout/route.ts    # POST /api/auth/logout
  auth/
    login/page.tsx       # Login page (uses AuthForm)
    signup/page.tsx      # Signup page (uses AuthForm)
components/
  auth-form.tsx          # Shared login/signup form (client component)
  auth-modal.tsx         # Modal variant of auth form
hooks/
  use-auth.tsx           # Auth context, verify/logout helpers
lib/
  auth.ts                # JWT helpers (sign/verify, get token from request)
  db.ts                  # Prisma-backed user helpers
  prisma.ts              # Prisma client (Accelerate)
prisma/
  schema.prisma          # Prisma schema (User model)
```

### Environment Variables

Create a `.env` file:

```bash
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"

# Auth
JWT_SECRET="replace-with-strong-secret"
JWT_EXPIRES_IN="7d"
```

Notes:
- The Prisma client output is configured in `prisma/schema.prisma`:
  - `generator client { output = "../generated/prisma" }`
  - This repo imports Prisma client from `../generated/prisma` in `lib/prisma.ts`.
- Ensure you run `prisma generate` after changing `schema.prisma`.

### Installation & Local Development

```bash
# Install deps
pnpm install

# Generate Prisma client (required)
npx prisma generate

# (Optional) Run migrations locally
# npx prisma migrate dev --name init

# Start dev server
pnpm dev
```

Local app: `http://localhost:3000`

### Authentication API

- POST `/api/auth/signup`
  - Body (signup):
    ```json
    { "name": "John Doe", "email": "john@example.com", "password": "secret123" }
    ```
  - Response:
    ```json
    {
      "success": true,
      "token": "<JWT>",
      "user": { "id": "...", "email": "john@example.com", "name": "John Doe" }
    }
    ```

- POST `/api/auth/login`
  - Body (login):
    ```json
    { "email": "john@example.com", "password": "secret123" }
    ```
  - Response: same shape as signup

- GET `/api/auth/verify`
  - Headers: `Authorization: Bearer <JWT>`
  - Response:
    ```json
    {
      "authenticated": true,
      "user": { "id": "...", "email": "john@example.com", "name": "John Doe" }
    }
    ```

- POST `/api/auth/logout`
  - Stateless logout; returns `{ "success": true }`. Client is responsible for clearing the token.

### Frontend Auth Flow

- On successful login/signup, the client stores the JWT in `localStorage` as `auth-token`.
- `hooks/use-auth.tsx` sends `Authorization: Bearer <token>` to `/api/auth/verify`.
- Logout clears `auth-token` and optionally calls `/api/auth/logout` (no-op on server).

### Database

- Hosted on Prisma Data Platform (PostgreSQL).
- Update `DATABASE_URL` accordingly. SSL is recommended in production (`?sslmode=require`).
- Prisma schema (excerpt):
  ```prisma
  model User {
    id          String   @id @default(uuid())
    email       String   @unique
    password    String
    name        String?
    shopName    String?
    shopAddress String?
    shopCity    String?
    shopState   String?
    isOnboarded Boolean  @default(false)
    shopCountry String?
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt
  }
  ```

### Deployment

- Hosted on Vercel: `https://apnidukan-blue.vercel.app`
- Set the same environment variables in Vercel Project Settings:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `JWT_EXPIRES_IN` (optional, default: `7d`)
- Ensure `npx prisma generate` runs during build (Next.js automatically runs `postinstall`; otherwise add a script/hook).

### Scripts

```bash
pnpm dev     # start dev server
pnpm build   # build for production
pnpm start   # run production build
pnpm lint    # lint
```

### Security Notes

- Use a strong `JWT_SECRET`.
- Consider rotating tokens and using refresh flows for long-lived sessions.
- Do not expose `DATABASE_URL` or secrets in the client or commit history.

### Troubleshooting

- Prisma client not found:
  - Run `npx prisma generate`
  - Ensure `generator client` output matches `lib/prisma.ts` import (`../generated/prisma`)
- 401 on `/api/auth/verify`:
  - Ensure the client sends `Authorization: Bearer <JWT>`
  - Check `JWT_SECRET` consistency across environments
