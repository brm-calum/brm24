import React, { useState, useRef } from 'react';
import { MessageSquare, Send, Upload } from 'lucide-react'; 
import { useAuth } from '../../contexts/AuthContext';
import { ErrorDisplay } from '../ui/ErrorDisplay';
import { uploadFile } from '../../lib/utils/files';
import { FilePreview } from '../files/FilePreview';
import { supabase } from '../../lib/supabase';

interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  label?: string;
  preview?: string;
  file?: File;
}

interface InquiryResponseProps {
  inquiryId: string;
  onSubmit: (message: string) => Promise<void>;
}

export function InquiryResponse({ inquiryId, onSubmit }: InquiryResponseProps) { 
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (files.length + selectedFiles.length > 5) {
      setError(new Error('Maximum 5 files allowed'));
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    const invalidFiles = selectedFiles.filter(file => file.size > maxSize);
    if (invalidFiles.length > 0) {
      setError(new Error(`Files must be smaller than ${maxSize / 1024 / 1024}MB`));
      return;
    }

    const newFiles = selectedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      file
    }));

    setFiles(prev => [...prev, ...newFiles]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!message.trim()) {
      setError(new Error('Message cannot be empty'));
      setIsLoading(false);
      return;
    }

    // Upload files if any
    const uploadedFiles = [];
    if (files.length > 0) {
      for (const file of files) {
        if (!file.file) continue;
        try {
          const storagePath = await uploadFile(file.file, user.id);
          uploadedFiles.push({
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type,
            storage_path: storagePath,
            label: file.label
          });
        } catch (err) {
          console.error('Failed to upload file:', err);
          setError(new Error('Failed to upload file: ' + file.name));
          return;
        }
      }
    }

    try {
      await supabase.rpc('respond_to_inquiry_v2', {
        p_inquiry_id: inquiryId,
        p_message: message,
        p_files: uploadedFiles.length > 0 ? uploadedFiles : null
      });
      setMessage('');
      setFiles([]);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col bg-[#f0f2f5] border-t">
      {error && (
        <div className="p-4">
          <ErrorDisplay 
            error={error}
            onRetry={() => setError(null)}
          />
        </div>
      )}

      <div className="p-4">
        <div className="min-w-0 flex-1">
          <div className="relative flex items-end space-x-2">
            <div className="flex-1 bg-white rounded-full shadow-sm">
              <div className="flex items-center">
                <textarea
                  rows={1}
                  required
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
                  }}
                  onKeyDown={handleKeyPress}
                  className="block w-full rounded-full border-0 bg-transparent py-2.5 pl-4 pr-20 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 resize-none"
                  placeholder="Type a message"
                  disabled={isLoading}
                />
                <div className="flex items-center pr-2 space-x-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-500 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  >
                    <Upload className="h-5 w-5" />
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !message.trim()}
                    className="p-2 text-white bg-green-500 rounded-full hover:bg-green-600 disabled:opacity-50 disabled:hover:bg-green-500"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {files.length > 0 && (
            <div className="mt-3">
              <div className="space-y-2">
                {files.map(file => (
                  <FilePreview
                    key={file.id}
                    file={file}
                    preview={file.preview}
                    onRemove={() => handleRemoveFile(file.id)}
                    onLabelChange={(label) => {
                      setFiles(prev => prev.map(f => 
                        f.id === file.id ? { ...f, label } : f
                      ));
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        accept="image/*,application/pdf,.doc,.docx"
        onChange={handleFileSelect}
      />
    </form>
  );
}