import { useState } from "react";
import { Image, Download, Loader2, Sparkles } from "lucide-react";

declare global {
  interface Window {
    puter?: {
      ai?: {
        txt2img: (
          prompt: string,
          options?: {
            model?: string;
          }
        ) => Promise<string | HTMLImageElement>;
      };
    };
  }
}

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateImage() {
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError("");
    setImageUrl("");

    try {
      if (!window.puter?.ai?.txt2img) {
        throw new Error("خدمة توليد الصور غير متاحة حالياً");
      }

      const result = await window.puter.ai.txt2img(prompt.trim());

      if (typeof result === "string") {
        setImageUrl(result);
      } else if (result instanceof HTMLImageElement) {
        setImageUrl(result.src);
      } else {
        throw new Error("لم يتم استلام الصورة");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "حدث خطأ أثناء توليد الصورة"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center">
            <Image className="w-6 h-6 text-white" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">
              مولد الصور بالذكاء الاصطناعي
            </h2>
            <p className="text-sm text-slate-400">
              اكتب وصف الصورة التي تريد إنشاءها
            </p>
          </div>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="مثال: مدينة الإسكندرية وقت الغروب، تصوير سينمائي واقعي، تفاصيل عالية..."
          className="w-full min-h-[120px] rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 p-4 outline-none focus:border-teal-500 resize-none"
          disabled={loading}
        />

        <button
          onClick={generateImage}
          disabled={loading || !prompt.trim()}
          className="mt-4 w-full h-12 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              جاري إنشاء الصورة...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              إنشاء الصورة
            </>
          )}
        </button>

        {error && (
          <div className="mt-4 rounded-xl border border-red-800 bg-red-950/50 text-red-300 p-4 text-sm">
            {error}
          </div>
        )}

        {imageUrl && (
          <div className="mt-6">
            <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-950">
              <img
                src={imageUrl}
                alt={prompt}
                className="w-full h-auto block"
              />
            </div>

            <a
              href={imageUrl}
              download="creator-ai-image.png"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 w-full h-11 rounded-xl bg-slate-800 border border-slate-700 text-white flex items-center justify-center gap-2 hover:bg-slate-700 transition"
            >
              <Download className="w-5 h-5" />
              فتح / حفظ الصورة
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
