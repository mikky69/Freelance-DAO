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
import { useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState(0)
  const [newMessage, setNewMessage] = useState("")
  const [isMobileConversationOpen, setIsMobileConversationOpen] = useState(false)

  const conversations = [
    {
      id: 1,
      name: "TechStartup Inc.",
      avatar: "T",
      lastMessage: "Thanks for the update on the project progress",
      timestamp: "2 min ago",
      unread: 2,
      online: true,
      project: "E-commerce Website Development",
      type: "client",
    },
    {
      id: 2,
      name: "Sarah Designer",
      avatar: "S",
      lastMessage: "I've uploaded the final designs to the project folder",
      timestamp: "1 hour ago",
      unread: 0,
      online: true,
      project: "Mobile App UI Design",
      type: "freelancer",
    },
    {
      id: 3,
      name: "CryptoLabs",
      avatar: "C",
      lastMessage: "When can we schedule the code review?",
      timestamp: "3 hours ago",
      unread: 1,
      online: false,
      project: "Smart Contract Audit",
      type: "client",
    },
    {
      id: 4,
      name: "Mike Developer",
      avatar: "M",
      lastMessage: "The API integration is complete",
      timestamp: "1 day ago",
      unread: 0,
      online: false,
      project: "Backend Development",
      type: "freelancer",
    },
  ]

  const messages = [
    {
      id: 1,
      sender: "TechStartup Inc.",
      content: "Hi! I wanted to check on the progress of our e-commerce website project.",
      timestamp: "10:30 AM",
      isOwn: false,
      type: "text",
    },
    {
      id: 2,
      sender: "You",
      content: "Hello! The project is going well. I've completed the homepage and product catalog pages.",
      timestamp: "10:32 AM",
      isOwn: true,
      type: "text",
    },
    {
      id: 3,
      sender: "You",
      content: "Here are some screenshots of the current progress:",
      timestamp: "10:33 AM",
      isOwn: true,
      type: "text",
    },
    {
      id: 4,
      sender: "You",
      content: "",
      timestamp: "10:33 AM",
      isOwn: true,
      type: "image",
      fileName: "homepage-preview.png",
      fileSize: "2.4 MB",
    },
    {
      id: 5,
      sender: "TechStartup Inc.",
      content: "This looks fantastic! The design is exactly what we were looking for.",
      timestamp: "10:45 AM",
      isOwn: false,
      type: "text",
    },
    {
      id: 6,
      sender: "TechStartup Inc.",
      content: "What's the timeline for the shopping cart functionality?",
      timestamp: "10:46 AM",
      isOwn: false,
      type: "text",
    },
    {
      id: 7,
      sender: "You",
      content:
        "I'm planning to have the shopping cart completed by tomorrow evening. Then we'll move on to the payment integration.",
      timestamp: "11:15 AM",
      isOwn: true,
      type: "text",
    },
    {
      id: 8,
      sender: "You",
      content: "",
      timestamp: "11:16 AM",
      isOwn: true,
      type: "file",
      fileName: "project-timeline.pdf",
      fileSize: "156 KB",
    },
    {
      id: 9,
      sender: "TechStartup Inc.",
      content: "Perfect! Thanks for the detailed timeline. Looking forward to the next update.",
      timestamp: "2 min ago",
      isOwn: false,
      type: "text",
    },
  ]

  const sendMessage = () => {
    if (newMessage.trim()) {
      // Handle message sending logic here
      setNewMessage("")
    }
  }

  const handleConversationSelect = (index: number) => {
    setSelectedChat(index)
    setIsMobileConversationOpen(true)
  }

  const ConversationsList = () => (
    <div className="h-full flex flex-col bg-white">
      {/* Search */}
      <div className="p-4 border-b border-slate-200 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input placeholder="Search conversations..." className="pl-10" />
        </div>
      </div>

      {/* Conversations */}
      <ScrollArea className="flex-1">
        <div className="p-2">
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

  const ChatArea = () => (
    <div className="flex-1 flex flex-col bg-white h-full">
      {/* Chat Header */}
      <div className="p-3 sm:p-4 border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Mobile back button */}
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
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {conversations[selectedChat].avatar}
                </AvatarFallback>
              </Avatar>
              {conversations[selectedChat].online && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-slate-800 text-sm sm:text-base truncate">
                {conversations[selectedChat].name}
              </h3>
              <div className="flex items-center space-x-2">
                <p className="text-xs sm:text-sm text-slate-600 truncate max-w-[150px] sm:max-w-none">
                  {conversations[selectedChat].project}
                </p>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    {conversations[selectedChat].online ? "Online" : "Last seen 2h ago"}
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

      {/* Messages */}
      <ScrollArea className="flex-1 p-3 sm:p-4">
        <div className="space-y-4">
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
                        <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
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
                        <File className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
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

      {/* Message Input */}
      <div className="p-3 sm:p-4 border-t border-slate-200 flex-shrink-0">
        <div className="flex items-end space-x-2">
          <Button variant="ghost" size="sm" className="mb-2 p-2 flex-shrink-0">
            <Paperclip className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <Textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="min-h-[44px] max-h-32 resize-none text-sm"
              onKeyPress={(e) => {
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

  return (
    <ProtectedRoute requireAuth={true} requireCompleteProfile={true}>
      <div className="min-h-screen bg-slate-50">
        <div className="h-screen bg-slate-50 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-slate-200 px-4 py-4 flex-shrink-0">
            <div className="container mx-auto">
              <div className="flex items-center justify-between">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center">
                  <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                  Messages
                </h1>
                {/* Mobile menu trigger */}
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
            {/* Desktop Layout */}
            <div className="hidden md:flex w-full">
              {/* Conversations List */}
              <div className="w-80 border-r border-slate-200">
                <ConversationsList />
              </div>
    
              {/* Chat Area */}
              <ChatArea />
            </div>
    
            {/* Mobile Layout */}
            <div className="md:hidden w-full">{!isMobileConversationOpen ? <ConversationsList /> : <ChatArea />}</div>
          </div>
        </div>
      )
    }
}
