import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc/trpc";
import { Client } from "minio";
import { nanoid } from "nanoid";
import path from "path";

const mc = new Client({
  endPoint: process.env.S3_ENDPOINT || "s3.rebertim.com",
  port: Number(process.env.S3_PORT) || 443,
  useSSL: true,
  accessKey: process.env.S3_ACCESS_KEY,
  secretKey: process.env.S3_SECRET_KEY,
});

const bucketName = process.env.S3_BUCKET_NAME || "memoire";

type multiPartUploadResponse = {
  uploadId: string;
  key: string;
  presignedUrls: string[];
  fileName: string;
}[];

type completeMultipartUploadResponse = {
  url: string;
  key: string;
}[];

export const s3Router = router({
  // Query to get all users
  mulitpartUpload: protectedProcedure
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
      const response: multiPartUploadResponse = [];
      const folderUploadId = nanoid();

      for (const file of input) {
        const objectName = `${user.userId}/${folderUploadId}/${file.fileName}`;
        const s3UploadId = await mc.initiateNewMultipartUpload(
          bucketName,
          objectName,
          {
            "Content-Type": file.contentType,
          }
        );

        const presignedUrls = [];
        for (let i = 1; i <= file.partCount; i++) {
          // Generate presigned URLs for the actual part uploads, not separate objects
          const presignedUrl = await mc.presignedPutObject(
            bucketName,
            objectName, // Use the same object name for all parts
            24 * 60 * 60
          );
          presignedUrls.push(presignedUrl);
        }

        console.log({ uploadId: s3UploadId, objectName, presignedUrls });
        response.push({
          uploadId: s3UploadId,
          key: objectName,
          presignedUrls,
          fileName: path.basename(objectName),
        });
      }
      return response;
    }),
  completeMultipartUpload: protectedProcedure
    .input(
      z.array(
        z.object({
          uploadId: z.string(),
          key: z.string(),
          etags: z.array(z.string()),
          expiration: z.number(),
        })
      )
    )
    .mutation(async ({ input, ctx }) => {
      console.log("Starting multipart upload completion");
      const response: completeMultipartUploadResponse = [];

      for (const file of input) {
        try {
          const parts = file.etags.map((etag, index) => ({
            etag,
            part: index + 1,
          }));

          console.log("Parts for completion:", JSON.stringify(parts));
          console.log("Bucket:", bucketName);
          console.log("Key:", file.key);
          console.log("UploadId:", file.uploadId);

          await mc.completeMultipartUpload(
            bucketName,
            file.key,
            file.uploadId,
            parts
          );

          const url = await mc.presignedGetObject(
            bucketName,
            file.key,
            file.expiration
          );

          response.push({
            url,
            key: file.key,
          });

          console.log("Successfully completed multipart upload for:", file.key);
        } catch (error) {
          console.error("Error completing multipart upload:", error);
          throw error; // Re-throw to be caught by tRPC error handling
        }
      }

      return response;
    }),
});
