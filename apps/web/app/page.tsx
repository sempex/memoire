"use client";

import { trpc } from "./utils/trpc";

export default function Home() {
  const { data } = trpc.user.getAll.useQuery();
  const byId = trpc.user.getById.useQuery({ id: 1 });

  return (
    <>
      <div>{data} hello</div>
      <div>{byId.data?.name}</div>
    </>
  );
}
