import React, { useState, useEffect, useRef } from 'react';
import { Modal, Markdown, Loading, useToast } from '@/components/shared';
import { getReferenceFile, type ReferenceFile } from '@/api/endpoints';

interface FilePreviewModalProps {
  fileId: string | null;
  onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  fileId,
  onClose,
}) => {
  const [file, setFile] = useState<ReferenceFile | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { show } = useToast();

  // 使用 ref 保存函数引用，避免依赖项变化导致无限循环
  const onCloseRef = useRef(onClose);
  const showRef = useRef(show);

  useEffect(() => {
    onCloseRef.current = onClose;
    showRef.current = show;
  }, [onClose, show]);

  useEffect(() => {
    if (!fileId) {
      setFile(null);
      setContent(null);
      setIsLoading(false);
      return;
    }

    const loadFile = async () => {
      setIsLoading(true);
      try {
        const response = await getReferenceFile(fileId);
        if (response.data?.file) {
          const fileData = response.data.file;

          // Check if file parsing is complete
          if (fileData.parse_status !== 'completed') {
            showRef.current({
              message: 'File parsing incomplete, cannot preview',
              type: 'info',
            });
            onCloseRef.current();
            return;
          }

          setFile(fileData);
          setContent(fileData.markdown_content || 'No content');
        }
      } catch (error: any) {
        console.error('Failed to load file content:', error);
        showRef.current({
          message: error?.response?.data?.error?.message || error.message || 'Failed to load file content',
          type: 'error',
        });
        setFile(null);
        setContent(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadFile();
  }, [fileId]); // 只依赖 fileId

  return (
    <Modal
      isOpen={fileId !== null}
      onClose={onClose}
      title={file?.filename || 'File Preview'}
      size="xl"
    >
      {isLoading ? (
        <div className="text-center py-8">
          <Loading message="Loading file content..." />
        </div>
      ) : content ? (
        <div className="max-h-[70vh] overflow-y-auto">
          <div className="prose max-w-none">
            <Markdown>{content}</Markdown>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No content</p>
        </div>
      )}
    </Modal>
  );
};

