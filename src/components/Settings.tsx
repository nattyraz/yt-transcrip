import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { LLMProvider, LLMSettings } from '../types';

interface SettingsProps {
  settings: LLMSettings;
  onSettingsChange: (settings: LLMSettings) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Settings({ settings, onSettingsChange, isOpen, onClose }: SettingsProps) {
  if (!isOpen) return null;

  const handleChange = (field: keyof LLMSettings, value: string) => {
    onSettingsChange({
      ...settings,
      [field]: value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <SettingsIcon size={24} className="text-blue-500" />
            LLM Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Provider
            </label>
            <select
              value={settings.provider}
              onChange={(e) => handleChange('provider', e.target.value as LLMProvider)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="openai">OpenAI</option>
              <option value="claude">Claude</option>
              <option value="ollama">Ollama</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              API Key {settings.provider === 'ollama' && '(Optional)'}
            </label>
            <input
              type="password"
              value={settings.apiKey}
              onChange={(e) => handleChange('apiKey', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={settings.provider === 'ollama' ? 'Optional for local Ollama' : 'Enter API key'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              API URL {settings.provider !== 'ollama' && '(Optional)'}
            </label>
            <input
              type="text"
              value={settings.apiUrl}
              onChange={(e) => handleChange('apiUrl', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={
                settings.provider === 'ollama'
                  ? 'http://localhost:11434'
                  : 'Optional custom API endpoint'
              }
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}