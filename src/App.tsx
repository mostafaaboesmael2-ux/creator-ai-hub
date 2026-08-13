import { useState, useEffect, useRef, useCallback } from "react";
import { Menu, Sparkles, AlertCircle } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import TypingIndicator from "@/components/TypingIndicator";
import ImageGenerator from "@/components/ImageGenerator";
import {
  supabase,
  type Conversation,
  type Message,
} from "@/lib/supabase";

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeId) {
      loadMessages(activeId);
    } else {
      setMessages([]);
    }
  }, [activeId]);

  async function loadConversations() {
    const { data, error } = await supabase
      .from("chat_conversations")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      setError("فشل في تحميل المحادثات");
      return;
    }
    setConversations(data || []);
  }

  async function loadMessages(convId: string) {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    if (error) {
      setError("فشل في تحميل الرسائل");
      return;
    }
    setMessages(data || []);
  }

  async function handleNewConversation() {
    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({ title: "محادثة جديدة" })
      .select()
      .single();

    if (error) {
      setError("فشل في إنشاء محادثة جديدة");
      return;
    }

    setConversations((prev) => [data, ...prev]);
    setActiveId(data.id);
    setMessages([]);
    setSidebarOpen(false);
    setError(null);
  }

  async function handleDeleteConversation(id: string) {
    const { error } = await supabase
      .from("chat_conversations")
      .delete()
      .eq("id", id);

    if (error) {
      setError("فشل في حذف المحادثة");
      return;
    }

    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) {
      setActiveId(null);
      setMessages([]);
    }
  }

  async function callAI(chatMessages: { role: string; content: string }[]) {
    const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ messages: chatMessages }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || `Request failed (${response.status})`);
    }

    const data = await response.json();
    if (!data.reply) {
      throw new Error("لم يتم استلام رد من الذكاء الاصطناعي");
    }
    return data.reply as string;
  }

  async function handleSend(text: string) {
    setError(null);

    let convId: string | null = activeId;
    let isNewConversation = false;

    if (!convId) {
      const { data: conv, error: convError } = await supabase
        .from("chat_conversations")
        .insert({ title: text.slice(0, 40) })
        .select()
        .single();

      if (convError || !conv) {
        setError("فشل في إنشاء محادثة");
        return;
      }

      convId = conv.id;
      isNewConversation = true;
      setConversations((prev) => [conv, ...prev]);
      setActiveId(conv.id);
    }

    // Optimistic: add user message
    const tempUserMsg: Message = {
      id: "temp-user-" + Date.now(),
      conversation_id: convId!,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    // Persist user message
    const { data: savedUserMsg, error: userMsgError } = await supabase
      .from("chat_messages")
      .insert({
        conversation_id: convId!,
        role: "user",
        content: text,
      })
      .select()
      .single();

    if (userMsgError) {
      setError("فشل في حفظ الرسالة");
      return;
    }

    // Replace temp message with saved
    setMessages((prev) =>
      prev.map((m) => (m.id === tempUserMsg.id ? savedUserMsg : m))
    );

    // Update conversation title if it was new or still default
    if (isNewConversation) {
      const { error: titleError } = await supabase
        .from("chat_conversations")
        .update({ title: text.slice(0, 40), updated_at: new Date().toISOString() })
        .eq("id", convId!);

      if (!titleError) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId! ? { ...c, title: text.slice(0, 40) } : c
          )
        );
      }
    }

    setLoading(true);

    // Build message history for AI
    const aiMessages = [
      ...messages
        .filter((m) => m.id !== tempUserMsg.id)
        .map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: text },
    ];

    try {
      const reply = await callAI(aiMessages);

      // Save assistant message
      const { data: savedAssistantMsg, error: assistantError } = await supabase
        .from("chat_messages")
        .insert({
          conversation_id: convId!,
          role: "assistant",
          content: reply,
        })
        .select()
        .single();

      if (assistantError) {
        setError("فشل في حفظ رد الذكاء الاصطناعي");
        return;
      }

      setMessages((prev) => [...prev, savedAssistantMsg]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden" dir="rtl">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={(id) => {
          setActiveId(id);
          setSidebarOpen(false);
          setError(null);
        }}
        onNew={handleNewConversation}
        onDelete={handleDeleteConversation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-slate-950"> <ImageGenerator />
        <header className="flex items-center gap-3 p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-slate-400 hover:text-white transition"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-400" />
            مساعد الذكاء الاصطناعي
          </h1>
        </header>

        <div className="flex-1 overflow-y-auto custom-scroll">
          {messages.length === 0 && !loading ? (
            <div className="h-full flex flex-col items-center justify-center px-4 text-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center mb-6 shadow-2xl shadow-teal-500/20">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">مرحباً! كيف أقدر أساعدك؟</h2>
              <p className="text-slate-400 max-w-md">
                ابدأ محادثة جديدة بكتابة رسالتك. أنا هنا للإجابة على أسئلتك ومساعدتك في أي موضوع.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8 max-w-2xl w-full">
                {[
                  { icon: "💡", title: "اقتراح أفكار", desc: "ساعدني أفكر في أفكار لمشروع جديد" },
                  { icon: "📝", title: "كتابة محتوى", desc: "اكتب لي رسالة رسمية" },
                  { icon: "🔍", title: "شرح موضوع", desc: "اشرحلي مفهوم الذكاء الاصطناعي" },
                  { icon: "🌍", title: "ترجمة", desc: "ترجم هذه الجملة للإنجليزية" },
                ].map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s.desc)}
                    className="text-right p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-teal-500 hover:bg-slate-800 transition-all group"
                  >
                    <div className="text-2xl mb-1">{s.icon}</div>
                    <div className="font-semibold text-sm text-white">{s.title}</div>
                    <div className="text-xs text-slate-400 mt-1">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {loading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {error && (
          <div className="px-4 pb-2">
            <div className="max-w-3xl mx-auto flex items-center gap-2 bg-red-950/50 border border-red-800 rounded-xl px-4 py-3 text-red-300 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="mr-auto text-red-400 hover:text-red-300 transition"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <ChatInput onSend={handleSend} disabled={loading} />
      </main>
    </div>
  );
}
