import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface ImageUploadProps {
  onImageSelected: (base64: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError("Please upload a valid image file (JPG, PNG, HEIC).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File size too large. Max 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onImageSelected(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div 
        className={`relative border-2 border-dashed rounded-3xl p-10 transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400'}
        `}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <Upload className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Upload a Landmark Photo</h3>
        <p className="text-gray-500 mb-6">Drag & drop or click to browse</p>
        
        <div className="flex gap-4 text-xs text-gray-400">
           <span className="flex items-center gap-1"><ImageIcon className="w-3 h-3" /> JPG, PNG, HEIC</span>
           <span>•</span>
           <span>Max 10MB</span>
        </div>

        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFiles(e.target.files[0])}
        />
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
