import React, { useCallback } from 'react';
import { Upload, FileText, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
  hasProcessed?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isProcessing, hasProcessed }) => {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.type === 'text/csv' || file.name.endsWith('.csv'));
    
    if (csvFile) {
      onFileSelect(csvFile);
    }
  }, [onFileSelect]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 transform transition-all duration-300 hover:scale-[1.02]">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          isProcessing
            ? 'border-cyan-400 bg-gradient-to-br from-cyan-50 to-teal-50 shadow-lg'
            : hasProcessed
            ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-md'
            : 'border-slate-300 hover:border-cyan-400 hover:bg-gradient-to-br hover:from-slate-50 hover:to-cyan-50 hover:shadow-md'
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />
        
        <div className="flex flex-col items-center space-y-4">
          <div className={`p-4 rounded-full transition-all duration-500 ${
            isProcessing 
              ? 'bg-cyan-100 shadow-lg' 
              : hasProcessed
              ? 'bg-emerald-100 shadow-md'
              : 'bg-slate-100 group-hover:bg-cyan-100'
          }`}>
            {isProcessing ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 transition-all duration-300"></div>
            ) : hasProcessed ? (
              <CheckCircle className="h-8 w-8 text-emerald-600 animate-pulse" />
            ) : (
              <Upload className="h-8 w-8 text-slate-600 transition-all duration-300 group-hover:text-cyan-600 group-hover:scale-110" />
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 transition-all duration-300">
              {isProcessing ? 'Processing...' : hasProcessed ? 'File Processed Successfully!' : 'Upload Timesheet CSV'}
            </h3>
            <p className="text-gray-600 mb-4 transition-all duration-300">
              {hasProcessed 
                ? 'Your timesheet has been validated and is ready for review'
                : 'Drag and drop your CSV file here, or click to select'
              }
            </p>
            
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 transition-all duration-300">
              <FileText className="h-4 w-4" />
              <span className="text-slate-500">Supports CSV files only</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};