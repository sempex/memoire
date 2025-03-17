"use client";

import { trpc } from "./utils/trpc";

export default function Home() {
  const {data} = trpc.user.getById.useQuery({id: 1});
  return (
    <div>
      {
        data?.name
      }
    </div>  );
}
