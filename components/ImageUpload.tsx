import React, { useRef } from 'react';

interface ImageUploadProps {
  label: string;
  description: string;
  imageSrc: string | null;
  onUpload: (file: File) => void;
}

export function ImageUpload({ label, description, imageSrc, onUpload }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-white">{label}</h2>
        <p className="text-sm text-zinc-500">{description}</p>
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative flex min-h-56 flex-1 items-center justify-center overflow-hidden rounded-lg border border-dashed border-zinc-700 bg-black/40 transition hover:border-indigo-400"
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={label}
            className="h-full max-h-[360px] w-full object-contain"
          />
        ) : (
          <div className="px-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-800 text-2xl text-zinc-400 transition group-hover:text-indigo-300">
              +
            </div>
            <p className="text-sm font-medium text-zinc-300">Upload image</p>
            <p className="mt-1 text-xs text-zinc-500">PNG, JPG, WEBP or GIF</p>
          </div>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
