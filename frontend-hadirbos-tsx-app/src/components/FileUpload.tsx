"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, FileText, Check } from "lucide-react"

interface FileUploadProps {
  onFileChange: (file: File | null) => void
  accept?: string
  maxSize?: number // in MB
  label?: string
}

const FileUpload = ({
  onFileChange,
  accept = ".pdf,.doc,.docx",
  maxSize = 5, // 5MB default
  label = "Upload Document",
}: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (selectedFile: File | null) => {
    setError(null)

    if (!selectedFile) {
      setFile(null)
      onFileChange(null)
      return
    }

    // Check file size
    if (selectedFile.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`)
      return
    }

    // Check file type
    const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase() || ""
    const acceptedTypes = accept.split(",").map((type) => type.trim().replace(".", "").toLowerCase())

    if (!acceptedTypes.includes(fileExtension)) {
      setError(`Invalid file type. Accepted types: ${accept}`)
      return
    }

    setFile(selectedFile)
    onFileChange(selectedFile)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const removeFile = () => {
    setFile(null)
    onFileChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
        className="hidden"
        accept={accept}
      />

      {!file ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm font-medium text-gray-700">{label}</p>
          <p className="mt-1 text-xs text-gray-500">Drag and drop or click to browse</p>
          <p className="mt-1 text-xs text-gray-500">
            Max size: {maxSize}MB | Formats: {accept}
          </p>
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-md">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 truncate max-w-xs">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile()
                }}
                className="text-gray-500 hover:text-red-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}

export default FileUpload
