import express from "express";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { router } from "./trpc/trpc";
import { clerkMiddleware, getAuth } from "@clerk/express";
import "dotenv/config";
import { s3Router } from "./routers/s3";

export const appRouter = router({
  s3: s3Router,
});

export type AppRouter = typeof appRouter;

const app = express();
const PORT = 4000;

// Enable CORS
app.use(
  cors({
    origin: [
      "http://localhost:3000, https://memoire.rebertim.com, https://memoire.on.shiper.app",
    ], // Allow your Next.js app origin
    credentials: true,
  }),
);

// Add tRPC API endpoint
app.use(clerkMiddleware());

const createContext = ({
  req,
  res,
}: {
  req: express.Request;
  res: express.Response;
}) => {
  const auth = getAuth(req); // Extract authentication details
  return { auth, req, res }; // Pass authentication to context
};

export type Context = ReturnType<typeof createContext>;

app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

app.use("/", (req, res) => {
  res.send("memoire backend");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
