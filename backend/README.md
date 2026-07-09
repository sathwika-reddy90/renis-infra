# RENISINFRA Backend

Backend foundation — **Express · TypeScript · Prisma · PostgreSQL**.

Layered architecture: `Controller → Service → Repository → Database`. Repositories
currently return **mock data**; business logic and the Prisma-backed data layer are
intentionally not wired yet.

## Scripts

```bash
npm install
cp .env.example .env
npm run prisma:generate   # generate Prisma client
npm run build             # prisma generate + tsc
npm run dev               # watch mode (tsx)
npm start                 # run compiled dist/
```

## Structure

```
src/
  config/        env loading & validation
  lib/           Prisma client singleton
  utils/         logger, ApiError, ApiResponse, asyncHandler
  middleware/    error handler, 404, request logger, validation
  types/         Zod schemas + inferred types per model
  repositories/  in-memory mock repositories (BaseRepository)
  services/      BaseService per model + site singleton
  controllers/   CRUD controller factory + site controller
  routes/        CRUD router factory + aggregate /api router
prisma/
  schema.prisma  10 models, enums, relations, indexes
```

## REST API

| Resource      | Path               |
| ------------- | ------------------ |
| Properties    | `/api/properties`  |
| Gallery       | `/api/gallery`     |
| Testimonials  | `/api/testimonials`|
| Team          | `/api/team`        |
| FAQs          | `/api/faqs`        |
| Blogs         | `/api/blogs`       |
| Contact       | `/api/contact`     |
| Site settings | `/api/site`        |
| Amenities     | `/api/amenities`   |
| Health        | `/health`          |

Each CRUD resource exposes `GET /`, `GET /:id`, `POST /`, `PUT/PATCH /:id`, `DELETE /:id`.
