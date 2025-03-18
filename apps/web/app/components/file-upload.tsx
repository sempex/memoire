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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // const getUploadUrlMutation = trpc.s3.getUploadUrl.useMutation();
  // getUploadUrlMutation.mutate({
  //   fileName: "test.jpg",
  //   expiration: 60 * 60 * 60 * 24,
  //   contentType: "image/jpeg",
  // });

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
    setFiles([...files, ...e.dataTransfer.files]);
    // In a real app, you would handle file upload here
  };
  const getUploadUrlsMutation = trpc.s3.getUploadUrls.useMutation();
  const upload = (files: File[]) => {
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
            console.log(data);
          },
          onError: (error) => {
            console.error(error);
          },
        }
      );
    } catch (error) {
      console.error(error);
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
                  <CardTitle className="mb-1 text-black">{file.name}</CardTitle>
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
