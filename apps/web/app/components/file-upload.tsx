import { useState, useRef } from "react";
import { trpc } from "../utils/trpc";

// Chunk size for multipart upload (5MB)
const CHUNK_SIZE = 5 * 1024 * 1024;

export default function SimpleMultipartUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // tRPC mutations
  const initiateUpload = trpc.s3.initiateMultipartUpload.useMutation();
  const getPartUrl = trpc.s3.getPartUploadUrl.useMutation();
  const completeUpload = trpc.s3.completeMultipartUpload.useMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setProgress(0);
      setStatus("File selected");
    }
  };

  const uploadFile = async () => {
    if (!file) return;

    try {
      setStatus("Initiating upload...");

      // Step 1: Initiate multipart upload
      const { uploadId, objectName } = await initiateUpload.mutateAsync({
        fileName: file.name,
        contentType: file.type,
      });

      // Calculate total parts
      const parts: { part: number; etag: string }[] = [];
      const numParts = Math.ceil(file.size / CHUNK_SIZE);

      // Step 2: Upload each part
      for (let i = 0; i < numParts; i++) {
        const part = i + 1;
        setStatus(`Uploading part ${part} of ${numParts}...`);

        // Get presigned URL for this part
        const { partUploadUrl } = await getPartUrl.mutateAsync({
          objectName,
          uploadId,
          partNumber: part,
          expiration: 3600,
        });

        // Prepare the part data
        const start = i * CHUNK_SIZE;
        const end = Math.min(file.size, start + CHUNK_SIZE);
        const chunk = file.slice(start, end);

        // Upload the part
        const response = await fetch(partUploadUrl, {
          method: "PUT",
          body: chunk,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload part ${part}`);
        }

        // Get ETag from response headers
        const etag = response.headers.get("etag")?.replace(/"/g, "") || "";
        parts.push({ part, etag });

        // Update progress
        setProgress(Math.round((part / numParts) * 100));
      }

      // Step 3: Complete multipart upload
      setStatus("Completing upload...");
      await completeUpload.mutateAsync({
        objectName,
        uploadId,
        parts,
      });

      setStatus("Upload completed successfully!");
      setProgress(100);
    } catch (error) {
      console.error("Upload failed:", error);
      setStatus(
        `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  return (
    <div className="p-4 border rounded">
      <h2 className="text-lg font-bold mb-4">Simple Multipart Upload</h2>

      <div className="mb-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="mb-2"
        />

        {file && (
          <div>
            <p>
              Selected file: {file.name} ({Math.round(file.size / 1024)} KB)
            </p>
            <button
              onClick={uploadFile}
              className="px-4 py-2 bg-blue-500 text-white rounded mt-2"
              disabled={progress > 0 && progress < 100}
            >
              Upload
            </button>
          </div>
        )}
      </div>

      {status && <p className="mb-2">{status}</p>}

      {progress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}
