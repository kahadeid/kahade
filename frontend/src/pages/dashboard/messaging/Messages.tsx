import { SkipToContent } from '@/lib/accessibility';
import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
// Date formatting utility
const formatDistanceToNow = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};
import {
  MessageCircle,
  Send,
  Search,
  MoreVertical,
  Phone,
  Video,
  Image,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  ArrowLeft,
} from "lucide-react";

interface Conversation {
  id: string;
  type: string;
  title: string | null;
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: string;
  } | null;
  participants: {
    userId: string;
    user: {
      username: string;
      avatarUrl: string | null;
    };
  }[];
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  type: string;
  createdAt: string;
  isRead: boolean;
  sender: {
    username: string;
    avatarUrl: string | null;
  };
}

export default function Messages() {
  const { conversationId } = useParams();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
      const conv = conversations.find((c) => c.id === conversationId);
      setSelectedConversation(conv || null);
    }
  }, [conversationId, conversations]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      const response = await api.get("/messaging/conversations");
      setConversations(response.data.data || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const response = await api.get(`/messaging/conversations/${convId}/messages`);
      setMessages(response.data.data || []);
      // Mark as read
      await api.post(`/messaging/conversations/${convId}/read`);
    } catch (error) {
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId) return;

    try {
      const response = await api.post(`/messaging/conversations/${conversationId}/messages`, {
        content: newMessage.trim(),
        type: "TEXT",
      });

      setMessages((prev) => [...prev, response.data]);
      setNewMessage("");
    } catch (error) {
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getOtherParticipant = (conv: Conversation) => {
    const other = conv.participants.find((p) => p.userId !== user?.id);
    return other?.user || { username: "Unknown", avatarUrl: null };
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const other = getOtherParticipant(conv);
    return other.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      {/* Conversation List */}
      <div
        className={`w-full md:w-80 lg:w-96 bg-white border-r flex flex-col ${
          conversationId ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b">
          <h1 className="text-xl font-semibold text-gray-800 mb-4">Pesan</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 aria-hidden="true" text-gray-400" />
            <input
              type="text"
              placeholder="Cari percakapan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <MessageCircle className="h-12 w-1 aria-hidden="true"2 mb-4" />
              <p>Belum ada percakapan</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const other = getOtherParticipant(conv);
              const isSelected = conv.id === conversationId;

              return (
                <div
                  key={conv.id}
                  onClick={() => navigate(`/dashboard/messages/${conv.id}`)}
                  className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isSelected ? "bg-blue-50 border-l-4 border-blue-600" : ""
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {other.avatarUrl ? (
                        <img
                          src={other.avatarUrl}
                          alt={other.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-semibold text-gray-600">
                          {other.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">
                        {conv.title || other.username}
                      </h3>
                      {conv.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(conv.lastMessage.createdAt))}
                        </span>
                      )}
                    </div>
                    {conv.lastMessage && (
                      <p className="text-sm text-gray-500 truncate">
                        {conv.lastMessage.senderId === user?.id ? "Anda: " : ""}
                        {conv.lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={`flex-1 flex flex-col ${
          !conversationId ? "hidden md:flex" : "flex"
        }`}
      >
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b p-4 flex items-center">
              <button
                onClick={() => navigate("/dashboard/messages")}
                className="md:hidden mr-3 p-1 hover:bg-gray-100 rounded"
              >
                <ArrowLeft className="h-5 w-5 aria-hidden="true"" />
              </button>
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {getOtherParticipant(selectedConversation).avatarUrl ? (
                  <img
                    src={getOtherParticipant(selectedConversation).avatarUrl!}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-semibold text-gray-600">
                    {getOtherParticipant(selectedConversation).username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="ml-3 flex-1">
                <h2 className="font-semibold text-gray-900">
                  {selectedConversation.title ||
                    getOtherParticipant(selectedConversation).username}
                </h2>
                <p className="text-xs text-green-500">Online</p>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <MoreVertical className="h-5 w-5 aria-hidden="true" text-gray-500" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => {
                const isOwn = message.senderId === user?.id;

                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        isOwn
                          ? "bg-blue-600 text-white rounded-br-md"
                          : "bg-white text-gray-900 rounded-bl-md shadow-sm"
                      }`}
                    >
                      <p className="break-words">{message.content}</p>
                      <div
                        className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                          isOwn ? "text-blue-100" : "text-gray-400"
                        }`}
                      >
                        <span>
                          {new Date(message.createdAt).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {isOwn && (
                          message.isRead ? (
                            <CheckCheck className="h-4 w-4 aria-hidden="true"" />
                          ) : (
                            <Check className="h-4 w-4 aria-hidden="true"" />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="bg-white border-t p-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
                >
                  <Paperclip className="h-5 w-5 aria-hidden="true"" />
                </button>
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
                >
                  <Image className="h-5 w-5 aria-hidden="true"" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ketik pesan..."
                  className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
                >
                  <Smile className="h-5 w-5 aria-hidden="true"" />
                </button>
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5 aria-hidden="true"" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <MessageCircle className="h-16 w-1 aria-hidden="true"6 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Pilih Percakapan</h2>
            <p>Pilih percakapan dari daftar untuk mulai mengobrol</p>
          </div>
        )}
      </div>
    </div>
  );
}
