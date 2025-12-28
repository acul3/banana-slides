import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Key, Image, Zap, Save, RotateCcw, Globe } from 'lucide-react';
import { Button, Input, Card, Loading, useToast, useConfirm } from '@/components/shared';
import * as api from '@/api/endpoints';
import type { OutputLanguage } from '@/api/endpoints';
import { OUTPUT_LANGUAGE_OPTIONS, getStoredOutputLanguage, storeOutputLanguage } from '@/api/endpoints';
import type { Settings as SettingsType } from '@/types';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { show, ToastContainer } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [outputLanguage, setOutputLanguage] = useState<OutputLanguage | null>(() => {
    return getStoredOutputLanguage();
  });
  const [formData, setFormData] = useState({
    ai_provider_format: 'gemini' as 'openai' | 'gemini',
    api_base_url: '',
    api_key: '',
    image_resolution: '2K',
    image_aspect_ratio: '16:9',
    max_description_workers: 5,
    max_image_workers: 8,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await api.getSettings();
      if (response.data) {
        setSettings(response.data);
        setFormData({
          ai_provider_format: response.data.ai_provider_format || 'gemini',
          api_base_url: response.data.api_base_url || '',
          api_key: '', // 不显示实际的 API key, 留空则在更新的时候不设置新的 apikey.
          image_resolution: response.data.image_resolution || '2K',
          image_aspect_ratio: response.data.image_aspect_ratio || '16:9',
          max_description_workers: response.data.max_description_workers || 5,
          max_image_workers: response.data.max_image_workers || 8,
        });
      }
    } catch (error: any) {
      console.error('Failed to load settings:', error);
      show({
        message: 'Failed to load settings: ' + (error?.message || 'Unknown error'),
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 除了 api_key 以外的字段全部透传（包括空字符串），让后端决定语义
      const { api_key, ...otherData } = formData;
      const payload: Parameters<typeof api.updateSettings>[0] = {
        ...otherData,
      };

      // 只有当用户输入了新的 API Key 时才更新，留空表示“不修改当前 Key”
      if (api_key) {
        payload.api_key = api_key;
      }

      const response = await api.updateSettings(payload);
      if (response.data) {
        setSettings(response.data);
        show({ message: 'Settings saved successfully', type: 'success' });
        // Clear API key input
        setFormData(prev => ({ ...prev, api_key: '' }));
      }
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      show({
        message: 'Failed to save settings: ' + (error?.response?.data?.error?.message || error?.message || 'Unknown error'),
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLanguageChange = (language: OutputLanguage) => {
    storeOutputLanguage(language);
    setOutputLanguage(language);
    show({
      message: `Output language set to: ${OUTPUT_LANGUAGE_OPTIONS.find(o => o.value === language)?.label}`,
      type: 'success',
    });
  };

  const handleReset = () => {
    confirm(
      'This will reset all AI model, image generation, and concurrency settings to environment defaults. Custom settings will be lost. Continue?',
      async () => {
        setIsSaving(true);
        try {
          const response = await api.resetSettings();
          if (response.data) {
            setSettings(response.data);
            setFormData({
              ai_provider_format: response.data.ai_provider_format || 'gemini',
              api_base_url: response.data.api_base_url || '',
              api_key: '',
              image_resolution: response.data.image_resolution || '2K',
              image_aspect_ratio: response.data.image_aspect_ratio || '16:9',
              max_description_workers: response.data.max_description_workers || 5,
              max_image_workers: response.data.max_image_workers || 8,
            });
            show({ message: 'Settings reset successfully', type: 'success' });
          }
        } catch (error: any) {
          console.error('Failed to reset settings:', error);
          show({
            message: 'Failed to reset settings: ' + (error?.message || 'Unknown error'),
            type: 'error'
          });
        } finally {
          setIsSaving(false);
        }
      },
      {
        title: 'Confirm Reset to Defaults',
        confirmText: 'Reset',
        cancelText: 'Cancel',
        variant: 'warning',
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50/30 to-pink-50/50 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50/30 to-pink-50/50 relative overflow-hidden">
      {/* Background decoration, matching home page style */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-banana-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-yellow-400/5 rounded-full blur-3xl"></div>
      </div>

      {/* Centered modal card */}
      <div className="relative min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl">
          <Card className="p-6 md:p-8 bg-white/90 backdrop-blur-xl shadow-2xl border-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Home size={18} />}
                  onClick={() => navigate('/')}
                  className="text-xs md:text-sm"
                >
                  Back to Home
                </Button>
                <div className="h-6 w-px bg-gray-200" />
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">System Settings</h1>
                  <p className="mt-1 text-xs md:text-sm text-gray-500">
                    Configure AI models, image generation, and performance settings
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* API Configuration */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Key size={20} className="mr-2" />
                  AI Model API Config
                </h2>
                <div className="space-y-4">
                  {/* AI Provider Format Toggle */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      AI Provider Format
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, ai_provider_format: 'openai' }))}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${formData.ai_provider_format === 'openai'
                            ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-sky-50 hover:border-sky-300'
                          }`}
                      >
                        OpenAI Format
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, ai_provider_format: 'gemini' }))}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${formData.ai_provider_format === 'gemini'
                            ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-emerald-50 hover:border-emerald-300'
                          }`}
                      >
                        Gemini Format
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Choose API request format. Changes take effect after saving.
                    </p>
                  </div>
                  <div>
                    <Input
                      label="API Base URL"
                      placeholder="https://api.example.com"
                      value={formData.api_base_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, api_base_url: e.target.value }))}
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Set the base URL for your AI provider's API
                    </p>
                  </div>
                  <div>
                    <Input
                      label="API Key"
                      type="password"
                      placeholder={settings?.api_key_length ? `Already set (length: ${settings.api_key_length})` : 'Enter new API Key'}
                      value={formData.api_key}
                      onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      {settings?.api_key_length
                        ? 'Leave empty to keep current key, enter new value to update'
                        : 'Enter your API Key'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Image Generation Settings */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Image size={20} className="mr-2" />
                  Image Generation Settings
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image Resolution (may not work with some OpenAI format proxies)
                    </label>
                    <select
                      value={formData.image_resolution}
                      onChange={(e) => setFormData(prev => ({ ...prev, image_resolution: e.target.value }))}
                      className="w-full h-10 px-4 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-banana-500 focus:border-transparent"
                    >
                      <option value="1K">1K (1024px)</option>
                      <option value="2K">2K (2048px)</option>
                      <option value="4K">4K (4096px)</option>
                    </select>
                    <p className="mt-1 text-sm text-gray-500">
                      Higher resolution creates more detailed images but takes longer
                    </p>
                  </div>
                  {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    图像比例
                  </label>
                  <select
                    value={formData.image_aspect_ratio}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_aspect_ratio: e.target.value }))}
                    className="w-full h-10 px-4 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-banana-500 focus:border-transparent"
                  >
                    <option value="1:1">1:1 (正方形)</option>
                    <option value="2:3">2:3 (竖向)</option>
                    <option value="3:2">3:2 (横向)</option>
                    <option value="3:4">3:4 (竖向)</option>
                    <option value="4:3">4:3 (标准)</option>
                    <option value="4:5">4:5 (竖向)</option>
                    <option value="5:4">5:4 (横向)</option>
                    <option value="9:16">9:16 (竖向)</option>
                    <option value="16:9">16:9 (宽屏)</option>
                    <option value="21:9">21:9 (超宽屏)</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    选择适合你 PPT 的图像比例
                  </p>
                </div> */}
                </div>
              </div>

              {/* Performance Settings */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Zap size={20} className="mr-2" />
                  Performance Settings
                </h2>
                <div className="space-y-4">
                  <div>
                    <Input
                      label="Max Description Workers"
                      type="number"
                      min="1"
                      max="20"
                      value={formData.max_description_workers}
                      onChange={(e) => setFormData(prev => ({ ...prev, max_description_workers: parseInt(e.target.value) || 5 }))}
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Max concurrent threads for description generation (1-20), higher = faster
                    </p>
                  </div>
                  <div>
                    <Input
                      label="Max Image Workers"
                      type="number"
                      min="1"
                      max="20"
                      value={formData.max_image_workers}
                      onChange={(e) => setFormData(prev => ({ ...prev, max_image_workers: parseInt(e.target.value) || 8 }))}
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Max concurrent threads for image generation (1-20), higher = faster
                    </p>
                  </div>
                </div>
              </div>

              {/* Output Language Settings */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Globe size={20} className="mr-2 text-blue-600" />
                  Output Language
                </h2>
                <p className="text-sm text-gray-500 mb-3">
                  This sets the default output language. The actual generation will use your most recent choice (saved in browser).
                </p>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {OUTPUT_LANGUAGE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleLanguageChange(option.value)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all text-sm md:text-base ${outputLanguage === option.value
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300'
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {outputLanguage === 'auto'
                    ? 'Auto mode: AI will automatically choose output language based on input content'
                    : `Current default output language: ${OUTPUT_LANGUAGE_OPTIONS.find(o => o.value === outputLanguage)?.label || 'Not set, using backend default'
                    }`}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <Button
                  variant="secondary"
                  icon={<RotateCcw size={18} />}
                  onClick={handleReset}
                  disabled={isSaving}
                >
                  Reset to Defaults
                </Button>
                <Button
                  variant="primary"
                  icon={<Save size={18} />}
                  onClick={handleSave}
                  loading={isSaving}
                >
                  Save Settings
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <ToastContainer />
      {ConfirmDialog}
    </div>
  );
};
