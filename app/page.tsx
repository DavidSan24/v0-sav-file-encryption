"use client"

import { useState, useCallback } from "react"
import { FileUploader } from "@/components/file-uploader"
import { HexEditor } from "@/components/hex-editor"
import { EncryptionPanel } from "@/components/encryption-panel"
import { FileCode2, Shield, Edit3, Sparkles } from "lucide-react"

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [fileData, setFileData] = useState<ArrayBuffer | null>(null)

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile)
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        setFileData(e.target.result as ArrayBuffer)
      }
    }
    reader.readAsArrayBuffer(selectedFile)
  }, [])

  const handleDataChange = useCallback((newData: ArrayBuffer) => {
    setFileData(newData)
  }, [])

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileCode2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">SAV File Editor</h1>
            <p className="text-sm text-muted-foreground">
              Encripta y modifica tus archivos .sav
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {!fileData ? (
          <div className="space-y-8">
            {/* Upload Section */}
            <section className="max-w-2xl mx-auto">
              <FileUploader onFileSelect={handleFileSelect} currentFile={file} />
            </section>

            {/* Features */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-card rounded-lg border border-border p-6 space-y-3">
                <div className="p-3 rounded-lg bg-primary/10 w-fit">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Encriptación AES-256</h3>
                <p className="text-sm text-muted-foreground">
                  Protege tus archivos con encriptación de grado militar usando AES-GCM.
                </p>
              </div>

              <div className="bg-card rounded-lg border border-border p-6 space-y-3">
                <div className="p-3 rounded-lg bg-primary/10 w-fit">
                  <Edit3 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Editor Hexadecimal</h3>
                <p className="text-sm text-muted-foreground">
                  Modifica cada byte de tu archivo con el editor hex interactivo.
                </p>
              </div>

              <div className="bg-card rounded-lg border border-border p-6 space-y-3">
                <div className="p-3 rounded-lg bg-primary/10 w-fit">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">100% Local</h3>
                <p className="text-sm text-muted-foreground">
                  Todo el procesamiento ocurre en tu navegador. Tus datos nunca salen de tu dispositivo.
                </p>
              </div>
            </section>

            {/* Instructions */}
            <section className="max-w-2xl mx-auto bg-card rounded-lg border border-border p-6">
              <h2 className="font-semibold text-foreground mb-4">¿Cómo usar?</h2>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                    1
                  </span>
                  <span>Sube tu archivo .sav arrastrándolo o haciendo clic en el área de carga</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                    2
                  </span>
                  <span>Usa el editor hexadecimal para modificar los bytes que necesites</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                    3
                  </span>
                  <span>Encripta el archivo con una contraseña para proteger tus modificaciones</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                    4
                  </span>
                  <span>Descarga el archivo modificado y/o encriptado</span>
                </li>
              </ol>
            </section>
          </div>
        ) : (
          <div className="space-y-6">
            {/* File Info Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-card rounded-lg border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileCode2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{file?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {fileData.byteLength.toLocaleString()} bytes
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFile(null)
                  setFileData(null)
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cargar otro archivo
              </button>
            </div>

            {/* Editor Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Hex Editor */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-primary" />
                  Editor Hexadecimal
                </h2>
                <HexEditor data={fileData} onChange={handleDataChange} />
                <p className="text-xs text-muted-foreground">
                  Haz clic en cualquier byte para editarlo. Presiona Enter para confirmar o Escape para cancelar.
                </p>
              </div>

              {/* Encryption Panel */}
              <div className="space-y-4">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Encriptación
                </h2>
                <EncryptionPanel
                  data={fileData}
                  fileName={file?.name || "archivo.sav"}
                  onDataChange={handleDataChange}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          SAV File Editor - Todo el procesamiento es local y seguro
        </div>
      </footer>
    </main>
  )
}
