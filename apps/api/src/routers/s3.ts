import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc/trpc";
import { Client } from "minio";
import { nanoid } from "nanoid";

// Initialize MinIO client
const mc = new Client({
  endPoint: process.env.S3_ENDPOINT || "s3.rebertim.cm",
  port: Number(process.env.S3_PORT) || 443,
  useSSL: true,
  accessKey: process.env.S3_ACCESS_KEY || "",
  secretKey: process.env.S3_SECRET_KEY || "",
});

const bucketName = process.env.S3_BUCKET_NAME || "memoire";

// This router handles S3 multipart upload operations
export const s3Router = router({
  // New method: Initiate multipart upload
  initiateMultipartUpload: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        contentType: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { fileName, contentType } = input;
      const user = ctx.auth;
      const uploadId = nanoid();
      const objectName = `${user.userId}/${uploadId}/${fileName}`;

      try {
        // Initiate the multipart upload in MinIO
        const uploadId = await mc.initiateNewMultipartUpload(
          bucketName,
          objectName,
          {
            "Content-Type": contentType,
          }
        );

        return {
          uploadId,
          objectName,
          bucketName,
        };
      } catch (error) {
        console.error("Error initiating multipart upload:", error);
        throw error;
      }
    }),

  // Get presigned URL for uploading a specific part
  getPartUploadUrl: protectedProcedure
    .input(
      z.object({
        objectName: z.string(),
        uploadId: z.string(),
        partNumber: z.number().int().positive(),
        expiration: z.number().default(3600),
      })
    )
    .mutation(async ({ input }) => {
      const { objectName, uploadId, partNumber, expiration } = input;

      try {
        // Generate presigned URL for this specific part
        const partUploadUrl = await mc.presignedUrl(
          "PUT",
          bucketName,
          objectName,
          expiration,
          {
            uploadId: uploadId,
            partNumber: partNumber.toString(),
          }
        );

        return { partUploadUrl };
      } catch (error) {
        console.error("Error generating part upload URL:", error);
        throw error;
      }
    }),

  // Complete the multipart upload after all parts are uploaded
  completeMultipartUpload: protectedProcedure
    .input(
      z.object({
        objectName: z.string(),
        uploadId: z.string(),
        parts: z.array(
          z.object({
            part: z.number().int().positive(),
            etag: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const { objectName, uploadId, parts } = input;

      try {
        // Complete the multipart upload
        await mc.completeMultipartUpload(
          bucketName,
          objectName,
          uploadId,
          parts
        );

        return {
          success: true,
          objectUrl: `${process.env.S3_PUBLIC_URL || ""}/${objectName}`,
        };
      } catch (error) {
        console.error("Error completing multipart upload:", error);
        throw error;
      }
    }),

  // Abort a multipart upload in case of errors
  abortMultipartUpload: protectedProcedure
    .input(
      z.object({
        objectName: z.string(),
        uploadId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { objectName, uploadId } = input;

      try {
        // Abort the multipart upload
        await mc.abortMultipartUpload(bucketName, objectName, uploadId);

        return { success: true };
      } catch (error) {
        console.error("Error aborting multipart upload:", error);
        throw error;
      }
    }),
});
