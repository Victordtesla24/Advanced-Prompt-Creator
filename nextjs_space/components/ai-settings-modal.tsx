
'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { 
  saveAPIConfig, 
  loadAPIConfig, 
  deleteAPIConfig, 
  getModelsForProvider,
  testAPIConnection,
  type APIConfig,
  type AIProvider 
} from '@/lib/ai-config';
import { toast } from 'sonner';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AISettingsModal({ isOpen, onClose }: AISettingsModalProps) {
  const [enabled, setEnabled] = useState(false);
  const [provider, setProvider] = useState<AIProvider | ''>('');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);

  // Load saved config on mount
  useEffect(() => {
    if (isOpen) {
      const config = loadAPIConfig();
      if (config) {
        setEnabled(config.enabled);
        setProvider(config.provider);
        setApiKey(config.apiKey);
        setModel(config.model);
      }
    }
  }, [isOpen]);

  // Update model options when provider changes
  const availableModels = provider ? getModelsForProvider(provider) : [];

  // Auto-select first model when provider changes
  useEffect(() => {
    if (provider && availableModels.length > 0 && !model) {
      setModel(availableModels[0]);
    }
  }, [provider, availableModels, model]);

  const handleSave = () => {
    if (!provider) {
      toast.error('Please select an AI provider');
      return;
    }
    if (!apiKey) {
      toast.error('Please enter an API key');
      return;
    }
    if (!model) {
      toast.error('Please select a model');
      return;
    }

    const config: APIConfig = {
      enabled,
      provider: provider as AIProvider,
      apiKey,
      model
    };

    try {
      saveAPIConfig(config);
      toast.success('AI settings saved successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete your API key?')) {
      deleteAPIConfig();
      setEnabled(false);
      setProvider('');
      setApiKey('');
      setModel('');
      toast.success('API key deleted successfully');
    }
  };

  const handleTestConnection = async () => {
    if (!provider || !apiKey || !model) {
      toast.error('Please fill in all fields first');
      return;
    }

    setTesting(true);
    
    try {
      const result = await testAPIConnection(
        provider as AIProvider,
        apiKey,
        model
      );
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Test failed. Please try again.');
    } finally {
      setTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[999] animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[600px] bg-white dark:bg-slate-800 rounded-xl shadow-2xl z-[1000] p-8 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              AI Integration Settings
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Optional: Enhance transformations with your AI API
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Notice */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-100 flex items-start gap-2">
            <span className="text-lg">🔒</span>
            <span>
              <strong>Security Notice:</strong> Your API key is stored only in your browser&apos;s localStorage. 
              It is never transmitted to our servers. All AI requests go directly from your browser to the AI provider.
            </span>
          </p>
        </div>

        {/* Enable Toggle */}
        <div className="mb-6 flex items-center justify-between">
          <label htmlFor="enable-ai" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Enable AI Enhancement
          </label>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="enable-ai"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-12 h-6 rounded-full appearance-none bg-slate-300 checked:bg-blue-600 relative cursor-pointer transition-colors
                before:content-[''] before:absolute before:w-5 before:h-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 
                before:transition-transform checked:before:translate-x-6"
            />
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
              enabled ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
            }`}>
              {enabled ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        {/* Provider Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            AI Provider
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as AIProvider)}
            className="w-full h-11 px-4 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Provider</option>
            <option value="openai">OpenAI (GPT-4, GPT-3.5)</option>
            <option value="perplexity">Perplexity AI (Sonar)</option>
            <option value="glm4">GLM-4 (Zhipu AI)</option>
          </select>
        </div>

        {/* API Key Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full h-11 px-4 pr-12 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-mono bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-100 dark:hover:bg-slate-600 rounded"
              aria-label="Toggle visibility"
            >
              {showKey ? '👁️' : '🔒'}
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            🔒 Stored locally in your browser only
          </p>
        </div>

        {/* Model Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Model
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={!provider}
            className="w-full h-11 px-4 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed"
          >
            <option value="">
              {provider ? 'Select Model' : 'Select provider first'}
            </option>
            {availableModels.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleTestConnection}
            disabled={!provider || !apiKey || !model || testing}
            className="flex-1 h-11 px-4 bg-white dark:bg-slate-700 border-2 border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
          <button
            onClick={handleSave}
            className="flex-1 h-11 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Save Settings
          </button>
        </div>

        {/* Delete Button */}
        {apiKey && (
          <button
            onClick={handleDelete}
            className="w-full mt-3 h-11 px-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            Delete API Key
          </button>
        )}
      </div>
    </>
  );
}
