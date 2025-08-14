import React from 'react';
import { Upload, File, X, AlertTriangle, FileArchive } from 'lucide-react';
import { useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import JSZip from 'jszip';
import { FileEntry } from '../types';

interface UploadedFile {
  name: string;
  size: number;
  extractedFiles: { path: string }[];
}

interface FileUploadStepProps {
  onFileUploaded: (file: UploadedFile) => void;
  onBack: () => void;
}

export default function FileUploadStep({
  onFileUploaded,
  onBack
}: FileUploadStepProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.zip')) {
      setError('Please upload a ZIP file');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Actually process the ZIP file
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);
      
      const extractedFiles: FileEntry[] = [];
      
      // First pass: collect all file paths to detect common root folder
      const allPaths = Object.keys(zipContent.files).filter(path => !zipContent.files[path].dir);
      
      // Find common root folder (e.g., "project/")
      let commonRoot = '';
      if (allPaths.length > 0) {
        const firstPath = allPaths[0];
        const pathParts = firstPath.split('/');
        
        if (pathParts.length > 1) {
          const potentialRoot = pathParts[0] + '/';
          const allHaveSameRoot = allPaths.every(path => path.startsWith(potentialRoot));
          
          if (allHaveSameRoot) {
            commonRoot = potentialRoot;
          }
        }
      }
      
      // Process each file in the ZIP
      for (const [relativePath, zipEntry] of Object.entries(zipContent.files)) {
        if (!zipEntry.dir) {
          try {
            // Strip common root folder if found
            let finalPath = relativePath;
            if (commonRoot && relativePath.startsWith(commonRoot)) {
              finalPath = relativePath.substring(commonRoot.length);
            }
            
            // Skip if path becomes empty after stripping root
            if (!finalPath) continue;
            
            // Try to read as text first, fallback to binary
            let content: string | Uint8Array;
            try {
              content = await zipEntry.async('string');
            } catch {
              content = await zipEntry.async('uint8array');
            }
            
            extractedFiles.push({
              path: finalPath,
              content: content,
              isDirectory: false
            });
          } catch (err) {
            console.warn(`Failed to extract file ${finalPath || relativePath}:`, err);
          }
        }
      }
      
      const uploadedFile: UploadedFile = {
        name: file.name,
        size: file.size,
        content: file,
        extractedFiles: extractedFiles
      };

      setUploadedFile(uploadedFile);
    } catch (err) {
      console.error('ZIP processing error:', err);
      setError('Failed to process ZIP file. Please ensure it\'s a valid ZIP archive.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContinue = () => {
    if (uploadedFile) {
      onFileUploaded(uploadedFile);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Upload Project Files
        </h2>
        <p className="text-gray-600">
          Upload your Bolt.new exported ZIP file to push to GitHub
        </p>
      </div>

      {!uploadedFile && !isProcessing && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-green-300 bg-white'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".zip"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Upload className="mx-auto h-16 w-16 text-gray-400 mb-6" />
          <p className="text-xl font-bold text-gray-900 mb-3">
            Drop your ZIP file here or click to browse
          </p>
          <p className="text-gray-500">
            Supports ZIP files exported from Bolt.new
          </p>
        </div>
      )}

      {/* Processing State */}
      {isProcessing && (
        <div className="text-center py-12">
          <LoadingSpinner size="lg" />
          <p className="mt-6 text-gray-600 font-medium text-lg">Processing ZIP file...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="alert-error">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="ml-3 text-red-800 font-medium">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* File Preview */}
      {uploadedFile && (
        <div className="card p-6 bg-gray-50">
          <h3 className="font-bold mb-4 text-gray-900 text-lg">
            File Preview
          </h3>
          <div className="flex items-center space-x-4 mb-6">
            <FileArchive className="h-10 w-10 text-gray-600" />
            <div>
              <p className="font-bold text-gray-900 text-lg">
                {uploadedFile.name}
              </p>
              <p className="text-gray-500 font-medium">
                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • {uploadedFile.extractedFiles.length} files
              </p>
            </div>
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            <div className="space-y-2">
              {uploadedFile.extractedFiles.slice(0, 10).map((file, index) => (
                <div key={index} className="flex items-center space-x-3 text-gray-600">
                  <File size={16} />
                  <span className="font-mono text-sm">{file.path}</span>
                </div>
              ))}
              {uploadedFile.extractedFiles.length > 10 && (
                <p className="text-gray-500 italic font-medium">
                  ... and {uploadedFile.extractedFiles.length - 10} more files
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={onBack}
          disabled={isProcessing}
          className="btn-secondary"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!uploadedFile || isProcessing}
          className="btn-primary"
        >
          Continue
        </button>
      </div>
    </div>
  );
}