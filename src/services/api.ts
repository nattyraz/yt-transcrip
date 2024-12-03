import axios from 'axios';
import { ApiResponse, LLMSettings } from '../types';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'
  : 'http://localhost:3000/api';

export const summarizeVideo = async (
  videoUrl: string,
  llmSettings: LLMSettings
): Promise<ApiResponse> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/summarize`,
      {
        videoUrl,
        llmProvider: llmSettings.provider,
        apiKey: llmSettings.apiKey,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to summarize video');
    }
    throw error;
  }
};

export const askQuestion = async (
  question: string,
  videoContext: string,
  llmSettings: LLMSettings
): Promise<string> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/chat`,
      {
        question,
        videoContext,
        llmProvider: llmSettings.provider,
        apiKey: llmSettings.apiKey,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.answer;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to get answer');
    }
    throw error;
  }
};