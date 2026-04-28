"use client"

import { useState, useCallback, useMemo } from "react"
import { cn } from "@/lib/utils"

interface HexEditorProps {
  data: ArrayBuffer
  onChange: (newData: ArrayBuffer) => void
}

export function HexEditor({ data, onChange }: HexEditorProps) {
  const [selectedByte, setSelectedByte] = useState<number | null>(null)
  const [editValue, setEditValue] = useState("")

  const bytes = useMemo(() => new Uint8Array(data), [data])

  const rows = useMemo(() => {
    const result: { offset: number; bytes: number[] }[] = []
    for (let i = 0; i < bytes.length; i += 16) {
      result.push({
        offset: i,
        bytes: Array.from(bytes.slice(i, Math.min(i + 16, bytes.length))),
      })
    }
    return result
  }, [bytes])

  const handleByteClick = useCallback((index: number, value: number) => {
    setSelectedByte(index)
    setEditValue(value.toString(16).padStart(2, "0"))
  }, [])

  const handleEditChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/[^0-9a-fA-F]/g, "").slice(0, 2)
      setEditValue(value)
    },
    []
  )

  const handleEditSubmit = useCallback(() => {
    if (selectedByte === null || editValue.length !== 2) return

    const newBytes = new Uint8Array(bytes)
    newBytes[selectedByte] = parseInt(editValue, 16)
    onChange(newBytes.buffer)
    setSelectedByte(null)
    setEditValue("")
  }, [selectedByte, editValue, bytes, onChange])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleEditSubmit()
      } else if (e.key === "Escape") {
        setSelectedByte(null)
        setEditValue("")
      }
    },
    [handleEditSubmit]
  )

  const toAscii = (byte: number) => {
    return byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : "."
  }

  return (
    <div className="font-mono text-sm overflow-auto max-h-[500px] bg-card rounded-lg border border-border">
      <div className="sticky top-0 bg-secondary border-b border-border px-4 py-2 flex gap-4 text-muted-foreground text-xs">
        <span className="w-20">Offset</span>
        <span className="flex-1">
          00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F
        </span>
        <span className="w-36">ASCII</span>
      </div>
      <div className="p-4">
        {rows.map((row) => (
          <div key={row.offset} className="flex gap-4 hover:bg-secondary/50 px-0 py-1 rounded">
            <span className="w-20 text-primary">
              {row.offset.toString(16).padStart(8, "0")}
            </span>
            <div className="flex-1 flex flex-wrap gap-x-2">
              {row.bytes.map((byte, i) => {
                const index = row.offset + i
                const isSelected = selectedByte === index
                return isSelected ? (
                  <input
                    key={i}
                    type="text"
                    value={editValue}
                    onChange={handleEditChange}
                    onKeyDown={handleKeyDown}
                    onBlur={handleEditSubmit}
                    autoFocus
                    className="w-6 bg-primary text-primary-foreground text-center rounded outline-none"
                  />
                ) : (
                  <span
                    key={i}
                    onClick={() => handleByteClick(index, byte)}
                    className={cn(
                      "w-6 text-center cursor-pointer rounded transition-colors",
                      "hover:bg-primary hover:text-primary-foreground"
                    )}
                  >
                    {byte.toString(16).padStart(2, "0")}
                  </span>
                )
              })}
            </div>
            <span className="w-36 text-muted-foreground tracking-wider">
              {row.bytes.map((b) => toAscii(b)).join("")}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
