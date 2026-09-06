import React, { useState, useEffect, useMemo } from "react";
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
  CheckCircle2,
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  X,
  Clock,
  Layers,
  FileText,
  Star,
  Printer,
  Bookmark,
  BrainCircuit,
  Lightbulb,
  Gavel,
  Type
} from "lucide-react";

// تابع هوشمند استخراج سال شمسی تصویب یا صدور رأی
export const extractSourceYear = (s: LegalSource): number | undefined => {
  if (s.year) return s.year;
  if (s.metadata?.year && typeof s.metadata.year === "number") return s.metadata.year;
  const toEn = (str: any) => String(str || "").replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
  
  const dateEn = toEn(s.date);
  const mDate = dateEn.match(/\b(1[34][0-9]{2})\b/);
  if (mDate) return parseInt(mDate[1], 10);

  const docEn = toEn(s.document_number);
  const mDoc = docEn.match(/(?:مصوب|سال)\s*(1[34][0-9]{2})/);
  if (mDoc) return parseInt(mDoc[1], 10);
  const mDdn = docEn.match(/\b(9[0-9])0997/);
  if (mDdn) return 1300 + parseInt(mDdn[1], 10);

  const titleEn = toEn(s.title);
  const mTitle = titleEn.match(/(?:مصوب|سال)\s*(1[34][0-9]{2})/);
  if (mTitle) return parseInt(mTitle[1], 10);
  const mTitleDdn = titleEn.match(/\b(9[0-9])0997/);
  if (mTitleDdn) return 1300 + parseInt(mTitleDdn[1], 10);

  const mGeneral = (dateEn + " " + docEn + " " + titleEn).match(/\b(1[34][0-9]{2})\b/);
  if (mGeneral) return parseInt(mGeneral[1], 10);

  return undefined;
};

// تابع تعیین نوع قانون و سند برای فیلتر و برچسب‌گذاری دقیق
export const getLawTypeLabel = (s: LegalSource): { label: string; badgeClass: string; key: string } => {
  const t = s.title || "";
  if (t.includes("قانون اساسی")) {
    return { label: "قانون اساسی", badgeClass: "bg-rose-500/15 text-rose-300 border-rose-500/30", key: "CONSTITUTION" };
  }
  if (s.source_type === "UNITY_JUDGMENT" || t.includes("وحدت رویه")) {
    return { label: "رأی وحدت رویه (دیوان عالی)", badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/30", key: "UNITY_JUDGMENT" };
  }
  if (s.metadata?.judge_id !== undefined || s.source_type === "JUDGMENT" || t.includes("دادنامه")) {
    return { label: "دادنامه و رویه قضایی محاکم", badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", key: "COURT_JUDGMENT" };
  }
  if (s.source_type === "ADMIN_COURT_JUDGMENT" || s.authority?.includes("دیوان عدالت") || s.category?.includes("دیوان عدالت")) {
    return { label: "دیوان عدالت اداری", badgeClass: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30", key: "ADMIN_COURT_JUDGMENT" };
  }
  if (s.source_type === "ADVISORY_OPINION" || t.includes("نظریه مشورتی")) {
    return { label: "نظریه مشورتی", badgeClass: "bg-teal-500/15 text-teal-300 border-teal-500/30", key: "ADVISORY_OPINION" };
  }
  if (s.source_type === "CIRCULAR" || t.includes("آیین‌نامه") || t.includes("بخشنامه") || t.includes("تصویب‌نامه")) {
    return { label: "آیین‌نامه / بخشنامه", badgeClass: "bg-purple-500/15 text-purple-300 border-purple-500/30", key: "CIRCULAR" };
  }
  if (s.source_type === "LAW") {
    if (t.includes("قانون مدنی") || t.includes("مجازات") || t.includes("تجارت") || t.includes("آیین دادرسی") || t.includes("قانون کار")) {
      return { label: "قانون عام و مادر", badgeClass: "bg-blue-500/15 text-blue-300 border-blue-500/30", key: "GENERAL_LAW" };
    }
    return { label: "قانون خاص و موضوعی", badgeClass: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30", key: "SPECIAL_LAW" };
  }
  return { label: s.source_type || "سند قانونی", badgeClass: "bg-slate-500/15 text-slate-300 border-slate-500/30", key: s.source_type };
};

export const KnowledgeBaseView: React.FC = () => {
  const [sources, setSources] = useState<LegalSource[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSourceType, setSelectedSourceType] = useState("all");
  const [selectedSourceOrigin, setSelectedSourceOrigin] = useState<"all" | "judges_100_to_1000" | "judges_1000_to_10000" | "unity_pages">("all");
  const [selectedAraPage, setSelectedAraPage] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<LegalSource | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isIngestOpen, setIsIngestOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isSyncingAra, setIsSyncingAra] = useState(false);
  const [syncUrl, setSyncUrl] = useState("https://ara.jri.ac.ir/Law/Index?layout=True&page=5&Slayout=True");
  const [syncStartPage, setSyncStartPage] = useState<number>(1);
  const [syncEndPage, setSyncEndPage] = useState<number>(71);
  const [syncResult, setSyncResult] = useState<{ count: number; message: string } | null>(null);
  const [totalAraCount, setTotalAraCount] = useState<number>(3522);
  const [totalJudgesCount, setTotalJudgesCount] = useState<number>(901);
  const [totalJudges100To1000, setTotalJudges100To1000] = useState<number>(901);
  const [totalJudges1000To10000, setTotalJudges1000To10000] = useState<number>(0);
  const [totalUnityCount, setTotalUnityCount] = useState<number>(2621);

  // Advanced Filter States (نوع قانون، سال تصویب، حوزه حقوقی)
  const [selectedLawType, setSelectedLawType] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [yearFrom, setYearFrom] = useState<string>("");
  const [yearTo, setYearTo] = useState<string>("");
  const [selectedEra, setSelectedEra] = useState<string>("all");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false);

  // New Comprehensive Knowledge Base States
  const [activeDocTab, setActiveDocTab] = useState<"text" | "ai_analysis" | "notes">("text");
  const [inDocSearch, setInDocSearch] = useState<string>("");
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Bookmarks State (LocalStorage)
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("legal_ai_bookmarks");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState<boolean>(false);

  // Citation Modal State
  const [isCitationModalOpen, setIsCitationModalOpen] = useState<boolean>(false);
  const [citationFormat, setCitationFormat] = useState<"pleading" | "footnote" | "standard">("pleading");
  const [citationCopied, setCitationCopied] = useState<boolean>(false);

  // Personal Source Notes State (LocalStorage)
  const [notesMap, setNotesMap] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem("legal_ai_source_notes");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [currentNote, setCurrentNote] = useState<string>("");
  const [noteSavedFeedback, setNoteSavedFeedback] = useState<boolean>(false);

  // New Law Ingestion Form State
  const [newTitle, setNewTitle] = useState("");
  const [newArticle, setNewArticle] = useState("");
  const [newCategory, setNewCategory] = useState("حقوق مدنی");
  const [newSourceType, setNewSourceType] = useState<any>("LAW");
  const [newAuthority, setNewAuthority] = useState("مجلس شورای اسلامی");
  const [newText, setNewText] = useState("");

  const effectiveYearFrom = useMemo(() => {
    if (yearFrom) return Number(yearFrom);
    if (selectedEra === "recent_1400") return 1400;
    if (selectedEra === "decade_1390") return 1390;
    if (selectedEra === "decade_1380") return 1380;
    if (selectedEra === "era_1350_1379") return 1350;
    if (selectedEra === "foundational_1300") return 1300;
    return undefined;
  }, [yearFrom, selectedEra]);

  const effectiveYearTo = useMemo(() => {
    if (yearTo) return Number(yearTo);
    if (selectedEra === "recent_1400") return 1404;
    if (selectedEra === "decade_1390") return 1399;
    if (selectedEra === "decade_1380") return 1389;
    if (selectedEra === "era_1350_1379") return 1379;
    if (selectedEra === "foundational_1300") return 1349;
    return undefined;
  }, [yearTo, selectedEra]);

  useEffect(() => {
    loadSources();
  }, [selectedAraPage, selectedCategory, selectedSourceType, selectedSourceOrigin, selectedLawType, selectedYear, effectiveYearFrom, effectiveYearTo]);

  const loadSources = async () => {
    try {
      const data = await api.getLegalSources({
        ara_page: selectedAraPage !== "all" ? selectedAraPage : undefined,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        source_type: selectedSourceType !== "all" ? selectedSourceType : undefined,
        source_origin: selectedSourceOrigin !== "all" ? selectedSourceOrigin : undefined,
        law_type: selectedLawType !== "all" ? selectedLawType : undefined,
        year: selectedYear !== "all" ? selectedYear : undefined,
        year_from: effectiveYearFrom,
        year_to: effectiveYearTo
      });
      setSources(data.sources);
      if (data.totalAraSources) {
        setTotalAraCount(data.totalAraSources);
      }
      if (data.totalJudgesSources) {
        setTotalJudgesCount(data.totalJudgesSources);
      }
      if (data.totalJudges100To1000 !== undefined) {
        setTotalJudges100To1000(data.totalJudges100To1000);
      }
      if (data.totalJudges1000To10000 !== undefined) {
        setTotalJudges1000To10000(data.totalJudges1000To10000);
      }
      if (data.totalUnitySources) {
        setTotalUnityCount(data.totalUnitySources);
      }
      if (data.sources.length > 0) {
        if (!selectedSource || !data.sources.some(s => s.id === selectedSource.id)) {
          setSelectedSource(data.sources[0]);
        }
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
      const res = await api.searchLegal(searchQuery, selectedCategory !== "all" ? selectedCategory : undefined, selectedSourceType !== "all" ? selectedSourceType : undefined, {
        lawType: selectedLawType !== "all" ? selectedLawType : undefined,
        year: selectedYear !== "all" ? selectedYear : undefined,
        yearFrom: effectiveYearFrom,
        yearTo: effectiveYearTo
      });
      let results = res.sources;
      if (selectedAraPage !== "all") {
        const pageNum = parseInt(selectedAraPage, 10);
        results = results.filter(s => s.metadata?.page === pageNum);
      }
      setSources(results);
      if (results.length > 0) {
        setSelectedSource(results[0]);
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

  useEffect(() => {
    if (selectedSource) {
      setCurrentNote(notesMap[selectedSource.id] || "");
      setInDocSearch("");
      setAnalysisError(null);
      // Reset active tab to text unless it's notes
      if (activeDocTab === "notes") {
        // keep notes tab
      } else if (activeDocTab === "ai_analysis" && !selectedSource.analysis && !selectedSource.metadata?.ai_analysis) {
        setActiveDocTab("text");
      }
    }
  }, [selectedSource?.id]);

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem("legal_ai_bookmarks", JSON.stringify(Array.from(next)));
      } catch (err) {
        console.warn("Bookmark save error:", err);
      }
      return next;
    });
  };

  const handleSaveNote = () => {
    if (!selectedSource) return;
    const newNotes = { ...notesMap, [selectedSource.id]: currentNote };
    setNotesMap(newNotes);
    try {
      localStorage.setItem("legal_ai_source_notes", JSON.stringify(newNotes));
    } catch (e) {
      console.warn("Note save error:", e);
    }
    setNoteSavedFeedback(true);
    setTimeout(() => setNoteSavedFeedback(false), 2500);
  };

  const handleAnalyzeSource = async (force: boolean = false) => {
    if (!selectedSource) return;
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const res = await api.analyzeLegalSource(selectedSource.id, force);
      if (res && res.analysis) {
        const updated = {
          ...selectedSource,
          analysis: res.analysis,
          metadata: {
            ...selectedSource.metadata,
            ai_analysis: res.analysis
          }
        };
        setSelectedSource(updated);
        setSources(prev => prev.map(s => s.id === updated.id ? updated : s));
        setActiveDocTab("ai_analysis");
      }
    } catch (err: any) {
      setAnalysisError(err.message || "خطا در تحلیل هوشمند مستند قانونی");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateCitation = (source: LegalSource, format: "pleading" | "footnote" | "standard"): string => {
    const isUnity = source.source_type === "UNITY_JUDGMENT" || source.title.includes("وحدت رویه");
    const docNum = source.document_number || "شماره مصوب";
    const dateStr = source.date || "نامشخص";
    const auth = source.authority || "مراجع قضایی";
    const yr = source.year ?? extractSourceYear(source);
    
    if (format === "pleading") {
      if (isUnity) {
        return `به استناد «رأی وحدت رویه شماره ${docNum} مورخ ${dateStr} هیأت عمومی دیوان عالی کشور» که به دلالت اصل ۱۶۱ قانون اساسی و ماده ۴۷۱ قانون آیین دادرسی کیفری برای کلیه شعب دیوان عالی کشور و دادگاه‌ها در موارد مشابه لازم‌الاتباع است،...`;
      }
      return `مستند به مفاد «${source.title}» (مصوب/صادره ${dateStr}، شماره ${docNum} مرجع: ${auth})،...`;
    }

    if (format === "footnote") {
      return `${auth}، «${source.title}»، شماره ${docNum}، مورخ ${dateStr}، پایگاه ملی قوانین و آراء قضایی.`;
    }

    return `[استناد قانونی]: ${source.title} | شماره: ${docNum} | تاریخ: ${dateStr} | مرجع: ${auth}${yr ? ` | سال ${yr}` : ""}`;
  };

  const handleCopyCitation = (text: string) => {
    navigator.clipboard.writeText(text);
    setCitationCopied(true);
    setTimeout(() => setCitationCopied(false), 2500);
  };

  const highlightInDocSearch = (str: string) => {
    const q = inDocSearch.trim();
    if (!q || q.length < 2) return str;
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi");
    const chunks = str.split(regex);
    if (chunks.length <= 1) return str;
    return (
      <>
        {chunks.map((chunk, i) =>
          regex.test(chunk) ? (
            <mark key={i} className="bg-amber-400 text-slate-950 px-1 py-0.5 rounded font-bold">
              {chunk}
            </mark>
          ) : (
            chunk
          )
        )}
      </>
    );
  };

  const handleSyncAra = async (options?: { url?: string; startPage?: number; endPage?: number; page?: number }) => {
    setIsSyncingAra(true);
    try {
      const payload = options || {
        url: syncUrl,
        startPage: syncStartPage,
        endPage: syncEndPage
      };
      const res = await api.syncAraJri(payload);
      if (res.success) {
        setSyncResult({ count: res.totalAraSources, message: res.message });
        setTotalAraCount(res.totalAraSources);
        const data = await api.getLegalSources({
          ara_page: selectedAraPage !== "all" ? selectedAraPage : undefined
        });
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

  const renderLegalText = (text: string) => {
    if (!text) return null;
    const fontSizeClass = fontSize === "sm" ? "text-xs" : fontSize === "lg" ? "text-base md:text-lg" : "text-xs md:text-sm";
    const parts = text.split(/(【[^】]+】:?)/g);
    if (parts.length > 1) {
      return (
        <div className={`space-y-4 leading-relaxed ${fontSizeClass}`}>
          {parts.map((part, idx) => {
            const trimmed = part.trim();
            const isHeader = /^【[^】]+】:?$/.test(trimmed);
            if (isHeader) {
              const cleanHeader = trimmed.replace(/[【】:]/g, "").trim();
              const isWorkflow = cleanHeader.includes("گردشکار") || cleanHeader.includes("سوابق");
              const isRuling = cleanHeader.includes("متن صریح") || cleanHeader.includes("منطوق") || cleanHeader.includes("تصمیم") || cleanHeader.includes("تعریف");
              const isGrounds = cleanHeader.includes("مبانی") || cleanHeader.includes("مستندات");
              const isEffect = cleanHeader.includes("اثر") || cleanHeader.includes("حکم") || cleanHeader.includes("الزامی") || cleanHeader.includes("شمول");

              let badgeColor = "bg-amber-500/15 text-amber-300 border-amber-500/30";
              if (isRuling) badgeColor = "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
              if (isWorkflow) badgeColor = "bg-sky-500/15 text-sky-300 border-sky-500/30";
              if (isGrounds) badgeColor = "bg-purple-500/15 text-purple-300 border-purple-500/30";
              if (isEffect) badgeColor = "bg-rose-500/15 text-rose-300 border-rose-500/30";

              return (
                <div key={idx} className="pt-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold border ${badgeColor}`}>
                    <span>{cleanHeader}</span>
                  </span>
                </div>
              );
            }
            if (!trimmed) return null;
            return (
              <p key={idx} className={`text-slate-200 ${fontSizeClass} leading-loose whitespace-pre-wrap font-serif`}>
                {highlightInDocSearch(trimmed)}
              </p>
            );
          })}
        </div>
      );
    }
    return (
      <div className={`text-slate-200 ${fontSizeClass} leading-loose whitespace-pre-wrap font-serif`}>
        {highlightInDocSearch(text)}
      </div>
    );
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

  const filteredSources = useMemo(() => {
    const seen = new Set<string>();
    return sources.filter(s => {
      if (!s.id || seen.has(s.id)) return false;
      seen.add(s.id);

      // فیلتر نشان‌شده‌ها
      if (showOnlyBookmarks && !bookmarkedIds.has(s.id)) {
        return false;
      }

      const matchCategory = selectedCategory === "all" || s.category === selectedCategory;
      const matchSourceType = selectedSourceType === "all" || s.source_type === selectedSourceType;

      // بررسی فیلتر نوع قانون
      const lawInfo = getLawTypeLabel(s);
      const matchLawType = selectedLawType === "all" ||
        lawInfo.key === selectedLawType ||
        s.law_type === selectedLawType ||
        s.source_type === selectedLawType;

      // بررسی فیلتر سال تصویب / صدور
      const yr = s.year ?? extractSourceYear(s);
      let matchYear = true;
      if (selectedYear !== "all") {
        matchYear = yr === Number(selectedYear);
      }
      if (matchYear && effectiveYearFrom !== undefined) {
        matchYear = yr !== undefined && yr >= effectiveYearFrom;
      }
      if (matchYear && effectiveYearTo !== undefined) {
        matchYear = yr !== undefined && yr <= effectiveYearTo;
      }

      return matchCategory && matchSourceType && matchLawType && matchYear;
    });
  }, [sources, selectedCategory, selectedSourceType, selectedLawType, selectedYear, effectiveYearFrom, effectiveYearTo, showOnlyBookmarks, bookmarkedIds]);

  const handleResetFilters = () => {
    setSelectedLawType("all");
    setSelectedCategory("all");
    setSelectedYear("all");
    setYearFrom("");
    setYearTo("");
    setSelectedEra("all");
    setSelectedSourceType("all");
    setSelectedAraPage("all");
    setSelectedSourceOrigin("all");
    setShowOnlyBookmarks(false);
    setSearchQuery("");
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedLawType !== "all") count++;
    if (selectedCategory !== "all") count++;
    if (selectedYear !== "all") count++;
    if (yearFrom || yearTo) count++;
    if (selectedEra !== "all") count++;
    return count;
  }, [selectedLawType, selectedCategory, selectedYear, yearFrom, yearTo, selectedEra]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-6rem)] overflow-hidden bg-[#090D16]">
      {/* 1. Left List & Search */}
      <div className="w-full lg:w-[410px] bg-slate-900/95 border-l border-slate-800 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Scale className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-xs font-bold text-slate-100 truncate">پایگاه جامع قوانین و آراء قضایی</span>
            </div>
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

          {/* Source Origin Segmented Switcher */}
          <div className="flex flex-wrap gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-bold">
            <button
              onClick={() => setSelectedSourceOrigin("all")}
              className={`flex-1 min-w-[70px] py-1 px-1.5 rounded-lg text-center transition-all cursor-pointer whitespace-nowrap text-[10px] ${
                selectedSourceOrigin === "all"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              همه ({totalAraCount})
            </button>
            <button
              onClick={() => setSelectedSourceOrigin("unity_pages")}
              className={`flex-1 min-w-[80px] py-1 px-1.5 rounded-lg text-center transition-all cursor-pointer whitespace-nowrap text-[10px] ${
                selectedSourceOrigin === "unity_pages"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              وحدت رویه ({totalUnityCount})
            </button>
            <button
              onClick={() => setSelectedSourceOrigin("judges_100_to_1000")}
              className={`flex-1 min-w-[85px] py-1 px-1.5 rounded-lg text-center transition-all cursor-pointer whitespace-nowrap text-[10px] ${
                selectedSourceOrigin === "judges_100_to_1000"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              دادنامه‌ها ۱۰۰-۱۰۰۰ ({totalJudges100To1000})
            </button>
            <button
              onClick={() => setSelectedSourceOrigin("judges_1000_to_10000")}
              className={`flex-1 min-w-[95px] py-1 px-1.5 rounded-lg text-center transition-all cursor-pointer whitespace-nowrap text-[10px] ${
                selectedSourceOrigin === "judges_1000_to_10000"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              دادنامه‌ها ۱۰۰۰-۱۰۰۰۰ ({totalJudges1000To10000})
            </button>
            <button
              onClick={() => setShowOnlyBookmarks(!showOnlyBookmarks)}
              className={`flex-1 min-w-[85px] py-1 px-1.5 rounded-lg text-center transition-all cursor-pointer whitespace-nowrap text-[10px] flex items-center justify-center gap-1 ${
                showOnlyBookmarks
                  ? "bg-amber-400 text-slate-950 font-bold shadow-sm"
                  : "text-amber-400/90 hover:text-amber-300 hover:bg-slate-900"
              }`}
              title="نمایش فقط اسناد نشان‌شده و برگزیده"
            >
              <Star className={`w-3 h-3 ${showOnlyBookmarks ? "fill-slate-950" : "fill-amber-400/40"}`} />
              <span>نشان‌شده ({bookmarkedIds.size})</span>
            </button>
          </div>

          {/* Search Input Bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="جستجو در نام قانون، ماده و آراء (مثلاً ماده ۳۰۸، ۸۵۲، چک)..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl pr-8 pl-7 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    loadSources();
                  }}
                  className="absolute left-2.5 top-2.5 text-slate-500 hover:text-slate-200 cursor-pointer"
                  title="پاک کردن متن جستجو"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-sm"
            >
              جستجو
            </button>
          </div>

          {/* ============================================================= */}
          {/* ADVANCED FILTERED SEARCH TOGGLE BUTTON & PANEL */}
          {/* ============================================================= */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
            <button
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              className="w-full flex items-center justify-between p-2.5 hover:bg-slate-900/60 transition-colors text-right cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-bold text-slate-200">جستجوی فیلتردار قوانین</span>
                {activeFiltersCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-mono text-[10px] font-bold">
                    {activeFiltersCount} فیلتر فعال
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="text-[10px]">
                  {isFilterPanelOpen ? "بستن فیلترها" : "انتخاب نوع، سال و حوزه"}
                </span>
                {isFilterPanelOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </button>

            {/* Collapsible Filter Form */}
            {isFilterPanelOpen && (
              <div className="p-3 border-t border-slate-800 space-y-3 bg-slate-950/90 text-right text-xs animate-fadeIn">
                {/* 1. انتخاب نوع قانون */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-300 font-semibold">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3 text-amber-400" />
                      <span>نوع قانون یا منبع حقوقی:</span>
                    </span>
                    {selectedLawType !== "all" && (
                      <button
                        onClick={() => setSelectedLawType("all")}
                        className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                      >
                        حذف فیلتر
                      </button>
                    )}
                  </div>
                  <select
                    value={selectedLawType}
                    onChange={(e) => setSelectedLawType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl p-2 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="all">همه انواع قوانین و مقررات</option>
                    <option value="GENERAL_LAW">قوانین عام و مادر (مدنی، مجازات، تجارت، دادرسی، کار)</option>
                    <option value="SPECIAL_LAW">قوانین خاص و موضوعی (چک، ثبت، پیش‌فروش، مستأجر، تملک)</option>
                    <option value="CONSTITUTION">قانون اساسی جمهوری اسلامی ایران</option>
                    <option value="UNITY_JUDGMENT">آراء وحدت رویه دیوان عالی کشور</option>
                    <option value="COURT_JUDGMENT">دادنامه‌ها و رویه قضایی محاکم</option>
                    <option value="ADMIN_COURT_JUDGMENT">آراء هیأت عمومی دیوان عدالت اداری</option>
                    <option value="CIRCULAR">تصویب‌نامه‌ها، آیین‌نامه‌ها و بخشنامه‌ها</option>
                    <option value="ADVISORY_OPINION">نظریات مشورتی اداره کل حقوقی</option>
                  </select>
                </div>

                {/* 2. انتخاب سال تصویب و بازه زمانی */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-300 font-semibold">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-400" />
                      <span>سال تصویب / صدور:</span>
                    </span>
                    {(selectedYear !== "all" || yearFrom || yearTo || selectedEra !== "all") && (
                      <button
                        onClick={() => {
                          setSelectedYear("all");
                          setYearFrom("");
                          setYearTo("");
                          setSelectedEra("all");
                        }}
                        className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                      >
                        حذف فیلتر سال
                      </button>
                    )}
                  </div>

                  {/* دوره‌های تاریخی سریع (Era chips) */}
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: "all", label: "همه سال‌ها" },
                      { id: "recent_1400", label: "۱۴۰۰ تا ۱۴۰۴ (اخیر)" },
                      { id: "decade_1390", label: "دهه ۱۳۹۰" },
                      { id: "decade_1380", label: "دهه ۱۳۸۰" },
                      { id: "era_1350_1379", label: "۱۳۵۰ تا ۱۳۷۹" },
                      { id: "foundational_1300", label: "قوانین مادر ۱۳۰۴-۱۳۴۹" }
                    ].map((era) => (
                      <button
                        key={era.id}
                        type="button"
                        onClick={() => {
                          setSelectedEra(era.id);
                          setSelectedYear("all");
                          setYearFrom("");
                          setYearTo("");
                        }}
                        className={`px-1.5 py-1 rounded-lg border text-[10px] font-bold text-center transition-colors cursor-pointer truncate ${
                          selectedEra === era.id
                            ? "bg-amber-500 text-slate-950 border-amber-400"
                            : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800"
                        }`}
                        title={era.label}
                      >
                        {era.label}
                      </button>
                    ))}
                  </div>

                  {/* انتخاب سال معین یا بازه از / تا */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">سال دقیق:</label>
                      <select
                        value={selectedYear}
                        onChange={(e) => {
                          setSelectedYear(e.target.value);
                          if (e.target.value !== "all") {
                            setSelectedEra("all");
                          }
                        }}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-[11px] rounded-lg p-1.5 outline-none focus:border-amber-500"
                      >
                        <option value="all">همه</option>
                        {[
                          1404, 1403, 1402, 1401, 1400,
                          1399, 1398, 1397, 1396, 1395, 1394, 1393, 1392, 1391, 1390,
                          1389, 1380, 1379, 1376, 1369, 1367, 1358, 1356, 1355, 1343,
                          1339, 1311, 1310, 1307, 1304
                        ].map((yr) => (
                          <option key={yr} value={String(yr)}>
                            سال {yr}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">از سال:</label>
                      <input
                        type="number"
                        placeholder="مثلاً ۱۳۷۰"
                        value={yearFrom}
                        onChange={(e) => {
                          setYearFrom(e.target.value);
                          if (e.target.value) {
                            setSelectedEra("all");
                            setSelectedYear("all");
                          }
                        }}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-[11px] rounded-lg p-1.5 outline-none focus:border-amber-500 font-mono text-center"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">تا سال:</label>
                      <input
                        type="number"
                        placeholder="مثلاً ۱۴۰۳"
                        value={yearTo}
                        onChange={(e) => {
                          setYearTo(e.target.value);
                          if (e.target.value) {
                            setSelectedEra("all");
                            setSelectedYear("all");
                          }
                        }}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-[11px] rounded-lg p-1.5 outline-none focus:border-amber-500 font-mono text-center"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. حوزه و شاخه حقوقی */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-300 font-semibold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-amber-400" />
                      <span>حوزه حقوقی:</span>
                    </span>
                    {selectedCategory !== "all" && (
                      <button
                        onClick={() => setSelectedCategory("all")}
                        className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                      >
                        همه حوزه‌ها
                      </button>
                    )}
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl p-2 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="all">همه شاخه‌های حقوقی</option>
                    <option value="حقوق مدنی">حقوق مدنی و مسئولیت مدنی</option>
                    <option value="کیفری و جزا">کیفری، جزا و مجازات اسلامی</option>
                    <option value="آیین دادرسی">آیین دادرسی مدنی و کیفری</option>
                    <option value="حقوق تجارت و شرکت‌ها">حقوق تجارت، اسناد تجاری و شرکت‌ها</option>
                    <option value="خانواده و امور حسبی">خانواده و امور حسبی</option>
                    <option value="املاک و اراضی و ثبت">املاک، اراضی، سرقفلی و ثبت</option>
                    <option value="کار و تأمین اجتماعی">کار، کارگری و تأمین اجتماعی</option>
                    <option value="دیوان عدالت اداری و اداری">دیوان عدالت اداری و حقوق عمومی</option>
                    <option value="مالیات و گمرک">مالیات، عوارض و گمرک</option>
                    <option value="آرای وحدت رویه">آرای وحدت رویه دیوان عالی</option>
                  </select>
                </div>

                {/* دکمه‌های اقدام فیلتر */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-850">
                  <button
                    onClick={handleSearch}
                    className="flex-1 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer text-center"
                  >
                    اعمال فیلترها و بازیابی
                  </button>
                  <button
                    onClick={handleResetFilters}
                    className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 font-medium text-xs transition-colors cursor-pointer"
                    title="ریست تمام فیلترها"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>پاک‌سازی</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Active Filter Badges */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-slate-950 border border-amber-500/30 text-xs">
              <span className="text-[10px] text-amber-300 font-bold shrink-0">فیلترهای فعال:</span>

              {selectedLawType !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-medium">
                  <span>نوع: {selectedLawType === "GENERAL_LAW" ? "قوانین عام" : selectedLawType === "SPECIAL_LAW" ? "قوانین خاص" : selectedLawType === "CONSTITUTION" ? "قانون اساسی" : selectedLawType === "UNITY_JUDGMENT" ? "وحدت رویه" : selectedLawType === "COURT_JUDGMENT" ? "دادنامه‌ها" : selectedLawType === "ADMIN_COURT_JUDGMENT" ? "دیوان عدالت" : selectedLawType}</span>
                  <button onClick={() => setSelectedLawType("all")} className="hover:text-white cursor-pointer"><X className="w-2.5 h-2.5" /></button>
                </span>
              )}

              {selectedCategory !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/30 text-[10px] font-medium">
                  <span>حوزه: {selectedCategory}</span>
                  <button onClick={() => setSelectedCategory("all")} className="hover:text-white cursor-pointer"><X className="w-2.5 h-2.5" /></button>
                </span>
              )}

              {selectedYear !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-medium">
                  <span>سال تصویب: {selectedYear}</span>
                  <button onClick={() => setSelectedYear("all")} className="hover:text-white cursor-pointer"><X className="w-2.5 h-2.5" /></button>
                </span>
              )}

              {selectedEra !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[10px] font-medium">
                  <span>دوره: {selectedEra === "recent_1400" ? "۱۴۰۰ تا ۱۴۰۴" : selectedEra === "decade_1390" ? "دهه ۱۳۹۰" : selectedEra === "decade_1380" ? "دهه ۱۳۸۰" : selectedEra === "era_1350_1379" ? "۱۳۵۰ تا ۱۳۷۹" : "۱۳۰۴ تا ۱۳۴۹"}</span>
                  <button onClick={() => setSelectedEra("all")} className="hover:text-white cursor-pointer"><X className="w-2.5 h-2.5" /></button>
                </span>
              )}

              {(yearFrom || yearTo) && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/30 text-[10px] font-medium">
                  <span>بازه: {yearFrom || "ابتدا"} تا {yearTo || "اکنون"}</span>
                  <button onClick={() => { setYearFrom(""); setYearTo(""); }} className="hover:text-white cursor-pointer"><X className="w-2.5 h-2.5" /></button>
                </span>
              )}

              <button
                onClick={handleResetFilters}
                className="text-[10px] text-slate-400 hover:text-amber-300 mr-auto font-bold underline cursor-pointer"
              >
                پاک‌سازی همه
              </button>
            </div>
          )}

          {/* Ara.jri.ac.ir Page Filter (1 to 71) */}
          <div className="flex items-center gap-2 pt-0.5">
            <div className="flex items-center gap-1.5 flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[11px]">
              <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-slate-400 shrink-0 text-[10px]">صفحه سامانه:</span>
              <select
                value={selectedAraPage}
                onChange={(e) => setSelectedAraPage(e.target.value)}
                className="w-full bg-transparent text-amber-300 font-bold outline-none cursor-pointer text-[11px]"
              >
                <option value="all" className="bg-slate-950 text-slate-200">همه صفحات (۱ تا ۷۱) — ۲،۶۱۵ منبع</option>
                <option value="5" className="bg-slate-950 text-amber-400">صفحه ۵ (لینک درخواستی کاربر)</option>
                {Array.from({ length: 71 }, (_, i) => i + 1).map((p) => (
                  <option key={p} value={String(p)} className="bg-slate-950 text-slate-200">
                    صفحه {p} از ۷۱ سامانه ملی قضایی
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {[
                { label: "ص۱", val: "1" },
                { label: "ص۲", val: "2" },
                { label: "ص۳", val: "3" },
                { label: "ص۴", val: "4" },
                { label: "ص۵", val: "5" },
                { label: "ص۷۱", val: "71" }
              ].map((btn) => (
                <button
                  key={btn.val}
                  onClick={() => setSelectedAraPage(selectedAraPage === btn.val ? "all" : btn.val)}
                  className={`px-1.5 py-1 rounded-lg border text-[10px] font-bold transition-colors cursor-pointer ${
                    selectedAraPage === btn.val
                      ? "bg-amber-500 text-slate-950 border-amber-400"
                      : "bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800"
                  }`}
                  title={`مشاهده آرای وحدت رویه صفحه ${btn.val} از ۷۱`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Famous Law & Ruling Topic Chips */}
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 block font-semibold">دسترسی سریع به قوانین و آراء شاخص:</span>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
              {[
                { label: "قانون مدنی (۱۳۰۷)", q: "قانون مدنی", year: "1307", lawType: "GENERAL_LAW" },
                { label: "قانون مجازات اسلامی (۱۳۹۲)", q: "قانون مجازات اسلامی", year: "1392", lawType: "GENERAL_LAW" },
                { label: "قانون تجارت (۱۳۱۱)", q: "قانون تجارت", year: "1311", lawType: "GENERAL_LAW" },
                { label: "قانون صدور چک (۱۳۵۵ و ۱۳۹۷)", q: "قانون صدور چک", lawType: "SPECIAL_LAW" },
                { label: "آیین دادرسی مدنی (۱۳۷۹)", q: "قانون آیین دادرسی مدنی", year: "1379", lawType: "GENERAL_LAW" },
                { label: "الزام به ثبت رسمی (۱۴۰۳)", q: "ثبت رسمی اموال غیرمنقول", year: "1403", lawType: "SPECIAL_LAW" },
                { label: "روابط موجر و مستأجر", q: "روابط موجر و مستأجر", lawType: "SPECIAL_LAW" },
                { label: "قانون مسئولیت مدنی (۱۳۳۹)", q: "قانون مسئولیت مدنی", year: "1339", lawType: "GENERAL_LAW" },
                { label: "رأی وحدت رویه ۸۵۲", q: "۸۵۲" },
                { label: "رأی وحدت رویه ۸۵۱", q: "۸۵۱" },
                { label: "رأی وحدت رویه ۸۵۰", q: "۸۵۰" },
                { label: "رأی وحدت رویه ۸۴۷", q: "۸۴۷" }
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchQuery(chip.q);
                    if (chip.year) setSelectedYear(chip.year);
                    if (chip.lawType) setSelectedLawType(chip.lawType);
                    api.searchLegal(chip.q, undefined, undefined, {
                      lawType: chip.lawType,
                      year: chip.year
                    }).then(res => {
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

          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800">
            <span>تعداد نتایج منطبق: <strong className="text-amber-300 font-mono">{filteredSources.length}</strong> منبع</span>
            <span className="text-slate-400">کل پایگاه: <strong className="text-slate-200 font-mono">{totalAraCount}</strong> سند</span>
          </div>
        </div>

        {/* Source List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {filteredSources.map((src, idx) => {
            const isSelected = src.id === selectedSource?.id;
            const isFromAra = src.metadata?.source_url?.includes("ara.jri.ac.ir") || src.authority?.includes("سامانه ملی آرای قضایی");
            const pageNum = src.metadata?.page;
            const srcYear = src.year ?? extractSourceYear(src);
            const lawTypeInfo = getLawTypeLabel(src);

            return (
              <div
                key={`${src.id}-${idx}`}
                onClick={() => setSelectedSource(src)}
                className={`p-3 rounded-xl cursor-pointer text-right transition-all border ${
                  isSelected
                    ? "bg-slate-850 border-r-4 border-amber-400 text-white shadow-md"
                    : "bg-slate-950/70 border-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 gap-1">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={(e) => toggleBookmark(src.id, e)}
                      className={`p-0.5 rounded hover:bg-slate-700/50 transition-colors shrink-0 ${
                        bookmarkedIds.has(src.id) ? "text-amber-400" : "text-slate-600 hover:text-slate-400"
                      }`}
                      title={bookmarkedIds.has(src.id) ? "حذف از نشان‌شده‌ها" : "نشانه‌گذاری"}
                    >
                      <Star className={`w-3.5 h-3.5 ${bookmarkedIds.has(src.id) ? "fill-amber-400 text-amber-400" : ""}`} />
                    </button>
                    <span className="text-xs font-bold text-slate-100 truncate">
                      {src.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {notesMap[src.id] && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="دارای یادداشت اختصاصی" />
                    )}
                    {(src.analysis || src.metadata?.ai_analysis) && (
                      <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" title="تحلیل هوشمند دارد" />
                    )}
                    {srcYear && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono flex items-center gap-0.5">
                        <Calendar className="w-2.5 h-2.5" />
                        <span>{srcYear}</span>
                      </span>
                    )}
                    {pageNum && (
                      <span className="text-[8px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                        ص {pageNum}
                      </span>
                    )}
                    {isFromAra && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold flex items-center gap-0.5">
                        <Globe className="w-2.5 h-2.5" />
                        ara.jri
                      </span>
                    )}
                  </div>
                </div>

                {/* Subheader: Law Type and Article */}
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className={`text-[9px] px-2 py-0.5 rounded border font-semibold ${lawTypeInfo.badgeClass}`}>
                    {lawTypeInfo.label}
                  </span>
                  {src.article && (
                    <span className="text-[10px] text-amber-300/90 font-mono truncate max-w-[140px]">
                      {src.article}
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2">
                  {src.text}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-850">
                  <span className="font-medium text-slate-300 truncate max-w-[170px]">{src.authority}</span>
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
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs px-2.5 py-0.5 rounded border font-semibold ${getLawTypeLabel(selectedSource).badgeClass}`}>
                      {getLawTypeLabel(selectedSource).label}
                    </span>
                    {(selectedSource.year || extractSourceYear(selectedSource)) && (
                      <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono font-bold flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>سال تصویب / صدور: {selectedSource.year ?? extractSourceYear(selectedSource)}</span>
                      </span>
                    )}
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

                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => toggleBookmark(selectedSource.id, e)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      bookmarkedIds.has(selectedSource.id)
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                    }`}
                    title={bookmarkedIds.has(selectedSource.id) ? "حذف از نشان‌شده‌ها" : "نشانه‌گذاری"}
                  >
                    <Star className={`w-3.5 h-3.5 ${bookmarkedIds.has(selectedSource.id) ? "fill-amber-400 text-amber-400" : ""}`} />
                    <span>{bookmarkedIds.has(selectedSource.id) ? "نشان‌شده" : "نشان"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCitationModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-colors cursor-pointer"
                    title="تولید استناد رسمی دادگاه برای لوایح"
                  >
                    <Gavel className="w-3.5 h-3.5 text-amber-400" />
                    <span>استناد در لایحه</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                    title="چاپ سند"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-400" />
                    <span className="hidden sm:inline">چاپ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(selectedSource.id, selectedSource.text)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                  >
                    {copiedId === selectedSource.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === selectedSource.id ? "کپی شد" : "کپی"}</span>
                  </button>
                </div>
              </div>

              {/* Verified Source Banner (ara.jri.ac.ir Provenance Card) */}
              {selectedSource.metadata?.source_url && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-950 border border-amber-500/30 space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                        <Scale className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-100 flex items-center gap-2">
                          <span>سامانه ملی آرای قضایی (پژوهشگاه قوه قضاییه)</span>
                          {selectedSource.metadata?.page && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                              صفحه {selectedSource.metadata.page} از ۷۱
                            </span>
                          )}
                          {selectedSource.metadata?.judge_id && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                              دادنامه شناسه {selectedSource.metadata.judge_id}
                            </span>
                          )}
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono dir-ltr select-all truncate max-w-xs sm:max-w-md">
                          {selectedSource.metadata.source_url}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedSource.metadata?.attribute_url && (
                        <a
                          href={selectedSource.metadata.attribute_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs transition-colors shrink-0 cursor-pointer shadow-sm"
                        >
                          <span>مشخصات پرونده</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
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
                  </div>

                  {/* Additional Verified Links */}
                  {(selectedSource.metadata?.external_view_url || selectedSource.metadata?.related_judgments_url || selectedSource.metadata?.attribute_url) && (
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                      {selectedSource.metadata?.attribute_url && (
                        <a
                          href={selectedSource.metadata.attribute_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-amber-300 text-[11px] border border-slate-800 transition-colors"
                        >
                          <BookOpen className="w-3 h-3 text-amber-400" />
                          <span>لینک مشخصات پرونده ({selectedSource.metadata.attribute_url})</span>
                          <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                        </a>
                      )}
                      {selectedSource.metadata?.external_view_url && (
                        <a
                          href={selectedSource.metadata.external_view_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 text-[11px] border border-slate-800 transition-colors"
                        >
                          <BookOpen className="w-3 h-3 text-amber-400" />
                          <span>متن در سامانه قوانین (ilaws.net)</span>
                          <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                        </a>
                      )}
                      {selectedSource.metadata?.related_judgments_url && (
                        <a
                          href={selectedSource.metadata.related_judgments_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 text-[11px] border border-slate-800 transition-colors"
                        >
                          <Scale className="w-3 h-3 text-emerald-400" />
                          <span>
                            آرای قضایی استنادی مرتبط {selectedSource.metadata.related_judgments_count ? `(${selectedSource.metadata.related_judgments_count} مورد)` : ""}
                          </span>
                          <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Metadata row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] mb-0.5">نوع مقرره / سند:</span>
                  <span className="font-bold text-amber-300">{getLawTypeLabel(selectedSource).label}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] mb-0.5">سال تصویب / صدور:</span>
                  <span className="font-bold font-mono text-emerald-300">
                    {selectedSource.year ?? extractSourceYear(selectedSource) ? `سال ${selectedSource.year ?? extractSourceYear(selectedSource)}` : "نامشخص"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] mb-0.5">حوزه حقوقی:</span>
                  <span className="font-bold text-slate-200">{selectedSource.category}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] mb-0.5">مرجع صادرکننده / تصویب:</span>
                  <span className="font-bold text-slate-200 truncate block">{selectedSource.authority}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] mb-0.5">تاریخ صدور / رأی:</span>
                  <span className="font-mono text-amber-300">{selectedSource.date || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] mb-0.5">شماره دادنامه / مصوبه:</span>
                  <span className="font-mono text-amber-300">{selectedSource.document_number || "—"}</span>
                </div>
                {selectedSource.metadata?.court_branch && (
                  <div>
                    <span className="text-slate-500 block text-[10px] mb-0.5">شعبه صادرکننده:</span>
                    <span className="text-slate-200 font-bold">{selectedSource.metadata.court_branch}</span>
                  </div>
                )}
                {selectedSource.metadata?.judges && (
                  <div>
                    <span className="text-slate-500 block text-[10px] mb-0.5">قضات صادرکننده:</span>
                    <span className="text-amber-300 font-medium">{selectedSource.metadata.judges}</span>
                  </div>
                )}
                {selectedSource.metadata?.court_type && (
                  <div>
                    <span className="text-slate-500 block text-[10px] mb-0.5">نوع مرجع دادرسی:</span>
                    <span className="text-slate-300">{selectedSource.metadata.court_type}</span>
                  </div>
                )}
              </div>

              {/* Document Tabs */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
                <button
                  type="button"
                  onClick={() => setActiveDocTab("text")}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeDocTab === "text"
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-950/40"
                      : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>متن صریح و گردشکار قانونی</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveDocTab("ai_analysis");
                    if (!selectedSource.analysis && !selectedSource.metadata?.ai_analysis) {
                      handleAnalyzeSource(false);
                    }
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeDocTab === "ai_analysis"
                      ? "bg-purple-600 text-white shadow-md shadow-purple-950/40"
                      : "bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 border border-purple-500/30"
                  }`}
                >
                  <BrainCircuit className="w-3.5 h-3.5 text-purple-300" />
                  <span>تحلیل تفسیری و دکترین قضایی (هوش مصنوعی)</span>
                  {(selectedSource.analysis || selectedSource.metadata?.ai_analysis) && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" title="تحلیل انجام شده است" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDocTab("notes")}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeDocTab === "notes"
                      ? "bg-slate-800 text-amber-300 border border-amber-500/40"
                      : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>یادداشت‌ها و حاشیه‌نویسی پرونده</span>
                  {notesMap[selectedSource.id] && (
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                  )}
                </button>
              </div>

              {/* Tab 1: Legal Text & Fast In-Doc Search */}
              {activeDocTab === "text" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <div className="flex items-center gap-2 flex-1">
                      <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <input
                        type="text"
                        value={inDocSearch}
                        onChange={(e) => setInDocSearch(e.target.value)}
                        placeholder="جستجوی سریع واژه در متن این مستند (مثلاً خسارت، الزام، مرور زمان)..."
                        className="bg-transparent text-slate-200 text-xs outline-none w-full placeholder:text-slate-500"
                      />
                      {inDocSearch && (
                        <button
                          type="button"
                          onClick={() => setInDocSearch("")}
                          className="text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-1.5 shrink-0 text-slate-400 border-t sm:border-t-0 sm:border-r border-slate-800 pt-2 sm:pt-0 sm:pr-3">
                      <Type className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-[10px]">قلم:</span>
                      <button
                        type="button"
                        onClick={() => setFontSize("sm")}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                          fontSize === "sm" ? "bg-amber-500 text-slate-950" : "bg-slate-900 hover:text-white"
                        }`}
                      >
                        A-
                      </button>
                      <button
                        type="button"
                        onClick={() => setFontSize("base")}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                          fontSize === "base" ? "bg-amber-500 text-slate-950" : "bg-slate-900 hover:text-white"
                        }`}
                      >
                        A
                      </button>
                      <button
                        type="button"
                        onClick={() => setFontSize("lg")}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                          fontSize === "lg" ? "bg-amber-500 text-slate-950" : "bg-slate-900 hover:text-white"
                        }`}
                      >
                        A+
                      </button>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 leading-loose font-serif selection:bg-amber-500/40">
                    {renderLegalText(selectedSource.text)}
                  </div>

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
              )}

              {/* Tab 2: AI Precedent & Doctrine Analysis */}
              {activeDocTab === "ai_analysis" && (
                <div className="space-y-4">
                  {isAnalyzing && (
                    <div className="p-8 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-center space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center mx-auto">
                        <BrainCircuit className="w-6 h-6 text-purple-400 animate-spin" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-purple-200">در حال تحلیل عمیق حقوقی و استخراج دکترین قضایی...</h4>
                        <p className="text-xs text-purple-300/70 max-w-md mx-auto leading-relaxed">
                          موتور Gemini Legal در حال استخراج قاعده آمره، انطباق با گردشکار، استنباط مبانی فقهی و استخراج کاربرد عملی در دفاع است.
                        </p>
                      </div>
                    </div>
                  )}

                  {analysisError && !isAnalyzing && (
                    <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs flex items-center justify-between gap-3">
                      <span>{analysisError}</span>
                      <button
                        type="button"
                        onClick={() => handleAnalyzeSource(true)}
                        className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs cursor-pointer shrink-0"
                      >
                        تلاش مجدد
                      </button>
                    </div>
                  )}

                  {!isAnalyzing && (selectedSource.analysis || selectedSource.metadata?.ai_analysis) && (() => {
                    const analysis = selectedSource.analysis || selectedSource.metadata?.ai_analysis;
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-purple-950/30 border border-purple-500/30">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span className="text-xs font-bold text-purple-200">
                              دکترین قضایی و تحلیل کاربردی استخراج‌شده
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAnalyzeSource(true)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs border border-slate-700 cursor-pointer"
                            title="تحلیل مجدد متن این سند"
                          >
                            <RotateCcw className="w-3 h-3 text-slate-400" />
                            <span>تحلیل مجدد</span>
                          </button>
                        </div>

                        {/* Executive Summary */}
                        {analysis.summary && (
                          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                              <span>خلاصه و جان‌مایه حقوقی:</span>
                            </span>
                            <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
                              {analysis.summary}
                            </p>
                          </div>
                        )}

                        {/* Ratio Decidendi / Holding */}
                        {analysis.holding && (
                          <div className="p-4 rounded-xl bg-emerald-950/20 border-r-4 border-emerald-400 border border-emerald-500/30 space-y-1.5">
                            <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                              <Scale className="w-3.5 h-3.5 text-emerald-400" />
                              <span>قاعده آمره و اصل حقوقی مستنبط (Ratio Decidendi):</span>
                            </span>
                            <p className="text-xs md:text-sm font-semibold text-emerald-100 leading-relaxed">
                              {analysis.holding}
                            </p>
                          </div>
                        )}

                        {/* Reasoning */}
                        {analysis.reasoning && (
                          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                            <span className="text-[11px] font-bold text-sky-400 flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                              <span>مبانی استدلال قضایی و اصول دادرسی:</span>
                            </span>
                            <p className="text-xs md:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                              {analysis.reasoning}
                            </p>
                          </div>
                        )}

                        {/* Litigation Application */}
                        {analysis.litigation_application && (
                          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                            <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                              <Gavel className="w-3.5 h-3.5 text-amber-400" />
                              <span>کاربرد عملی در لوایح و دفاعیات دادگستری:</span>
                            </span>
                            <p className="text-xs md:text-sm text-amber-100/90 leading-relaxed whitespace-pre-wrap">
                              {analysis.litigation_application}
                            </p>
                          </div>
                        )}

                        {/* Practical Points */}
                        {analysis.practical_points && analysis.practical_points.length > 0 && (
                          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                            <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                              <span>نکات طلایی و ترفندهای دفاعی برای وکلا:</span>
                            </span>
                            <ul className="space-y-1.5 text-xs text-slate-300 pr-4 list-disc marker:text-amber-400">
                              {analysis.practical_points.map((pt: string, idx: number) => (
                                <li key={idx} className="leading-relaxed">{pt}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Related Laws */}
                        {analysis.related_laws && analysis.related_laws.length > 0 && (
                          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                              <Tag className="w-3.5 h-3.5 text-slate-400" />
                              <span>قوانین و مقررات مرتبط استنادی:</span>
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {analysis.related_laws.map((law: string, idx: number) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    setSearchQuery(law);
                                    handleSearch();
                                  }}
                                  className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 transition-colors cursor-pointer"
                                  title="جستجوی این مقرره در پایگاه دانش"
                                >
                                  {law}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {!isAnalyzing && !selectedSource.analysis && !selectedSource.metadata?.ai_analysis && (
                    <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-purple-500/30 text-center space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center mx-auto">
                        <BrainCircuit className="w-6 h-6 text-purple-400" />
                      </div>
                      <div className="space-y-1.5 max-w-md mx-auto">
                        <h4 className="text-sm font-bold text-white">تحلیل هوشمند و استخراج دکترین با هوش مصنوعی</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          با استفاده از مدل‌های حقوقی پیشرفته، قاعده آمره، گردشکار و کاربرد دفاعی این مستند در محاکم را استخراج و ساختاربندی کنید.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAnalyzeSource(false)}
                        className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md shadow-purple-950/40 cursor-pointer inline-flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>تحلیل هوشمند این سند</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Personal Notes */}
              {activeDocTab === "notes" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span>حاشیه‌نویسی و یادداشت اختصاصی برای این سند:</span>
                      </span>
                      {noteSavedFeedback && (
                        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>ذخیره شد</span>
                        </span>
                      )}
                    </div>

                    <textarea
                      rows={6}
                      value={currentNote}
                      onChange={(e) => setCurrentNote(e.target.value)}
                      placeholder="یادداشت‌های تحلیلی، ارجاعات به پرونده‌های موکلین، نکات استنادی در جلسه دادگاه..."
                      className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-xs text-slate-100 outline-none leading-relaxed"
                    />

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500">
                        یادداشت‌های شما به صورت امن و محلی در مرورگر برای مراجعات بعدی نگهداری می‌شوند.
                      </span>
                      <button
                        type="button"
                        onClick={handleSaveNote}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-sm"
                      >
                        ذخیره یادداشت
                      </button>
                    </div>
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

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-2">
              <div className="font-bold flex items-center justify-between">
                <span>استخراج و نمایه‌سازی هوشمند سامانه ملی آرای قضایی (صفحات ۱ تا ۷۱)</span>
                <span className="font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  ۲،۶۱۵ منبع فعال
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                کلیه ۲،۶۱۵ مستند قانونی و رأی وحدت رویه از صفحه ۱ تا صفحه ۷۱ سامانه ملی آرای قضایی (پژوهشگاه قوه قضاییه) با متن کامل، شماره دادنامه و کلیدواژه‌های حقوقی استخراج شده و در وکتور دیتابیس RAG آماده استناد هستند.
              </p>
            </div>

            {/* Quick Batch Options */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isSyncingAra}
                onClick={() => handleSyncAra({ startPage: 1, endPage: 71 })}
                className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-amber-500/40 text-right space-y-1 transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-amber-300 group-hover:text-amber-200 flex items-center justify-between">
                  <span>همگام‌سازی کل صفحات (۱ تا ۷۱)</span>
                  <Scale className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-[10px] text-slate-400">بارگذاری ۲،۶۱۵ رأی و مقرره در موتور RAG</div>
              </button>

              <button
                type="button"
                disabled={isSyncingAra}
                onClick={() => handleSyncAra({ page: 5, url: "https://ara.jri.ac.ir/Law/Index?layout=True&page=5&Slayout=True" })}
                className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-right space-y-1 transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-slate-200 group-hover:text-white flex items-center justify-between">
                  <span>همگام‌سازی اختصاصی صفحه ۵</span>
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-[10px] text-slate-400">آراء وحدت رویه منتخب صفحه ۵</div>
              </button>
            </div>

            {/* Range Selector */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="block text-slate-400 text-[11px] font-medium">یا تعیین بازه صفحات دلخواه برای همگام‌سازی:</label>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 text-[11px]">از صفحه:</span>
                <input
                  type="number"
                  min={1}
                  max={71}
                  value={syncStartPage}
                  onChange={(e) => setSyncStartPage(Math.max(1, Math.min(71, parseInt(e.target.value) || 1)))}
                  className="w-16 bg-slate-900 border border-slate-800 text-center rounded-lg p-1.5 text-amber-300 font-mono font-bold outline-none"
                />
                <span className="text-slate-400 text-[11px]">تا صفحه:</span>
                <input
                  type="number"
                  min={1}
                  max={71}
                  value={syncEndPage}
                  onChange={(e) => setSyncEndPage(Math.max(1, Math.min(71, parseInt(e.target.value) || 71)))}
                  className="w-16 bg-slate-900 border border-slate-800 text-center rounded-lg p-1.5 text-amber-300 font-mono font-bold outline-none"
                />
                <button
                  type="button"
                  disabled={isSyncingAra}
                  onClick={() => handleSyncAra({ startPage: syncStartPage, endPage: syncEndPage })}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-slate-700"
                >
                  همگام‌سازی بازه
                </button>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="block text-slate-400 font-medium">نشانی اینترنتی منبع (URL سامانه ملی آرای قضایی):</label>
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
                    <span>شروع فرآیند همگام‌سازی</span>
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

      {/* Legal Citation Generator Modal */}
      {isCitationModalOpen && selectedSource && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-right space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Gavel className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-white text-sm">استناد رسمی در لایحه و دادگاه</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCitationModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              فرمت استناد را متناسب با کاربرد موردنظر خود (لایحه دفاعیه دادگستری، مقاله پژوهشی یا شناسنامه سند) انتخاب کنید:
            </p>

            <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
              <button
                type="button"
                onClick={() => setCitationFormat("brief")}
                className={`py-2 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer text-center ${
                  citationFormat === "brief"
                    ? "bg-amber-500 text-slate-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                لایحه دفاعیه
              </button>
              <button
                type="button"
                onClick={() => setCitationFormat("academic")}
                className={`py-2 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer text-center ${
                  citationFormat === "academic"
                    ? "bg-amber-500 text-slate-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                پژوهشی (پاورقی)
              </button>
              <button
                type="button"
                onClick={() => setCitationFormat("standard")}
                className={`py-2 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer text-center ${
                  citationFormat === "standard"
                    ? "bg-amber-500 text-slate-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                شناسنامه سند
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[11px] text-slate-500 block">پیش‌نمایش متن استنادی:</span>
              <p className="text-xs text-slate-200 font-serif leading-loose whitespace-pre-wrap select-all bg-slate-900/50 p-3 rounded-lg border border-slate-800/80">
                {generateCitation(selectedSource, citationFormat)}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const cit = generateCitation(selectedSource, citationFormat);
                  navigator.clipboard.writeText(cit);
                  setCitationCopied(true);
                  setTimeout(() => setCitationCopied(false), 2500);
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md shadow-amber-950/40 flex items-center justify-center gap-2"
              >
                {citationCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{citationCopied ? "استناد در کلیپ‌بورد کپی شد" : "کپی متن استناد"}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCitationModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
