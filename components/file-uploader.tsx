"use client"

import { useCallback } from "react"
import { Upload, FileArchive } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploaderProps {
  onFileSelect: (file: File) => void
  currentFile: File | null
}

export function FileUploader({ onFileSelect, currentFile }: FileUploaderProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file && file.name.endsWith(".sav")) {
        onFileSelect(file)
      }
    },
    [onFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        onFileSelect(file)
      }
    },
    [onFileSelect]
  )

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={cn(
        "relative border-2 border-dashed rounded-lg p-8 transition-all duration-200 cursor-pointer group",
        "hover:border-primary hover:bg-primary/5",
        currentFile ? "border-primary bg-primary/5" : "border-border"
      )}
    >
      <input
        type="file"
        accept=".sav"
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="flex flex-col items-center gap-4 text-center">
        {currentFile ? (
          <>
            <div className="p-4 rounded-full bg-primary/10">
              <FileArchive className="w-10 h-10 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{currentFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(currentFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="p-4 rounded-full bg-secondary group-hover:bg-primary/10 transition-colors">
              <Upload className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                Arrastra tu archivo .sav aquí
              </p>
              <p className="text-sm text-muted-foreground">
                o haz clic para seleccionar
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
