import React, { useCallback, useState } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { cn } from "@/lib/utils"

export interface ImageZoneProps {
  value?: string; // URL
  onChange: (file: File | null) => void;
  className?: string;
  aspectRatio?: "square" | "video" | "auto";
}

export function ImageZone({ value, onChange, className, aspectRatio = "square" }: ImageZoneProps) {
  const [preview, setPreview] = useState<string | undefined>(value)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file)
        setPreview(url)
        onChange(file)
    }
  }, [onChange])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
      onChange(file)
    }
  }

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPreview(undefined)
    onChange(null)
  }

  return (
    <div 
      className={cn(
        "relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-muted/30 hover:border-primary/50 overflow-hidden group",
        aspectRatio === "square" && "aspect-square",
        aspectRatio === "video" && "aspect-video",
        className
      )}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => document.getElementById('image-upload')?.click()}
    >
      <input 
        id="image-upload" 
        type="file" 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange}
      />
      
      {preview ? (
        <>
          <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button 
              onClick={clear}
              className="p-2 bg-error rounded-full text-white hover:scale-110 transition-transform"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center p-4">
          <div className="p-3 bg-muted/50 rounded-full mb-3">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">Click or drag image</p>
          <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
        </div>
      )}
    </div>
  )
}
