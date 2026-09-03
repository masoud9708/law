import React, { useState } from "react";
import { api } from "../../lib/api";
import {
  FilePenLine,
  Scale,
  Sparkles,
  Copy,
  Check,
  Printer,
  Download,
  ShieldCheck,
  Zap,
  BookOpen,
  HelpCircle,
  FileCheck2
} from "lucide-react";

interface DraftingViewProps {
  onCreditDeducted: () => void;
}

const DRAFT_TEMPLATES = [
  { id: "دادخواست", label: "دادخواست حقوقی", desc: "بدوی، شورای حل اختلاف، الزام به تعهدات" },
  { id: "لایحه دفاعیه", label: "لایحه دفاعیه تخصصی", desc: "دفاع در جلسه دادگاه، رد ادعای خواهان" },
  { id: "شکواییه", label: "شکواییه کیفری", desc: "کلاهبرداری، خیانت در امانت، صدور چک بلامحل" },
  { id: "اظهارنامه", label: "اظهارنامه رسمی قضایی", desc: "ارسال اخطار رسمی قبل از طرح دعوا" },
  { id: "تجدیدنظرخواهی", label: "دادخواست تجدیدنظر", desc: "اعتراض به دادنامه بدوی در مهلت ۲۰ روزه" },
  { id: "فرجام‌خواهی", label: "لایحه فرجام‌خواهی", desc: "دیوان عالی کشور با استناد به موازین شرعی و قانونی" },
  { id: "قرارداد", label: "قرارداد حقوقی و تجاری", desc: "مشارکت در ساخت، اجاره، خرید و فروش، صلح" }
];

export const DraftingView: React.FC<DraftingViewProps> = ({ onCreditDeducted }) => {
  const [draftType, setDraftType] = useState("دادخواست");
  const [plaintiff, setPlaintiff] = useState("آقای علیرضا موسوی (اصالتاً / با وکالت)");
  const [defendant, setDefendant] = useState("شرکت ساختمانی آرمان سازه / آقای بهروز شایسته");
  const [subject, setSubject] = useState("الزام به تحویل مبیع و مطالبه وجه التزام قراردادی به انضمام خسارات دادرسی");
  const [court, setCourt] = useState("مجتمع قضایی شهید بهشتی تهران / شورای حل اختلاف");
  const [facts, setFacts] = useState("اینجانب در تاریخ ۱۴۰۲/۰۶/۱۵ به موجب مبایعه‌نامه شماره ۴۵۸۲ یک باب آپارتمان را خریداری نموده و کلیه اقساط ثمن را پرداخت کردم. مقرر بود ملک در تاریخ ۱۴۰۳/۰۲/۰۱ تحویل گردد لکن خوانده با وجود گذشت چند ماه از تحویل امتناع نموده است.");
  const [evidence, setEvidence] = useState("۱. تصویر مصدق مبایعه‌نامه شماره ۴۵۸۲، ۲. فیش‌های واریزی ثمن معامله، ۳. گواهی عدم حضور دفترخانه اسناد رسمی، ۴. اظهارنامه ارسالی");
  const [customArticles, setCustomArticles] = useState("مواد ۱۰، ۲۱۹، ۲۲۰ و ۲۳۰ قانون مدنی و مواد ۵۱۵ و ۵۲۲ قانون آیین دادرسی مدنی");

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<string | null>(null);
  const [citations, setCitations] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!subject.trim() || !facts.trim()) {
      setError("لطفاً موضوع و شرح وقایع را تکمیل نمایید.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const res = await api.generateDraft({
        draftType,
        plaintiff,
        defendant,
        subject,
        court,
        facts,
        evidence,
        customArticles
      });

      setGeneratedDraft(res.generatedDraft);
      setCitations(res.citations || []);
      onCreditDeducted();
    } catch (err: any) {
      setError(err.message || "خطا در تدوین سند حقوقی");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedDraft) return;
    navigator.clipboard.writeText(generatedDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-6rem)] overflow-y-auto bg-[#090D16] p-4 lg:p-6 gap-6 text-right">
      {/* 1. Configuration & Input Form */}
      <div className="w-full lg:w-5/12 space-y-4">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
              <FilePenLine className="w-4 h-4 text-amber-400" />
              <span>دستیار هوشمند تنظیم اسناد و لوایح قضایی</span>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-lg bg-amber-950/60 text-amber-300 border border-amber-500/30 font-mono font-bold">
              هزینه: ۱۵ واحد اعتبار
            </span>
          </div>

          {/* Template Selection Pills */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">نوع سند قضایی:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DRAFT_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => setDraftType(tmpl.id)}
                  className={`p-2.5 rounded-xl text-right transition-all text-xs font-medium border cursor-pointer ${
                    draftType === tmpl.id
                      ? "bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-md shadow-amber-950/40"
                      : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  <div>{tmpl.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Plaintiff & Defendant */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">خواهان / شاکی / اظهارکننده:</label>
              <input
                type="text"
                value={plaintiff}
                onChange={(e) => setPlaintiff(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">خوانده / مشتکی‌عنه / مخاطب:</label>
              <input
                type="text"
                value={defendant}
                onChange={(e) => setDefendant(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none transition-all"
              />
            </div>
          </div>

          {/* Subject & Court */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">موضوع خواسته / عنوان لایحه:</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">مرجع قضایی رسیدگی‌کننده:</label>
            <input
              type="text"
              value={court}
              onChange={(e) => setCourt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none"
            />
          </div>

          {/* Facts */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">شرح ماوقع و فکت‌های پرونده (Facts):</label>
            <textarea
              rows={4}
              value={facts}
              onChange={(e) => setFacts(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl p-3 text-xs text-slate-100 leading-relaxed outline-none transition-all resize-none"
            />
          </div>

          {/* Evidence */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">دلایل و منضمات اثباتی:</label>
            <input
              type="text"
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none"
            />
          </div>

          {/* Custom Articles */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">مواد قانونی و آرای وحدت رویه مدنظر:</label>
            <input
              type="text"
              value={customArticles}
              onChange={(e) => setCustomArticles(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none font-mono"
            />
          </div>

          {error && <div className="p-2.5 rounded-xl bg-red-950/50 text-red-200 text-xs border border-red-800/50">{error}</div>}

          {/* Action Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
              isGenerating
                ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                : "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-950/40 active:scale-98"
            }`}
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                <span>در حال انطباق با قوانین و تدوین لایحه...</span>
              </>
            ) : (
              <>
                <Scale className="w-4 h-4 text-slate-950" />
                <span>تدوین و استخراج نسخه نهایی لایحه</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Output Document Preview */}
      <div className="w-full lg:w-7/12 flex flex-col space-y-4">
        <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 md:p-6 flex flex-col shadow-xl overflow-hidden min-h-[500px]">
          {/* Output Toolbar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-100">
                پیش‌نمایش سند آماده چاپ و ثبت در سامانه خودکاربری
              </span>
            </div>

            {generatedDraft && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "کپی شد" : "کپی متن"}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer shadow-md shadow-amber-950/30"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-950" />
                  <span>چاپ / PDF</span>
                </button>
              </div>
            )}
          </div>

          {/* Document Paper Canvas */}
          <div className="flex-1 overflow-y-auto mt-4 p-6 md:p-8 bg-[#060A12] rounded-xl border border-slate-800 font-serif leading-loose text-slate-100 text-xs md:text-sm whitespace-pre-wrap shadow-inner">
            {generatedDraft ? (
              <div className="space-y-4">
                <div className="text-center pb-4 border-b border-slate-800 space-y-1">
                  <div className="text-sm font-bold text-amber-300">به نام خدا</div>
                  <div className="text-xs text-slate-400 font-mono">بسمه‌تعالی • جمهوری اسلامی ایران • قوه قضاییه</div>
                </div>

                <div className="leading-loose text-slate-200">
                  {generatedDraft}
                </div>

                {citations.length > 0 && (
                  <div className="mt-8 pt-4 border-t border-slate-800 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>مستندات احراز شده در متن سند:</span>
                    </div>
                    <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                      {citations.map((c, i) => (
                        <li key={i} className="text-amber-300 font-medium">{c.citation_text}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-3">
                <FileCheck2 className="w-12 h-12 text-slate-600" />
                <p className="text-xs max-w-sm text-slate-400 leading-relaxed">
                  مشخصات پرونده و فکت‌ها را در فرم سمت راست وارد نموده و دکمه «تدوین و استخراج» را بفشارید.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
