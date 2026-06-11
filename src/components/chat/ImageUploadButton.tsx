import React, { useRef, useState, useCallback } from 'react';
import { Paperclip, X, Loader2, ImageIcon } from 'lucide-react';

interface ImageUploadButtonProps {
  onImageSelected: (file: File) => void;
  onClear?: () => void;
  previewUrl?: string | null;
  uploading?: boolean;
  disabled?: boolean;
}

export default function ImageUploadButton({
  onImageSelected,
  onClear,
  previewUrl,
  uploading = false,
  disabled = false,
}: ImageUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      if (file.size > 5 * 1024 * 1024) return; // 5MB limit
      onImageSelected(file);
    },
    [onImageSelected]
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = () => setDragOver(false);

  return (
    <div
      className="relative"
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onChange}
        disabled={disabled || uploading}
      />

      {previewUrl ? (
        <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-purple-200 group">
          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          {uploading && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <Loader2 size={14} className="text-white animate-spin" />
            </div>
          )}
          {!uploading && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear?.();
              }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-gray-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={10} />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading}
          className={`p-2.5 rounded-full transition-all cursor-pointer shrink-0 ${
            dragOver
              ? 'bg-purple-100 text-purple-600 ring-2 ring-purple-300'
              : 'hover:bg-purple-50 text-gray-400 hover:text-purple-500'
          }`}
          title="სურათის ატვირთვა"
        >
          {uploading ? (
            <Loader2 size={18} className="animate-spin text-purple-500" />
          ) : (
            <Paperclip size={18} />
          )}
        </button>
      )}

      {dragOver && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] font-medium px-2 py-1 rounded-lg whitespace-nowrap pointer-events-none">
          <ImageIcon size={10} className="inline mr-1" />
          ჩააგდეთ სურათი
        </div>
      )}
    </div>
  );
}
