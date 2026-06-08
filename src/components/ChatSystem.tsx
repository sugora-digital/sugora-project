/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Send, Image as ImageIcon, Paperclip, Smile, MoreVertical, Check, 
  CheckCheck, ShieldAlert, ArrowLeft, Bot, Sparkles, Share2, 
  UserPlus, UserCheck, MessageSquare, Plus, Video, FileText, 
  FolderArchive, Trash2, X, AlertTriangle, FileUp, Download
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

const SUGGESTED_EMOJIS = ['👍', '❤️', '😂', '🔥', '👏', '🎉', '💡', '🚀', '🙌', '💯', '✨', '🤩', '🎯', '🤝'];

const ALL_EMOJIS_CATEGORIES = [
  {
    name: 'Smileys & People',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😋', '😛', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🫣', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🫨']
  },
  {
    name: 'Gestures & Hearts',
    emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🪬', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🧠', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹']
  },
  {
    name: 'Tech & Objects',
    emojis: ['💻', '🖥️', '🖨️', '⌨️', '🖱️', '🎛️', '🕹️', '📱', '☎️', '📞', '📟', '📠', '🔋', '🔌', '💡', '🔦', '🕯️', '💵', '🪙', '💴', '💶', '💷', '💳', '💎', '⚖️', '🔑', '🔐', '🔒', '🔓', '🖊️', '🖋️', '📝', '📁', '📂', '📅', '🗑️', '🔔', '📢', '🪐']
  }
];

export default function ChatSystem({ currentUser, usersList = [] }: ChatSystemProps) {
  const [rooms, setRooms] = useState<ChatRoom[]>(INITIAL_ROOMS);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('room-support');
  const [inputVal, setInputVal] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Emoji States
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState<number>(0);

  // File share states
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const [isMobileListOpen, setIsMobileListOpen] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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
      (u.name || '').toLowerCase().includes(queryMatcher) ||
      (u.phone || '').toLowerCase().includes(queryMatcher)
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
    setValidationError(null);

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

    const newMsgId = `m-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: newMsgId,
      room_id: selectedRoomId,
      sender_id: currentUser.id || 'current-user',
      sender_name: currentUser.name || 'Current User',
      text: content,
      created_at: new Date().toISOString(),
      attachment: attachment ? {
        ...attachment,
        // Ensure standard store only chat metadata rule satisfies: save URL, name, type, size and msg reference ID
      } : undefined
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
          last_message: content || `Attachment: ${attachment?.name || 'File Shared'}`,
          last_message_time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
        };
      }
      return r;
    }));

    if (!textToSend) {
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

  const handleSelectEmoji = (emoji: string) => {
    setInputVal(prev => prev + emoji);
  };

  // Modern File sharing Handler with Size checking (50MB) and Metadata Extraction.
  const processUploadedFile = (file: File) => {
    setValidationError(null);

    // 50 MB limit checks
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    if (file.size > MAX_SIZE) {
      setValidationError(`Upload failed: "${file.name}" (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 50MB size limit limit.`);
      // Clear validation message after 5 seconds automatically
      setTimeout(() => setValidationError(null), 6000);
      return;
    }

    // Classify file type to conform to specification
    let classifiedType: 'image' | 'video' | 'audio' | 'document' | 'file' = 'file';
    const mime = file.type.toLowerCase();
    
    if (mime.startsWith('image/')) {
      classifiedType = 'image';
    } else if (mime.startsWith('video/')) {
      classifiedType = 'video';
    } else if (mime.startsWith('audio/')) {
      classifiedType = 'audio';
    } else if (mime === 'application/pdf') {
      classifiedType = 'document'; // PDF mapped as document/file as requested
    } else {
      classifiedType = 'file';
    }

    // Capture metadata - store only metadata (No binary payloads inside database standard storage)
    const file_m_name = file.name;
    const file_m_size = file.size < 1024 * 1024 
      ? `${(file.size / 1024).toFixed(1)} KB` 
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    // Generate local Preview Object URL for interactive sandbox previewing
    const fileObjectURL = URL.createObjectURL(file);

    // Send only metadata package to standard message composer
    handleSendMessage('', {
      url: fileObjectURL,
      type: classifiedType,
      name: file_m_name,
      size: file_m_size
    });
  };

  // Drag-and-drop Events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processUploadedFile(e.target.files[0]);
    }
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

  const filteredRooms = rooms.filter(r => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    
    // Support matching by name, participant name, username, or phone/mobile number
    const usernameMatch = r.participant_username && r.participant_username.toLowerCase().includes(q);
    const originMatch = (usersList || []).find(u => u.id === r.participant_id);
    const phoneMatch = originMatch && originMatch.phone && originMatch.phone.toLowerCase().includes(q);
    
    return (
      r.name.toLowerCase().includes(q) || 
      r.participant_name.toLowerCase().includes(q) ||
      usernameMatch ||
      phoneMatch
    );
  });

  return (
    <div 
      id="chat-system-widget" 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative flex h-full w-full rounded-none md:rounded-3xl overflow-hidden border bg-white dark:bg-zinc-950 border-slate-100 dark:border-zinc-850 shadow-xs md:shadow-xl transition-all duration-350 select-none ${
        isDragging ? 'ring-2 ring-emerald-500 bg-emerald-50/5 dark:bg-emerald-950/5' : ''
      }`}
    >
      {/* File input handle */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileInputChange} 
        className="hidden" 
        id="chat-file-uploader-dom" 
      />

      {/* Drag overlay indicator */}
      {isDragging && (
        <div className="absolute inset-0 bg-indigo-600/10 backdrop-blur-xs z-50 flex flex-col justify-center items-center text-indigo-600 dark:text-indigo-400 pointer-events-none border-4 border-dashed border-indigo-500 rounded-3xl animate-pulse">
          <FileUp className="h-14 w-14 mb-2" />
          <h3 className="font-extrabold text-base">Drag and Drop any file to load instantly</h3>
          <p className="text-xs opacity-75">Images, Videos, PDFs & Documents up to 50MB</p>
        </div>
      )}

      {/* 2. ROOMS SELECTOR SIDEBAR (Mobile togglable, scrollable list) */}
      <div className={`w-full md:w-80 shrink-0 border-r dark:border-zinc-850 bg-slate-50/50 dark:bg-zinc-900/30 flex flex-col ${
        isMobileListOpen ? 'block' : 'hidden md:flex'
      }`}>
        {/* Search header container */}
        <div className="p-4 border-b dark:border-zinc-850 bg-white dark:bg-zinc-950 space-y-3">
          <h2 className="text-sm font-extrabold text-[#1a1f26] dark:text-zinc-150 flex items-center justify-between uppercase tracking-wider">
            <span>Conversations</span>
            <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/40 font-bold font-sans">ACTIVE</span>
          </h2>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search chats, phone or @user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-zinc-900 font-semibold border border-slate-200 dark:border-zinc-800 outline-none focus:bg-white dark:focus:bg-zinc-900 text-slate-800 dark:text-zinc-100"
            />
          </div>
        </div>

        {/* List items block (only this section inside list selection side scrolls) */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100/60 dark:divide-zinc-900/50 pb-16 md:pb-0">
          
          {/* USER DISCOVERY DROPDOWN AREA FOR UNOPEND ROSTER SEARCHES */}
          {searchQuery.trim() !== '' && (
            <div className="bg-indigo-50/25 dark:bg-indigo-950/20 p-2.5 border-b dark:border-zinc-850">
              <span className="block text-[9px] uppercase font-black text-indigo-600 dark:text-indigo-400 tracking-wider px-1 mb-1.5">Discover New Users</span>
              
              {searchedUsersToStart.length === 0 ? (
                <span className="block text-[10.5px] text-zinc-400 dark:text-zinc-500 italic px-1">No user matched your query.</span>
              ) : (
                <div className="space-y-1">
                  {searchedUsersToStart.map(user => (
                    <button
                      key={user.id}
                      onClick={() => handleStartNewChat(user)}
                      className="w-full text-left p-2 rounded-xl bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-850 flex items-center justify-between border dark:border-zinc-800 transition duration-150 text-xs font-semibold"
                    >
                      <div className="flex gap-2 items-center min-w-0">
                        <img referrerPolicy="no-referrer" src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'} className="h-7 w-7 rounded-lg object-cover bg-slate-100" />
                        <div className="min-w-0">
                          <span className="block text-slate-800 dark:text-zinc-150 font-bold truncate">{user.name}</span>
                          <span className="block text-[9px] text-[#22c55e] dark:text-[#4ade80] font-medium truncate">{user.phone || '@' + user.username}</span>
                        </div>
                      </div>
                      <UserPlus className="h-4 w-4 text-indigo-600 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Regular Rooms */}
          {filteredRooms.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 dark:text-zinc-500">
              No conversations found.
            </div>
          ) : (
            filteredRooms.map((room) => {
              const isSel = room.id === selectedRoomId;
              return (
                <div
                  key={room.id}
                  onClick={() => handleSelectRoom(room.id)}
                  className={`p-3.5 flex gap-3 cursor-pointer transition-all duration-150 ${
                    isSel 
                      ? 'bg-indigo-50/40 dark:bg-[#1a1b24]/40 border-l-[3.5px] border-indigo-600 dark:border-indigo-500' 
                      : 'hover:bg-slate-50 dark:hover:bg-zinc-900/40'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      referrerPolicy="no-referrer"
                      src={room.participant_avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'}
                      alt={room.name}
                      className="h-10 w-10 rounded-full object-cover bg-slate-100 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800"
                    />
                    {room.is_online && (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-950 ring-1 ring-slate-100 dark:ring-zinc-800" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 text-left space-y-0.5 pt-0.5">
                    <div className="flex justify-between items-baseline">
                      <h4 className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 truncate">{room.participant_name}</h4>
                      <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-mono font-medium shrink-0">{room.last_message_time}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <p className="text-slate-500 dark:text-zinc-400 truncate max-w-[155px] font-medium leading-relaxed">{room.last_message}</p>
                      {room.unread_count > 0 && (
                        <span className="h-4.5 w-4.5 rounded-md text-[9px] font-black bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shrink-0">
                          {room.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. CONVERSATION VIEW WINDOW (Fills space on selection state, scrollable message list) */}
      <div className={`flex-grow flex flex-col bg-white dark:bg-zinc-950 min-w-0 ${
        !isMobileListOpen ? 'flex' : 'hidden md:flex'
      }`}>
        
        {/* Active room header */}
        {activeRoom ? (
          <>
            <div className="px-5 py-3 border-b border-slate-100 dark:border-zinc-900 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-zinc-900/20">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMobileListOpen(true)}
                  className="rounded-xl h-8 w-8 bg-white dark:bg-zinc-900 border dark:border-zinc-800 flex md:hidden items-center justify-center text-slate-500 dark:text-zinc-400 transition cursor-pointer hover:bg-slate-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>

                <div className="relative shrink-0">
                  <img
                    referrerPolicy="no-referrer"
                    src={activeRoom.participant_avatar}
                    alt={activeRoom.name}
                    className="h-9 w-9 rounded-full object-cover border dark:border-zinc-800"
                  />
                  {activeRoom.is_online && (
                    <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-950" />
                  )}
                </div>

                <div>
                  <h3 className="text-xs font-black text-slate-800 dark:text-zinc-150 leading-tight">
                    {activeRoom.participant_name}
                  </h3>
                  <span className="text-[9.5px] text-slate-400 block font-mono">
                    {activeRoom.participant_username ? `@${activeRoom.participant_username}` : 'Sugora Official Desk'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 p-0.5 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl">
                <span className="h-2 w-2 rounded-full bg-emerald-500 text-transparent mx-2 inline-block animate-pulse">●</span>
                <span className="text-[10.5px] text-slate-400 dark:text-zinc-500 font-bold tracking-tight pr-2">Secure Connection</span>
              </div>
            </div>

            {/* Validation & limit warnings strip */}
            {validationError && (
              <div className="px-4 py-2.5 bg-rose-50 dark:bg-rose-950/25 border-b border-rose-100 dark:border-rose-900/30 text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-2 font-bold animate-fadeIn shrink-0">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Messages box list scrolling container (the only scrollable vertical content here) */}
            <div className="flex-grow overflow-y-auto p-4 md:p-5 space-y-4 bg-slate-50/10 dark:bg-zinc-900/10">
              {activeRoomMessages.map((msg, index) => {
                const isMe = msg.sender_id === currentUser.id || msg.sender_id === 'current-user';
                return (
                  <div key={msg.id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                    <div className="max-w-[75%] space-y-1">
                      
                      {/* Name tags */}
                      {!isMe && (
                        <span className="block text-[8.5px] text-slate-400 dark:text-zinc-500 font-bold px-1 uppercase tracking-widest">{msg.sender_name}</span>
                      )}

                      <div className={`p-3.5 rounded-3xl text-xs font-semibold leading-relaxed relative group ${
                        isMe 
                          ? 'bg-indigo-600 dark:bg-indigo-500 text-white rounded-br-none' 
                          : 'bg-white dark:bg-zinc-900 border dark:border-zinc-850 text-slate-800 dark:text-zinc-200 rounded-bl-none shadow-xs'
                      }`}>
                        
                        {/* Text Content */}
                        {msg.text && <p className="block whitespace-pre-wrap">{msg.text}</p>}

                        {/* Interactive Attachments Rendering with custom icons */}
                        {msg.attachment && (
                          <div className="mt-1.5 space-y-1">
                            {/* Images Attachments */}
                            {msg.attachment.type === 'image' && (
                              <div className="relative group border border-slate-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs bg-slate-50 dark:bg-zinc-950">
                                <img 
                                  referrerPolicy="no-referrer" 
                                  src={msg.attachment.url} 
                                  alt={msg.attachment.name || "Image Preview"} 
                                  className="max-w-64 max-h-48 object-contain w-full rounded-xl"
                                />
                                <div className="p-2 bg-slate-100/90 dark:bg-zinc-900/95 flex justify-between items-center text-[10px] text-slate-600 dark:text-zinc-400 font-mono border-t dark:border-zinc-800">
                                  <span className="truncate max-w-[150px] font-bold">{msg.attachment.name || 'Imagefile.png'}</span>
                                  <span className="font-semibold shrink-0">{msg.attachment.size || '1.1 MB'}</span>
                                </div>
                              </div>
                            )}

                            {/* Video Playback attachments */}
                            {msg.attachment.type === 'video' && (
                              <div className="border border-slate-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs bg-slate-50 dark:bg-zinc-950 max-w-64">
                                <video 
                                  controls 
                                  src={msg.attachment.url} 
                                  className="w-full max-h-48 rounded-t-xl"
                                />
                                <div className="p-2 bg-slate-100/90 dark:bg-zinc-900/95 flex justify-between items-center text-[10px] text-slate-600 dark:text-zinc-400 font-mono border-t dark:border-zinc-800">
                                  <span className="truncate max-w-[150px] font-bold">{msg.attachment.name || 'Video_Clip.mp4'}</span>
                                  <span className="font-semibold shrink-0">{msg.attachment.size || '4.2 MB'}</span>
                                </div>
                              </div>
                            )}

                            {/* PDFs Attachments */}
                            {msg.attachment.type === 'document' && (
                              <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-750 dark:text-red-400 rounded-2xl p-3 max-w-64">
                                <FileText className="h-8 w-8 text-red-500 shrink-0 fill-red-100 dark:fill-red-950" />
                                <div className="min-w-0 flex-1 space-y-0.5 text-left">
                                  <h4 className="font-extrabold text-[11.5px] leading-tight truncate">{msg.attachment.name || 'document.pdf'}</h4>
                                  <span className="block text-[9px] opacity-75 font-mono">{msg.attachment.size || '380 KB'} • PDF File</span>
                                </div>
                                <a 
                                  href={msg.attachment.url} 
                                  download={msg.attachment.name || 'file.pdf'}
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1.5 rounded-xl bg-white dark:bg-zinc-900 hover:bg-red-50 text-red-600 border dark:border-zinc-800 transition active:scale-90"
                                  title="Download / View PDF"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </a>
                              </div>
                            )}

                            {/* Generic Document File Attachments */}
                            {msg.attachment.type === 'file' && (
                              <div className="flex items-center gap-3 bg-slate-100 dark:bg-zinc-900 border dark:border-zinc-800 text-slate-700 dark:text-zinc-300 rounded-2xl p-3 max-w-64">
                                <FolderArchive className="h-8 w-8 text-slate-500 dark:text-zinc-400 shrink-0" />
                                <div className="min-w-0 flex-1 space-y-0.5 text-left">
                                  <h4 className="font-extrabold text-[11.5px] leading-tight truncate text-slate-800 dark:text-zinc-200">{msg.attachment.name || 'archive_assets.zip'}</h4>
                                  <span className="block text-[9px] opacity-75 font-mono text-slate-500 dark:text-zinc-400">{msg.attachment.size || '12.4 MB'} • Document</span>
                                </div>
                                <a 
                                  href={msg.attachment.url} 
                                  download={msg.attachment.name || 'file'}
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-50 text-slate-650 border dark:border-zinc-700 transition active:scale-90"
                                  title="Download File"
                                >
                                  <Download className="h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" />
                                </a>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Interactive message reactions drawer */}
                        <div className="absolute top-1/2 -translate-y-1/2 hidden group-hover:flex gap-1 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-xl p-1 border dark:border-zinc-800 shadow-md z-15 right-full mr-2">
                          {SUGGESTED_EMOJIS.slice(0, 5).map(e_char => (
                            <button
                              key={e_char}
                              onClick={() => handleMessageReaction(msg.id, e_char)}
                              className="hover:scale-130 text-[11px] transition duration-100 select-none cursor-pointer"
                            >
                              {e_char}
                            </button>
                          ))}
                        </div>

                        {/* Display reactions under bubble */}
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div className="flex flex-wrap gap-1 absolute top-full -translate-y-1/2 right-4 bg-white dark:bg-zinc-900 px-1.5 py-0.5 rounded-full border dark:border-zinc-800 text-[9.5px] text-slate-500 shadow-sm z-12 select-none">
                            {msg.reactions.map((react, r_i) => (
                              <span key={r_i} className="cursor-pointer" onClick={() => handleMessageReaction(msg.id, react)}>{react}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      <span className={`block text-[8px] text-slate-400 dark:text-zinc-500 font-mono ${isMe ? 'text-right' : 'text-left'}`}>
                        {new Date(msg.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            {/* Message input composer anchor */}
            <div className="p-3 bg-white dark:bg-zinc-950 border-t border-slate-100 dark:border-zinc-900 space-y-2">
              <div className="flex items-center gap-2">
                
                {/* Manual Click file picker */}
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="rounded-xl h-10 w-10 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-850 border border-slate-200 dark:border-zinc-800 text-slate-505 dark:text-zinc-400 flex items-center justify-center transition shrink-0 cursor-pointer"
                  title="Upload / Share local files (Click / Drag files onto panel)"
                >
                  <Paperclip className="h-4.5 w-4.5" />
                </button>

                {/* Main Instant Text input form */}
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
                    placeholder="Type a message or select / drag files..."
                    className="flex-1 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 p-2.5 text-xs font-semibold focus:bg-white dark:focus:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-indigo-505 text-slate-800 dark:text-zinc-150"
                  />

                  {/* Standard emoji toggler */}
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`rounded-xl h-10 w-10 border flex items-center justify-center transition shrink-0 cursor-pointer ${
                      showEmojiPicker 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-900' 
                        : 'bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-850 border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400'
                    }`}
                    title="Toggle Emoji Box"
                  >
                    <Smile className="h-4.5 w-4.5" />
                  </button>
                  
                  <button
                    type="submit"
                    className="rounded-2xl h-10 w-10 bg-indigo-600 hover:bg-indigo-700 text-[#FFFFFF] shadow-sm flex items-center justify-center transition shrink-0 hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>

              {/* Suggestions strip: Display commonly used emojis below the message box (Suggestions Area) */}
              <div className="flex items-center gap-1 px-1.5 py-0.5 border-t border-slate-50 dark:border-zinc-900/40 justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-zinc-550 font-extrabold pr-1">Suggested:</span>
                  {SUGGESTED_EMOJIS.slice(0, 10).map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleSelectEmoji(emoji)}
                      className="hover:scale-130 transition text-xs font-sans pb-0.5 focus:outline-none select-none cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <span className="text-[9.5px] text-slate-350 dark:text-zinc-500 font-medium italic hidden sm:inline">Drag Files Here to Upload</span>
              </div>

              {/* Advanced inline picker: Show emoji picker directly below the message input area */}
              {showEmojiPicker && (
                <div className="border border-slate-100 dark:border-zinc-800 rounded-2xl bg-slate-5/50 dark:bg-zinc-900/50 p-3.5 space-y-3 animate-fadeIn">
                  <div className="flex justify-between items-center border-b dark:border-zinc-800 pb-1.5">
                    <span className="text-[9.5px] font-extrabold uppercase tracking-wide text-slate-500 dark:text-zinc-400">Unicode Emoji Category Picker</span>
                    <button 
                      onClick={() => setShowEmojiPicker(false)} 
                      className="text-slate-450 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Tabs selector */}
                  <div className="flex gap-1 border-b pb-2 dark:border-zinc-800">
                    {ALL_EMOJIS_CATEGORIES.map((cat, c_idx) => (
                      <button
                        key={cat.name}
                        onClick={() => setActiveEmojiCategory(c_idx)}
                        className={`px-2.5 py-1 text-[10px] rounded-lg font-bold transition cursor-pointer ${
                          activeEmojiCategory === c_idx 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-white hover:bg-slate-50 dark:bg-zinc-80 w text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  {/* Grid layout */}
                  <div className="grid grid-cols-10 gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {ALL_EMOJIS_CATEGORIES[activeEmojiCategory].emojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleSelectEmoji(emoji)}
                        className="py-1 text-center hover:scale-130 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition text-base font-sans select-none cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-center p-12 text-slate-400 dark:text-zinc-505 selection:none select-none">
            <MessageSquare className="h-12 w-12 text-slate-300 dark:text-zinc-700 animate-bounce mb-3" />
            <h4 className="font-extrabold text-slate-650 dark:text-zinc-400">Select or Start a conversation</h4>
            <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-xs mt-1.5 leading-relaxed font-semibold">Enter a profile name, username, or mobile number inside the searching panel to chat immediately.</p>
          </div>
        )}
      </div>
    </div>
  );
}
