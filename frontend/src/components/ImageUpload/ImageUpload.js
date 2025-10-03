import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  CloudArrowUpIcon, 
  PhotoIcon, 
  XMarkIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import Button from '../UI/Button';
import LoadingSpinner from '../UI/LoadingSpinner';

const ImageUpload = ({ 
  onUpload, 
  loading = false, 
  maxFiles = 1, 
  maxSize = 10 * 1024 * 1024, // 10MB
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
  }
}) => {
  const [files, setFiles] = useState([]);
  const [uploadError, setUploadError] = useState(null);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setUploadError(null);

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(file => {
        const error = file.errors[0];
        return `${file.file.name}: ${error.message}`;
      });
      setUploadError(errors.join(', '));
      return;
    }

    // Process accepted files
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      type: file.type
    }));

    setFiles(prevFiles => {
      const combined = [...prevFiles, ...newFiles];
      return combined.slice(0, maxFiles); // Respect maxFiles limit
    });
  }, [maxFiles]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles,
    multiple: maxFiles > 1
  });

  const removeFile = (fileId) => {
    setFiles(prevFiles => {
      const updatedFiles = prevFiles.filter(f => f.id !== fileId);
      // Revoke object URL to prevent memory leaks
      const fileToRemove = prevFiles.find(f => f.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return updatedFiles;
    });
    setUploadError(null);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setUploadError('Please select at least one image');
      return;
    }

    try {
      setUploadError(null);
      await onUpload(files);
      
      // Clear files after successful upload
      files.forEach(file => URL.revokeObjectURL(file.preview));
      setFiles([]);
    } catch (error) {
      setUploadError(error.message || 'Upload failed');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-colors duration-200 cursor-pointer
          ${isDragActive && !isDragReject ? 'border-primary-400 bg-primary-50' : ''}
          ${isDragReject ? 'border-red-400 bg-red-50' : ''}
          ${!isDragActive ? 'border-gray-300 hover:border-gray-400' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="text-center">
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <p className="text-lg font-medium text-gray-900">
              {isDragActive ? 'Drop images here...' : 'Upload car damage photos'}
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Drag and drop images, or{' '}
              <span className="font-medium text-primary-600">browse</span>
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Supports: JPEG, PNG, GIF, WebP (max {formatFileSize(maxSize)})
            </p>
          </div>
        </div>

        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <LoadingSpinner size="large" text="Uploading..." />
          </div>
        )}
      </div>

      {/* Error display */}
      {uploadError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{uploadError}</p>
          </div>
        </div>
      )}

      {/* File preview */}
      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Selected Images ({files.length}/{maxFiles})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
              <div key={file.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* File info */}
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-700"
                  aria-label="Remove image"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Upload button */}
          <div className="mt-6">
            <Button
              onClick={handleUpload}
              variant="primary"
              loading={loading}
              disabled={files.length === 0}
              icon={PhotoIcon}
              className="w-full sm:w-auto"
            >
              {loading ? 'Uploading...' : `Upload ${files.length} Image${files.length > 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
