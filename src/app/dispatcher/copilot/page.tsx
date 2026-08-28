'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { Bot, Sparkles, Send, ShieldCheck, Database, Code, CornerDownLeft, Zap } from 'lucide-react';
import { answerCopilotQuestion } from '../../../lib/ai/groq';

interface ChatMessage {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
  toolUsed?: string;
  toolData?: any;
  timestamp: string;
}

const SUGGESTED_PROMPTS = [
  'Which shipments are at risk?',
  'Why was L-11 selected?',
  'Which lorry is best for S-1042?',
  'Can we consolidate Chennai shipments?',
  'What happens if L-07 fails?',
  'How much did optimization save today?',
  'Which route costs the most?',
  'Which shipment should we prioritize?',
];

export default function FleetMindAIPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'copilot',
      text: "Hello! I am **FleetMind AI**, your real-time fleet decision assistant powered by FleetMind Intelligence. I have live access to verified fleet metrics, route telemetry, and consolidation algorithms. How can I assist your dispatch operations today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      let response: { answer: string; toolUsed: string; toolData: any };
      try {
        const res = await fetch('/api/ai/copilot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: textToSend }),
        });
        if (res.ok) {
          response = await res.json();
        } else {
          response = await answerCopilotQuestion(textToSend);
        }
      } catch {
        response = await answerCopilotQuestion(textToSend);
      }

      const copilotMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'copilot',
        text: response.answer,
        toolUsed: response.toolUsed,
        toolData: response.toolData,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, copilotMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'copilot',
        text: "I encountered an error executing backend inspection tools. Please ensure server connectivity.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PortalHeader
        title="FleetMind AI Assistant"
        subtitle="Operational Decision Intelligence with Safe Tool-Calling and Strict Hallucination Control"
        category="FleetMind AI · Neural Copilot"
        icon={<Bot className="w-5 h-5" />}
        accent="purple"
      />

      <main className="p-4 sm:p-6 max-w-5xl mx-auto w-full flex-1 flex flex-col h-[calc(100vh-100px)]">
        {/* Security Badge */}
        <div className="mb-4 bg-violet-50 border border-violet-200 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-violet-950">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-violet-600" />
            <span className="font-semibold">
              Hallucination Guard Active: FleetMind AI answers are strictly bound to verified backend facts.
            </span>
          </div>
          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-violet-200 text-violet-800">
            TOOL-CALLING PIPELINE
          </span>
        </div>

        {/* Chat Messages Timeline */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-card p-6 overflow-y-auto space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'copilot' && (
                <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-xl space-y-2 rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white font-medium rounded-tr-none'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
                }`}
              >
                {/* Tool Calling Execution Tag */}
                {msg.toolUsed && (
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-[10px] space-y-1 font-mono text-slate-600 mb-2">
                    <div className="flex items-center gap-1.5 font-bold text-violet-700">
                      <Database className="w-3 h-3" />
                      <span>Executed Backend Tool: {msg.toolUsed}()</span>
                    </div>
                  </div>
                )}

                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div
                  className={`text-[9px] text-right ${
                    msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3 animate-in fade-in">
              <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-500 flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
                <span>Executing backend tool & synthesizing verified answer...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts & Input */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
            {SUGGESTED_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold whitespace-nowrap shadow-subtle transition"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 bg-white rounded-2xl border border-slate-200 shadow-card p-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask FleetMind AI about shipments, lorry efficiency, risk, or simulations..."
              className="flex-1 px-4 py-2 text-xs font-medium text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              Send
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
