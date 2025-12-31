import React, { useState } from 'react';
import { X, FileText, Settings as SettingsIcon } from 'lucide-react';
import { Button, Textarea } from '@/components/shared';
import { Settings } from '@/pages/Settings';

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  // 项目设置
  extraRequirements: string;
  templateStyle: string;
  onExtraRequirementsChange: (value: string) => void;
  onTemplateStyleChange: (value: string) => void;
  onSaveExtraRequirements: () => void;
  onSaveTemplateStyle: () => void;
  isSavingRequirements: boolean;
  isSavingTemplateStyle: boolean;
}

type SettingsTab = 'project' | 'global';

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  isOpen,
  onClose,
  extraRequirements,
  templateStyle,
  onExtraRequirementsChange,
  onTemplateStyleChange,
  onSaveExtraRequirements,
  onSaveTemplateStyle,
  isSavingRequirements,
  isSavingTemplateStyle,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('project');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="关闭"
          >
            <X size={20} />
          </button>
        </div>

        {/* 主内容区 */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* 左侧导航栏 */}
          <aside className="w-64 bg-gray-50 border-r border-gray-200 flex-shrink-0">
            <nav className="p-4 space-y-2">
              <button
                onClick={() => setActiveTab('project')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'project'
                  ? 'bg-banana-500 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <FileText size={20} />
                <span className="font-medium">Project Setup</span>
              </button>
              <button
                onClick={() => setActiveTab('global')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'global'
                  ? 'bg-banana-500 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <SettingsIcon size={20} />
                <span className="font-medium">Global Settings</span>
              </button>
            </nav>
          </aside>

          {/* 右侧内容区 */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'project' ? (
              <div className="max-w-3xl space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Project-level configuration</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    These settings apply only to the current project and do not affect other projects
                  </p>
                </div>

                {/* 额外要求 */}
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div>
                    <h4 className="text-base font-semibold text-gray-900 mb-2">Additional requirements</h4>
                    <p className="text-sm text-gray-600">
                      These requirements will be referenced when generating each page
                    </p>
                  </div>
                  <Textarea
                    value={extraRequirements}
                    onChange={(e) => onExtraRequirementsChange(e.target.value)}
                    placeholder="For example: Use a compact layout, display the first-level outline title at the top, add more rich PPT illustrations..."
                    rows={4}
                    className="text-sm"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onSaveExtraRequirements}
                    disabled={isSavingRequirements}
                    className="w-full sm:w-auto"
                  >
                    {isSavingRequirements ? 'Saving...' : 'Save additional requirements'}
                  </Button>
                </div>

                {/* 风格描述 */}
                <div className="bg-blue-50 rounded-lg p-6 space-y-4">
                  <div>
                    <h4 className="text-base font-semibold text-gray-900 mb-2">Style description</h4>
                    <p className="text-sm text-gray-600">
                      Describe the overall style of the PPT, and AI will generate pages with the corresponding style based on the description
                    </p>
                  </div>
                  <Textarea
                    value={templateStyle}
                    onChange={(e) => onTemplateStyleChange(e.target.value)}
                    placeholder="For example: Simple business style, use deep blue and white color, clear and大方, layout clean..."
                    rows={5}
                    className="text-sm"
                  />
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={onSaveTemplateStyle}
                      disabled={isSavingTemplateStyle}
                      className="w-full sm:w-auto"
                    >
                      {isSavingTemplateStyle ? 'Saving...' : 'Save style description'}
                    </Button>
                  </div>
                  <div className="bg-blue-100 rounded-md p-3">
                    <p className="text-xs text-blue-900">
                      💡 <strong>Tip:</strong> The style description will be automatically added to the prompt when generating images.
                      If a template image is uploaded at the same time, the style description will be used as additional instructions.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Global Settings</h3>
                  <p className="text-sm text-gray-600">
                    These settings apply to all projects
                  </p>
                </div>
                {/* 复用 Settings 组件的内容 */}
                <Settings />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

