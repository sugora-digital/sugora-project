/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, Trash2, Plus, Sparkles, Copy, Check, Clock, 
  Image, Mic, MicOff, FolderPlus, Folder, Smile, ChevronLeft, ChevronRight, Share2 
} from 'lucide-react';
import { Profile, AIConversation, AIMessage } from '../types';
import ReactMarkdown from 'react-markdown';

interface AIChatBotProps {
  currentUser: Profile;
}

interface AIChatFolder {
  id: string;
  name: string;
}

interface Reaction {
  emoji: string;
  count: number;
}

const POPULAR_EMOJIS = ['👍', '❤️', '😂', '🔥', '👏', '🎉', '💡', '🚀'];

export default function AIChatBot({ currentUser }: AIChatBotProps) {
  // Folder categories
  const [folders, setFolders] = useState<AIChatFolder[]>([
    { id: 'f-marketing', name: 'Marketing Tips' },
    { id: 'f-code', name: 'Page Layouts' },
    { id: 'f-general', name: 'Inspirations' }
  ]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [isCreatingFolder, setIsCreatingFolder] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');

  // Conversations
  const [conversations, setConversations] = useState<AIConversation[]>([
    { id: 'conv-1', user_id: currentUser.id, title: 'Sugora Tree Marketing Strategy', created_at: new Date().toISOString() },
    { id: 'conv-2', user_id: currentUser.id, title: 'Landing Page Copywriting', created_at: new Date(Date.now() - 3600000).toISOString() }
  ]);
  const [activeConvId, setActiveConvId] = useState<string>('conv-1');

  // Conversation-Folder mappings
  const [convFolderMapping, setConvFolderMapping] = useState<Record<string, string>>({
    'conv-1': 'f-marketing',
    'conv-2': 'f-code'
  });

  // Messages with reaction states
  const [messages, setMessages] = useState<Record<string, (AIMessage & { reactions?: Record<string, number>, imageUrl?: string })[]>>({
    'conv-1': [
      { id: 'm1', conversation_id: 'conv-1', role: 'model', content: 'Hello! I am **Sugora Copilot**. Ask me how to promote affiliate products, grow your Instagram list, design bespoke Sugora Tree themes, or write custom page builder layout grids!', created_at: new Date().toISOString(), reactions: { '👍': 1 } }
    ],
    'conv-2': [
      { id: 'm-lc-1', conversation_id: 'conv-2', role: 'model', content: 'Sure, tell me about your landing page, target audience, and key values, and I\'ll craft responsive high-converting copy in seconds!', created_at: new Date(Date.now() - 3600000).toISOString() }
    ]
  });

  const [inputText, setInputText] = useState<string>('');
  const [isPendingAI, setIsPendingAI] = useState<boolean>(false);
  const [creditLimit, setCreditLimit] = useState<number>(50); // counts down from 50
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Simulated Media Attachments
  const [isMicListening, setIsMicListening] = useState<boolean>(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isHoveredMsgId, setIsHoveredMsgId] = useState<string | null>(null);
  const [activeEmojiDropdownMsgId, setActiveEmojiDropdownMsgId] = useState<string | null>(null);

  // Chat Sidebar Toggle on Mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

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
        content: `I created a fresh dialog box! What marketing or platform setup questions do you have today? You can write code or ask for layout parameters.`,
        created_at: new Date().toISOString()
      }]
    }));
    // Map to currently active folder if filtered
    if (selectedFolderId !== 'all') {
      setConvFolderMapping(prev => ({ ...prev, [newId]: selectedFolderId }));
    }
    setActiveConvId(newId);
  };

  const handleDeleteChat = (convId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setConversations(prev => prev.filter(c => c.id !== convId));
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

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const newId = `folder-${Date.now()}`;
    setFolders(prev => [...prev, { id: newId, name: newFolderName.trim() }]);
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  const handleAssignFolder = (convId: string, folderId: string) => {
    setConvFolderMapping(prev => ({
      ...prev,
      [convId]: folderId
    }));
  };

  const handleSimulateVoiceInput = () => {
    if (isMicListening) {
      setIsMicListening(false);
      return;
    }
    setIsMicListening(true);
    setTimeout(() => {
      setInputText(prev => prev + (prev ? " " : "") + "Draft an advanced affiliate conversion page showing total commission graphs.");
      setIsMicListening(false);
    }, 2500);
  };

  const handleAttachSimulatedImage = () => {
    const urls = [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=300',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=300',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300'
    ];
    const picked = urls[Math.floor(Math.random() * urls.length)];
    setAttachedImage(picked);
  };

  const handleAddReaction = (msgId: string, emoji: string) => {
    setMessages(prev => {
      const activeList = prev[activeConvId] || [];
      const updatedList = activeList.map(m => {
        if (m.id !== msgId) return m;
        const currentReactions = m.reactions || {};
        const currentCount = currentReactions[emoji] || 0;
        return {
          ...m,
          reactions: {
            ...currentReactions,
            [emoji]: currentCount + 1
          }
        };
      });
      return {
        ...prev,
        [activeConvId]: updatedList
      };
    });
    setActiveEmojiDropdownMsgId(null);
  };

  const handleSendPrompt = async () => {
    if ((!inputText.trim() && !attachedImage) || isPendingAI) return;
    if (creditLimit <= 0) {
      alert('Sandbox credit allocation limit reached! You can top up under your credentials page.');
      return;
    }

    const promptText = inputText;
    const currentAttachedImage = attachedImage;
    setInputText('');
    setAttachedImage(null);

    const userMessage = {
      id: `usr-${Date.now()}`,
      conversation_id: activeConvId,
      role: 'user' as const,
      content: promptText,
      created_at: new Date().toISOString(),
      imageUrl: currentAttachedImage || undefined
    };

    setMessages(prev => ({
      ...prev,
      [activeConvId]: [...(prev[activeConvId] || []), userMessage]
    }));

    setIsPendingAI(true);

    try {
      const historyToSend = (messages[activeConvId] || []).map(m => ({
        role: m.role,
        content: m.content
      }));

      // Direct post to backend Gemini service
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: promptText + (currentAttachedImage ? " [Attached Image analysis]" : ""),
          history: historyToSend
        })
      });

      const data = await response.json();

      if (response.ok) {
        const aiMessage = {
          id: `ai-${Date.now()}`,
          conversation_id: activeConvId,
          role: 'model' as const,
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
      const fallbackMsg = `#### Suggested Marketing Actions:\n- **Promote directly on Instagram** using our responsive templates.\n- Set your **commission allocations to 15%** under System Admin to accelerate conversions.\n- Upload digital checklist ZIP files on the Shop module.\n\n*(Gemini sandbox notice: configure your \`GEMINI_API_KEY\` inside AI Studio Secrets for automated real-time answers)*`;
      
      const aiErrorMsg = {
        id: `ai-err-${Date.now()}`,
        conversation_id: activeConvId,
        role: 'model' as const,
        content: fallbackMsg,
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

  const filteredConversations = conversations.filter(c => {
    if (selectedFolderId === 'all') return true;
    return convFolderMapping[c.id] === selectedFolderId;
  });

  const activeMessages = messages[activeConvId] || [];

  return (
    <div id="ai-chat-root" className="grid grid-cols-1 lg:grid-cols-12 h-full w-full rounded-none md:rounded-2xl overflow-hidden border border-slate-100 dark:border-zinc-855 bg-white dark:bg-[#0c0d12] shadow-xs md:shadow-lg flex-1 font-sans">
      
      {/* Dynamic ChatGPT Sidebars (Collapsible/Responsive) */}
      <div className={`${isSidebarOpen ? 'flex' : 'hidden'} lg:flex lg:col-span-4 shrink-0 border-r border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 flex-col justify-between`}>
        
        {/* Header and Folder section */}
        <div className="p-4 space-y-4 border-b border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#0c0d12]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider font-sans">AI Workspace</span>
            <button
              onClick={handleCreateNewChat}
              className="rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold py-2 px-3.5 text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 border-0 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> New Dialog
            </button>
          </div>

          {/* Collapsible Filter folders list */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[9px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-widest px-1">
              <span>Collection Folders</span>
              <button onClick={() => setIsCreatingFolder(!isCreatingFolder)} className="hover:text-blue-600 text-slate-400 dark:text-zinc-500 bg-transparent border-0 cursor-pointer">
                <FolderPlus className="h-3.5 w-3.5" />
              </button>
            </div>

            {isCreatingFolder && (
              <div className="flex gap-1.5 mt-2 p-1.5 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900">
                <input
                  type="text"
                  placeholder="Folder name..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="bg-white dark:bg-[#0c0d12] text-slate-800 dark:text-zinc-200 px-2 py-1 text-[10px] font-medium border border-slate-200 dark:border-zinc-800 rounded-lg focus:outline-none flex-1"
                />
                <button onClick={handleCreateFolder} className="bg-blue-600 hover:bg-blue-700 text-white rounded px-2.5 py-1 text-[9px] font-bold border-0 cursor-pointer">
                  Add
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-1 mt-1.5">
              <button
                onClick={() => setSelectedFolderId('all')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                  selectedFolderId === 'all'
                    ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-400'
                    : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-750'
                }`}
              >
                📁 All
              </button>
              {folders.map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFolderId(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                    selectedFolderId === f.id
                      ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-400'
                      : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-750'
                  }`}
                >
                  📂 {f.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat conversations thread navigation list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-none">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-10 text-slate-400 dark:text-zinc-500 text-xs font-medium">No discussions in this folder</div>
          ) : (
            filteredConversations.map((c) => {
              const isSelected = c.id === activeConvId;
              const mappedFolder = folders.find(f => f.id === convFolderMapping[c.id]);
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setActiveConvId(c.id);
                    // on mobile, close sidebar after pick
                    if (window.innerWidth < 1024) setIsSidebarOpen(false);
                  }}
                  className={`group w-full p-3 rounded-xl flex flex-col gap-1.5 text-left transition relative cursor-pointer font-sans select-none ${
                    isSelected
                      ? 'bg-blue-50/50 dark:bg-[#1a2b40]/30 text-blue-950 dark:text-blue-150 font-semibold border-l-2 border-blue-600 dark:border-blue-400'
                      : 'text-slate-755 hover:bg-slate-100/50 hover:text-slate-900 dark:hover:bg-zinc-900/30 dark:hover:text-zinc-150'
                  }`}
                >
                  <div className="flex items-center justify-between min-w-0">
                    <span className="truncate text-xs text-slate-850 dark:text-zinc-200 font-bold max-w-[150px]">{c.title}</span>
                    <button
                      onClick={(e) => handleDeleteChat(c.id, e)}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 text-slate-400 dark:text-zinc-500 hover:text-red-650 dark:hover:text-red-400 transition bg-transparent border-0 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-medium font-sans">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                    {/* Folder assignment toggler */}
                    <select
                      value={convFolderMapping[c.id] || ''}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleAssignFolder(c.id, e.target.value)}
                      className="text-[8px] bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-850 rounded px-1 text-slate-500 dark:text-zinc-400 max-w-[75px] font-bold focus:outline-none"
                    >
                      <option value="">Move to...</option>
                      {folders.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Dynamic Credit Tracker panel */}
        <div className="p-4 border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#0c0d12]">
          <div className="rounded-2xl bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-[#111322] dark:to-[#17152c] p-3.5 border border-slate-100 dark:border-zinc-800">
            <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider mb-1.5 font-sans">
              <span>Sandbox limits</span>
              <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400">{creditLimit}/50 units</span>
            </div>
            <div className="w-full bg-slate-150 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden text-[1px]">
              <div style={{ width: `${(creditLimit / 50) * 100}%` }} className="bg-indigo-605 h-full bg-indigo-600 dark:bg-indigo-550 transition-all duration-300" />
            </div>
            <p className="text-[9px] text-slate-450 dark:text-zinc-500 mt-2 font-medium leading-relaxed font-sans text-left">
              Sandbox credit counts down per dispatch. Administrative role settings override total allocation directly.
            </p>
          </div>
        </div>
      </div>

      {/* Main ChatGPT Chat Frame Container */}
      <div className="lg:col-span-8 flex flex-col justify-between bg-white dark:bg-[#0c0d12] relative">
        
        {/* Chat Workspace Header */}
        <div className="px-4 py-3.5 border-b border-slate-100 dark:border-zinc-900 flex items-center justify-between bg-white dark:bg-[#0c0d12] shadow-xs shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile collapsible indicator */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-850 text-slate-500 dark:text-zinc-400 border-0 cursor-pointer"
            >
              {isSidebarOpen ? <ChevronLeft className="h-4.5 w-4.5" /> : <ChevronRight className="h-4.5 w-4.5" />}
            </button>
            <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Bot className="h-5 w-5" />
            </div>
            <div className="text-left">
              <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-150 flex items-center gap-1.5 leading-tight font-sans">
                Sugora Copilot
                <span className="inline-flex items-center rounded bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-400">
                  Online
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium font-sans">Model: gemini-3.5-flash (Secure API execution)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleCreateNewChat} 
              className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-900 text-slate-500 dark:text-zinc-400 bg-transparent border-0 cursor-pointer"
              title="New dialog thread"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Chat message bubbles scroll column */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/20 dark:bg-zinc-900/5 space-y-4">
          {activeMessages.map((msg) => {
            const isModel = msg.role === 'model';
            const isHovered = isHoveredMsgId === msg.id;

            return (
              <div 
                key={msg.id} 
                className={`flex ${isModel ? 'justify-start' : 'justify-end'}`}
                onMouseEnter={() => setIsHoveredMsgId(msg.id)}
                onMouseLeave={() => {
                  setIsHoveredMsgId(null);
                  setActiveEmojiDropdownMsgId(null);
                }}
              >
                <div className={`max-w-[85%] rounded-2xl p-4.5 shadow-xs relative group/bubble border ${
                  isModel
                    ? 'bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 border-slate-100 dark:border-zinc-850'
                    : 'bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 border-indigo-200/50 dark:border-indigo-900/40 ring-2 ring-indigo-50/50 dark:ring-indigo-950/20'
                }`}>
                  
                  {/* Sender title & Utility copy row */}
                  <div className="flex items-center justify-between gap-4 border-b border-slate-101 dark:border-zinc-800/80 pb-2 mb-2 font-sans">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-600 dark:text-indigo-400">
                      {isModel ? 'Sugora AI Assistant' : 'You (Creator Account)'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopyMessage(msg.content)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-350 transition bg-transparent border-0 cursor-pointer"
                        title="Copy message"
                      >
                        {copiedText === msg.content ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                      
                      {/* React Emoji Selector */}
                      <div className="relative">
                        <button
                          onClick={() => setActiveEmojiDropdownMsgId(activeEmojiDropdownMsgId === msg.id ? null : msg.id)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-350 transition bg-transparent border-0 cursor-pointer"
                          title="Add reaction"
                        >
                          <Smile className="h-3.5 w-3.5" />
                        </button>

                        {activeEmojiDropdownMsgId === msg.id && (
                          <div className="absolute right-0 bottom-full mb-1 z-20 bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 shadow-md rounded-lg p-1.5 flex gap-1 animate-fadeIn select-none">
                            {POPULAR_EMOJIS.map(emoji => (
                              <button
                                key={emoji}
                                onClick={() => handleAddReaction(msg.id, emoji)}
                                className="hover:bg-slate-50 dark:hover:bg-zinc-800 p-1 text-sm rounded transition border-0 cursor-pointer"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Render simulated image attachment */}
                  {msg.imageUrl && (
                    <div className="mb-3 rounded-xl overflow-hidden border border-slate-100 dark:border-zinc-800 max-w-sm">
                      <img src={msg.imageUrl} alt="Attached screenshot analysis" className="w-full object-cover max-h-48" />
                    </div>
                  )}

                  {/* Message body using react-markdown */}
                  <div className="text-xs text-slate-700 dark:text-zinc-200 leading-relaxed font-sans space-y-3 prose dark:prose-invert max-w-none text-left">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>

                  {/* Current reactions listing */}
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3.5 font-sans">
                      {Object.entries(msg.reactions).map(([reactionEmoji, reactionCount]) => (
                        <span 
                          key={reactionEmoji} 
                          className="inline-flex items-center gap-1 bg-slate-50 dark:bg-zinc-855 border border-slate-150 dark:border-zinc-800 rounded-full px-2 py-0.5 text-[10px] font-mono text-slate-500 dark:text-zinc-400"
                        >
                          <span>{reactionEmoji}</span>
                          <span className="font-bold">{reactionCount}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  <span className="block text-[8px] opacity-40 text-right mt-2 text-slate-400 dark:text-zinc-500 select-none font-mono">
                    {new Date(msg.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}

          {isPendingAI && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-zinc-900 border border-slate-105 dark:border-zinc-800 p-4 rounded-2xl flex items-center gap-2.5 shadow-sm">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600 dark:bg-blue-400"></span>
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-400 dark:text-zinc-550 animate-pulse">
                  Copilot is formulating expert advice...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Dispatcher and Sandbox helpers */}
        <div className="p-3 md:p-4 border-t border-slate-150 dark:border-zinc-900 bg-white dark:bg-[#0c0d12] shrink-0 font-sans">
          
          {/* Active attachment review bubble */}
          {attachedImage && (
            <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950/30 border border-blue-105 dark:border-blue-900/50 rounded-xl px-3.5 py-1.5 mb-3 text-xs text-blue-800 dark:text-blue-400 animate-fadeIn font-sans">
              <div className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                <span>Simulated Image file ready for review</span>
              </div>
              <button onClick={() => setAttachedImage(null)} className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-transparent border-0 cursor-pointer">
                Cancel
              </button>
            </div>
          )}

          {isMicListening && (
            <div className="flex items-center gap-2.5 bg-red-50 dark:bg-red-955/20 border border-red-105 dark:border-red-900/30 rounded-xl px-3.5 py-2 mb-3 text-xs text-red-800 dark:text-red-400 animate-pulse font-sans">
              <Mic className="h-4 w-4 animate-bounce text-red-600 dark:text-red-450 shrink-0" />
              <span>Listening to voice commands... Simulated transaction templates ready.</span>
            </div>
          )}

          <div className="flex gap-2 items-center">
            {/* Simulated Multi-Media Actions */}
            <div className="flex gap-1">
              <button
                onClick={handleAttachSimulatedImage}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-850 text-slate-505 dark:text-zinc-400 transition active:scale-95 border-0 cursor-pointer"
                title="Mock image upload"
              >
                <Image className="h-4.5 w-4.5" />
              </button>
              <button
                onClick={handleSimulateVoiceInput}
                className={`p-2.5 rounded-xl transition active:scale-95 cursor-pointer border-0 ${
                  isMicListening 
                    ? 'bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400' 
                    : 'bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-850 text-slate-505 dark:text-zinc-400'
                }`}
                title="Google Speech voice prompt simulation"
              >
                <Mic className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Ask Copilot: How do I grow followers on Instagram, or code custom grids..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendPrompt();
                }}
                disabled={isPendingAI}
                className="w-full rounded-xl bg-slate-50 dark:bg-zinc-900 focus:bg-white dark:focus:bg-[#0c0d12] border border-slate-150 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 focus:ring-2 focus:ring-blue-500 py-3 pl-4 pr-10 text-xs focus:outline-none transition disabled:opacity-50 text-slate-800 dark:text-zinc-100 font-medium"
              />
            </div>

            <button
              onClick={handleSendPrompt}
              disabled={isPendingAI || (!inputText.trim() && !attachedImage)}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-3 text-white hover:opacity-95 active:scale-95 transition disabled:opacity-40 shrink-0 shadow-md border-0 cursor-pointer"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="mt-2 text-center">
            <span className="text-[9.5px] text-slate-400 dark:text-zinc-550 font-mono">
              ⚡ Secure end-to-end communication sandbox active. Free allocations refreshed hourly.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
