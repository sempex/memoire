import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc/trpc";
import { Client } from "minio";
import { nanoid } from "nanoid";

const mc = new Client({
  endPoint: process.env.S3_ENDPOINT || "s3.rebertim.cm",
  port: Number(process.env.S3_PORT) || 443,
  useSSL: true,
  accessKey: process.env.S3_ACCESS_KEY,
  secretKey: process.env.S3_SECRET_KEY,
});

const bucketName = process.env.S3_BUCKET_NAME || "memoire";

export const s3Router = router({
  // Query to get all users
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        contentType: z.string(),
        expiration: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
// expiration is in seconds
      const { fileName, contentType, expiration } = input;
      const user = ctx.auth;
      const uploadId = nanoid();

      const objectName = `${user.userId}/${uploadId}/${fileName}`;

      const uploadUrl = await mc.presignedPutObject(
        bucketName,
        objectName,
        expiration
      );

      return { uploadUrl, fileUrl: objectName };
    }),
});
