"use client";

import { useCallback, useState } from "react";

import GenAIService from "@/services/genai.service";

import {
    ChatRequest,
    LlamaVariant,
    Message,
} from "@/types/genai";

export default function useGenAIChat() {

    //////////////////////////////////////////////////////////
    // State
    //////////////////////////////////////////////////////////

    const [messages, setMessages] =
        useState<Message[]>([]);

    const [isLoading, setIsLoading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const [selectedModel, setSelectedModel] =
        useState<LlamaVariant>(LlamaVariant.MAVERICK);

    //////////////////////////////////////////////////////////
    // Send Message
    //////////////////////////////////////////////////////////

    const sendMessage =
        useCallback(async (content: string) => {

            setIsLoading(true);

            setError(null);

            const userMessage: Message = {
                role: "user",
                content,
            };

            const newMessages = [
                ...messages,
                userMessage,
            ];

            setMessages(newMessages);

            try {

                const request: ChatRequest = {
                    messages: newMessages,
                    model: selectedModel,
                };

                const response =
                    await GenAIService.createChatCompletion(
                        request
                    );

                //////////////////////////////////////////////
                // Typewriter Effect
                //////////////////////////////////////////////

                const words = response.reply.split(" ");

                let currentText = "";

                setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: "" },
                ]);

                for (let i = 0; i < words.length; i++) {

                    currentText +=
                        (i === 0 ? "" : " ") + words[i];

                    setMessages((prev) => {

                        const updated = [...prev];

                        updated[updated.length - 1] = {
                            role: "assistant",
                            content: currentText,
                        };

                        return updated;

                    });

                    await new Promise((resolve) =>
                        setTimeout(resolve, 50)
                    );

                }

            } catch (err: any) {

                console.error("GenAI Chat Error:", err);

                setError(
                    err?.response?.data?.message ??
                    "Failed to get a response from the assistant."
                );

            } finally {

                setIsLoading(false);

            }

        }, [messages, selectedModel]);

    //////////////////////////////////////////////////////////
    // Return
    //////////////////////////////////////////////////////////

    return {

        messages,

        isLoading,

        error,

        sendMessage,

        selectedModel,

        setSelectedModel,

    };

}
