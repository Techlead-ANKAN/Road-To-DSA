# Road to DSA Backend

Node.js + Express API with MongoDB persistence for the Road to DSA application.

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env` and set `MONGO_URI`, `PORT`, and `JWT_SECRET` (placeholder until auth is expanded).
3. Import the course data:
   ```
   npm run import:course
   ```
4. Start the API server:
   ```
   npm run dev
   ```

## Scripts

- `npm run dev` – start the API with nodemon
- `npm run start` – start the API in production mode
- `npm run lint` – run ESLint
- `npm run import:course` – load Striver's A2Z DSA structure into MongoDB
- `npm run init:progress` – clone the canonical course into a Progress document for a user (requires `--user=<id>` and optional `--course=<id>`)

## API overview

- `GET /api/course` – course overview with metadata
- `GET /api/course/:stepIndex` – single step with topics and problems
- `POST /api/users` – create or update a user by email
- `GET /api/users/:userId` – retrieve user details
- `POST /api/progress/init` – create progress scaffold for user + course
- `GET /api/progress/:userId` – progress summary with step + difficulty metrics
- `POST /api/progress/mark` – toggle problem completion
- `POST /api/progress/saveCode` – save solution code and notes
- `GET /api/progress/export/:userId` – download solved problems as CSV

## Notes

- The canonical course JSON is stored in full under `raw_source` for traceability.
- Mongoose schemas add indexes on `userId` and `courseId` for progress lookups.
- Keep problem names and hierarchy identical to the source JSON when importing.
