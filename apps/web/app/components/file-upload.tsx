import { useState, useRef } from "react";
import { trpc } from "../utils/trpc";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { filesize } from "filesize";
import { nanoid } from "nanoid";
import { Progress } from "@/components/ui/progress";

// Chunk size for multipart upload (5MB)
const CHUNK_SIZE = 5 * 1024 * 1024;

type Filehandler = {
  file: File;
  status: string;
  progress: number;
};

export default function SimpleMultipartUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<Record<string, Filehandler>>({});
  const userUploadId = nanoid();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // In a real app, you would handle file upload here
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // tRPC mutations
  const initiateUpload = trpc.s3.initiateMultipartUpload.useMutation();
  const getPartUrl = trpc.s3.getPartUploadUrl.useMutation();
  const completeUpload = trpc.s3.completeMultipartUpload.useMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const updatedFiles = { ...files };

      Array.from(e.target.files).forEach((file) => {
        updatedFiles[file.name] = {
          file: file,
          status: "selected",
          progress: 0,
        };
      });

      setFiles(updatedFiles);
    }
  };

  const uploadFile = async (file: File) => {
    if (!file) return;

    try {
      let updatedFiles = { ...files };
      updatedFiles[file.name].status = "Initiating upload...";
      setFiles(updatedFiles);
      // Step 1: Initiate multipart upload
      const { uploadId, objectName } = await initiateUpload.mutateAsync({
        fileName: file.name,
        contentType: file.type,
        uploadId: userUploadId,
      });

      // Calculate total parts
      const parts: { part: number; etag: string }[] = [];
      const numParts = Math.ceil(file.size / CHUNK_SIZE);

      // Step 2: Upload each part
      for (let i = 0; i < numParts; i++) {
        const part = i + 1;
        let updatedFiles = { ...files };
        updatedFiles[file.name].status =
          `Uploading part ${part} of ${numParts}...`;
        setFiles(updatedFiles);

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
        updatedFiles = { ...files };
        updatedFiles[file.name].progress = Math.round((part / numParts) * 100);
        setFiles(updatedFiles);
      }

      // Step 3: Complete multipart upload
      updatedFiles = { ...files };
      updatedFiles[file.name].status = "Completing upload...";
      setFiles(updatedFiles);

      await completeUpload.mutateAsync({
        objectName,
        uploadId,
        parts,
      });

      updatedFiles = { ...files };
      updatedFiles[file.name].status = "Upload completed successfully!";
      updatedFiles[file.name].progress = 100;

      setFiles(updatedFiles);
    } catch (error) {
      console.error("Upload failed:", error);
      const updatedFiles = { ...files };
      updatedFiles[file.name].status =
        `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`;
      setFiles(updatedFiles);
    }
  };

  const uploadFiles = async () => {
    const uploadPromises = Object.values(files).map((file) =>
      uploadFile(file.file)
    );
    await Promise.all(uploadPromises);
  };

  return (
    <motion.div
      className={`gap-3 mt-8 p-8 border-2 border-dashed rounded-xl transition-all ${
        isDragging ? "border-primary bg-primary/5" : "border-border"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      whileHover={{ scale: 1.01 }}
      animate={isDragging ? { scale: 1.02 } : { scale: 1 }}
    >
      <div className="flex items-center justify-center gap-3">
        <Button
          className="cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          Browse Files
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
          />
        </Button>
        <Button
          onClick={() => uploadFiles()}
          className="rounded cursor-pointer"
          // disabled={progress > 0 && progress < 100}
          variant="outline"
        >
          Upload
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4">
        {Object.values(files).map((file) => (
          <Card key={file.file.name}>
            <CardContent>
              <p className="font-bold">{file.file.name}</p>
              <p className="text-secondary-foreground">
                <span className="font-semibold">size: </span>
                {filesize(file.file.size)}
              </p>
              <Progress value={file.progress} />
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
