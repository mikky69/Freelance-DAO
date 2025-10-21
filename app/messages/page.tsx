"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Star,
  CheckCircle2,
  ImageIcon,
  File,
  Download,
  Menu,
  ArrowLeft,
  MessageSquare,
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useSearchParams } from "next/navigation"

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState(0)
  const [newMessage, setNewMessage] = useState("")
  const [isMobileConversationOpen, setIsMobileConversationOpen] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  type ConversationSummary = {
    id: string
    name: string
    avatar: string
    lastMessage: string
    timestamp: string
    unread: number
    online: boolean
    project: string
    type: "client" | "freelancer"
    otherPartyId?: string
    jobId?: string
    isPlaceholder?: boolean
  }

  type MessageItem = {
    id: string
    sender: string
    content: string
    timestamp: string
    isOwn: boolean
    type: "text" | "image" | "file"
    fileName?: string
    fileSize?: string
  }

  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [loadingConversations, setLoadingConversations] = useState<boolean>(true)
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false)

  const searchParams = useSearchParams()
  const recipientIdParam = searchParams.get("recipientId")
  const recipientRoleParam = searchParams.get("recipientRole")
  const jobIdParam = searchParams.get("jobId")
  const recipientNameParam = searchParams.get("recipientName")
  const projectParam = searchParams.get("project")

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem("freelancedao_token")
        if (!token) return
        const res = await fetch("/api/messages/conversations", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        if (res.ok) {
          const data = await res.json()
          const convs: ConversationSummary[] = (data.conversations || [])
          if (recipientIdParam) {
            const idx = convs.findIndex((c: ConversationSummary) => c.otherPartyId === recipientIdParam)
            if (idx >= 0) {
              setConversations(convs)
              setSelectedChat(idx)
              fetchMessages(convs[idx].id)
            } else {
              const name = recipientNameParam || "New Chat"
              const avatar = (name || "U")[0]
              const type: "client" | "freelancer" = recipientRoleParam === "freelancer" ? "freelancer" : "client"
              const placeholder: ConversationSummary = {
                id: `new:${recipientIdParam}:${jobIdParam || "none"}`,
                name,
                avatar,
                lastMessage: "Start the conversation...",
                timestamp: "Just now",
                unread: 0,
                online: false,
                project: projectParam || (type === "client" ? "Direct Chat" : "New Conversation"),
                type,
                otherPartyId: recipientIdParam || undefined,
                jobId: jobIdParam || undefined,
                isPlaceholder: true,
              }
              setConversations([placeholder, ...convs])
              setSelectedChat(0)
            }
          } else {
            setConversations(convs)
            if (convs.length > 0) {
              setSelectedChat(0)
              fetchMessages(convs[0].id)
            }
          }
        }
      } catch (e) {
        console.error("Failed to load conversations", e)
      } finally {
        setLoadingConversations(false)
      }
    }
    fetchConversations()
  }, [])

  // Subscribe to SSE for live message updates on the selected conversation
  useEffect(() => {
    const conv = conversations[selectedChat]
    if (!conv || conv.isPlaceholder) return

    const token = localStorage.getItem("freelancedao_token")
    if (!token) return

    const url = `/api/messages/stream?conversationId=${encodeURIComponent(conv.id)}&token=${encodeURIComponent(token)}`
    const es = new EventSource(url)

    const onReady = () => {
      // connection established; optional: console.log("SSE ready")
    }
    const onMessage = (ev: MessageEvent) => {
      try {
        const payload = JSON.parse(ev.data) as MessageItem
        setMessages((prev) => [...prev, payload])
      } catch (err) {
        console.error("Failed to parse SSE message", err)
      }
    }
    const onError = (err: any) => {
      console.warn("SSE connection error", err)
      // EventSource will auto-reconnect; no action needed
    }

    es.addEventListener("ready", onReady)
    es.onmessage = onMessage
    es.onerror = onError

    return () => {
      es.removeEventListener("ready", onReady)
      es.close()
    }
  }, [selectedChat, conversations[selectedChat]?.id])

  const fetchMessages = async (conversationId: string) => {
    setLoadingMessages(true)
    try {
      const token = localStorage.getItem("freelancedao_token")
      if (!token) return
      const res = await fetch(`/api/messages?conversationId=${conversationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch (e) {
      console.error("Failed to load messages", e)
    } finally {
      setLoadingMessages(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return
    try {
      const token = localStorage.getItem("freelancedao_token")
      if (!token) return
      const conversation = conversations[selectedChat]
      if (!conversation) return

      // If this is a placeholder conversation, create the conversation implicitly with recipientId
      if (conversation.isPlaceholder) {
        const res = await fetch("/api/messages", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipientId: conversation.otherPartyId,
            recipientRole: conversation.type,
            jobId: conversation.jobId,
            content: newMessage.trim(),
            type: "text",
          }),
        })
        if (res.ok) {
          const data = await res.json()
          const msg = data.message as MessageItem
          const newConvId = data.conversationId as string
          setConversations((prev) => {
            const updated = [...prev]
            updated[selectedChat] = { ...updated[selectedChat], id: newConvId, isPlaceholder: false }
            return updated
          })
          setMessages((prev) => [...prev, msg])
          setNewMessage("")
          inputRef.current?.focus()
        }
        return
      }

      // Existing conversation: send message normally
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: conversation.id,
          content: newMessage.trim(),
          type: "text",
        }),
      })
      if (res.ok) {
        const data = await res.json()
        const msg = data.message as MessageItem
        const newConvId = data.conversationId as string
        setConversations((prev) => {
          const updated = [...prev]
          updated[selectedChat] = { ...updated[selectedChat], id: newConvId, isPlaceholder: false }
          return updated
        })
        setMessages((prev) => [...prev, msg])
        setNewMessage("")
        inputRef.current?.focus()
      }
    } catch (e) {
      console.error("Failed to send message", e)
    }
  }

  const handleConversationSelect = (index: number) => {
    setSelectedChat(index)
    setIsMobileConversationOpen(true)
    const conv = conversations[index]
    if (conv && !conv.isPlaceholder) fetchMessages(conv.id)
  }

  const ConversationsList = () => (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-slate-200 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input placeholder="Search conversations..." className="pl-10" />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {loadingConversations && (
            <div className="text-sm text-slate-500 px-3 py-2">Loading conversations...</div>
          )}
          {!loadingConversations && conversations.length === 0 && (
            <div className="text-sm text-slate-500 px-3 py-2">No conversations yet</div>
          )}
          {conversations.map((conversation, index) => (
            <div
              key={conversation.id}
              className={`p-3 rounded-lg cursor-pointer transition-colors mb-1 ${
                selectedChat === index ? "bg-blue-50 border border-blue-200" : "hover:bg-slate-50"
              }`}
              onClick={() => handleConversationSelect(index)}
            >
              <div className="flex items-start space-x-3">
                <div className="relative flex-shrink-0">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback
                      className={`${
                        conversation.type === "client" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                      }`}
                    >
                      {conversation.avatar}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.online && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-slate-800 truncate text-sm sm:text-base">{conversation.name}</h4>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {conversation.unread > 0 && (
                        <Badge className="bg-blue-500 text-white text-xs px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                          {conversation.unread}
                        </Badge>
                      )}
                      <span className="text-xs text-slate-500 whitespace-nowrap">{conversation.timestamp}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 truncate mb-2">{conversation.lastMessage}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs truncate max-w-[120px] sm:max-w-none">
                      {conversation.project}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={`text-xs flex-shrink-0 ${
                        conversation.type === "client" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                      }`}
                    >
                      {conversation.type}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )

  const ChatArea = () => {
    const conversation = conversations[selectedChat]
    if (!conversation) {
      return (
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="text-slate-500 text-sm">Select a conversation to start chatting</div>
        </div>
      )
    }

    return (
      <div className="flex-1 flex flex-col bg-white h-full">
        <div className="p-3 sm:p-4 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden p-2"
                onClick={() => setIsMobileConversationOpen(false)}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="relative flex-shrink-0">
                <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                  <AvatarFallback className="bg-blue-100 text-blue-600">{conversation.avatar}</AvatarFallback>
                </Avatar>
                {conversation.online && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-slate-800 text-sm sm:text-base truncate">{conversation.name}</h3>
                <div className="flex items-center space-x-2">
                  <p className="text-xs sm:text-sm text-slate-600 truncate max-w-[150px] sm:max-w-none">
                    {conversation.project}
                  </p>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {conversation.online ? "Online" : "Last seen recently"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              <Button variant="ghost" size="sm" className="p-2">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Video className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 hidden sm:inline-flex">
                <Star className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 p-3 sm:p-4">
          <div className="space-y-4">
            {loadingMessages && (
              <div className="text-sm text-slate-500 px-3 py-2">Loading messages...</div>
            )}
            {!loadingMessages && messages.length === 0 && (
              <div className="text-sm text-slate-500 px-3 py-2">No messages yet. Say hello!</div>
            )}
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] sm:max-w-xs lg:max-w-md ${message.isOwn ? "order-2" : "order-1"}`}>
                  {!message.isOwn && (
                    <div className="flex items-center space-x-2 mb-1">
                      <Avatar className="w-5 h-5 sm:w-6 sm:h-6">
                        <AvatarFallback className="text-xs bg-blue-100 text-blue-600">{message.sender[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium text-slate-700">{message.sender}</span>
                    </div>
                  )}
                  <div
                    className={`rounded-lg px-3 py-2 sm:px-4 sm:py-2 ${
                      message.isOwn ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-800 border border-slate-200"
                    }`}
                  >
                    {message.type === "text" && <p className="text-sm">{message.content}</p>}
                    {message.type === "image" && (
                      <div className="space-y-2">
                        <div className="w-40 h-28 sm:w-48 sm:h-32 bg-slate-200 rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 sm:w-8 h-8 text-slate-400" />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="truncate">{message.fileName}</span>
                          <Button variant="ghost" size="sm" className="h-6 px-2">
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                    {message.type === "file" && (
                      <div className="flex items-center space-x-3 p-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <File className="w-4 h-4 sm:w-5 h-5 text-slate-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{message.fileName}</p>
                          <p className="text-xs opacity-75">{message.fileSize}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 px-2 flex-shrink-0">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className={`flex items-center mt-1 space-x-1 ${message.isOwn ? "justify-end" : "justify-start"}`}>
                    <span className="text-xs text-slate-500">{message.timestamp}</span>
                    {message.isOwn && (
                      <div className="flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-blue-500" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-3 sm:p-4 border-t border-slate-200 flex-shrink-0">
          <div className="flex items-end space-x-2">
            <Button variant="ghost" size="sm" className="mb-2 p-2 flex-shrink-0">
              <Paperclip className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <Textarea
                ref={inputRef}
                autoFocus
                dir="ltr"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => {
                  const v = e.target.value
                  setNewMessage(v)
                  requestAnimationFrame(() => {
                    const el = inputRef.current
                    if (el) {
                      const end = v.length
                      try {
                        el.setSelectionRange(end, end)
                      } catch {}
                    }
                  })
                }}
                className="min-h-[44px] max-h-32 resize-none text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
              />
            </div>
            <Button onClick={sendMessage} className="bg-blue-500 hover:bg-blue-600 mb-2 p-2 flex-shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute requireAuth={true} requireCompleteProfile={true}>
      <div className="min-h-screen bg-slate-50">
        <div className="h-screen bg-slate-50 flex flex-col">
          <div className="bg-white border-b border-slate-200 px-4 py-4 flex-shrink-0">
            <div className="container mx-auto">
              <div className="flex items-center justify-between">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center">
                  <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                  Messages
                </h1>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="md:hidden">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-80">
                    <ConversationsList />
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
          <div className="flex-1 flex overflow-hidden">
            <div className="hidden md:flex w-full">
              <div className="w-80 border-r border-slate-200">
                <ConversationsList />
              </div>
              <ChatArea />
            </div>
            <div className="md:hidden w-full">{!isMobileConversationOpen ? <ConversationsList /> : <ChatArea />}</div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}