import { z } from 'zod';
import { protectedProcedure, publicProcedure, router } from '../trpc/trpc';
import { TRPCError } from '@trpc/server';

const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' },
];

export const userRouter = router({
  // Query to get all users
  getAll: protectedProcedure.query(({ctx}) => {
    return ctx.auth?.userId
  }),
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => {
      const user = users.find(u => u.id === input.id);
      if (!user) {
        throw new Error(`No user with ID ${input.id}`);
      }
      return user;
    }),
});