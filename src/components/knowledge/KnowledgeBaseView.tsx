import React, { useState, useEffect } from "react";
import { LegalSource } from "../../types";
import { api } from "../../lib/api";
import {
  BookOpen,
  Search,
  Scale,
  Plus,
  Filter,
  Copy,
  Check,
  Calendar,
  Building,
  Tag,
  Sparkles,
  ExternalLink,
  Globe,
  RefreshCw,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

export const KnowledgeBaseView: React.FC = () => {
  const [sources, setSources] = useState<LegalSource[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSourceType, setSelectedSourceType] = useState("all");
  const [selectedSource, setSelectedSource] = useState<LegalSource | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isIngestOpen, setIsIngestOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isSyncingAra, setIsSyncingAra] = useState(false);
  const [syncUrl, setSyncUrl] = useState("https://ara.jri.ac.ir/Law/Index?layout=True&page=5&Slayout=True");
  const [syncResult, setSyncResult] = useState<{ count: number; message: string } | null>(null);

  // New Law Ingestion Form State
  const [newTitle, setNewTitle] = useState("");
  const [newArticle, setNewArticle] = useState("");
  const [newCategory, setNewCategory] = useState("حقوق مدنی");
  const [newSourceType, setNewSourceType] = useState<any>("LAW");
  const [newAuthority, setNewAuthority] = useState("مجلس شورای اسلامی");
  const [newText, setNewText] = useState("");

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    try {
      const data = await api.getLegalSources();
      setSources(data.sources);
      if (data.sources.length > 0 && !selectedSource) {
        setSelectedSource(data.sources[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadSources();
      return;
    }
    try {
      const res = await api.searchLegal(searchQuery, selectedCategory, selectedSourceType);
      setSources(res.sources);
      if (res.sources.length > 0) {
        setSelectedSource(res.sources[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSyncAra = async (overrideUrl?: string) => {
    setIsSyncingAra(true);
    try {
      const target = overrideUrl || syncUrl;
      const res = await api.syncAraJri(target);
      if (res.success) {
        setSyncResult({ count: res.totalAraSources, message: res.message });
        const data = await api.getLegalSources();
        setSources(data.sources);
        if (res.sources && res.sources.length > 0) {
          setSelectedSource(res.sources[0]);
        }
        setTimeout(() => setSyncResult(null), 6000);
      }
    } catch (err) {
      console.error("Failed to sync ara.jri.ac.ir:", err);
    } finally {
      setIsSyncingAra(false);
      setIsSyncModalOpen(false);
    }
  };

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newText) return;

    try {
      const res = await api.ingestLegalSource({
        title: newTitle,
        article: newArticle,
        category: newCategory as any,
        source_type: newSourceType,
        authority: newAuthority,
        text: newText,
        keywords: [newTitle, newArticle, newCategory]
      });

      setSources(prev => [res.source, ...prev]);
      setSelectedSource(res.source);
      setIsIngestOpen(false);
      setNewTitle("");
      setNewText("");
      setNewArticle("");
    } catch (err) {
      console.error(err);
    }
  };

  const filteredSources = sources.filter(s => {
    const matchCategory = selectedCategory === "all" || s.category === selectedCategory;
    const matchType = selectedSourceType === "all" || s.source_type === selectedSourceType;
    return matchCategory && matchType;
  });

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-6rem)] overflow-hidden bg-[#090D16]">
      {/* 1. Left List & Search */}
      <div className="w-full lg:w-96 bg-slate-900/90 border-l border-slate-800 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-100 truncate">پایگاه قوانین و آراء دیوان عالی کشور</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setIsSyncModalOpen(true)}
                title="همگام‌سازی از سامانه ملی آرای قضایی (ara.jri.ac.ir)"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition-all cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>ara.jri</span>
              </button>
              <button
                onClick={() => setIsIngestOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold transition-all cursor-pointer shadow-sm shadow-amber-950/40"
              >
                <Plus className="w-3.5 h-3.5 text-slate-950" />
                <span>ثبت</span>
              </button>
            </div>
          </div>

          {/* Sync Success Feedback */}
          {syncResult && (
            <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-[11px] flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="leading-snug">{syncResult.message}</div>
            </div>
          )}

          {/* Search Input */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="جستجو در مواد و آراء (مثلاً ۸۵۲، ۸۵۰، ۸۴۷، ۸۱۰)..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl pr-8 pl-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5" />
            </div>
            <button
              onClick={handleSearch}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-750 cursor-pointer transition-colors"
            >
              جستجو
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 text-slate-300 text-[11px] rounded-xl p-2 outline-none focus:border-amber-500"
            >
              <option value="all">همه شاخه‌های حقوقی</option>
              <option value="حقوق مدنی">حقوق مدنی</option>
              <option value="کیفری و جزا">کیفری و جزا</option>
              <option value="آیین دادرسی">آیین دادرسی</option>
              <option value="دیوان عدالت اداری و اداری">دیوان عدالت اداری و اداری</option>
              <option value="آرای وحدت رویه">آرای وحدت رویه</option>
              <option value="حقوق تجارت و شرکت‌ها">حقوق تجارت و شرکت‌ها</option>
              <option value="خانواده و امور حسبی">خانواده و امور حسبی</option>
              <option value="کار و تأمین اجتماعی">کار و تأمین اجتماعی</option>
              <option value="املاک و اراضی و ثبت">املاک و اراضی و ثبت</option>
              <option value="مالیات و گمرک">مالیات و گمرک</option>
            </select>

            <select
              value={selectedSourceType}
              onChange={(e) => setSelectedSourceType(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 text-slate-300 text-[11px] rounded-xl p-2 outline-none focus:border-amber-500"
            >
              <option value="all">همه مراجع و اسناد</option>
              <option value="UNITY_JUDGMENT">رأی وحدت رویه (دیوان عالی)</option>
              <option value="LAW">قوانین مصوب (LAW)</option>
              <option value="ADMIN_COURT_JUDGMENT">رأی دیوان عدالت اداری</option>
              <option value="ADVISORY_OPINION">نظریه مشورتی</option>
              <option value="CIRCULAR">بخشنامه‌ها و آیین‌نامه‌ها</option>
            </select>
          </div>

          {/* Quick Topic Chips */}
          <div className="flex flex-wrap gap-1 pt-1 max-h-28 overflow-y-auto">
            {[
              { label: "سامانه ملی (ara.jri)", q: "ara.jri.ac.ir" },
              { label: "رأی ۸۵۲ (ترهین مال غیر)", q: "۸۵۲" },
              { label: "رأی ۸۵۱ (شعب بانک)", q: "۸۵۱" },
              { label: "رأی ۸۵۰ (تاخیر تادیه)", q: "۸۵۰" },
              { label: "رأی ۸۴۷ (وکیل و ثمن بخس)", q: "۸۴۷" },
              { label: "رأی ۸۴۶ (تخفیف مواد مخدر)", q: "۸۴۶" },
              { label: "رأی ۸۵۵ (فرجام‌خواهی)", q: "۸۵۵" },
              { label: "رأی ۸۴۰ (قسامه و اعاده)", q: "۸۴۰" },
              { label: "رأی ۸۳۶ (ابطال داوری)", q: "۸۳۶" },
              { label: "رأی ۸۳۴ (دیه بیت‌المال)", q: "۸۳۴" },
              { label: "رأی ۸۳۰ (اعسار پیش از حبس)", q: "۸۳۰" },
              { label: "رأی ۸۲۸ (اراضی ملی)", q: "۸۲۸" },
              { label: "رأی ۸۲۲ (تغییر کاربری)", q: "۸۲۲" },
              { label: "رأی ۸۱۰ (فسخ بیع و چک)", q: "۸۱۰" },
              { label: "رأی ۸۱۱ (مستحق‌للغیر)", q: "۸۱۱" },
              { label: "رأی ۸۰۵ (وجه التزام)", q: "۸۰۵" },
              { label: "ماده ۲۳ چک صیادی", q: "ماده ۲۳ قانون صدور چک" },
              { label: "الزام به ثبت رسمی", q: "ثبت رسمی اموال غیرمنقول" }
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSearchQuery(chip.q);
                  api.searchLegal(chip.q).then(res => {
                    setSources(res.sources);
                    if (res.sources.length > 0) setSelectedSource(res.sources[0]);
                  });
                }}
                className="px-2 py-0.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-[10px] text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-800"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Source List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {filteredSources.map((src) => {
            const isSelected = src.id === selectedSource?.id;
            const isFromAra = src.metadata?.source_url?.includes("ara.jri.ac.ir") || src.authority?.includes("سامانه ملی آرای قضایی");
            return (
              <div
                key={src.id}
                onClick={() => setSelectedSource(src)}
                className={`p-3 rounded-xl cursor-pointer text-right transition-all border ${
                  isSelected
                    ? "bg-slate-850 border-r-4 border-amber-400 text-white shadow-md"
                    : "bg-slate-950/70 border-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 gap-1">
                  <span className="text-xs font-bold text-slate-100 truncate flex-1">
                    {src.title}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    {isFromAra && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold flex items-center gap-0.5">
                        <Globe className="w-2.5 h-2.5" />
                        ara.jri
                      </span>
                    )}
                    <span className="text-[9px] px-2 py-0.5 rounded bg-slate-900 font-mono text-amber-300 border border-slate-800 font-bold">
                      {src.source_type}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2">
                  {src.text}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-850">
                  <span className="font-medium text-slate-300 truncate max-w-[180px]">{src.authority}</span>
                  <span className="text-slate-400">{src.category}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Source Viewer */}
      <div className="flex-1 flex flex-col h-full bg-[#0B1120] overflow-y-auto p-4 md:p-6 text-right">
        {selectedSource ? (
          <div className="max-w-3xl mx-auto w-full space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 text-right space-y-5 shadow-xl">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono font-bold">
                      {selectedSource.source_type}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{selectedSource.category}</span>
                    {selectedSource.metadata?.binding && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        لازم‌الاتباع برای کلیه محاکم
                      </span>
                    )}
                  </div>
                  <h2 className="text-base md:text-lg font-black text-white pt-1">
                    {selectedSource.title} {selectedSource.article && `(${selectedSource.article})`}
                  </h2>
                </div>

                <button
                  onClick={() => handleCopy(selectedSource.id, selectedSource.text)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                >
                  {copiedId === selectedSource.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === selectedSource.id ? "کپی شد" : "کپی رأی"}</span>
                </button>
              </div>

              {/* Verified Source Banner (ara.jri.ac.ir Provenance Card) */}
              {selectedSource.metadata?.source_url && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-950 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                      <Scale className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-100 flex items-center gap-2">
                        <span>سامانه ملی آرای قضایی (پژوهشگاه قوه قضاییه)</span>
                        {selectedSource.metadata?.page && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">صفحه {selectedSource.metadata.page}</span>
                        )}
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono dir-ltr select-all truncate max-w-xs sm:max-w-md">
                        {selectedSource.metadata.source_url}
                      </div>
                    </div>
                  </div>
                  <a
                    href={selectedSource.metadata.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shrink-0 cursor-pointer shadow-sm"
                  >
                    <span>مشاهده در سامانه ملی</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Metadata row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] mb-0.5">مرجع صادرکننده / تصویب:</span>
                  <span className="font-bold text-slate-200">{selectedSource.authority}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] mb-0.5">تاریخ صدور / رأی:</span>
                  <span className="font-mono text-amber-300">{selectedSource.date}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] mb-0.5">شماره دادنامه / مصوبه:</span>
                  <span className="font-mono text-amber-300">{selectedSource.document_number}</span>
                </div>
              </div>

              {/* Full Legal Text */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>متن صریح و گردشکار قانونی:</span>
                </span>
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs md:text-sm leading-loose whitespace-pre-wrap font-serif selection:bg-amber-500/40">
                  {selectedSource.text}
                </div>
              </div>

              {/* Keywords */}
              {selectedSource.keywords && (
                <div className="pt-2">
                  <span className="text-[11px] text-slate-400 block mb-2">کلیدواژه‌های نمایه‌سازی شده در وکتور RAG:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSource.keywords.map((kw, i) => (
                      <span key={i} className="text-[10px] px-2.5 py-1 rounded-full bg-slate-950 text-slate-300 border border-slate-800">
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs">
            یک مستند را از ستون کناری انتخاب کنید.
          </div>
        )}
      </div>

      {/* Sync from ara.jri.ac.ir Modal */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-right space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-sm text-slate-100">همگام‌سازی از سامانه ملی آرای قضایی</span>
              </div>
              <button type="button" onClick={() => setIsSyncModalOpen(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer">✕</button>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-1">
              <div className="font-bold">استخراج و نمایه‌سازی هوشمند آرای وحدت رویه (صفحه ۵)</div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                آراء وحدت رویه هیأت عمومی دیوان عالی کشور منتشر شده در سامانه ملی آرای قضایی (پژوهشگاه قوه قضاییه) مستقیماً با وکتورهای معنایی و تطبیق‌های قانونی در دیتابیس هوشمند بارگذاری و به‌روزرسانی می‌شوند.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block text-slate-400 font-medium">نشانی اینترنتی منبع (URL):</label>
              <input
                type="text"
                value={syncUrl}
                onChange={(e) => setSyncUrl(e.target.value)}
                dir="ltr"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-slate-100 font-mono text-xs outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                disabled={isSyncingAra}
                onClick={() => handleSyncAra()}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs cursor-pointer shadow-md shadow-amber-950/40 flex items-center justify-center gap-1.5"
              >
                {isSyncingAra ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>در حال استخراج و نمایه‌سازی RAG...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 text-slate-950" />
                    <span>همگام‌سازی و بارگذاری منابع</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsSyncModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ingest Modal */}
      {isIngestOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleIngest}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-right space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-sm text-slate-100">نمایه‌سازی مستند قانونی جدید در وکتور دیتابیس</span>
              <button type="button" onClick={() => setIsIngestOpen(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">عنوان قانون / رأی:</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: رأی وحدت رویه شماره ۸۵۲ هیأت عمومی دیوان عالی کشور"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-slate-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">ماده / شماره دادنامه:</label>
                  <input
                    type="text"
                    value={newArticle}
                    onChange={(e) => setNewArticle(e.target.value)}
                    placeholder="مثال: ۸۵۲"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">دسته‌بندی:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-slate-100 outline-none"
                  >
                    <option value="آرای وحدت رویه">آرای وحدت رویه</option>
                    <option value="حقوق مدنی">حقوق مدنی</option>
                    <option value="کیفری و جزا">کیفری و جزا</option>
                    <option value="آیین دادرسی">آیین دادرسی</option>
                    <option value="دیوان عدالت اداری و اداری">دیوان عدالت اداری و اداری</option>
                    <option value="حقوق تجارت و شرکت‌ها">حقوق تجارت و شرکت‌ها</option>
                    <option value="خانواده و امور حسبی">خانواده و امور حسبی</option>
                    <option value="کار و تأمین اجتماعی">کار و تأمین اجتماعی</option>
                    <option value="املاک و اراضی و ثبت">املاک و اراضی و ثبت</option>
                    <option value="مالیات و گمرک">مالیات و گمرک</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">متن ماده یا رأی:</label>
                <textarea
                  rows={4}
                  required
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="متن کامل ماده قانونی یا رأی وحدت رویه..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-slate-100 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md shadow-amber-950/40"
              >
                ذخیره و ایندکس در پایگاه RAG
              </button>
              <button
                type="button"
                onClick={() => setIsIngestOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
