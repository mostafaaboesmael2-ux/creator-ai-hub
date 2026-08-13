import { User, Sparkles } from "lucide-react";
import type { Message } from "@/lib/supabase";

type ChatMessageProps = {
  message: Message;
};

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center
          ${isUser
            ? "bg-gradient-to-br from-blue-500 to-indigo-600"
            : "bg-gradient-to-br from-teal-400 to-emerald-500"}`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Sparkles className="w-5 h-5 text-white" />
        )}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${isUser
          ? "bg-blue-600 text-white rounded-tr-sm"
          : "bg-slate-800 text-slate-100 rounded-tl-sm"}`}
      >
        <p className="whitespace-pre-wrap leading-relaxed text-[15px]">
          {message.content}
        </p>
      </div>
    </div>
  );
}
