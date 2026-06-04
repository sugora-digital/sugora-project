"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Trash2, Plus, Copy, Check } from 'lucide-react';
import { Profile, AIConversation, AIMessage } from '../types';

interface AIChatBotProps {
  currentUser: Profile;
}

export default function AIChatBot({ currentUser }: AIChatBotProps) {
  const [conversations, setConversations] = useState<AIConversation[]>([
    { id: 'conv-1', user_id: currentUser.id, title: 'Sugora Tree Marketing Strategy', created_at: new Date().toISOString() }
  ]);
  const [activeConvId, setActiveConvId] = useState<string>('conv-1');
  const [messages, setMessages] = useState<Record<string, AIMessage[]>>({
    'conv-1': [
      { id: 'm1', conversation_id: 'conv-1', role: 'model', content: 'Hello! I am Sugora AI. Ask me how to promote affiliate products, grow your Instagram list, design bespoke Sugora Tree themes, or write SQL tables!', created_at: new Date().toISOString() }
    ]
  });

  const [inputText, setInputText] = useState<string>('');
  const [isPendingAI, setIsPendingAI] = useState<boolean>(false);
  const [creditLimit, setCreditLimit] = useState<number>(50); // counts down from 50
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeConvId]);

  const handleCreateNewChat = () => {
    const newId = `conv-${Date.now()}`;
    const newChat: AIConversation = {
      id: newId,
      user_id: currentUser.id,
      title: `AI Chat #${conversations.length + 1}`,
      created_at: new Date().toISOString()
    };
    setConversations(prev => [newChat, ...prev]);
    setMessages(prev => ({
      ...prev,
      [newId]: [{
        id: `m-init-${Date.now()}`,
        conversation_id: newId,
        role: 'model',
        content: 'I created a fresh dialog box! What core marketing questions do you have today?',
        created_at: new Date().toISOString()
      }]
    }));
    setActiveConvId(newId);
  };

  const handleDeleteChat = (convId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setConversations(prev => prev.filter(c => c.id !== convId));
    // If deleted the active one, pick first remaining or clear
    if (activeConvId === convId) {
      const remaining = conversations.filter(c => c.id !== convId);
      if (remaining.length > 0) {
        setActiveConvId(remaining[0].id);
      }
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedText(content);
    setTimeout(() => setCopiedText(null), 1500);
  };

  const handleSendPrompt = async () => {
    if (!inputText.trim() || isPendingAI) return;
    if (creditLimit <= 0) {
      // Out of tokens limit block
      alert('You have depleted your sandbox credit tokens! Admin can reset this allocation under Admin console.');
      return;
    }

    const currentPrompt = inputText;
    setInputText('');

    const userMessage: AIMessage = {
      id: `usr-${Date.now()}`,
      conversation_id: activeConvId,
      role: 'user',
      content: currentPrompt,
      created_at: new Date().toISOString()
    };

    // Update active state
    setMessages(prev => ({
      ...prev,
      [activeConvId]: [...(prev[activeConvId] || []), userMessage]
    }));

    setIsPendingAI(true);

    try {
      // Gather active history in proper format
      const historyToSend = (messages[activeConvId] || []).map(m => ({
        role: m.role,
        content: m.content
      }));

      // Direct server post call to avoid browser API leaking
      // Corrected to use /api/chat instead of /api/ai/chat based on Next.js folder routing!
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentPrompt,
          history: historyToSend
        })
      });

      const data = await response.json();

      if (response.ok) {
        const aiMessage: AIMessage = {
          id: `ai-${Date.now()}`,
          conversation_id: activeConvId,
          role: 'model',
          content: data.response,
          created_at: new Date().toISOString()
        };

        setMessages(prev => ({
          ...prev,
          [activeConvId]: [...(prev[activeConvId] || []), aiMessage]
        }));

        setCreditLimit(prev => Math.max(0, prev - 1));
      } else {
        throw new Error(data.error || 'Server error');
      }

    } catch (err: any) {
      console.error('AI call failure:', err);
      // Give fallback mock explanation
      const aiErrorMsg: AIMessage = {
        id: `ai-err-${Date.now()}`,
        conversation_id: activeConvId,
        role: 'model',
        content: `Error details: ${err.message || 'Connection timeout.'}\n\nMake sure to add your **GEMINI_API_KEY** in the Secrets panel inside AI Studio so we can process real responses!`,
        created_at: new Date().toISOString()
      };

      setMessages(prev => ({
        ...prev,
        [activeConvId]: [...(prev[activeConvId] || []), aiErrorMsg]
      }));
    } finally {
      setIsPendingAI(false);
    }
  };

  const activeMessages = messages[activeConvId] || [];

  return (
    <div id="ai-chat-root" className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[620px] rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-xl dark:border-zinc-800/80 dark:bg-zinc-950 font-sans">
      
      {/* Sidebar - Chat History list */}
      <div className="hidden lg:col-span-4 shrink-0 border-r border-gray-100 dark:border-zinc-800/60 bg-gray-50/50 dark:bg-zinc-900/30 flex flex-col justify-between">
        <div className="p-4 border-b border-gray-50 dark:border-zinc-800">
          <button
            onClick={handleCreateNewChat}
            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition"
          >
            + Start New Chat
          </button>
        </div>

        {/* Scrollable listing */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map((c) => {
            const isSelected = c.id === activeConvId;
            return (
              <button
                key={c.id}
                onClick={() => setActiveConvId(c.id)}
                className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition text-xs ${
                  isSelected
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300 font-bold'
                    : 'text-gray-700 hover:bg-gray-100/50 dark:text-zinc-300 dark:hover:bg-zinc-900/40'
                }`}
              >
                <span className="truncate max-w-[150px]">{c.title}</span>
                <span
                  onClick={(e) => handleDeleteChat(c.id, e)}
                  className="p-1 rounded hover:bg-red-100 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Credit Tracker panel */}
        <div className="p-4 border-t border-gray-50 dark:border-zinc-800/30 bg-white dark:bg-zinc-950">
          <div className="rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 p-3 flex flex-col gap-1">
            <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Usage tracking limit</span>
            <span className="text-sm font-bold text-gray-900 dark:text-zinc-200">
              {creditLimit} Remaining Credits
            </span>
            <div className="w-full bg-emerald-200 dark:bg-emerald-900 h-1.5 rounded-full overflow-hidden mt-1 text-[1px]">
              <div style={{ width: `${(creditLimit / 50) * 100}%` }} className="bg-emerald-600 h-full transition-all duration-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Main AI Interaction Portal */}
      <div className="lg:col-span-8 flex flex-col justify-between bg-white dark:bg-zinc-950">
        
        {/* Dynamic heading info */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-white dark:bg-zinc-950 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-emerald-600 animate-pulse" />
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-1.5">
                Sugora Copilot
                <span className="text-[10px] bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded font-bold uppercase dark:bg-teal-950/40 dark:text-teal-300">Active</span>
              </h3>
              <p className="text-[9px] text-gray-400 font-medium">Model: Gemini (Secure execution via server route)</p>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button onClick={handleCreateNewChat} className="text-xs bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg font-bold dark:bg-emerald-950/30 dark:text-emerald-300">
              New
            </button>
          </div>
        </div>

        {/* Dialog bubble board */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/20 dark:bg-zinc-900/10 space-y-4">
          {activeMessages.map((msg) => {
            const isModel = msg.role === 'model';
            return (
              <div key={msg.id} className={`flex ${isModel ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm relative ${
                  isModel
                    ? 'bg-white text-gray-900 dark:bg-zinc-900 dark:text-zinc-100 border border-gray-100 dark:border-zinc-800'
                    : 'bg-emerald-600 text-white'
                }`}>
                  <div className="flex items-center justify-between gap-4 border-b border-gray-50/10 pb-1.5 text-[9px] uppercase tracking-wide font-bold opacity-60 mb-2">
                    <span>{isModel ? 'Sugora AI' : 'Creator Panel'}</span>
                    <button
                      onClick={() => handleCopyMessage(msg.content)}
                      className="p-1 hover:bg-black/10 rounded flex items-center gap-1"
                      title="Copy content"
                    >
                      {copiedText === msg.content ? <Check className="h-3 w-3.5 text-emerald-500" /> : <span className="text-[9px]">[Copy]</span>}
                    </button>
                  </div>

                  {/* Message prompt block formatting */}
                  <div className="text-xs space-y-2 leading-relaxed">
                    {msg.content.split('\n\n').map((paragraph, i) => {
                      // Check for code blocks
                      if (paragraph.startsWith('```')) {
                        const cleanCode = paragraph.replace(/```/g, '');
                        return (
                          <pre key={i} className="bg-zinc-950 text-emerald-400 p-3 rounded-lg overflow-x-auto font-mono text-[10px] border border-zinc-800/80 my-2">
                            <code>{cleanCode}</code>
                          </pre>
                        );
                      }
                      
                      // Check for itemized headings or lists
                      if (paragraph.startsWith('-')) {
                        return (
                          <ul key={i} className="list-disc pl-4 space-y-1 my-1">
                            {paragraph.split('\n').map((li, idx) => (
                              <li key={idx}>{li.replace('-', '').trim()}</li>
                            ))}
                          </ul>
                        );
                      }

                      return <p key={i} className="whitespace-pre-wrap">{paragraph}</p>;
                    })}
                  </div>

                  <span className="absolute bottom-1 right-2 text-[8px] opacity-40">
                    {new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}

          {isPendingAI && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-[11px] font-mono font-bold text-gray-400 animate-pulse">Copilot is formulating advice...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Dispatcher Bar */}
        <div className="p-3 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask Copilot: e.g. How do I setup Razorpay, or write database migrations..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendPrompt();
              }}
              disabled={isPendingAI}
              className="flex-1 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 py-3 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
            />
            <button
              onClick={handleSendPrompt}
              disabled={isPendingAI || !inputText.trim()}
              className="rounded-xl bg-emerald-600 text-white font-bold text-xs py-3 px-5 hover:bg-emerald-700 active:scale-95 transition disabled:opacity-40 shrink-0"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
