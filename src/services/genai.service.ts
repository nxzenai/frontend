import apiClient from './apiClient';
import { ChatRequest, ChatResponse } from '../types/genai';

export const genaiService = {
  createChatCompletion: async (request: ChatRequest): Promise<ChatResponse> => {
    const response = await apiClient.post<ChatResponse>('/genai/chat', request);
    return response.data;
  },
};