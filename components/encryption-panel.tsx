"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, Unlock, Eye, EyeOff, Download } from "lucide-react"
import { encryptData, decryptData, arrayBufferToBase64, base64ToArrayBuffer } from "@/lib/crypto"

interface EncryptionPanelProps {
  data: ArrayBuffer
  fileName: string
  onDataChange: (newData: ArrayBuffer) => void
}

export function EncryptionPanel({ data, fileName, onDataChange }: EncryptionPanelProps) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isEncrypted, setIsEncrypted] = useState(false)
  const [storedIv, setStoredIv] = useState<Uint8Array | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEncrypt = async () => {
    if (!password) {
      setError("Ingresa una contraseña")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const { encrypted, iv } = await encryptData(data, password)
      setStoredIv(iv)
      setIsEncrypted(true)
      onDataChange(encrypted)
    } catch {
      setError("Error al encriptar el archivo")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDecrypt = async () => {
    if (!password || !storedIv) {
      setError("Ingresa la contraseña correcta y carga el archivo de clave (.json)")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const decrypted = await decryptData(data, storedIv, password)
      setIsEncrypted(false)
      setStoredIv(null)
      onDataChange(decrypted)
    } catch {
      setError("Contraseña incorrecta o archivo corrupto")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([data], { type: "application/octet-stream" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    
    // Crear nombre del archivo
    const baseName = fileName.replace(".sav", "").replace(".bin", "").replace("_encrypted", "")
    let newFileName: string
    
    if (isEncrypted) {
      // Desencriptado (decrypt) -> descargar como .bin
      newFileName = `${baseName}.bin`
    } else {
      // Encriptado (encrypt) -> descargar como .sav
      newFileName = `${baseName}.sav`
    }
    
    a.download = newFileName
    
    // Si esta encriptado, tambien guardar el IV en un archivo separado
    if (isEncrypted && storedIv) {
      const ivData = {
        iv: arrayBufferToBase64(storedIv.buffer),
        encrypted: true
      }
      const metaBlob = new Blob([JSON.stringify(ivData)], { type: "application/json" })
      const metaUrl = URL.createObjectURL(metaBlob)
      const metaLink = document.createElement("a")
      metaLink.href = metaUrl
      metaLink.download = `${baseName}_key.json`
      metaLink.click()
      URL.revokeObjectURL(metaUrl)
    }
    
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleLoadKey = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = JSON.parse(event.target?.result as string)
        if (content.iv) {
          const ivBuffer = base64ToArrayBuffer(content.iv)
          setStoredIv(new Uint8Array(ivBuffer))
          setIsEncrypted(true)
          setError(null)
        }
      } catch {
        setError("Archivo de clave inválido")
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6 space-y-4">
      <div className="flex items-center gap-3">
        {isEncrypted ? (
          <div className="p-2 rounded-full bg-primary/10">
            <Lock className="w-5 h-5 text-primary" />
          </div>
        ) : (
          <div className="p-2 rounded-full bg-secondary">
            <Unlock className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
        <div>
          <h3 className="font-semibold text-foreground">
            {isEncrypted ? "Archivo Encriptado" : "Archivo Sin Encriptar"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isEncrypted
              ? "Desencripta para editar los datos"
              : "Encripta para proteger tus datos"}
          </p>
        </div>
      </div>

      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="Contraseña de encriptación"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="pr-10 bg-input border-border"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex flex-wrap gap-3">
        {isEncrypted ? (
          <Button
            onClick={handleDecrypt}
            disabled={isProcessing || !password || !storedIv}
            className="gap-2"
          >
            <Unlock className="w-4 h-4" />
            {isProcessing ? "Desencriptando..." : "Desencriptar"}
          </Button>
        ) : (
          <Button
            onClick={handleEncrypt}
            disabled={isProcessing || !password}
            className="gap-2"
          >
            <Lock className="w-4 h-4" />
            {isProcessing ? "Encriptando..." : "Encriptar"}
          </Button>
        )}

        <Button variant="secondary" onClick={handleDownload} className="gap-2">
          <Download className="w-4 h-4" />
          {"Descargar"}
        </Button>

        <div className="relative">
          <Button variant="outline" className="gap-2">
            {storedIv ? "Clave Cargada" : "Cargar Clave (.json)"}
          </Button>
          <input
            type="file"
            accept=".json"
            onChange={handleLoadKey}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
        </div>
      </div>

      {storedIv && (
        <p className="text-sm text-primary">{"Clave IV cargada correctamente. Ingresa la contraseña y presiona Desencriptar."}</p>
      )}
    </div>
  )
}
