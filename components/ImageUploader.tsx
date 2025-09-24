import React, { useCallback, useState } from 'react';
import type { ImageFile } from '../types';
import { UploadIcon } from './icons';

interface ImageUploaderProps {
  onImageUpload: (file: ImageFile) => void;
  uploadedFileName?: string;
  buttonText?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, uploadedFileName, buttonText = "Click to upload" }) => {
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, etc.).');
      return;
    }
    setError(null);
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      onImageUpload({ name: file.name, base64, mimeType: file.type });
      setIsUploading(false);
    };
    reader.onerror = () => {
        setError("Failed to read the file.");
        setIsUploading(false);
    }
    reader.readAsDataURL(file);
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    processFile(file);
    event.target.value = '';
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };
   const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    processFile(file);
  };

  return (
    <div>
      <label
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={handleDragLeave}
        className={`flex flex-col items-center justify-center w-full min-h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all duration-200 ${isDragging ? 'border-blue-500 bg-blue-500/10' : ''}`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
          <UploadIcon className={`w-8 h-8 mb-3 text-gray-400 transition-colors ${isDragging ? 'text-blue-500' : ''}`} />
          <p className="mb-2 text-sm text-gray-500">
            <span className="font-semibold text-blue-600">{buttonText}</span> or drag and drop
          </p>
          <p className="text-xs text-gray-400">SVG, PNG, JPG or GIF</p>
        </div>
        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isUploading} />
      </label>
      {uploadedFileName && <p className="text-sm mt-2 text-green-600 truncate">✓ {uploadedFileName}</p>}
      {error && <p className="text-sm mt-2 text-red-600">{error}</p>}
    </div>
  );
};