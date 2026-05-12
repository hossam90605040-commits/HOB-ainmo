import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Plus, 
  Trash2, 
  MoreVertical, 
  MessageSquare, 
  Zap, 
  Brain, 
  Sparkles,
  Paperclip,
  Mic,
  Image as ImageIcon,
  Copy,
  RotateCcw,
  Share2,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Pin,
  X,
  FileText,
  LayoutDashboard,
  Search,
  Palette,
  Video,
  Pencil,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { sendMessageStream, MODELS } from '@/services/ai';
import { ChatMessage, ChatSession, Attachment } from '@/types';
import { 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  setDoc,
  getDocs
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useNavigate, useParams, Link } from 'react-router-dom';

export default function ChatPage() {
  const { t, i18n } = useTranslation();
  const { user, profile, signOut } = useAuth();
  const { sessionId: urlSessionId } = useParams();
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS.FAST);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Sessions
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'users', user.uid, 'sessions'),
      orderBy('updatedAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const sess = snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatSession));
      setSessions(sess);
    });
    return unsubscribe;
  }, [user]);

  // Fetch Messages for current session
  useEffect(() => {
    if (!user || !urlSessionId) {
      setMessages([]);
      return;
    }
    const q = query(
      collection(db, 'users', user.uid, 'sessions', urlSessionId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage));
      setMessages(msgs);
    });
    return unsubscribe;
  }, [user, urlSessionId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const createNewSession = async () => {
    if (!user) return;
    const id = `session_${Date.now()}`;
    const newSession: Partial<ChatSession> = {
      userId: user.uid,
      title: i18n.language === 'ar' ? 'محادثة جديدة' : 'New Chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pinned: false,
      model: selectedModel,
      messagesCount: 0
    };
    await setDoc(doc(db, 'users', user.uid, 'sessions', id), newSession);
    navigate(`/chat/${id}`);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && pendingAttachments.length === 0) || isStreaming || !user) return;

    let currentSessionId = urlSessionId;
    if (!currentSessionId) {
      // Auto create session if not selected
      const id = `session_${Date.now()}`;
      await setDoc(doc(db, 'users', user.uid, 'sessions', id), {
        userId: user.uid,
        title: input.slice(0, 30) || pendingAttachments[0]?.name || (i18n.language === 'ar' ? 'محادثة جديدة' : 'New Chat'),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        pinned: false,
        model: selectedModel,
        messagesCount: 0
      });
      currentSessionId = id;
      navigate(`/chat/${id}`);
    }

    const userMsg: ChatMessage = {
      id: `${Date.now()}_user`,
      role: 'user',
      content: input,
      timestamp: Date.now(),
      model: selectedModel,
      attachments: [...pendingAttachments]
    };

    const currentAttachments = [...pendingAttachments];
    setInput('');
    setPendingAttachments([]);
    setIsStreaming(true);

    try {
      // Save User Message
      await setDoc(doc(db, 'users', user.uid, 'sessions', currentSessionId, 'messages', userMsg.id), userMsg);
      await updateDoc(doc(db, 'users', user.uid, 'sessions', currentSessionId), {
        updatedAt: Date.now(),
        messagesCount: messages.length + 1
      });

      // AI Response
      let fullResponse = "";
      const assistantId = `${Date.now()}_assistant`;
      
      const stream = sendMessageStream(userMsg.content, messages, selectedModel, currentAttachments);
      
      // Temporary state for UI streaming
      setMessages(prev => [...prev, userMsg, { 
        id: assistantId, 
        role: 'assistant', 
        content: '', 
        timestamp: Date.now(),
        model: selectedModel
      }]);

      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: fullResponse } : m));
      }

      // Save Assistant Message
      await setDoc(doc(db, 'users', user.uid, 'sessions', currentSessionId, 'messages', assistantId), {
        id: assistantId,
        role: 'assistant',
        content: fullResponse,
        timestamp: Date.now(),
        model: selectedModel
      });

    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error(i18n.language === 'ar' ? `خطأ في الإرسال: ${error.message || 'غير معروف'}` : `Error sending: ${error.message || 'unknown'}`);
    } finally {
      setIsStreaming(false);
    }
  };

   const deleteSession = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'sessions', id));
      if (urlSessionId === id) navigate('/chat');
      toast.success(t('chat_deleted'));
    } catch (e) {
      toast.error(t('error_deleting'));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        setPendingAttachments(prev => [...prev, {
          url: base64,
          type: file.type,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
    // Reset input
    e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setPendingAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const regenerateLastMessage = async () => {
    if (messages.length < 2 || isStreaming || !user || !urlSessionId) return;
    
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMessage) return;

    // Remove last assistant message if exists
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role === 'assistant') {
      // In a real app, you might want to delete it from Firestore too
      // setMessages(prev => prev.slice(0, -1));
    }

    setInput(lastUserMessage.content);
    handleSendMessage();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(i18n.language === 'ar' ? 'تم النسخ' : 'Copied');
  };

  const startEditing = (message: ChatMessage) => {
    setEditingMessageId(message.id);
    setEditingContent(message.content);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingContent('');
  };

  const handleUpdateMessage = async (messageId: string) => {
    if (!user || !urlSessionId || !editingContent.trim()) return;

    try {
      // If the message is local-only (just sent and still streaming or not yet synced), we might need to find its Firestore ID
      // But usually, the messages state is populated from onSnapshot, so each message has its real doc ID
      const messageDocRef = doc(db, 'users', user.uid, 'sessions', urlSessionId, 'messages', messageId);
      await updateDoc(messageDocRef, {
        content: editingContent,
        isEdited: true,
        updatedAt: serverTimestamp()
      });
      
      setEditingMessageId(null);
      setEditingContent('');
      toast.success(i18n.language === 'ar' ? 'تم تعديل الرسالة' : 'Message updated');
    } catch (error) {
      console.error("Error updating message:", error);
      toast.error(i18n.language === 'ar' ? 'فشل التعديل' : 'Update failed');
    }
  };

  return (
    <div className="flex h-screen bg-[#020617] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full border-r border-white/5 bg-slate-950/40 backdrop-blur-xl flex flex-col z-20"
          >
            <div className="p-4 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <img src="https://i.ibb.co/h7n25wY0/1715446168128.webp" alt="HOB AI" className="w-full h-full object-cover" />
                </div>
                <span className="font-bold text-lg tracking-tight">{t('app_name')}</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="text-slate-400">
                <ChevronLeft className={i18n.language === 'ar' ? 'rotate-180' : ''} />
              </Button>
            </div>

            <div className="px-4 mb-6 space-y-4">
              <div className="relative group/search">
                <input 
                  type="text" 
                  placeholder={i18n.language === 'ar' ? 'البحث عن محادثة...' : 'Search chat...'}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 pr-10 text-xs focus:ring-1 focus:ring-cyan-500 transition-all outline-none"
                />
                <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-500" />
              </div>

              <div className="flex flex-col gap-1">
                <Button 
                  onClick={() => navigate('/dashboard')}
                  variant="ghost" 
                  className="w-full justify-start gap-4 p-3 rounded-xl text-slate-400 hover:text-white"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  {t('dashboard')}
                </Button>
                <Button 
                  onClick={() => navigate('/creative')}
                  variant="ghost" 
                  className="w-full justify-start gap-4 p-3 rounded-xl text-slate-400 hover:text-white"
                >
                  <Sparkles className="w-5 h-5" />
                  {i18n.language === 'ar' ? 'استوديو الإبداع' : 'Creative Studio'}
                </Button>
              </div>

              <Button 
                onClick={createNewSession}
                className="w-full h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white flex items-center justify-center gap-2 font-bold transition-all"
              >
                <Plus className="w-5 h-5" />
                {i18n.language === 'ar' ? "محادثة جديدة" : "New Chat"}
              </Button>
            </div>

            <ScrollArea className="flex-1 px-3">
              <div className="space-y-1">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => navigate(`/chat/${s.id}`)}
                    className={`w-full group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                      urlSessionId === s.id ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 text-sm font-medium text-right truncate">
                      {s.title}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger 
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-md transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-3 h-3" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-white/10">
                        <DropdownMenuItem className="text-slate-200">
                          <Pin className="w-4 h-4 ml-2" />
                          {i18n.language === 'ar' ? 'تثبيت' : 'Pin'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-400 focus:text-red-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSession(s.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 ml-2" />
                          {i18n.language === 'ar' ? 'حذف' : 'Delete'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-white/5 bg-slate-950/20">
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-white/5 transition-all text-right border-none bg-transparent">
                  <Avatar className="h-10 w-10 border border-white/10">
                    <AvatarImage src={profile?.photoURL} />
                    <AvatarFallback className="bg-cyan-500 text-slate-950 font-bold">
                      {profile?.displayName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold truncate">{profile?.displayName}</p>
                    <p className="text-xs text-slate-500 truncate">{profile?.email}</p>
                  </div>
                  <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px]">
                    {profile?.role === 'admin' ? t('admin') : t('free')}
                  </Badge>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-slate-900 border-white/10 p-2">
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="w-4 h-4 ml-2" />
                    {t('settings')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <Brain className="w-4 h-4 ml-2" />
                    {t('dashboard')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem className="text-red-400 focus:text-red-400" onClick={signOut}>
                    <LogOut className="w-4 h-4 ml-2" />
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="fixed bottom-4 right-4 z-30 w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/30"
        >
          <Plus className="w-6 h-6 text-slate-950" />
        </button>
      )}

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-slate-950/20 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="text-slate-400">
                <ChevronRight className={i18n.language === 'ar' ? 'rotate-180' : ''} />
              </Button>
            )}
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center rounded-full border border-white/10 bg-white/5 hover:bg-white/10 gap-2 h-9 px-4 text-sm font-medium transition-colors">
                  {selectedModel === MODELS.FAST ? (
                    <Zap className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <Brain className="w-4 h-4 text-purple-400" />
                  )}
                  <span className="text-sm font-bold">
                    {selectedModel === MODELS.FAST ? (i18n.language === 'ar' ? 'الوضع السريع' : 'Fast Mode') : (i18n.language === 'ar' ? 'الاستنتاج العميق' : 'Reasoning Mode')}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={i18n.language === 'ar' ? 'end' : 'start'} className="w-72 bg-slate-900 border-white/10 p-2">
                  <DropdownMenuItem onClick={() => setSelectedModel(MODELS.FAST)} className="p-3 gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="font-bold">{i18n.language === 'ar' ? 'الوضع السريع' : 'Fast Mode'}</p>
                      <p className="text-xs text-slate-500">Gemini 3.1 Flash</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedModel(MODELS.SMART)} className="p-3 gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-bold">{i18n.language === 'ar' ? 'الاستنتاج العميق' : 'Reasoning Mode'}</p>
                      <p className="text-xs text-slate-500">Gemini 3.1 Pro</p>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white rounded-full">
               <Share2 className="w-4 h-4" />
             </Button>
          </div>
        </header>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4 md:p-8 overflow-y-auto" ref={scrollRef}>
          <div className="max-w-4xl mx-auto space-y-12">
            {messages.length === 0 ? (
              <div className="h-[60vh] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-cyan-500/40 mb-8 animate-bounce">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-4xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">
                  {i18n.language === 'ar' ? 'كيف يمكنني خدمتك اليوم؟' : 'How can I assist you today?'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 w-full max-w-2xl px-4">
                  {[
                    { ar: "ما هي آخر أخبار الذكاء الاصطناعي؟", en: "What's the latest in AI?" },
                    { ar: "ساعدني في كتابة كود بايثون لمعالجة البيانات", en: "Help me write Python code for data processing" },
                    { ar: "لخص لي أهمية الحوسبة الكمومية", en: "Summarize the importance of quantum computing" },
                    { ar: "تخيل مستقبل المدن الذكية في عام 2050", en: "Imagine the future of smart cities in 2050" }
                  ].map((p, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setInput(i18n.language === 'ar' ? p.ar : p.en)}
                      className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] text-sm text-slate-400 text-right hover:text-white transition-all"
                    >
                      {i18n.language === 'ar' ? p.ar : p.en}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, idx) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 md:gap-6 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className={`w-10 h-10 border shadow-sm flex-shrink-0 ${m.role === 'user' ? 'border-cyan-500/20' : 'border-purple-500/20'}`}>
                    {m.role === 'user' ? (
                      <>
                        <AvatarImage src={profile?.photoURL} />
                        <AvatarFallback className="bg-cyan-500 text-slate-950 font-bold">
                          {profile?.displayName?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </>
                    ) : (
                      <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                        <img src="https://i.ibb.co/h7n25wY0/1715446168128.webp" alt="HOB AI" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </Avatar>

                  <div className={`flex flex-col max-w-[85%] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`p-5 rounded-[2rem] text-sm leading-relaxed shadow-lg ${
                      m.role === 'user' 
                        ? 'bg-cyan-500 text-slate-950 font-medium rounded-tr-none' 
                        : 'bg-white/[0.03] text-slate-200 border border-white/5 rounded-tl-none backdrop-blur-sm'
                    }`}>
                      {m.role === 'user' && editingMessageId === m.id ? (
                        <div className="flex flex-col gap-2 min-w-[200px]">
                          <textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className="bg-white/10 border-none focus:ring-0 text-slate-950 p-2 rounded-lg resize-none text-sm"
                            rows={3}
                            autoFocus
                          />
                          <div className="flex justify-end gap-2">
                             <Button size="sm" variant="ghost" onClick={cancelEditing} className="h-7 text-slate-800 hover:bg-white/10">
                               <X className="w-3 h-3" />
                             </Button>
                             <Button size="sm" onClick={() => handleUpdateMessage(m.id)} className="h-7 bg-slate-900 text-cyan-400 hover:bg-slate-800">
                               <Check className="w-3 h-3" />
                             </Button>
                          </div>
                        </div>
                      ) : m.role === 'assistant' ? (
                        <div className="markdown-body">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]} 
                            rehypePlugins={[rehypeHighlight]}
                            components={{
                              a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />
                            }}
                          >
                            {m.content}
                          </ReactMarkdown>
                          {isStreaming && idx === messages.length - 1 && (
                            <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse ml-1 align-middle" />
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4 w-full">
                          {m.attachments && m.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {m.attachments.map((a, i) => (
                                <div key={i} className="relative group/att">
                                  {a.type.startsWith('image/') ? (
                                    <img src={a.url} alt={a.name} className="max-w-xs max-h-64 rounded-xl border border-white/10" />
                                  ) : a.type.startsWith('video/') ? (
                                    <video src={a.url} controls className="max-w-sm rounded-xl border border-white/10 overflow-hidden" />
                                  ) : (
                                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                                      <FileText className="w-5 h-5 text-cyan-400" />
                                      <span className="text-xs font-bold truncate max-w-[150px]">{a.name}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          <p className="whitespace-pre-wrap">{m.content}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className={`flex items-center gap-3 mt-3 px-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">
                        {new Date(m.timestamp).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}
                        {m.isEdited && ` (${i18n.language === 'ar' ? 'معدلة' : 'edited'})`}
                      </span>
                      {m.role === 'assistant' ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => copyToClipboard(m.content)} className="p-1 hover:bg-white/5 rounded text-slate-500 hover:text-white transition-all" title={i18n.language === 'ar' ? 'نسخ' : 'Copy'}>
                            <Copy className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={regenerateLastMessage}
                            className="p-1 hover:bg-white/5 rounded text-slate-500 hover:text-white transition-all" 
                            title={i18n.language === 'ar' ? 'إعادة توليد' : 'Regenerate'}
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => startEditing(m)} 
                            className="p-1 hover:bg-white/5 rounded text-slate-500 hover:text-white transition-all" 
                            title={i18n.language === 'ar' ? 'تعديل' : 'Edit'}
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Bar */}
        <div className="p-4 md:p-8 z-10">
          <div className="max-w-4xl mx-auto relative group">
             <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-[2.5rem] blur opacity-20 group-focus-within:opacity-40 transition-opacity" />
             <div className="relative bg-slate-900 border border-white/10 rounded-[2.5rem] p-2 flex flex-col shadow-2xl">
               
               {/* Pending Attachments */}
               {pendingAttachments.length > 0 && (
                 <div className="flex flex-wrap gap-3 p-3 border-b border-white/5">
                   {pendingAttachments.map((a, i) => (
                     <div key={i} className="relative group/pending">
                       {a.type.startsWith('image/') ? (
                         <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/20">
                            <img src={a.url} alt={a.name} className="w-full h-full object-cover" />
                         </div>
                       ) : (
                         <div className="h-20 px-4 flex items-center gap-2 bg-white/5 rounded-xl border border-white/10">
                            <FileText className="w-5 h-5 text-cyan-400" />
                            <span className="text-[10px] font-bold truncate max-w-[80px]">{a.name}</span>
                         </div>
                       )}
                       <button 
                        onClick={() => removeAttachment(i)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-slate-900 group-hover/pending:scale-110 transition-transform"
                       >
                         <X className="w-3 h-3" />
                       </button>
                     </div>
                   ))}
                 </div>
               )}

               <div className="flex items-end">
                 <div className="flex items-center gap-1 mr-2 mb-1">
                   <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    multiple 
                    onChange={handleFileSelect} 
                   />
                   <Button 
                    onClick={() => fileInputRef.current?.click()}
                    variant="ghost" 
                    size="icon" 
                    className="text-slate-400 hover:text-cyan-400 rounded-full h-10 w-10"
                   >
                     <Paperclip className="w-5 h-5" />
                   </Button>
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      variant="ghost" 
                      size="icon" 
                      className="text-slate-400 hover:text-cyan-400 rounded-full h-10 w-10"
                    >
                     <ImageIcon className="w-5 h-5" />
                   </Button>
                 </div>
                 
                 <form onSubmit={handleSendMessage} className="flex-1 flex items-center">
                   <textarea
                     rows={1}
                     value={input}
                     onChange={(e) => {
                       setInput(e.target.value);
                       e.target.style.height = 'auto';
                       e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                     }}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter' && !e.shiftKey) {
                         e.preventDefault();
                         handleSendMessage();
                       }
                     }}
                     placeholder={t('type_message')}
                     className="w-full bg-transparent border-none focus:ring-0 text-slate-100 text-base py-3 px-4 resize-none min-h-[44px] max-h-48 overflow-y-auto font-sans"
                   />
                   
                   <div className="flex items-center gap-2 mr-2 mb-1">
                     <Button variant="ghost" size="icon" className="text-slate-400 hover:text-cyan-400 rounded-full h-10 w-10">
                       <Mic className="w-5 h-5" />
                     </Button>
                     <Button 
                      type="submit"
                      disabled={(!input.trim() && pendingAttachments.length === 0) || isStreaming}
                      className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                        (input.trim() || pendingAttachments.length > 0) && !isStreaming 
                          ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' 
                          : 'bg-white/5 text-slate-500'
                      }`}
                     >
                       {isStreaming ? (
                         <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent animate-spin rounded-full" />
                       ) : (
                         <Send className={`w-5 h-5 ${i18n.language === 'ar' ? 'rotate-180' : ''}`} />
                       )}
                     </Button>
                   </div>
                 </form>
               </div>
             </div>
             <p className="text-[10px] text-slate-600 text-center mt-3 font-medium uppercase tracking-widest">
               {i18n.language === 'ar' ? 'الذكاء قد يرتكب أخطاء. يرجى التحقق من المعلومات المهمة.' : 'AI can make mistakes. Check important info.'}
             </p>
          </div>
        </div>
      </main>
    </div>
  );
}
