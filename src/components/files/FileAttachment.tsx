import React from 'react';
import { FileIcon, Trash2, Download, Tag, Pencil } from 'lucide-react';
import { useState } from 'react';
import { FileLabel } from './FileLabel';

interface FileAttachmentProps {
  id: string;
  name: string;
  size: number;
  type: string;
  label?: string | null;
  canEditLabel?: boolean;
  onDelete?: () => void;
  onDownload?: () => void;
  onUpdateLabel?: (id: string, label: string) => Promise<void>;
}

export function FileAttachment({
  id,
  name,
  size,
  type,
  label,
  canEditLabel,
  onDelete,
  onDownload,
  onUpdateLabel
}: FileAttachmentProps) {
  const [editingLabel, setEditingLabel] = useState(false);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="flex items-center justify-between p-2 rounded-lg border border-gray-200 bg-gray-50">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <FileIcon className="h-5 w-5 text-gray-400" />
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900">{name}</div>
          <p className="text-xs text-gray-500">{formatSize(size)}</p>
          {label && !editingLabel && (
            <div className="mt-1 text-xs text-gray-500 flex items-center">
              <Tag className="h-3 w-3 mr-1" />
              {label}
            </div>
          )}
          {editingLabel && onUpdateLabel ? (
            <div className="mt-2">
              <FileLabel
                id={id}
                label={label || ''}
                onSave={onUpdateLabel}
                onCancel={() => setEditingLabel(false)}
              />
            </div>
          ) : canEditLabel && onUpdateLabel && (
            <button
              onClick={() => setEditingLabel(true)}
              className="mt-1 text-xs text-gray-400 hover:text-gray-600 flex items-center group"
            >
              <Pencil className="h-3 w-3 mr-1 group-hover:text-gray-600" />
              {label ? 'Edit label' : 'Add label'}
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {onDownload && (
          <button
            onClick={onDownload}
            className="p-1 text-gray-400 hover:text-gray-500"
          >
            <Download className="h-4 w-4" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}