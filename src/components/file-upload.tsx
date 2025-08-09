"use client";

import { X, Upload } from "lucide-react";
import Image from "next/image";

/**
 * File Upload Component
 * 
 * This component provides a basic file upload interface with preview functionality.
 * Currently uses HTML5 File API to create temporary object URLs for file previews.
 * 
 * Note: Files are not actually uploaded to a server - this is just for preview/display.
 * For persistent file storage, integrate with a service like AWS S3, Cloudinary, or similar.
 */
interface FileUploadProps {
  onChange: (url?: string) => void;
  value: string;
  endpoint: "messageFile" | "serverImage";
}

export const FileUpload = ({
  onChange,
  value,
  endpoint
}: FileUploadProps) => {
  const fileType = value?.split(".").pop();

  if (value && fileType !== "pdf") {
    return (
      <div className="relative h-20 w-20">
        <Image
          fill
          src={value}
          alt="Upload"
          className="rounded-full"
        />
        <button
          onClick={() => onChange("")}
          className="bg-rose-500 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center w-full">
      <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-32 h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <Upload className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold">Click to upload</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {endpoint === "messageFile" ? "Images, PDFs, Documents" : "Images only"}
          </p>
        </div>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              // Create a temporary object URL for file preview
              // Note: This is just for display - file is not uploaded anywhere
              const url = URL.createObjectURL(file);
              onChange(url);
            }
          }}
          accept={endpoint === "messageFile" ? "*/*" : "image/*"}
        />
      </label>
    </div>
  )
}