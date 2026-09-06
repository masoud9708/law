import React, { useState, useEffect, useRef } from "react";
import { Conversation, Message, Citation } from "../../types";
import { api } from "../../lib/api";
import {
  Send,
  Plus,
  Trash2,
  Scale,
  ShieldCheck,
  Zap,
  Sparkles,
  BookOpen,
  Copy,
  Check,
  Clock,
  Cpu,
  CornerDownRight,
  ExternalLink,
  HelpCircle,
  FileText,
  Paperclip,
  X,
  UploadCloud,
  FileUp
} from "lucide-react";

interface ChatViewProps {
  onCreditDeducted: () => void;
}

const SAMPLE_LEGAL_QUESTIONS = [
  {
    title: "مستحق‌للغیر درآمدن مبیع و رأی ۸۱۱",
    prompt: "اگر ملکی که خریدم مستحق‌للغیر دربیاد و بیع باطل بشه، چطور باید خسارت و تورم ثمن رو به قیمت روز از فروشنده بگیرم؟ آیا رأی وحدت رویه در این خصوص داریم؟"
  },
  {
    title: "اجرائیه مستقیم چک صیادی (ماده ۲۳)",
    prompt: "برای چک صیادی برگشت‌خورده چگونه می‌توان بدون نیاز به جلسه رسیدگی دادگاه، اجرائیه مستقیم گرفت؟ شرایط و مواد قانونی آن چیست؟"
  },
  {
    title: "دستور تخلیه فوری ملک اجاره‌ای",
    prompt: "شرایط صدور دستور تخلیه فوری ملک مسکونی طبق قانون روابط موجر و مستأجر سال ۱۳۷۶ چیست و چگونه اقدام کنیم؟"
  },
  {
    title: "شکایت در دیوان عدالت اداری (ماده ۱۰ و ۱۲)",
    prompt: "نحوه ابطال بخشنامه خلاف قانون دولتی در هیأت عمومی دیوان عدالت اداری و مهلت دادخواست به شعب دیوان چگونه است؟"
  },
  {
    title: "مطالبه مهریه مازاد بر ۱۱۰ سکه",
    prompt: "شرایط قانونی توقیف اموال و حبس زوج برای مهریه بالاتر از ۱۱۰ سکه بهار آزادی بر اساس قانون حمایت خانواده و محکومیت‌های مالی چیست؟"
  },
  {
    title: "الزام کارفرما به بیمه (ماده ۱۴۸ کار)",
    prompt: "چگونه کارگر می‌تواند برای سوابق بیمه پرداخت‌نشده علیه کارفرما طبق ماده ۱۴۸ قانون کار و ماده ۳۶ تأمین اجتماعی شکایت کند؟"
  }
];

export const ChatView: React.FC<ChatViewProps> = ({ onCreditDeducted }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputContent, setInputContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: number; text: string } | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const loadConversations = async () => {
    try {
      const data = await api.getConversations();
      setConversations(data.conversations);
      if (data.conversations.length > 0 && !activeConvId) {
        selectConversation(data.conversations[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectConversation = async (id: string) => {
    setActiveConvId(id);
    setErrorMsg(null);
    try {
      const data = await api.getConversation(id);
      setMessages(data.messages);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateNewChat = async (type: string = "LEGAL_CHAT") => {
    try {
      const data = await api.createConversation("گفتگوی حقوقی جدید", type);
      setConversations(prev => [data.conversation, ...prev]);
      setActiveConvId(data.conversation.id);
      setMessages([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteConversation(id);
      const remaining = conversations.filter(c => c.id !== id);
      setConversations(remaining);
      if (activeConvId === id) {
        if (remaining.length > 0) {
          selectConversation(remaining[0].id);
        } else {
          setActiveConvId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAttachFile = async (file: File) => {
    setIsUploadingFile(true);
    try {
      let extractedText = "";
      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        extractedText = await file.text();
      } else {
        try {
          const rawBuffer = await file.slice(0, 50000).text();
          const cleanStrings = rawBuffer.replace(/[^\u0600-\u06FF\s0-9a-zA-Z.,;:()\-]/g, " ").trim();
          if (cleanStrings.length > 100) {
            extractedText = cleanStrings.slice(0, 2000);
          }
        } catch {
          // ignore
        }
        if (!extractedText || extractedText.length < 50) {
          extractedText = `[پیوست پرونده حقوقی: ${file.name} - حجم: ${(file.size / 1024).toFixed(1)} KB]`;
        }
      }

      setAttachedFile({
        name: file.name,
        size: file.size,
        text: extractedText
      });
    } catch (err) {
      console.error("Error reading attached file:", err);
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputContent;
    if ((!text.trim() && !attachedFile) || isLoading) return;

    let targetConvId = activeConvId;
    if (!targetConvId) {
      const newChat = await api.createConversation((text || attachedFile?.name || "گفتگوی حقوقی").slice(0, 30), "LEGAL_CHAT");
      setConversations(prev => [newChat.conversation, ...prev]);
      targetConvId = newChat.conversation.id;
      setActiveConvId(targetConvId);
    }

    const currentAttachment = attachedFile;
    const displayText = currentAttachment
      ? `${text ? text + "\n\n" : ""}📎 پیوست: ${currentAttachment.name}`
      : text;

    // Optimistic UI for user message
    const tempUserMsg: Message = {
      id: `temp-u-${Date.now()}`,
      conversation_id: targetConvId,
      role: "user",
      content: displayText,
      model: "user",
      status: "completed",
      input_tokens: Math.round(displayText.length / 3),
      output_tokens: 0,
      credit_cost: 0,
      created_at: "هم‌اکنون"
    };

    setMessages(prev => [...prev, tempUserMsg]);
    setInputContent("");
    setAttachedFile(null);
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const result = await api.sendMessage(targetConvId, text, currentAttachment?.text);
      setMessages(prev => [...prev.filter(m => m.id !== tempUserMsg.id), result.userMessage, result.assistantMessage]);
      onCreditDeducted();
    } catch (err: any) {
      setErrorMsg(err.message || "خطا در برقراری ارتباط با موتور هوش مصنوعی حقوقی");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const currentConv = conversations.find(c => c.id === activeConvId);

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-6rem)] overflow-hidden bg-[#090D16]">
      {/* 1. Conversations Sidebar */}
      <aside className="w-full md:w-72 bg-slate-900/95 border-l border-slate-800 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800">
          <button
            onClick={() => handleCreateNewChat("LEGAL_CHAT")}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>گفتگوی جدید حقوقی</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="text-[11px] text-slate-400 px-3 py-2 uppercase font-bold tracking-wider">
            گفتگوهای اخیر
          </div>

          {conversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 space-y-2">
              <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
              <p>گفتگویی وجود ندارد. گفتگوی جدیدی آغاز کنید.</p>
            </div>
          ) : (
            conversations.map(c => {
              const isSelected = c.id === activeConvId;
              return (
                <div
                  key={c.id}
                  onClick={() => selectConversation(c.id)}
                  className={`w-full rounded-xl p-3 text-right cursor-pointer flex items-start justify-between group transition-all ${
                    isSelected
                      ? "bg-slate-800 text-amber-300 border border-slate-700 shadow-sm"
                      : "hover:bg-slate-850 text-slate-300 hover:text-white border border-transparent"
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-1">
                    <p className={`text-xs truncate ${isSelected ? "font-bold text-white" : "font-medium text-slate-300"}`}>
                      {c.title}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                      <span>{c.created_at.split("-")[0]}</span>
                      <span>•</span>
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                        {c.assistant_type === "LEGAL_DRAFT" ? "تنظیم لایحه" : "چت حقوقی"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDeleteConversation(c.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-950/60 text-slate-400 hover:text-red-400 transition-opacity cursor-pointer"
                    title="حذف گفتگو"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer Link */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>RAG Active: <strong className="text-slate-200">۵۰+ سرفصل جامع</strong></span>
          </span>
          <span className="font-mono text-[10px] text-amber-400">Gemini 3.7</span>
        </div>
      </aside>

      {/* 2. Chat Conversation Area */}
      <main className="flex-1 flex flex-col h-full bg-[#0B1120] relative overflow-hidden">
        {/* Chat Header */}
        <div className="h-14 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-900/90 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-sm font-bold text-slate-100">
              {currentConv ? currentConv.title : "مشاوره و استعلام حقوقی"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="hidden sm:inline">موتور تحلیل:</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 text-amber-300 font-mono text-[11px] border border-slate-800 font-bold">
              LLM Gateway + Hybrid Qdrant
            </span>
          </div>
        </div>

        {/* Error Alert if any */}
        {errorMsg && (
          <div className="p-3 bg-red-950/50 border-b border-red-800/50 text-red-200 text-xs flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-red-300 hover:text-white font-bold cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="max-w-2xl mx-auto text-center py-8 space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-lg flex items-center justify-center mx-auto text-amber-400">
                <Scale className="w-7 h-7 text-amber-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base md:text-lg font-bold text-white">
                  دستیار هوش مصنوعی و وکیل مجازی دادگستری
                </h3>
                <p className="text-xs md:text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
                  هرگونه پرسش حقوقی، استعلام ماده قانون، آرای وحدت رویه، مهلت‌های تجدیدنظرخواهی یا نحوه طرح دادخواست را بپرسید.
                </p>
              </div>

              {/* Sample Prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right pt-2">
                {SAMPLE_LEGAL_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q.prompt)}
                    className="p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 text-right transition-all group shadow-sm cursor-pointer"
                  >
                    <div className="text-xs font-bold text-slate-200 group-hover:text-amber-300 flex items-center justify-between mb-1.5">
                      <span>{q.title}</span>
                      <CornerDownRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {q.prompt}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? "justify-start" : "justify-end"} w-full`}
                >
                  {isUser ? (
                    /* User Bubble */
                    <div className="flex gap-3 items-start max-w-2xl text-right">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 shrink-0 mt-1 flex items-center justify-center text-amber-300 text-xs font-bold">
                        شما
                      </div>
                      <div className="bg-slate-800/90 p-4 rounded-2xl rounded-tr-none shadow-md border border-slate-700/80 text-sm text-slate-100 leading-relaxed">
                        <div className="text-[11px] text-slate-400 mb-1 font-mono">
                          {msg.created_at}
                        </div>
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      </div>
                    </div>
                  ) : (
                    /* Assistant Bubble */
                    <div className="flex gap-3 items-start max-w-3xl mr-auto text-right w-full">
                      <div className="bg-slate-900/95 p-5 rounded-2xl rounded-tl-none shadow-xl border border-slate-800 text-sm text-slate-100 leading-relaxed relative flex-1">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                              پاسخ هوش مصنوعی (مستند به قوانین)
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              ({msg.model})
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopyText(msg.id, msg.content)}
                              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                              title="کپی متن پاسخ"
                            >
                              {copiedMsgId === msg.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap space-y-2 font-normal">
                          {msg.content}
                        </div>

                        {/* Citations Box */}
                        {msg.citations && msg.citations.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap gap-2">
                              {msg.citations.map((cit, cIdx) => (
                                <button
                                  key={`${cit.id}-${cIdx}`}
                                  onClick={() => setSelectedCitation(cit)}
                                  className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-[11px] text-amber-300 rounded-lg border border-amber-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <span className="text-amber-400 font-bold">●</span>
                                  <span>{cit.citation_text}</span>
                                </button>
                              ))}
                            </div>

                            <div className="flex items-center gap-1 text-[10px] text-emerald-300 font-bold bg-emerald-950/60 border border-emerald-600/40 px-2 py-1 rounded-lg">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                              <span>استناد تأیید شده</span>
                            </div>
                          </div>
                        )}

                        {/* Footer stats */}
                        {(msg.latency_ms || msg.credit_cost) && (
                          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <div className="flex items-center gap-3">
                              {msg.latency_ms && <span>زمان پاسخ: {msg.latency_ms}ms</span>}
                              {msg.output_tokens > 0 && <span>توکن‌ها: {msg.input_tokens + msg.output_tokens}</span>}
                            </div>
                            <div className="text-amber-400 font-bold">
                              کسر اعتبار: {msg.credit_cost} واحد
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 shrink-0 mt-1 flex items-center justify-center text-amber-400 text-[10px] font-bold shadow-sm">
                        AI
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start gap-3 max-w-xl mr-auto text-right w-full">
              <div className="bg-slate-900/95 p-4 rounded-2xl rounded-tl-none border border-slate-800 shadow-xl flex-1 space-y-2 animate-pulse">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                  <span>خط لوله RAG در حال بازیابی قوانین و استعلام مدل...</span>
                </div>
                <div className="h-2 bg-slate-800 rounded w-3/4" />
                <div className="h-2 bg-slate-850 rounded w-1/2" />
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 shrink-0 mt-1 flex items-center justify-center text-amber-400 text-[10px] font-bold">
                AI
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 md:p-6 bg-slate-900/95 border-t border-slate-800 shrink-0">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleAttachFile(e.target.files[0]);
              }
            }}
            accept=".pdf,.doc,.docx,.txt,.rtf,image/*"
            className="hidden"
          />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="max-w-4xl mx-auto space-y-2 relative"
          >
            {/* Attached file chip */}
            {attachedFile && (
              <div className="flex items-center justify-between bg-amber-950/50 border border-amber-500/40 px-3 py-1.5 rounded-lg text-xs text-amber-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold">{attachedFile.name}</span>
                  <span className="text-[10px] text-amber-400 font-mono">({(attachedFile.size / 1024).toFixed(0)} KB)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedFile(null)}
                  className="p-1 text-amber-300 hover:text-red-400 rounded cursor-pointer"
                  title="حذف پیوست"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="relative">
              <textarea
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="سوال حقوقی خود را بپرسید یا استعلام مواد قانونی را مطرح نمایید..."
                className="w-full border border-slate-700/80 rounded-xl p-4 pr-12 pl-28 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 resize-none h-24 shadow-inner bg-slate-950"
              />

              <div className="absolute left-3 bottom-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingFile}
                  className="p-2 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
                  title="پیوست سند یا پرونده حقوقی (PDF/Word/تصویر)"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <button
                  type="submit"
                  disabled={isLoading || (!inputContent.trim() && !attachedFile)}
                  className={`px-5 py-2 rounded-lg text-sm font-bold shadow-md transition-all cursor-pointer ${
                    isLoading || (!inputContent.trim() && !attachedFile)
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                      : "bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-95 shadow-amber-950/40"
                  }`}
                >
                  ارسال پرسش
                </button>
              </div>

              <div className="absolute right-4 top-4 text-slate-500 pointer-events-none">
                <Scale className="w-5 h-5 text-slate-500" />
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* 3. Right Status & RAG Side Panel (Matching Design) */}
      <aside className="w-64 bg-slate-900/95 border-r border-slate-800 p-4 space-y-6 hidden xl:flex flex-col shrink-0 overflow-y-auto">
        <div>
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            وضعیت موتور هوشمند
          </h3>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">مدل اصلی:</span>
              <span className="font-bold text-amber-300">Gemini 3.7 Flash</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">وضعیت RAG:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                آماده پاسخگویی
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
              <div className="bg-emerald-400 h-full w-full"></div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            منابع فعال بازیابی (RAG)
          </h3>
          <div className="space-y-2">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[10px] leading-tight shadow-sm">
              <p className="font-bold text-slate-200">قانون مدنی ایران</p>
              <p className="text-slate-400 mt-1">مواد ۱۰، ۱۹۰، ۲۱۹، ۲۲۰ و ۲۳۰</p>
              <div className="flex justify-between items-center mt-2 pt-1 border-t border-slate-800/80">
                <span className="text-amber-400 font-bold uppercase font-mono">Qdrant Vector</span>
                <span className="text-slate-500 font-mono">امتیاز: ۰.۹۸</span>
              </div>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[10px] leading-tight shadow-sm">
              <p className="font-bold text-slate-200">رأی وحدت رویه شماره ۸۱۱</p>
              <p className="text-slate-400 mt-1">غرامت مستحق‌للغیر بر مبنای تورم</p>
              <div className="flex justify-between items-center mt-2 pt-1 border-t border-slate-800/80">
                <span className="text-amber-400 font-bold uppercase font-mono">Supreme Court</span>
                <span className="text-slate-500 font-mono">امتیاز: ۰.۹۴</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            تحلیل پرونده و سند
          </h3>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleAttachFile(e.dataTransfer.files[0]);
              }
            }}
            className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-xl p-4 flex flex-col items-center justify-center text-center bg-slate-950/60 hover:bg-slate-950 transition-colors cursor-pointer group"
          >
            <UploadCloud className="w-8 h-8 text-slate-500 group-hover:text-amber-400 mb-2 transition-colors" />
            <p className="text-[10px] text-slate-400 group-hover:text-slate-300 font-medium leading-relaxed">
              فایل PDF یا DOCX خود را برای پیوست و تحلیل اینجا رها یا انتخاب کنید
            </p>
          </div>
        </div>
      </aside>

      {/* 4. Citation Inspector Modal */}
      {selectedCitation && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-right space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>شناسنامه استناد قانونی (Legal Citation)</span>
              </div>
              <button
                onClick={() => setSelectedCitation(null)}
                className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">عنوان منبع:</span>
                <span className="font-bold text-amber-300 text-sm">{selectedCitation.source_title}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">نوع مدرک:</span>
                <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 font-mono text-[10px] border border-slate-800">
                  {selectedCitation.source_type}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">متن استناد در پاسخ:</span>
                <p className="p-3 rounded-xl bg-slate-950 text-slate-200 leading-relaxed border border-slate-800">
                  {selectedCitation.citation_text}
                </p>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-2 text-emerald-300 font-semibold">
                <span>اعتبار در پایگاه داده قوانین: تأیید شده (Verified)</span>
                <span className="font-mono">اطمینان: {(selectedCitation.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedCitation(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer shadow-sm border border-slate-700"
            >
              بستن
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
