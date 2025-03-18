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

type getUploadUrlsResponse = {
  uploadId: string;
  key: string;
  presignedUrls: string[];
}[];

export const s3Router = router({
  // Query to get all users
  getUploadUrls: protectedProcedure
    .input(
      z.array(
        z.object({
          fileName: z.string(),
          filesize: z.number(),
          contentType: z.string(),
          partCount: z.number(),
        })
      )
    )
    .mutation(async ({ input, ctx }) => {
      // expiration is in seconds
      const user = ctx.auth;
      const response: getUploadUrlsResponse = [];
      const uploadId = nanoid();

      for (const file of input) {
        const objectName = `${user.userId}/${uploadId}/${file.fileName}`;
        const s3UploadId = await mc.initiateNewMultipartUpload(
          bucketName,
          objectName,
          {
            "Content-Type": file.contentType,
          }
        );
        const presignedUrls = [];
        for (let i = 1; i <= file.partCount; i++) {
          const presignedUrl = await mc.presignedPutObject(
            bucketName,
            objectName,
            24 * 60 * 60
          );
          presignedUrls.push(presignedUrl);
        }
        console.log({ uploadId, objectName, presignedUrls });
        response.push({
          uploadId: s3UploadId,
          key: objectName,
          presignedUrls,
        });
      }
      console.log(response);
      return response;
    }),
});
