import { trpc } from "./utils/trpc";

export default function Home() {
  const data = trpc.user.getAll.useQuery();
  return (
    <>{data}</>
  );
}