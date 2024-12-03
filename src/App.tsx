import React, { useState } from 'react';
import { VideoInput } from './components/VideoInput';
import { Summary } from './components/Summary';
import { Settings } from './components/Settings';
import { Chat } from './components/Chat';
import { summarizeVideo, askQuestion } from './services/api';
import { VideoSummary, LLMSettings, ChatMessage } from './types';
import { Youtube, Settings as SettingsIcon } from 'lucide-react';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<VideoSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [llmSettings, setLLMSettings] = useState<LLMSettings>({
    provider: 'openai',
    apiKey: '',
    apiUrl: '',
  });

  const handleSubmit = async (url: string) => {
    if (!llmSettings.apiKey && llmSettings.provider !== 'ollama') {
      setError('Please configure your API key in settings first');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await summarizeVideo(url, llmSettings);
      if (response.success) {
        setSummary(response.data);
        setMessages([]); // Reset chat when new video is loaded
      } else {
        setError(response.error || 'Failed to process video');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!summary) return;

    const newMessage: ChatMessage = { role: 'user', content };
    setMessages(prev => [...prev, newMessage]);
    setIsChatLoading(true);

    try {
      const videoContext = `
        Title: ${summary.title}
        Transcript: ${summary.transcript}
        Summary: ${summary.summary}
      `;
      
      const response = await askQuestion(content, videoContext, llmSettings);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response');
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-8">
          <div className="w-full max-w-2xl flex justify-end">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-gray-300 hover:text-white transition-colors"
            >
              <SettingsIcon size={18} />
              Settings
            </button>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Youtube size={32} className="text-red-500" />
              <h1 className="text-3xl font-bold">Video Summarizer</h1>
            </div>
            <p className="text-gray-400 max-w-xl">
              Get instant transcriptions, summaries, and key moments from any YouTube video
            </p>
          </div>

          <VideoInput onSubmit={handleSubmit} isLoading={isLoading} />

          {error && (
            <div className="w-full max-w-2xl bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-blue-500">
              <div className="w-6 h-6 border-4 border-current border-t-transparent rounded-full animate-spin" />
              Processing your video...
            </div>
          )}

          {summary && (
            <>
              <Summary data={summary} />
              <Chat
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isChatLoading}
              />
            </>
          )}
        </div>
      </div>

      <Settings
        settings={llmSettings}
        onSettingsChange={setLLMSettings}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default App;