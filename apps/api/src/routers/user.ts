import { z } from 'zod';
import { procedure, router } from '../trpc';

const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' },
];

export const userRouter = router({
  // Query to get all users
  getAll: procedure.query(() => {
    return users;
  }),
  
  // Query to get a user by ID
  getById: procedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => {
      const user = users.find(u => u.id === input.id);
      if (!user) {
        throw new Error(`No user with ID ${input.id}`);
      }
      return user;
    }),
});