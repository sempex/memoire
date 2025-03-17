import type { AppRouter } from "../../../api/src"
import { createTRPCReact } from '@trpc/react-query'; 

const trpc = createTRPCReact<AppRouter>();

export { trpc };

export const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      // Browser should use the API directly
      return 'http://localhost:4000';
    }
    
    // Server-side rendering should use the internal URL
    // If your backend is on a different server, you'll need to adjust this
    return process.env.INTERNAL_API_URL || 'http://localhost:4000';
  };