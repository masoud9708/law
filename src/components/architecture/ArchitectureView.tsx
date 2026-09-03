import React, { useState } from "react";
import {
  Layers,
  Server,
  Database,
  Cpu,
  ShieldCheck,
  Zap,
  ArrowDown,
  ArrowLeft,
  CheckCircle,
  FileCode,
  Sparkles,
  GitBranch,
  Terminal,
  Activity
} from "lucide-react";

export const ArchitectureView: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<number>(1);

  const ARCHITECTURE_SECTIONS = [
    {
      id: 1,
      title: "۱. معماری کلان (Cloudflare / NGINX / Gateway)",
      content: `ترافیک ورودی ابتدا از Cloudflare (WAF/DDoS) گذشته و به NGINX Reverse Proxy هدایت می‌شود. NGINX درخواست‌های استاتیک را سرو کرده و ترافیک /api/* را به کلاستر بک‌اند (FastAPI/Node) و /ws را به کلاستر WebSocket هدایت می‌کند.`
    },
    {
      id: 2,
      title: "۲. دیتابیس‌ها و ذخیره‌سازی داده (PostgreSQL / Qdrant / Redis / MinIO)",
      content: `• PostgreSQL 16: ذخیره کاربران، سشن‌ها، تراکنش‌ها، اسناد و گزارشات مالی با رعایت تراکنش‌های اتمیک ACID.\n• Qdrant Vector DB: پایگاه داده برداری برای ذخیره امبدینگ‌های قوانین، آرای وحدت رویه و چانک‌های پرونده‌ها.\n• Redis: کشینگ لایحه و پاسخ‌ها و مدیریت Token Bucket برای Rate Limiter.\n• MinIO: ذخیره امن آبجکت‌های PDF، دادنامه‌ها و تصاویر ارسالی.`
    },
    {
      id: 3,
      title: "۳. پیش‌پردازش و نرمال‌سازی زبان فارسی (Persian Normalizer)",
      content: `• تبدیل تمامی ی/ي و ک/ك عربی به فارسی یکدست.\n• تبدیل ارقام انگلیسی و عربی به فارسی استاندارد.\n• اصلاح و درج نیم‌فاصله‌ها (Zero-Width Non-Joiner) با Regexهای بهینه‌شده.\n• حذف اعراب و نشانه‌های غیرضروری بدون افت معنی حقوقی.`
    },
    {
      id: 4,
      title: "۴. سیستم چانک‌بندی تخصصی حقوقی (Legal Chunking)",
      content: `قوانین بر اساس «ماده»، «تبصره» و «بند» برش داده می‌شوند (Semantic Structure Chunking) تا ارتباط مفهومی اصل ماده با تبصره‌های آن حفظ شود.`
    },
    {
      id: 5,
      title: "۵. بازیابی هیبرید و بازرتبه‌بندی (Hybrid RAG & Cross-Encoder)",
      content: `ترکیب جستجوی متنی کلمات کلیدی (BM25) با تشابه برداری (Dense Vector Cosine Similarity) از طریق فرمول RRF، و سپس فیلتر و رتبه‌بندی توسط Cross-Encoder جهت بازگردانی مرتبط‌ترین ۴ مستند قانونی.`
    },
    {
      id: 6,
      title: "۶. ارکستریتور هوش مصنوعی و مسیریابی مدل‌ها (Model Router)",
      content: `ارسال پرامپت تقویت‌شده به Gemini 3.7 Flash یا مدل‌های تخصصی محلی با Temperature پایین (۰.۱ الی ۰.۲) برای جلوگیری از توهم (Hallucination).`
    },
    {
      id: 7,
      title: "۷. لایه اعتبارسنجی استنادات (Citation Verification Layer)",
      content: `پاسخ تولیدی توسط سیستم Regex و انطباق با دیتابیس مراجع قانونی واکاوی شده و تنها در صورت وجود واقعی ماده قانونی در مراجع معتبر ایران، تیک تایید سبز و نمره اطمینان داده می‌شود.`
    },
    {
      id: 8,
      title: "۸. موتور محاسبات اتمیک اعتبار (Atomic Credit Engine)",
      content: `قبل از اجرای هر درخواست، با دستور SELECT ... FOR UPDATE موجودی کاربر بررسی و به میزان لازم کسر می‌شود. در صورت عدم کفایت موجودی، ارور ۴۰۲ داده شده و لاگ تراکنش ثبت می‌گردد.`
    }
  ];

  return (
    <div className="flex-1 h-[calc(100vh-6rem)] overflow-y-auto bg-[#090D16] p-4 lg:p-8 space-y-8 text-right">
      {/* Title */}
      <div className="max-w-6xl mx-auto space-y-2">
        <div className="flex items-center gap-2.5 text-white font-bold text-sm">
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400">
            <Layers className="w-5 h-5" />
          </div>
          <span>طرح‌واره جامع معماری سیستم هوش مصنوعی حقوقی (System Architecture Blueprint)</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          پیاده‌سازی دقیق تمامی ۳۵ بند نیازمندی‌های مطرح شده در خصوص خط لوله RAG، نرمال‌سازی فارسی، کسر اعتبار اتمیک و اعتبارسنجی استنادات.
        </p>
      </div>

      {/* Visual Pipeline Flow */}
      <div className="max-w-6xl mx-auto p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>خط لوله جریان داده و استعلام در زمان واقعی (End-to-End Dataflow Pipeline)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 relative">
            <div className="text-[10px] px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 font-bold font-mono inline-block border border-blue-500/20">
              گام ۱: درخواست و احراز هویت
            </div>
            <div className="text-xs font-bold text-white">پرسش کاربر & بررسی اعتبار اتمیک</div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              ارسال توکن JWT، قفل سطر اشتراک در PostgreSQL، کسر ۵ اعتبار با FOR UPDATE.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 relative">
            <div className="text-[10px] px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-300 font-bold font-mono inline-block border border-amber-500/20">
              گام ۲: پاک‌سازی و RAG
            </div>
            <div className="text-xs font-bold text-white">Persian Normalizer & Hybrid Search</div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              تبدیل ی/ک و نیم‌فاصله‌ها، جستجوی همزمان BM25 + برداری Qdrant با بازرتبه‌بندی.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 relative">
            <div className="text-[10px] px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-300 font-bold font-mono inline-block border border-purple-500/20">
              گام ۳: استدلال هوش مصنوعی
            </div>
            <div className="text-xs font-bold text-white">LLM Orchestration (Gemini 3.7)</div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              ترکیب پرامپت تخصصی وکلای دادگستری با مستندات قانونی بازیابی‌شده با ضریب دمای ۰.۲.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-800/40 space-y-2 relative">
            <div className="text-[10px] px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold font-mono inline-block border border-emerald-500/20">
              گام ۴: تایید استناد قانونی
            </div>
            <div className="text-xs font-bold text-white">Citation Verifier & Stream</div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              انطباق ارجاعات حقوقی با مواد واقعی، ضمیمه کردن شناسنامه رأی، پاسخ نهایی به کاربر.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive 8-Phase Deep-Dive Cards */}
      <div className="max-w-6xl mx-auto space-y-4">
        <h3 className="text-sm font-bold text-white">توصیف فنی اجزای ۸ گانه سیستم:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ARCHITECTURE_SECTIONS.map((sec) => (
            <div
              key={sec.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-right shadow-xl"
            >
              <h4 className="text-xs font-bold text-amber-300">{sec.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {sec.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
