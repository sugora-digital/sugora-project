/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Search, Send, Image, Paperclip, Smile, MoreVertical, Check, CheckCheck, ShieldAlert, ArrowLeft, Bot, Sparkles, Share2 } from 'lucide-react';
import { Profile, ChatRoom, ChatMessage } from '../types';

interface ChatSystemProps {
  currentUser: Profile;
}

const INITIAL_ROOMS: ChatRoom[] = [
  {
    id: 'room-support',
    name: 'Sugora Official Support Team',
    type: 'support',
    created_at: new Date().toISOString(),
    last_message: 'How can we help you today with your Sugora Tree or Wallet?',
    last_message_time: '10:30 AM',
    unread_count: 1,
    participant_id: 'support-agent',
    participant_name: 'Agent Sarah',
    participant_username: 'sarah_support',
    participant_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    is_online: true
  },
  {
    id: 'room-developer',
    name: 'Sam Billings (Co-founder)',
    type: 'one-to-one',
    created_at: new Date().toISOString(),
    last_message: 'Hey, did you check the new Instagram growth template?',
    last_message_time: 'Yesterday',
    unread_count: 0,
    participant_id: 'user-developer',
    participant_name: 'Sam Billings',
    participant_username: 'samb',
    participant_avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150',
    is_online: false
  }
];

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'room-support': [
    {
      id: 'm1',
      room_id: 'room-support',
      sender_id: 'support-agent',
      sender_name: 'Agent Sarah',
      text: 'Hello! I am Sarah from Sugora Support. Please upload your documents for KYC or ask anything about our wallet.',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      is_read: true
    }
  ],
  'room-developer': [
    {
      id: 'm2',
      room_id: 'room-developer',
      sender_id: 'user-developer',
      sender_name: 'Sam Billings',
      text: 'What do you think about integrating digital files directly on our Sugora Tree profiles?',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      is_read: true
    },
    {
      id: 'm3',
      room_id: 'room-developer',
      sender_id: 'current-user',
      sender_name: 'Owner',
      text: 'I think that is perfect! It streamlines digital selling immediately.',
      created_at: new Date(Date.now() - 7000000).toISOString(),
      is_read: true
    },
    {
      id: 'm4',
      room_id: 'room-developer',
      sender_id: 'user-developer',
      sender_name: 'Sam Billings',
      text: 'Hey, did you check the new Instagram growth template?',
      created_at: new Date(Date.now() - 5000000).toISOString(),
      is_read: true
    }
  ]
};

const POPULAR_EMOJIS = ['👍', '❤️', '😂', '🔥', '👏', '🎉', '💡', '🚀', '🙌', '💯'];

export default function ChatSystem({ currentUser }: ChatSystemProps) {
  const [rooms, setRooms] = useState<ChatRoom[]>(INITIAL_ROOMS);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('room-support');
  const [inputVal, setInputVal] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [showUploadSimModal, setShowUploadSimModal] = useState<'image' | 'file' | null>(null);
  const [simUploadUrl, setSimUploadUrl] = useState<string>('');
  const [isMobileListOpen, setIsMobileListOpen] = useState<boolean>(true);

  const activeRoom = rooms.find(r => r.id === selectedRoomId);
  const activeRoomMessages = messages[selectedRoomId] || [];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedRoomId, messages]);

  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    setIsMobileListOpen(false);

    // Mark messages in room as read
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        return { ...r, unread_count: 0 };
      }
      return r;
    }));
  };

  const handleSendMessage = (textToSend = inputVal, fileData?: { url: string; type: 'image' | 'file' }) => {
    if (!textToSend.trim() && !fileData) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      room_id: selectedRoomId,
      sender_id: currentUser.id,
      sender_name: currentUser.name,
      text: textToSend,
      file_url: fileData?.url,
      file_type: fileData?.type,
      created_at: new Date().toISOString(),
      is_read: false
    };

    // Update active room last message
    setRooms(prev => prev.map(r => {
      if (r.id === selectedRoomId) {
        return {
          ...r,
          last_message: textToSend || (fileData?.type === 'image' ? '📷 Image attached' : '📁 Document attached'),
          last_message_time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
        };
      }
      return r;
    }));

    setMessages(prev => ({
      ...prev,
      [selectedRoomId]: [...(prev[selectedRoomId] || []), newMessage]
    }));

    setInputVal('');
    setShowEmojiPicker(false);

    // Trigger customized automated support helper reply after 1.5 seconds
    setTimeout(() => {
      triggerSimulatedResponse(textToSend || '');
    }, 1500);
  };

  const triggerSimulatedResponse = (userPromptText: string) => {
    let replyText = 'Thanks for reaching out! Let me fetch that information for you.';
    const promptLower = userPromptText.toLowerCase();

    if (selectedRoomId === 'room-support') {
      if (promptLower.includes('kyc') || promptLower.includes('verify')) {
        replyText = 'Hi! For quick KYC approval, ensure both files are clear JPEG/PNG captures. Under Admin panel you can instantly simulate approvals yourself!';
      } else if (promptLower.includes('wallet') || promptLower.includes('payout') || promptLower.includes('withdraw')) {
        replyText = 'Our automated system supports UPI withdrawal instantly once Approved. The minimum limit is ₹100. Let me check if your account is ready.';
      } else if (promptLower.includes('link') || promptLower.includes('tree') || promptLower.includes('sugora')) {
        replyText = 'You can customize your card widgets, theme background, social profiles directly inside the Sugora Tree tab. Try clicking Customize!';
      } else {
        replyText = 'Understood. Let me create an assistance request. Agent Sarah has been updated inside our support queue!';
      }
    } else {
      replyText = 'Awesome response! Let me double check that and get back to you soon.';
    }

    const simMessage: ChatMessage = {
      id: `sim-${Date.now()}`,
      room_id: selectedRoomId,
      sender_id: activeRoom?.participant_id || 'peer',
      sender_name: activeRoom?.participant_name || 'Agent',
      text: replyText,
      created_at: new Date().toISOString(),
      is_read: true
    };

    setMessages(prev => ({
      ...prev,
      [selectedRoomId]: [...(prev[selectedRoomId] || []), simMessage]
    }));

    // Update room list
    setRooms(prev => prev.map(r => {
      if (r.id === selectedRoomId) {
        return {
          ...r,
          last_message: replyText,
          last_message_time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
        };
      }
      return r;
    }));
  };

  const executeSimulatedUpload = () => {
    if (!simUploadUrl.trim()) return;

    handleSendMessage('', {
      url: simUploadUrl,
      type: showUploadSimModal === 'image' ? 'image' : 'file'
    });

    setSimUploadUrl('');
    setShowUploadSimModal(null);
  };

  const filteredRooms = rooms.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.participant_name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div id="chat-system-widget" className="relative flex h-[620px] rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-xl dark:border-zinc-800/80 dark:bg-zinc-950">
      
      {/* Search & Rooms list (Full width on search list state, sidebar on desktop) */}
      <div className={`w-full md:w-80 shrink-0 border-r border-gray-100 dark:border-zinc-800/60 bg-gray-50/50 dark:bg-zinc-900/30 flex flex-col ${
        isMobileListOpen ? 'block' : 'hidden md:flex'
      }`}>
        <div className="p-4 border-b border-gray-50 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            Sugora Chat <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">Realtime</span>
          </h2>
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-white dark:bg-zinc-900 py-2 pl-9 pr-4 text-xs border border-gray-100 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Channels/Inbox Scroll Column */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50/40 dark:divide-zinc-800/10">
          {filteredRooms.map((r) => {
            const isSelected = r.id === selectedRoomId;
            return (
              <button
                key={r.id}
                onClick={() => handleSelectRoom(r.id)}
                className={`w-full p-4 flex items-start gap-3 text-left transition ${
                  isSelected ? 'bg-emerald-50/80 dark:bg-emerald-950/20 border-l-4 border-emerald-500' : 'hover:bg-gray-100/50 dark:hover:bg-zinc-900/40'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    referrerPolicy="no-referrer"
                    src={r.participant_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=80'}
                    alt={r.participant_name}
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-gray-100/80"
                  />
                  {r.is_online && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900 dark:text-zinc-100 truncate">{r.participant_name}</span>
                    <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">{r.last_message_time}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500 truncate dark:text-zinc-400">{r.last_message}</p>
                  {r.unread_count && r.unread_count > 0 ? (
                    <span className="mt-1 inline-block bg-emerald-500 text-white rounded-full text-[10px] px-1.5 py-0.5 font-bold animate-bounce">
                      {r.unread_count} new
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main chat window (Hidden on mobile if listing is active) */}
      <div className={`flex-1 flex flex-col bg-white dark:bg-zinc-950 ${
        isMobileListOpen ? 'hidden md:flex' : 'flex'
      }`}>
        {activeRoom ? (
          <>
            {/* Direct Channel Info header */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-950 shadow-sm shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMobileListOpen(true)}
                  className="md:hidden p-1 rounded-lg hover:bg-gray-100 text-gray-600 dark:text-zinc-300"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <img
                  referrerPolicy="no-referrer"
                  src={activeRoom.participant_avatar}
                  alt={activeRoom.participant_name}
                  className="h-9 w-9 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100">{activeRoom.participant_name}</h3>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1">
                    {activeRoom.is_online ? (
                      <>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active now
                      </>
                    ) : 'offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {activeRoom.type === 'support' && (
                  <span className="inline-flex items-center gap-1 rounded bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700 dark:bg-teal-950/30">
                    <Sparkles className="h-2.5 w-2.5" /> Support Operator
                  </span>
                )}
                <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/40 dark:bg-zinc-900/20">
              {activeRoomMessages.map((msg, index) => {
                const isMyMessage = msg.sender_id === currentUser.id;
                return (
                  <div
                    key={msg.id || index}
                    className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%] rounded-2xl p-3 shadow-sm ${
                      isMyMessage
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : 'bg-white text-gray-900 dark:bg-zinc-900 dark:text-zinc-100 rounded-bl-none border border-gray-100 dark:border-zinc-800'
                    }`}>
                      {!isMyMessage && (
                        <p className="text-[10px] uppercase font-bold tracking-wider opacity-60 mb-1">
                          {msg.sender_name}
                        </p>
                      )}
                      
                      {/* Text content */}
                      {msg.text && <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>}

                      {/* Attached images / files */}
                      {msg.file_url && msg.file_type === 'image' && (
                        <div className="mt-2 text-center">
                          <img
                            referrerPolicy="no-referrer"
                            src={msg.file_url}
                            alt="attachment"
                            className="max-h-48 rounded-lg object-contain bg-black/5"
                          />
                        </div>
                      )}

                      {msg.file_url && msg.file_type === 'file' && (
                        <div className={`mt-2 p-2 rounded flex items-center gap-2 text-xs font-mono border ${
                          isMyMessage ? 'bg-emerald-700/50 border-emerald-500' : 'bg-gray-50 dark:bg-zinc-800 border-gray-100 dark:border-zinc-800'
                        }`}>
                          <Paperclip className="h-4.5 w-4.5" />
                          <span className="truncate max-w-[120px]">{msg.file_url}</span>
                        </div>
                      )}

                      <div className="mt-1 flex items-center justify-end gap-1 text-[9px] opacity-70">
                        <span>{new Date(msg.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                        {isMyMessage && (
                          msg.is_read ? <CheckCheck className="h-3 w-3 text-teal-200" /> : <Check className="h-3 w-3 text-white/70" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message composer input bar */}
            <div className="p-3 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0">
              {/* Popular quick emoji bar */}
              {showEmojiPicker && (
                <div className="mb-2 p-2 bg-gray-50 dark:bg-zinc-900 rounded-xl flex items-center justify-around">
                  {POPULAR_EMOJIS.map(em => (
                    <button
                      key={em}
                      onClick={() => {
                        setInputVal(prev => prev + em);
                        setShowEmojiPicker(false);
                      }}
                      className="text-base hover:scale-125 transition"
                    >
                      {em}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-1.5 focus:outline-none text-gray-500 hover:text-gray-700 dark:hover:text-zinc-300"
                >
                  <Smile className="h-5 w-5" />
                </button>
                
                {/* Upload attachment proxies */}
                <button
                  onClick={() => setShowUploadSimModal('image')}
                  className="p-1.5 focus:outline-none text-gray-500 hover:text-gray-700 dark:hover:text-zinc-300"
                  title="Simulate Image Attachment"
                >
                  <Image className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowUploadSimModal('file')}
                  className="p-1.5 focus:outline-none text-gray-500 hover:text-gray-700 dark:hover:text-zinc-300"
                  title="Simulate Document Attachment"
                >
                  <Paperclip className="h-5 w-5" />
                </button>

                <textarea
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-9 align-middle"
                />

                <button
                  onClick={() => handleSendMessage()}
                  className="rounded-xl bg-emerald-600 p-2 text-white hover:bg-emerald-700 active:scale-95 transition"
                >
                  <Send className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400">
            <Smile className="h-12 w-12 text-gray-200 dark:text-zinc-800 mb-2" />
            <p className="text-sm">Select any dialogue on the left column to begin chatting!</p>
          </div>
        )}
      </div>

      {/* Simulated Upload modal popup */}
      {showUploadSimModal && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-40">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-zinc-900 border dark:border-zinc-800">
            <h4 className="text-sm font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-1.5 mb-2">
              <Share2 className="h-4 w-4 text-emerald-600" />
              Simulate {showUploadSimModal === 'image' ? 'Image File' : 'Document File'} Upload
            </h4>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              To mock database storage, paste any visual hosting URL or select a preset option below.
            </p>
            
            <input
              type="text"
              placeholder={showUploadSimModal === 'image' ? 'Paste JPEG URL...' : 'Paste PDF URL...'}
              value={simUploadUrl}
              onChange={(e) => setSimUploadUrl(e.target.value)}
              className="w-full rounded-xl bg-gray-50 dark:bg-zinc-950 py-2.5 px-3 text-xs border border-gray-100 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-3"
            />

            {/* Quick preset chips */}
            <div className="mb-4 flex flex-wrap gap-2">
              {showUploadSimModal === 'image' ? (
                <>
                  <button
                    onClick={() => setSimUploadUrl('https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=400')}
                    className="rounded bg-gray-100 px-2 py-1 text-[10px] text-gray-700 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    Unsplash Template
                  </button>
                  <button
                    onClick={() => setSimUploadUrl('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=400')}
                    className="rounded bg-gray-100 px-2 py-1 text-[10px] text-gray-700 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    Gradient Artwork
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setSimUploadUrl('https://sugora.com/downloads/pan-verification.pdf')}
                    className="rounded bg-gray-100 px-2 py-1 text-[10px] text-gray-700 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    scanned_pan_card.pdf
                  </button>
                  <button
                    onClick={() => setSimUploadUrl('https://sugora.com/downloads/aadhaar-kyc.pdf')}
                    className="rounded bg-gray-100 px-2 py-1 text-[10px] text-gray-700 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    aadhaar_card_scanned.pdf
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => {
                  setShowUploadSimModal(null);
                  setSimUploadUrl('');
                }}
                className="rounded-xl px-3 py-2 text-xs text-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={executeSimulatedUpload}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs text-white font-semibold hover:bg-emerald-700"
              >
                Attach file
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
