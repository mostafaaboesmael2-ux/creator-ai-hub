import { useState, useRef, type KeyboardEvent } from "react";
import { Send } from "lucide-react";

type ChatInputProps = {
  onSend: (text: string) => void;
  disabled: boolean;
};

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  };

  return (
    <div className="border-t border-slate-800 bg-slate-900 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end gap-2 bg-slate-800 rounded-2xl p-2 border border-slate-700 focus-within:border-teal-500 transition-colors">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              handleInput();
            }}
            onKeyDown={handleKeyDown}
            placeholder="اكتب رسالتك هنا..."
            rows={1}
            disabled={disabled}
            className="flex-1 bg-transparent text-white placeholder-slate-500 resize-none outline-none px-3 py-2 text-[15px] leading-relaxed max-h-[200px] custom-scroll"
          />
          <button
            onClick={handleSend}
            disabled={disabled || !text.trim()}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-blue-500 text-white flex items-center justify-center hover:from-teal-400 hover:to-blue-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-xs text-slate-600 mt-2">
          اضغط Enter للإرسال، Shift+Enter لسطر جديد
        </p>
      </div>
    </div>
  );
}
