import { Plus, MessageSquare, Trash2, X } from "lucide-react";
import type { Conversation } from "@/lib/supabase";

type SidebarProps = {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  isOpen,
  onClose,
}: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed md:relative z-40 h-full w-72 flex-shrink-0 transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          bg-slate-900 border-r border-slate-800 flex flex-col`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </span>
            مساعد الذكاء
          </h2>
          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3">
          <button
            onClick={onNew}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 text-white font-medium hover:from-teal-400 hover:to-blue-400 transition-all shadow-lg shadow-teal-500/20"
          >
            <Plus className="w-5 h-5" />
            محادثة جديدة
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4 custom-scroll">
          {conversations.length === 0 && (
            <p className="text-slate-500 text-sm text-center mt-8">
              لا توجد محادثات بعد
            </p>
          )}
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer mb-1 transition-all
                ${activeId === conv.id
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"}`}
              onClick={() => onSelect(conv.id)}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0 opacity-60" />
              <span className="flex-1 truncate text-sm">{conv.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-800">
          <p className="text-xs text-slate-600 text-center">
            مدعوم بواسطة الذكاء الاصطناعي
          </p>
        </div>
      </aside>
    </>
  );
}
