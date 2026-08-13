import { Sparkles } from "lucide-react";

export default function TypingIndicator() {
  return (
    <div className="flex gap-3 flex-row">
      <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-teal-400 to-emerald-500">
        <Sparkles className="w-5 h-5 text-white" />
      </div>
      <div className="bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-4 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}
