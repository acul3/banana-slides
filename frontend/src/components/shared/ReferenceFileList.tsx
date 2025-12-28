import React, { useState, useEffect, useRef } from 'react';
import { ReferenceFileCard, useToast } from '@/components/shared';
import { listProjectReferenceFiles, type ReferenceFile } from '@/api/endpoints';

interface ReferenceFileListProps {
  // Two modes: 1. Load from API (pass projectId) 2. Display directly (pass files)
  projectId?: string | null;
  files?: ReferenceFile[]; // If files is passed, display directly without loading from API
  onFileClick?: (fileId: string) => void;
  onFileStatusChange?: (file: ReferenceFile) => void;
  onFileDelete?: (fileId: string) => void; // If passed, use external delete logic
  deleteMode?: 'delete' | 'remove';
  title?: string; // Custom title
  className?: string; // Custom style
}

export const ReferenceFileList: React.FC<ReferenceFileListProps> = ({
  projectId,
  files: externalFiles,
  onFileClick,
  onFileStatusChange,
  onFileDelete,
  deleteMode = 'remove',
  title = 'Uploaded Files',
  className = 'mb-6',
}) => {
  const [internalFiles, setInternalFiles] = useState<ReferenceFile[]>([]);
  const { show } = useToast();
  const showRef = useRef(show);

  // If files is passed, use external file list; otherwise load from API
  const isExternalMode = externalFiles !== undefined;
  const files = isExternalMode ? externalFiles : internalFiles;

  useEffect(() => {
    showRef.current = show;
  }, [show]);

  // Only load from API in non-external mode
  useEffect(() => {
    if (isExternalMode || !projectId) {
      if (!isExternalMode) {
        setInternalFiles([]);
      }
      return;
    }

    const loadFiles = async () => {
      try {
        const response = await listProjectReferenceFiles(projectId);
        if (response.data?.files) {
          setInternalFiles(response.data.files);
        }
      } catch (error: any) {
        console.error('Failed to load file list:', error);
        showRef.current({
          message: error?.response?.data?.error?.message || error.message || 'Failed to load file list',
          type: 'error',
        });
      }
    };

    loadFiles();
  }, [projectId, isExternalMode]);

  const handleFileStatusChange = (updatedFile: ReferenceFile) => {
    if (!isExternalMode) {
      setInternalFiles(prev => prev.map(f => f.id === updatedFile.id ? updatedFile : f));
    }
    onFileStatusChange?.(updatedFile);
  };

  const handleFileDelete = (fileId: string) => {
    if (onFileDelete) {
      // Use external delete logic
      onFileDelete(fileId);
    } else if (!isExternalMode) {
      // Internal delete logic
      setInternalFiles(prev => prev.filter(f => f.id !== fileId));
    }
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
      <div className="space-y-2">
        {files.map(file => (
          <ReferenceFileCard
            key={file.id}
            file={file}
            onDelete={handleFileDelete}
            onStatusChange={handleFileStatusChange}
            deleteMode={deleteMode}
            onClick={() => onFileClick?.(file.id)}
          />
        ))}
      </div>
    </div>
  );
};


