"use client";
import { trpc } from "@/app/utils/trpc";
import { basename } from "path";
import { use } from "react";

type Pageparams = {
  params: Promise<{
    shareUser: string;
    shareId: string;
  }>;
};

export default function Page({ params }: Pageparams) {
  const resolvedParams = use(params);
  const { shareUser, shareId } = resolvedParams;

  const listFiles = trpc.s3.listFiles.useQuery({ shareUser, shareId });
  const { data } = listFiles;

  console.log(data);

  return (
    <div>
      <h1>Share Details</h1>
      <p>User: {shareUser}</p>
      <p>ID: {shareId}</p>
      <div>
        Files:{" "}
        {data?.map((file) => {
          if ("name" in file) {
            return <p key={file.name}>{basename(file.name)}</p>;
          }
        })}
      </div>
    </div>
  );
}
