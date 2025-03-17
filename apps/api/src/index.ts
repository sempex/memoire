import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { userRouter } from './routers/user';
import { router } from './trpc';


export const appRouter = router({
  user: userRouter,
});

export type AppRouter = typeof appRouter;

const app = express();
const PORT = 4000;

// Enable CORS
app.use(cors({
  origin: ['http://localhost:3000'], // Allow your Next.js app origin
  credentials: true,
}));

// Add tRPC API endpoint
app.use(
  '/api/trpc',
  createExpressMiddleware({
    router: appRouter,
  })
);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});