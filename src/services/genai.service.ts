import api from "@/lib/studioApi";

import {
    ChatRequest,
    ChatResponse,
} from "@/types/genai";

class GenAIService {

    ////////////////////////////////////////////
    // Create Chat Completion
    ////////////////////////////////////////////

    async createChatCompletion(

        request: ChatRequest,

    ): Promise<ChatResponse> {

        const response =
            await api.post<ChatResponse>(
                "/genai/chat",
                request,
            );

        return response.data;

    }

}

export default new GenAIService();
