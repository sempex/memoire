import type { AppRouter } from "@memoire/api/src/index";
import { createTRPCReact } from "@trpc/react-query";
import { env } from "next-runtime-env";

const trpc = createTRPCReact<AppRouter>();

export { trpc };

export const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // Browser should use the API directly
    return env("NEXT_PUBLIC_API_URL");
  }

  // Server-side rendering should use the internal URL
  // If your backend is on a different server, you'll need to adjust this
  return env("INTERNAL_API_URL") || env("NEXT_PUBLIC_API_URL");
};

