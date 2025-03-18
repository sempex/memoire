"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { filesize } from "filesize";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { trpc } from "../utils/trpc";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

export default function FileUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const getUploadUrlsMutation = trpc.s3.mulitpartUpload.useMutation();
  const completeUploadUrlsMutation =
    trpc.s3.completeMultipartUpload.useMutation();

  type PresignedUrlData = {
    fileName: string;
    uploadId: string;
    key: string;
    presignedUrls: string[];
  }[];

  // Make sure this matches exactly what the API expects
  type CompleteUploadInput = {
    fileName: string;
    uploadId: string;
    key: string;
    etags: string[]; // Simple string array, not PartETag objects
    expiration: number;
  };

  const processUpload = async (data: PresignedUrlData) => {
    const completedUploads: CompleteUploadInput[] = [];
    const newUploadStatus = { ...uploadStatus };

    for (const file of files) {
      try {
        newUploadStatus[file.name] = "uploading";
        setUploadStatus({ ...newUploadStatus });

        const partCount = Math.ceil(file.size / CHUNK_SIZE);
        const etags: string[] = [];
        const fileData = data.find(
          (dataFile) => dataFile.fileName === file.name
        );

        if (!fileData) {
          console.error(`No file data found for ${file.name}`);
          newUploadStatus[file.name] = "error";
          setUploadStatus({ ...newUploadStatus });
          continue;
        }

        let allPartsUploaded = true;

        for (let i = 0; i < partCount; i++) {
          const start = i * CHUNK_SIZE;
          const end = Math.min(file.size, start + CHUNK_SIZE);
          const chunk = file.slice(start, end);
          const presignedUrl = fileData.presignedUrls[i];

          if (!presignedUrl) {
            console.error(`No presigned URL for part ${i + 1} of ${file.name}`);
            allPartsUploaded = false;
            break;
          }

          try {
            // Upload the chunk
            const uploadResponse = await fetch(presignedUrl, {
              method: "PUT",
              body: chunk,
              headers: {
                "Content-Type": file.type,
              },
            });

            if (!uploadResponse.ok) {
              console.error(
                `Upload failed with status: ${uploadResponse.status}`
              );
              throw new Error(
                `Failed to upload part ${i + 1} of ${file.name}: ${uploadResponse.statusText}`
              );
            }

            // Get the ETag header
            const etag = uploadResponse.headers.get("etag");
            if (!etag) {
              console.error(`No ETag received for part ${i + 1}`);
              throw new Error(
                `No ETag received for part ${i + 1} of ${file.name}`
              );
            }

            // Store the ETag without quotes
            const cleanEtag = etag.replace(/^"(.+)"$/, "$1");
            console.log(`Part ${i + 1} ETag: ${cleanEtag}`);
            etags.push(cleanEtag);

            console.log(
              `Part ${i + 1}/${partCount} uploaded for ${file.name}, ETag: ${cleanEtag}`
            );
          } catch (error) {
            console.error(
              `Error uploading part ${i + 1} of ${file.name}:`,
              error
            );
            allPartsUploaded = false;
            break;
          }
        }

        if (allPartsUploaded) {
          completedUploads.push({
            fileName: file.name,
            key: fileData.key,
            etags: etags,
            uploadId: fileData.uploadId,
            expiration: 24 * 60 * 60, // 24 hours in seconds
          });

          newUploadStatus[file.name] = "processed";
        } else {
          newUploadStatus[file.name] = "error";
        }

        setUploadStatus({ ...newUploadStatus });
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        newUploadStatus[file.name] = "error";
        setUploadStatus({ ...newUploadStatus });
      }
    }

    if (completedUploads.length > 0) {
      try {
        console.log(
          "Completing uploads with data:",
          JSON.stringify(completedUploads)
        );

        completeUploadUrlsMutation.mutate(completedUploads, {
          onSuccess: (data) => {
            console.log("Successfully completed uploads:", data);

            // Update status for successfully completed files
            const finalStatus = { ...newUploadStatus };
            completedUploads.forEach((file) => {
              finalStatus[file.fileName] = "completed";
            });
            setUploadStatus(finalStatus);
          },
          onError: (error) => {
            console.error("Error completing multipart upload:", error);
            console.error("Error details:", JSON.stringify(error, null, 2));

            // Mark files as failed
            const finalStatus = { ...newUploadStatus };
            completedUploads.forEach((file) => {
              finalStatus[file.fileName] = "failed";
            });
            setUploadStatus(finalStatus);
          },
        });
      } catch (error) {
        console.error("Error in complete upload mutation:", error);
      }
    }
  };

  // Rest of component unchanged...

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
    const newFiles = Array.from(e.dataTransfer.files);
    setFiles([...files, ...newFiles]);
  };

  const upload = (files: File[]) => {
    if (files.length === 0) return;

    try {
      getUploadUrlsMutation.mutate(
        files.map((file) => {
          return {
            fileName: file.name,
            contentType: file.type,
            filesize: file.size,
            partCount: Math.ceil(file.size / CHUNK_SIZE),
          };
        }),
        {
          onSuccess: (data) => {
            processUpload(data);
          },
          onError: (error) => {
            console.error("Error getting upload URLs:", error);
            const newStatus: Record<string, string> = {};
            files.forEach((file) => {
              newStatus[file.name] = "failed";
            });
            setUploadStatus({ ...uploadStatus, ...newStatus });
          },
        }
      );
    } catch (error) {
      console.error("Error initiating upload:", error);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "uploading":
        return "text-blue-500";
      case "processed":
        return "text-yellow-500";
      case "completed":
        return "text-green-500";
      case "failed":
      case "error":
        return "text-red-500";
      default:
        return "";
    }
  };

  return (
    <motion.div
      className={`mt-8 p-8 border-2 border-dashed rounded-xl transition-all ${
        isDragging ? "border-primary bg-primary/5" : "border-border"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      whileHover={{ scale: 1.01 }}
      animate={isDragging ? { scale: 1.02 } : { scale: 1 }}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <motion.div
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 2,
            repeatType: "reverse",
          }}
        >
          <Upload className="h-12 w-12 text-primary" />
        </motion.div>
        <p className="text-center">
          <span className="font-medium">Drag & drop files here</span> or click
          to browse
        </p>
        <Button
          size="lg"
          className="cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          Browse Files
          <input
            type="file"
            placeholder="Upload Files"
            className="hidden"
            ref={fileInputRef}
            multiple
            onChange={(e) => {
              if (e.target.files) {
                setFiles([...files, ...Array.from(e.target.files)]);
              }
            }}
          />
        </Button>
        <Button onClick={() => upload(files)}>Upload</Button>
        <p className="text-xs text-muted-foreground">
          Upload up to 2GB for free. No registration required.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {files.map((file) => (
            <div key={file.name}>
              <Card className="px-12">
                <CardContent className="text-muted-foreground">
                  <CardTitle className="mb-1 text-black flex justify-between items-center">
                    <span>{file.name}</span>
                    {uploadStatus[file.name] && (
                      <span
                        className={`text-xs font-medium ${getStatusColor(uploadStatus[file.name])}`}
                      >
                        {uploadStatus[file.name]}
                      </span>
                    )}
                  </CardTitle>
                  <p>
                    <span className="font-semibold">size: </span>
                    {filesize(file.size)}
                  </p>
                  <p>
                    <span className="font-semibold">last edited: </span>
                    {new Date(file.lastModified)
                      .toLocaleDateString()
                      .replace(/\//g, ".")}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
