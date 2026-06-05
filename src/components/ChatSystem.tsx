/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Send, Image, Paperclip, Smile, MoreVertical, Check, 
  CheckCheck, ShieldAlert, ArrowLeft, Bot, Sparkles, Share2, 
  UserPlus, UserCheck, MessageSquare, Plus 
} from 'lucide-react';
import { Profile, ChatRoom, ChatMessage } from '../types';

interface ChatSystemProps {
  currentUser: Profile;
  usersList?: Profile[];
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

export default function ChatSystem({ currentUser, usersList = [] }: ChatSystemProps) {
  const [rooms, setRooms] = useState<ChatRoom[]>(INITIAL_ROOMS);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('room-support');
  const [inputVal, setInputVal] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [showUploadSimModal, setShowUploadSimModal] = useState<'image' | 'file' | null>(null);
  const [simUploadUrl, setSimUploadUrl] = useState<string>('');
  const [isMobileListOpen, setIsMobileListOpen] = useState<boolean>(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Active searching for users that are NOT currently in the sidebar conversation rooms
  const searchedUsersToStart = searchQuery.trim() ? (usersList || []).filter(u => {
    // Suppress current user from discovery list
    if (u.id === currentUser.id) return false;

    // Suppress users whom we already have active conversations with inside the sidebar
    const hasAlreadyOpenedRoom = rooms.some(r => r.participant_id === u.id);
    if (hasAlreadyOpenedRoom) return false;

    const queryMatcher = searchQuery.toLowerCase();
    return (
      (u.username || '').toLowerCase().includes(queryMatcher) ||
      (u.name || '').toLowerCase().includes(queryMatcher)
    );
  }) : [];

  const handleStartNewChat = (user: Profile) => {
    const existingRoom = rooms.find(r => r.participant_id === user.id);
    if (existingRoom) {
      handleSelectRoom(existingRoom.id);
      return;
    }

    const newRoomId = `room-user-${user.id}`;
    const newRoom: ChatRoom = {
      id: newRoomId,
      name: user.name,
      type: 'one-to-one',
      created_at: new Date().toISOString(),
      last_message: `Let's discuss our partnership.`,
      last_message_time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
      unread_count: 0,
      participant_id: user.id,
      participant_name: user.name,
      participant_username: user.username,
      participant_avatar: user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      is_online: true
    };

    setRooms(prev => [newRoom, ...prev]);
    setMessages(prev => ({
      ...prev,
      [newRoomId]: [
        {
          id: `msg-welcome-${Date.now()}`,
          room_id: newRoomId,
          sender_id: user.id,
          sender_name: user.name,
          text: `Hi there! I detected your username on the search roster. Let's brainstorm ideas for our brand campaigns!`,
          created_at: new Date().toISOString()
        }
      ]
    }));

    handleSelectRoom(newRoomId);
    setSearchQuery('');
  };

  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    setIsMobileListOpen(false);

    // Read unread metrics
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, unread_count: 0 } : r));
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedRoomId]);

  const activeRoom = rooms.find(r => r.id === selectedRoomId);
  const activeRoomMessages = messages[selectedRoomId] || [];

  const handleSendMessage = (textToSend = '', attachment?: ChatMessage['attachment']) => {
    const content = textToSend.trim() || inputVal.trim();
    if (!content && !attachment) return;

    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      room_id: selectedRoomId,
      sender_id: currentUser.id || 'current-user',
      sender_name: currentUser.name || 'Current User',
      text: content,
      created_at: new Date().toISOString(),
      attachment
    };

    setMessages(prev => ({
      ...prev,
      [selectedRoomId]: [...(prev[selectedRoomId] || []), newMsg]
    }));

    // Update room snapshot list
    setRooms(prev => prev.map(r => {
      if (r.id === selectedRoomId) {
        return {
          ...r,
          last_message: content || 'Attachment uploaded',
          last_message_time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
        };
      }
      return r;
    }));

    if (textToSend.trim() === '') {
      setInputVal('');
    }

    // Auto trigger simulations inside chatroom
    setTimeout(() => {
      triggerSimulatedReply();
    }, 1500);
  };

  const triggerSimulatedReply = () => {
    let replyText = "Fascinating perspective! Let's schedule a Zoom call to calibrate these digital downloads.";
    if (selectedRoomId === 'room-support') {
      replyText = "We received your UPI disbursement challenge logs. Resolving this on Razorpay systems within minutes!";
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

  const handleMessageReaction = (msgId: string, emoji: string) => {
    setMessages(prev => ({
      ...prev,
      [selectedRoomId]: (prev[selectedRoomId] || []).map(m => {
        if (m.id === msgId) {
          const reactions = m.reactions || [];
          const updatedReactions = reactions.includes(emoji) 
            ? reactions.filter(r => r !== emoji) 
            : [...reactions, emoji];
          return { ...m, reactions: updatedReactions };
        }
        return m;
      })
    }));
  };

  const filteredRooms = rooms.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.participant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.participant_username && r.participant_username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div id="chat-system-widget" className="relative flex h-[74vh] min-h-[500px] md:h-[630px] rounded-3xl overflow-hidden border border-slate-105 bg-white shadow-xl animate-fadeIn">
      
      {/* 1. ROOMS SELECTOR SIDEBAR (Mobile togglable) */}
      <div className={`w-full md:w-80 shrink-0 border-r bg-slate-50/50 flex flex-col ${
        isMobileListOpen ? 'block' : 'hidden md:flex'
      }`}>
        {/* Search header container */}
        <div className="p-4 border-b space-y-3 bg-white">
          <h2 className="text-base font-black text-slate-900 flex items-center justify-between">
            <span>Conversations</span>
            <span className="text-[10px] bg-emerald-55 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-100 font-bold font-sans">REALTIME CONNECT</span>
          </h2>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search chats or @username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 text-slate-700 font-semibold"
            />
          </div>
        </div>

        {/* List items block */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100/60 pb-16 md:pb-0">
          
          {/* USERNAME SEARCH RESULTS DISCOVERY DROPDOWN AREA */}
          {searchQuery.trim() !== '' && (
            <div className="bg-blue-550/10 p-2.5 space-y-1.5 p-y-2 border-b bg-indigo-50/20">
              <span className="block text-[9.5px] uppercase font-black text-slate-400 tracking-wider px-1">Discover Users by username</span>
              
              {searchedUsersToStart.length === 0 ? (
                <span className="block text-[11px] text-zinc-400 italic px-1 selection:none">No new username credentials matched.</span>
              ) : (
                searchedUsersToStart.map(user => (
                  <button
                    key={user.id}
                    onClick={() => handleStartNewChat(user)}
                    className="w-full text-left p-2 rounded-xl bg-white hover:bg-slate-105 flex items-center justify-between border transition text-xs font-semibold"
                  >
                    <div className="flex gap-2 items-center min-w-0">
                      <img referrerPolicy="no-referrer" src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'} className="h-6.5 w-6.5 rounded-full object-cover" />
                      <div className="min-w-0">
                        <span className="block text-slate-800 font-bold truncate max-w-[120px]">{user.name}</span>
                        <span className="block text-[9px] text-slate-450 font-mono">@{user.username}</span>
                      </div>
                    </div>
                    <UserPlus className="h-4.5 w-4.5 text-blue-600 px-0.5 shrink-0" />
                  </button>
                ))
              )}
            </div>
          )}

          {/* Regular Rooms */}
          {filteredRooms.map((room) => {
            const isSel = room.id === selectedRoomId;
            return (
              <div
                key={room.id}
                onClick={() => handleSelectRoom(room.id)}
                className={`p-3.5 flex gap-3 cursor-pointer transition duration-150 ${
                  isSel ? 'bg-indigo-50/40 border-l-[3.5px] border-blue-600' : 'hover:bg-slate-100/60'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    referrerPolicy="no-referrer"
                    src={room.participant_avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'}
                    alt={room.name}
                    className="h-10 w-10 rounded-full object-cover bg-slate-100 border border-slate-100"
                  />
                  {room.is_online && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-slate-100" />
                  )}
                </div>

                <div className="flex-1 min-w-0 text-left space-y-0.5 pt-0.5">
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-xs font-bold text-slate-800 truncate">{room.participant_name}</h4>
                    <span className="text-[9px] text-slate-400 font-mono font-bold shrink-0">{room.last_message_time}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <p className="text-slate-450 truncate max-w-[155px] font-medium leading-relaxed">{room.last_message}</p>
                    {room.unread_count > 0 && (
                      <span className="h-4.5 w-4.5 rounded-md text-[9px] font-black bg-blue-600 text-white flex items-center justify-center shrink-0">
                        {room.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. CONVERSATION VIEW WINDOW (Fills space on selection state) */}
      <div className={`flex-1 flex flex-col bg-white ${
        !isMobileListOpen ? 'flex' : 'hidden md:flex'
      }`}>
        
        {/* Active room header */}
        {activeRoom ? (
          <>
            <div className="px-5 py-3 border-b flex items-center justify-between shrink-0 bg-slate-50/55">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMobileListOpen(true)}
                  className="rounded-xl h-8 w-8 bg-white border flex md:hidden items-center justify-center text-slate-550 transition cursor-pointer"
                >
                  <ArrowLeft className="h-4.5 w-4.5" />
                </button>

                <div className="relative shrink-0">
                  <img
                    referrerPolicy="no-referrer"
                    src={activeRoom.participant_avatar}
                    alt={activeRoom.name}
                    className="h-9 w-9 rounded-full object-cover border"
                  />
                  {activeRoom.is_online && (
                    <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 border-2 border-slate-50" />
                  )}
                </div>

                <div>
                  <h3 className="text-xs font-black text-slate-900 leading-tight flex items-center gap-1">
                    {activeRoom.participant_name}
                  </h3>
                  <span className="text-[9.5px] text-slate-450 block font-mono">@{activeRoom.participant_username || 'support'}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 p-0.5 bg-white border rounded-xl">
                <span className="h-2 w-2 rounded-full bg-emerald-500 text-transparent mx-2 inline-block">●</span>
                <span className="text-[10.5px] text-slate-450 font-bold tracking-tight pr-2">Realtime Sync</span>
              </div>
            </div>

            {/* Messages box list scrolling container */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 bg-slate-50/15">
              {activeRoomMessages.map((msg, index) => {
                const isMe = msg.sender_id === currentUser.id || msg.sender_id === 'current-user';
                return (
                  <div key={msg.id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                    <div className="max-w-[80%] space-y-1.5">
                      
                      {/* Name tags */}
                      {!isMe && (
                        <span className="block text-[8.5px] text-slate-400 font-bold px-1 uppercase tracking-widest">{msg.sender_name}</span>
                      )}

                      <div className={`p-3.5 rounded-3xl text-xs font-semibold leading-relaxed relative group ${
                        isMe 
                          ? 'bg-blue-600 text-white rounded-br-none' 
                          : 'bg-white border text-slate-850 rounded-bl-none shadow-xs'
                      }`}>
                        
                        {/* Text bubble */}
                        {msg.text && <p className="block whitespace-pre-wrap">{msg.text}</p>}

                        {/* Attachments rendering */}
                        {msg.attachment && msg.attachment.type === 'image' && (
                          <img referrerPolicy="no-referrer" src={msg.attachment.url} alt="Shared Upload" className="max-w-60 max-h-40 object-cover rounded-xl mt-1.5 shadow-xs border" />
                        )}
                        {msg.attachment && msg.attachment.type === 'file' && (
                          <div className="flex items-center gap-2 bg-slate-100 text-slate-755 border rounded-xl p-2.5 mt-1.5">
                            <span className="font-bold text-[10.5px] truncate max-w-[150px]">{msg.attachment.url}</span>
                          </div>
                        )}

                        {/* Message Reaction Hover Drawer */}
                        <div className="absolute top-1/2 -translate-y-1/2 hidden group-hover:flex gap-1 bg-white/95 backdrop-blur-md rounded-xl p-1 border shadow-md z-15 right-full mr-2">
                          {POPULAR_EMOJIS.slice(0, 5).map(e_char => (
                            <button
                              key={e_char}
                              onClick={() => handleMessageReaction(msg.id, e_char)}
                              className="hover:scale-125 text-[11px] transition duration-100"
                            >
                              {e_char}
                            </button>
                          ))}
                        </div>

                        {/* Display reactions */}
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div className="flex flex-wrap gap-1 absolute top-full -translate-y-1/2 right-4 bg-white px-1.5 py-0.5 rounded-full border text-[9.5px] text-slate-500 shadow-sm font-sans z-12 select-none">
                            {msg.reactions.map((react, r_i) => (
                              <span key={r_i}>{react}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      <span className={`block text-[8px] text-slate-400 font-mono ${isMe ? 'text-right' : 'text-left'}`}>
                        {new Date(msg.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            {/* Message input anchor */}
            <div className="p-3 bg-white border-t space-y-2">
              <div className="flex items-center gap-2">
                
                {/* Simulated file attachments selectors */}
                <button
                  onClick={() => setShowUploadSimModal('image')}
                  className="rounded-xl h-9.5 w-9.5 bg-slate-50 hover:bg-slate-100 border text-slate-555 flex items-center justify-center transition shrink-0"
                  title="Upload copy assets"
                >
                  <Image className="h-4.5 w-4.5" />
                </button>

                {/* Main input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex-1 flex gap-2"
                >
                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder="Type an instant message..."
                    className="flex-1 rounded-2xl bg-slate-50 hover:bg-slate-100/50 border p-2.5 text-xs font-semibold focus:bg-white outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                  />
                  
                  <button
                    type="submit"
                    className="rounded-2xl h-10 w-10 bg-blue-600 hover:bg-blue-700 text-[#FFFFFF] shadow-sm flex items-center justify-center transition shrink-0 hover:scale-105 active:scale-95"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-center p-12 text-slate-400 selection:none select-none">
            <MessageSquare className="h-12 w-12 text-slate-350 animate-bounce mb-3" />
            <h4 className="font-extrabold text-slate-650">Select or Start a conversation</h4>
            <p className="text-xs text-slate-400 max-w-xs mt-1.5 leading-relaxed font-semibold">Enter a profile name inside the searching panel to chat immediately.</p>
          </div>
        )}
      </div>

      {/* Simulated image/file attachment uploader modal */}
      {showUploadSimModal && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-105 max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="font-extrabold text-xs uppercase tracking-wider text-slate-800">
                Simulated {showUploadSimModal === 'image' ? 'Image Image file' : 'Document File'} Upload
              </span>
              <button onClick={() => setShowUploadSimModal(null)} className="text-slate-400 font-bold hover:text-slate-800 text-sm">✕</button>
            </div>

            <div className="space-y-3.5 text-xs font-semibold text-slate-505">
              <label className="block text-[9px] uppercase font-bold text-slate-400">Simulation link address / URL</label>
              <input
                type="text"
                placeholder={showUploadSimModal === 'image' ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300' : 'https://sugora.com/files/growth-blueprint.pdf'}
                value={simUploadUrl}
                onChange={(e) => setSimUploadUrl(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="text-[10px] text-slate-400 italic">This simulates immediate full-stack S3/Supabase Storage integrations.</p>
            </div>

            <div className="flex justify-end gap-2 text-xs font-bold pt-2">
              <button onClick={() => setShowUploadSimModal(null)} className="px-3.5 py-2 border rounded-xl hover:bg-slate-50 text-slate-500 font-black">Cancel</button>
              <button onClick={executeSimulatedUpload} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-[#FFFFFF] font-black shadow-sm">Simulate Upload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
