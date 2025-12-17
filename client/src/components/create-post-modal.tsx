"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { AxiosError } from "axios";
import axiosInstance from "@/http/axios";
import { useAppStore } from "@/store";

interface ModalType {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreatePostModal = ({ isOpen, onOpenChange }: ModalType) => {
  const { getUserInfo } = useAppStore();
  const [file, setFile] = useState<any | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      setFile(droppedFile);
    } else {
      toast.error("Only image files are supported.");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setFile(selectedFile);
    } else {
      toast.error("Only image files are supported.");
    }
  };

  const handleImageClear = () => {
    setFile(null);
    setDescription("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOpenFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleCreatePost = async () => {
    setIsLoading(true);
    try {
      if (!file) {
        return toast.error("Please select photo to continue.");
      }
      const formData = new FormData();
      formData.append("post", file);
      formData.append("content", description);

      await axiosInstance.post("/posts", formData);
      onOpenChange(false);
      handleImageClear();
      getUserInfo();
      toast.success("Your post created succesfully.");
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message ||
            "Something went wrong. Please try again."
          : "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="lg:max-w-4xl w-[95%] sm:w-[90%] h-[95%] sm:h-[90%] max-h-[50rem] bg-card p-0 overflow-hidden flex flex-col">
        <DialogHeader className="flex items-center justify-between px-4 sm:px-6 py-3 border-b bg-white/70 dark:bg-black/30 backdrop-blur-xl top-0">
          <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Post
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 flex justify-center items-center overflow-auto p-4">
          {file && previewUrl ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                className="max-w-full max-h-full object-contain rounded-lg"
                src={previewUrl || "/placeholder.svg"}
                alt="Preview"
              />
              <button
                type="button"
                onClick={handleImageClear}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-background transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div
              className={`relative group cursor-pointer w-full h-full flex flex-col items-center justify-center
                         ${isDragging ? "border-primary" : "border-border"}
                         border-2 border-dashed rounded-lg transition-colors duration-200`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleOpenFileInput}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
              />
              <div className="p-4 rounded-full bg-secondary">
                <ImagePlus className="h-6 w-6" />
              </div>
              <div className="text-center space-y-1 mt-4">
                <p className="text-sm font-medium">
                  Drag and drop your image here, or click to select
                </p>
                <p className="text-xs">Supports: JPG, PNG, GIF</p>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t">
          <Label htmlFor="description" className="sr-only">
            Description
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description..."
            className="w-full resize-none h-32 border-none !bg-transparent"
            rows={4}
          />
        </div>
        <DialogFooter className="p-2">
          <Button onClick={() => onOpenChange(false)} variant={"destructive"}>
            Close
          </Button>
          <Button
            onClick={handleCreatePost}
            disabled={(!file && !description.trim()) || isLoading}
            className="text-white"
          >
            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
