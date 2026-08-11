"use client";

import { useState } from "react";

import { Sparkles, Send, Bot, User } from "lucide-react";

import useGenAIChat from "@/hooks/useGenAIChat";

import { LlamaVariant } from "@/types/genai";

export default function ChatWindow() {

    //////////////////////////////////////////////////////////
    // State
    //////////////////////////////////////////////////////////

    const {
        messages,
        isLoading,
        error,
        sendMessage,
        selectedModel,
        setSelectedModel,
    } = useGenAIChat();

    const [input, setInput] = useState("");

    //////////////////////////////////////////////////////////
    // Submit
    //////////////////////////////////////////////////////////

    function handleSubmit(e: React.FormEvent) {

        e.preventDefault();

        if (!input.trim() || isLoading) return;

        sendMessage(input);

        setInput("");

    }

    //////////////////////////////////////////////////////////
    // UI
    //////////////////////////////////////////////////////////

    return (

        <div className="flex h-[calc(100vh-8rem)] flex-col space-y-8">

            {/* Page Header */}

            <div className="flex items-center justify-between">

                <div>

                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        GenAI Studio
                    </h1>

                    <p className="mt-2 text-slate-400">
                        Chat with NxZen AI Studio's Llama-powered assistant.
                    </p>

                </div>

                <select
                    value={selectedModel}
                    onChange={(e) =>
                        setSelectedModel(e.target.value as LlamaVariant)
                    }
                    className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-pink-500 focus:outline-none"
                >
                    <option value={LlamaVariant.SCOUT}>
                        Llama 4 Scout (Fast / Long Context)
                    </option>
                    <option value={LlamaVariant.MAVERICK}>
                        Llama 4 Maverick (Deep Reasoning)
                    </option>
                    <option value={LlamaVariant.LLAMA_3_3_70B}>
                        Llama 3.3 70B (Legacy)
                    </option>
                </select>

            </div>

            {/* Chat Panel */}

            <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">

                {/* Messages */}

                <div className="flex-1 space-y-4 overflow-y-auto p-6">

                    {messages.length === 0 && (

                        <div className="flex h-full flex-col items-center justify-center text-center text-slate-500">

                            <div className="rounded-2xl bg-pink-600/20 p-4">
                                <Sparkles size={32} className="text-pink-400" />
                            </div>

                            <p className="mt-4 text-slate-400">
                                Ask anything to start a conversation.
                            </p>

                        </div>

                    )}

                    {messages.map((msg, idx) => (

                        <div
                            key={idx}
                            className={`flex items-start gap-3 ${
                                msg.role === "user"
                                    ? "flex-row-reverse"
                                    : "flex-row"
                            }`}
                        >

                            <div
                                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                                    msg.role === "user"
                                        ? "bg-blue-600"
                                        : "bg-pink-600/20"
                                }`}
                            >
                                {msg.role === "user" ? (
                                    <User size={16} className="text-white" />
                                ) : (
                                    <Bot size={16} className="text-pink-400" />
                                )}
                            </div>

                            <div
                                className={`max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                    msg.role === "user"
                                        ? "bg-blue-600 text-white"
                                        : "border border-slate-700 bg-slate-950 text-slate-200"
                                }`}
                            >
                                {msg.content}
                            </div>

                        </div>

                    ))}

                    {isLoading && (

                        <div className="flex items-center gap-3 text-slate-400">

                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-pink-600/20">
                                <Bot size={16} className="text-pink-400" />
                            </div>

                            <span className="animate-pulse text-sm">
                                Assistant is typing...
                            </span>

                        </div>

                    )}

                </div>

                {/* Error */}

                {error && (

                    <div className="border-t border-red-500/20 bg-red-500/10 px-6 py-3">

                        <p className="text-sm text-red-300">{error}</p>

                    </div>

                )}

                {/* Input */}

                <form
                    onSubmit={handleSubmit}
                    className="flex items-center gap-3 border-t border-slate-700 p-4"
                >

                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Message Llama..."
                        className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-pink-500"
                    />

                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="
                            flex
                            items-center
                            gap-2
                            rounded-xl
                            bg-pink-600
                            px-6
                            py-3
                            font-semibold
                            text-white
                            transition-all
                            duration-200
                            hover:bg-pink-700
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        <Send size={16} />
                        Send
                    </button>

                </form>

            </div>

        </div>

    );

}
