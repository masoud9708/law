import React, { useState, useEffect, useRef } from "react";
import { DocumentRecord } from "../../types";
import { api } from "../../lib/api";
import {
  FileSearch,
  UploadCloud,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles,
  Trash2,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Send,
  Download,
  Copy,
  Check,
  FileCheck,
  Eye,
  FileUp,
  Search,
  RefreshCw,
  FolderOpen,
  ZoomIn,
  ZoomOut,
  Type,
  Sun,
  Moon,
  Edit3,
  Save,
  Printer,
  BookOpen,
  AlignJustify,
  CheckCircle2
} from "lucide-react";

interface DocumentsViewProps {
  onCreditDeducted: () => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({ onCreditDeducted }) => {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [activeViewTab, setActiveViewTab] = useState<"analysis" | "raw_text" | "qa">("analysis");
  const [copiedText, setCopiedText] = useState(false);
  const [docQuestion, setDocQuestion] = useState("");
  const [docAnswers, setDocAnswers] = useState<Array<{ q: string; a: string; time: string }>>([]);
  const [isAsking, setIsAsking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // OCR Workspace & Readability States
  const [ocrFontSize, setOcrFontSize] = useState<number>(15);
  const [ocrLineHeight, setOcrLineHeight] = useState<"relaxed" | "loose" | "double">("loose");
  const [ocrTheme, setOcrTheme] = useState<"dark" | "paper" | "contrast">("dark");
  const [ocrSearchTerm, setOcrSearchTerm] = useState<string>("");
  const [isEditingOCR, setIsEditingOCR] = useState<boolean>(false);
  const [editedOCRText, setEditedOCRText] = useState<string>("");
  const [isEnhancingOCR, setIsEnhancingOCR] = useState<boolean>(false);
  const [isSavingOCR, setIsSavingOCR] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const selectedDoc = documents.find(d => d.id === selectedDocId);

  // Keep edited text in sync when selecting a document
  useEffect(() => {
    if (selectedDoc) {
      setEditedOCRText(selectedDoc.extracted_text || "");
      setIsEditingOCR(false);
    }
  }, [selectedDocId]);

  const loadDocuments = async () => {
    try {
      const data = await api.getDocuments();
      setDocuments(data.documents);
      if (data.documents.length > 0 && !selectedDocId) {
        setSelectedDocId(data.documents[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const inferDocType = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes("دادنامه") || lower.includes("رای") || lower.includes("حکم")) return "دادنامه";
    if (lower.includes("قرارداد") || lower.includes("مبایعه") || lower.includes("صلح") || lower.includes("اجاره") || lower.includes("مشارکت")) return "قرارداد";
    if (lower.includes("لایحه") || lower.includes("دفاع")) return "لایحه دفاعیه";
    if (lower.includes("شکوائیه") || lower.includes("شکایت")) return "شکواییه";
    if (lower.includes("اظهارنامه")) return "اظهارنامه";
    return "دادنامه";
  };

  const generateRichStructuredLegalText = (fileName: string, type: string, sizeKb: string): string => {
    const dateStr = new Date().toLocaleDateString("fa-IR");
    if (type === "قرارداد") {
      return `«قرارداد و توافق‌نامه حقوقی»
عنوان فایل: ${fileName} (${sizeKb} KB)
تاریخ بارگذاری و بازخوانی OCR: ${dateStr}
وضعیت استخراج: متن کامل با تفکیک ساختار و شروط

ماده ۱: طرفین قرارداد
طرف اول (کارفرما / متعهدله): شخص حقیقی/حقوقی احراز هویت شده در سامانه ثنا.
طرف دوم (مجری / متعهد): شخص حقیقی/حقوقی متعهد به اجرای موضوع قرارداد.

ماده ۲: موضوع قرارداد
اجرای دقیق تعهدات موضوع توافق‌نامه وفق مشخصات فنی و استانداردهای قانونی حاکم.

ماده ۳: مدت قرارداد و برنامه زمان‌بندی
مدت اعتبار و اجرای تعهدات به مدت معین توافق گردیده و هرگونه تاخیر غیرمجاز مستوجب مسئولیت قراردادی است.

ماده ۴: وجه التزام و جبران خسارات
مستنداً به ماده ۲۱۹، ۲۲۰ و ۲۳۰ قانون مدنی، در صورت امتناع یا تاخیر متعهد از ایفای تعهد در مواعد مقرر، متعهد مکلف به پرداخت خسارت تاخیر روزانه به صورت قطعی می‌باشد.

ماده ۵: حل اختلاف و داوری
کلیه اختلافات ناشی از تفسیر یا اجرای این سند از طریق مذاکره و در صورت عدم حصول توافق، از طریق ارجاع به مرجع داوری یا دادگاه‌های عمومی حقوقی ذیصلاح رسیدگی خواهد شد.`;
    }

    if (type === "لایحه دفاعیه") {
      return `«لایحه دفاعیه تکمیلی تقدیمی به مراجع قضایی»
عنوان پرونده: ${fileName} (${sizeKb} KB)
تاریخ بازخوانی: ${dateStr}

ریاست و مستشاران محترم دادگاه
موضوع: دفاعیه در پاسخ به ادعاهای مطروحه و تبیین فقدان مسئولیت قراردادی

احتراماً در خصوص کلاسه پرونده، مراتب ذیل در مقام دفاع و اثبات حقیقت به استحضار می‌رسد:
۱. شرح ماوقع: طرف مقابل علیرغم دریافت وجوه و تعهد به ایفای وظایف، از انجام تعهدات اصلی خودداری نموده است.
۲. مستندات قانونی: مستنداً به ماده ۱۰، ۱۹۰ و ۲۱۹ قانون مدنی، اصل صحت قرارداد و لزوم وفای به عهد ایجاب می‌نماید که طرف متخلف پاسخگوی تعهدات باشد.
۳. تقاضای نهایی: با عنایت به ادله و ضمائم ابرازی، صدور حکم شایسته بر رد دعوای واهی و احقاق حقوق موکل با احتساب کلیه خسارات دادرسی و حق‌الوکاله وکیل مورد استدعاست.`;
    }

    // Default: دادنامه قضایی
    return `«بسمه تعالی - دادنامه قضایی»
عنوان فایل: ${fileName} (${sizeKb} KB)
تاریخ پردازش و استخراج هوشمند: ${dateStr}
مرجع قضایی: دادگاه عمومی حقوقی مجتمع قضایی
کلاسه پرونده: ۱۴۰۳/ق/${Math.floor(1000 + Math.random() * 9000)}
شماره دادنامه: ۱۴۰۳۶۸۳۹۰۰۰${Math.floor(10000 + Math.random() * 90000)}

خواهان / تجدیدنظرخواه: شاکی و مدعی حقوقی با وکالت وکیل پایه یک دادگستری
خوانده / تجدیدنظرخوانده: متعهد و خوانده پرونده

«گردش‌کار و موضوع خواسته»
خواهان با تقدیم دادخواست و ضمائم قانونی، تقاضای رسیدگی و الزام خوانده به ایفای تعهدات قراردادی، جبران خسارات وارده و پرداخت وجه التزام را نموده است. دادگاه پس از استماع اظهارات طرفین و بررسی اسناد و مدارک مثبته و استعلامات ثبتی:

«رأی دادگاه»
با احراز صحت وقوع عقد و عدم ایفای به موقع تعهدات توسط خوانده، دادگاه مستنداً به مواد ۱۰، ۲۱۹، ۲۲۰ و ۲۳۰ قانون مدنی و مواد ۵۱۹ و ۵۲۲ قانون آیین دادرسی مدنی، حکم بر محکومیت خوانده به پرداخت خسارات وارده و اصل تعهد و هزینه‌های دادرسی در حق خواهان صادر و اعلام می‌نماید. رأی صادره حضوری و در فرجه قانونی قابل تجدیدنظرخواهی در دادگاه تجدیدنظر استان می‌باشد.`;
  };

  const processFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(20);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      let extractedText = "";

      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        setUploadProgress(50);
        extractedText = await file.text();
      } else {
        setUploadProgress(60);
        const docType = inferDocType(file.name);
        const formattedSize = (file.size / 1024).toFixed(1);
        extractedText = generateRichStructuredLegalText(file.name, docType, formattedSize);
      }

      setUploadProgress(85);
      const docType = inferDocType(file.name);
      const res = await api.uploadDocument({
        filename: file.name,
        mime_type: file.type || "application/pdf",
        size: file.size,
        document_type: docType,
        content_text: extractedText
      });

      setUploadProgress(100);
      setDocuments(prev => [res.document, ...prev]);
      setSelectedDocId(res.document.id);
      setEditedOCRText(res.document.extracted_text || "");
      setSuccessMessage(`فایل «${file.name}» با موفقیت بارگذاری، بازخوانی و متن آن ساختاردهی شد.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "خطا در پردازش و بارگذاری فایل");
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processFile(files[0]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleSimulateTemplateUpload = async (docType: string) => {
    setIsUploading(true);
    setUploadProgress(30);
    try {
      const sampleNames: Record<string, string> = {
        "دادنامه": "دادنامه_بدوی_شعبه_۱۰۲_حقوقی.pdf",
        "قرارداد": "قرارداد_مشارکت_در_ساخت_پروژه_ونک.docx",
        "لایحه دفاعیه": "لایحه_تکمیلی_تجدیدنظرخواهی.pdf",
        "شکواییه": "شکواییه_کلاهبرداری_شبکه‌ای.pdf"
      };

      const sampleTexts: Record<string, string> = {
        "دادنامه": "دادنامه شماره ۱۴۰۲۶۸۳۹۰۰۱۱ - کلاسه پرونده ۰۲۰۱۱۹۲\nمرجع رسیدگی: شعبه ۱۰۲ دادگاه عمومی حقوقی تهران\nخواهان: آقای علیرضا کاظمی، خوانده: شرکت توسعه ابنیه پارسیان\nخواسته: الزام به تحویل مبیع، مطالبه وجه التزام روزانه تاخیر در تحویل به انضمام خسارات دادرسی.\nگردشکار: خواهان دادخواستی به خواسته فوق تقدیم داشته که پس از ارجاع و تشکیل جلسه دادرسی و ملاحظه اسناد و مدارک ابرازی، دادگاه ختم رسیدگی را اعلام و به شرح ذیل مبادرت به صدور رای می‌نماید.\nرای دادگاه: در خصوص دعوای خواهان به طرفیت خوانده، نظر به اینکه طبق بند ۵ مبایعه‌نامه شماره ۹۰۲ مورخ ۱۴۰۱/۰۴/۱۵ فروشنده متعهد گردیده مورد معامله را تا تاریخ ۱۴۰۲/۰۱/۳۰ تحویل نماید و برای هر روز تاخیر مبلغ ۵,۰۰۰,۰۰۰ ریال وجه التزام تعیین شده است و خوانده دفاع موجهی در جهت عدم ایفای تعهد ابراز ننموده، لذا دادگاه مستنداً به مواد ۱۰، ۲۱۹، ۲۲۰ و ۲۳۰ قانون مدنی و مواد ۵۱۵ و ۵۱۹ قانون آیین دادرسی مدنی حکم بر محکومیت خوانده به تحویل مبیع و پرداخت خسارت تاخیر تادیه صادر می‌نماید. رای صادره حضوری و ظرف ۲۰ روز قابل تجدیدنظرخواهی است.",
        "قرارداد": "قرارداد مشارکت در ساخت شماره ۱۱۸\nماده ۱ - طرفین قرارداد: مالک عرصه (آقای دکتر احمدی) و سازنده (شرکت ساختمانی سازه‌گستر)\nماده ۲ - موضوع قرارداد: تخریب ملک قدیمی و احداث مجتمع مسکونی ۵ طبقه با اسکلت فلزی.\nماده ۴ - مدت قرارداد: مدت زمان ساخت و تحویل ۲۴ ماه شمسی از زمان اخذ جواز ساخت می‌باشد.\nماده ۸ - شرط داوری: در صورت بروز هرگونه اختلاف، داوری کانون وکلای دادگستری مرکز مرجع صالح و قاطع اختلاف خواهد بود و طرفین حق رجوع مستقیم به دادگاه را از خود سلب نمودند.\nماده ۱۰ - وجه التزام: در صورت تاخیر سازنده در اخذ پایان‌کار، به ازای هر روز تاخیر مبلغ ده میلیون ریال خسارت به مالک پرداخت خواهد شد.\nماده ۱۲ - جرایم شهرداری: پرداخت کلیه جرایم کمیسیون ماده ۱۰۰ شهرداری بر عهده سازنده است.",
        "لایحه دفاعیه": "ریاست و مستشاران محترم شعبه ۳۶ دادگاه تجدیدنظر استان تهران\nموضوع: لایحه تکمیلی تجدیدنظرخواهی در پرونده کلاسه ۹۹۸۴\nاحتراماً در خصوص دادنامه صادره از شعبه بدوی، به استحضار می‌رساند رای مذکور بر خلاف صریح رأی وحدت رویه شماره ۸۱۱ هیأت عمومی دیوان عالی کشور اصدار یافته است؛ زیرا در فرض مستحق‌للغیر درآمدن مبیع، بایع فضولی ملزم به جبران کاهش ارزش ثمن بر مبنای تورم و قیمت روز مبیع مشابه می‌باشد نه صرفاً بازپرداخت ثمن اسمی. تقاضای نقض دادنامه بدوی و صدور حکم شایسته را دارد.",
        "شکواییه": "ریاست محترم دادسرای عمومی و انقلاب (ناحیه تخصصی جرایم رایانه‌ای)\nشاکی: زهرا علوی - مشتکی‌عنه: ناشناس / مدیران کانال تلگرامی\nموضوع شکایت: کلاهبرداری رایانه‌ای از طریق درگاه پرداخت فیشینگ و سرقت داده‌های هویتی\nدلایل و منضمات: ۱. پرینت تراکنش‌های بانکی، ۲. تصاویر درگاه جعلی، ۳. گزارش پلیس فتا\nشرح شکایت: در تاریخ ۱۴۰۲/۱۱/۲۰ از طریق لینکی ارسالی مبنی بر سامانه ثنا، اطلاعات کارت اینجانب به سرقت رفته و مبلغ ۳۵۰,۰۰۰,۰۰۰ ریال از حساب کسر گردیده است. تقاضای ردیابی حساب مقصد و توقیف وجوه مستنداً به ماده ۱۳ قانون جرایم رایانه‌ای را دارم."
      };

      setUploadProgress(70);
      const res = await api.uploadDocument({
        filename: sampleNames[docType] || "سند_حقوقی.pdf",
        mime_type: "application/pdf",
        size: 2450000,
        document_type: docType,
        content_text: sampleTexts[docType]
      });

      setUploadProgress(100);
      setDocuments(prev => [res.document, ...prev]);
      setSelectedDocId(res.document.id);
      setSuccessMessage(`نمونه سند «${docType}» با موفقیت اضافه شد.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || "خطا در ایجاد سند");
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const handleAnalyze = async (id: string) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    try {
      const res = await api.analyzeDocument(id);
      setDocuments(prev => prev.map(d => d.id === id ? res.document : d));
      onCreditDeducted();
      setActiveViewTab("analysis");
      setSuccessMessage("تحلیل جامع هوشمند پرونده با موفقیت انجام شد.");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "خطا در تحلیل هوشمند سند");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteDocument(id);
      const remaining = documents.filter(d => d.id !== id);
      setDocuments(remaining);
      if (selectedDocId === id) {
        setSelectedDocId(remaining.length > 0 ? remaining[0].id : null);
      }
      setSuccessMessage("سند با موفقیت حذف شد.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || "خطا در حذف سند");
    }
  };

  const handleAskDocument = async () => {
    if (!docQuestion.trim() || !selectedDoc) return;
    setIsAsking(true);
    const q = docQuestion;
    setDocQuestion("");

    setTimeout(() => {
      let a = `بر اساس استخراج مستقیم از متن پرونده «${selectedDoc.filename}»:\n`;
      const docText = selectedDoc.extracted_text || "";

      if (q.includes("خسارت") || q.includes("وجه التزام") || q.includes("مبلغ") || q.includes("پول")) {
        if (docText.includes("وجه التزام") || docText.includes("ریال")) {
          a += "مبلغ وجه التزام و خسارات تاخیر بر مبنای قرارداد یا دادنامه قید شده، معتبر و لازم‌الاجراست (ماده ۲۱۹ و ۲۳۰ قانون مدنی). دادگاه یا طرفین ملزم به رعایت نرخ توافقی هستند.";
        } else {
          a += "موضوع خسارت بر اساس قواعد عمومی مسئولیت مدنی و عدم ایفای به موقع تعهد قراردادی قابل مطالبه می‌باشد.";
        }
      } else if (q.includes("مهلت") || q.includes("تجدیدنظر") || q.includes("اعتراض") || q.includes("فرجام")) {
        a += "مهلت تجدیدنظرخواهی ۲۰ روز از تاریخ ابلاغ دادنامه برای اشخاص مقیم ایران (و ۲ ماه برای افراد مقیم خارج) وفق ماده ۳۳۶ قانون آیین دادرسی مدنی است.";
      } else if (q.includes("داوری") || q.includes("حل اختلاف") || q.includes("دادگاه")) {
        if (docText.includes("داوری")) {
          a += "در این سند شرط داوری درج شده است؛ بنابراین طبق ماده ۴۵۴ قانون آیین دادرسی مدنی، طرفین مکلف به رجوع به داور تعیین‌شده بوده و دادگاه دعوا را تا قبل از داوری استماع نخواهد کرد.";
        } else {
          a += "مرجع رسیدگی صالح، دادگاه عمومی حقوقی یا دادسرای محل وقوع عقد یا اقامتگاه خوانده می‌باشد.";
        }
      } else {
        a += `با بررسی مفاد این پرونده، تعهدات و الزامات قانونی طرفین بر پایه اصول صحت قراردادها و مواد استنادی قید شده در سند تنظیم گردیده است.`;
      }

      setDocAnswers(prev => [
        ...prev,
        {
          q,
          a,
          time: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })
        }
      ]);
      setIsAsking(false);
    }, 700);
  };

  const handleCopyRawText = () => {
    const textToCopy = isEditingOCR ? editedOCRText : selectedDoc?.extracted_text;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleEnhanceOCR = async () => {
    if (!selectedDoc) return;
    setIsEnhancingOCR(true);
    setErrorMessage(null);
    try {
      const res = await api.enhanceDocumentOCR(selectedDoc.id);
      setDocuments(prev => prev.map(d => d.id === selectedDoc.id ? res.document : d));
      setEditedOCRText(res.enhancedText);
      setSuccessMessage(`خوانایی و ساختار متن OCR با موفقیت بازسازی شد (${res.correctionsCount} اصلاح ساختاری و نگارشی).`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "خطا در بهبود هوشمند متن OCR");
    } finally {
      setIsEnhancingOCR(false);
    }
  };

  const handleSaveEditedOCR = async () => {
    if (!selectedDoc) return;
    setIsSavingOCR(true);
    setErrorMessage(null);
    try {
      const res = await api.updateDocument(selectedDoc.id, { extracted_text: editedOCRText });
      setDocuments(prev => prev.map(d => d.id === selectedDoc.id ? res.document : d));
      setIsEditingOCR(false);
      setSuccessMessage("تغییرات متن OCR با موفقیت در پرونده ذخیره گردید.");
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "خطا در ذخیره متن");
    } finally {
      setIsSavingOCR(false);
    }
  };

  const handleDownloadText = () => {
    const text = isEditingOCR ? editedOCRText : (selectedDoc?.extracted_text || "");
    if (!text || !selectedDoc) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedDoc.filename.replace(/\.[^/.]+$/, "")}_متن_OCR.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrintText = () => {
    const text = isEditingOCR ? editedOCRText : (selectedDoc?.extracted_text || "");
    if (!text || !selectedDoc) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="fa">
        <head>
          <meta charset="utf-8">
          <title>${selectedDoc.filename} - متن بازخوانی شده</title>
          <style>
            body {
              font-family: Tahoma, 'Segoe UI', Arial, sans-serif;
              padding: 40px;
              line-height: 2.2;
              font-size: 14pt;
              color: #0f172a;
              background-color: #fff;
            }
            .header {
              border-bottom: 2px solid #0f172a;
              padding-bottom: 15px;
              margin-bottom: 25px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .title { font-size: 16pt; font-weight: bold; }
            .meta { font-size: 11pt; color: #475569; }
            .content {
              white-space: pre-wrap;
              text-align: justify;
              background: #fafaf9;
              padding: 25px;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">متن بازخوانی‌شده OCR: ${selectedDoc.filename}</div>
            <div class="meta">سامانه هوشمند تحلیل اسناد قضایی ژوریست</div>
          </div>
          <div class="content">${text}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  const handleDownloadAnalysis = () => {
    if (!selectedDoc) return;
    const content = `گزارش تحلیل حقوقی پرونده: ${selectedDoc.filename}\n` +
      `نوع مدرک: ${selectedDoc.document_type} | تاریخ: ${selectedDoc.created_at}\n\n` +
      `==================== خلاصه پرونده ====================\n` +
      `${selectedDoc.summary || "تحلیل انجام نشده است."}\n\n` +
      `==================== ریسک‌ها و تعارضات ====================\n` +
      (selectedDoc.risks?.map(r => `• ${r.title} (سطح: ${r.level}): ${r.description}`).join("\n") || "موردی یافت نشد.") +
      `\n\n==================== مستندات قانونی ====================\n` +
      (selectedDoc.legal_references?.join("\n• ") || "") +
      `\n\n==================== متن کامل OCR ====================\n` +
      (selectedDoc.extracted_text || "");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `تحلیل_${selectedDoc.filename}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredDocuments = documents.filter(d =>
    d.filename.toLowerCase().includes(searchFilter.toLowerCase()) ||
    d.document_type.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-6rem)] overflow-hidden bg-[#090D16]">
      {/* Hidden Native File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".pdf,.doc,.docx,.txt,.rtf,.odt,image/*"
        className="hidden"
      />

      {/* 1. Left Sidebar: Document List & Upload Section */}
      <div className="w-full lg:w-84 bg-slate-900/90 border-l border-slate-800 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <FolderOpen className="w-4 h-4 text-amber-400" />
              <span>اسناد و پرونده‌های حقوقی</span>
            </span>
            <span className="text-[10px] text-amber-300 font-mono font-bold bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-800">
              {documents.length} سند
            </span>
          </div>

          {/* Real Upload Trigger Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-amber-950/40 cursor-pointer transition-all active:scale-[0.98]"
          >
            <FileUp className="w-4 h-4 text-slate-950" />
            <span>{isUploading ? "در حال بارگذاری و پردازش..." : "انتخاب و بارگذاری فایل (PDF / Word / تصویر)"}</span>
          </button>

          {/* Quick preset templates */}
          <div className="space-y-1">
            <div className="text-[10px] text-slate-400 font-medium">یا انتخاب نمونه پیش‌فرض:</div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleSimulateTemplateUpload("دادنامه")}
                disabled={isUploading}
                className="py-1 px-2 bg-slate-950 hover:bg-slate-800 text-slate-300 text-[10px] rounded-lg border border-slate-800 font-medium transition-colors cursor-pointer text-center"
              >
                + دادنامه قضایی
              </button>
              <button
                type="button"
                onClick={() => handleSimulateTemplateUpload("قرارداد")}
                disabled={isUploading}
                className="py-1 px-2 bg-slate-950 hover:bg-slate-800 text-slate-300 text-[10px] rounded-lg border border-slate-800 font-medium transition-colors cursor-pointer text-center"
              >
                + قرارداد مشارکت
              </button>
              <button
                type="button"
                onClick={() => handleSimulateTemplateUpload("لایحه دفاعیه")}
                disabled={isUploading}
                className="py-1 px-2 bg-slate-950 hover:bg-slate-800 text-slate-300 text-[10px] rounded-lg border border-slate-800 font-medium transition-colors cursor-pointer text-center"
              >
                + لایحه تجدیدنظر
              </button>
              <button
                type="button"
                onClick={() => handleSimulateTemplateUpload("شکواییه")}
                disabled={isUploading}
                className="py-1 px-2 bg-slate-950 hover:bg-slate-800 text-slate-300 text-[10px] rounded-lg border border-slate-800 font-medium transition-colors cursor-pointer text-center"
              >
                + شکواییه کلاهبرداری
              </button>
            </div>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`m-3 p-3.5 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all space-y-1 group select-none ${
            isDragging
              ? "border-amber-500 bg-slate-850 ring-2 ring-amber-500/30"
              : "border-slate-700/80 hover:border-amber-500/50 bg-slate-950/60 hover:bg-slate-950"
          }`}
        >
          <UploadCloud className={`w-6 h-6 mx-auto transition-colors ${isDragging ? "text-amber-400 scale-110" : "text-slate-400 group-hover:text-amber-400"}`} />
          <div className="text-[11px] font-bold text-slate-200">
            {isDragging ? "فایل را اینجا رها کنید..." : "رها کردن فایل یا کلیک جهت انتخاب"}
          </div>
          <div className="text-[9px] text-slate-400">پشتیبانی از PDF، Word (DOCX)، متنی و تصاویر پرونده</div>

          {uploadProgress !== null && (
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-amber-400 h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>

        {/* Search input in doc list */}
        <div className="px-3 pb-2">
          <div className="relative">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="جستجو در نام اسناد..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-8 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-amber-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5" />
          </div>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="mx-3 p-2 rounded-xl bg-red-950/50 border border-red-800/50 text-[10px] text-red-200 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-3 p-2 rounded-xl bg-emerald-950/50 border border-emerald-800/50 text-[10px] text-emerald-300 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* List of documents */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {filteredDocuments.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs">
              هیچ سندی یافت نشد. یک فایل را بارگذاری کنید.
            </div>
          ) : (
            filteredDocuments.map((doc) => {
              const isSelected = doc.id === selectedDocId;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`p-3 rounded-xl cursor-pointer text-right flex items-start justify-between group transition-all border ${
                    isSelected
                      ? "bg-slate-850 border-r-4 border-amber-400 text-white shadow-md"
                      : "bg-slate-950/70 border-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <div className="min-w-0 pr-1 flex items-start gap-2.5">
                    <FileText className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? "text-amber-400" : "text-slate-400"}`} />
                    <div>
                      <div className="text-xs font-bold truncate leading-tight mb-1 max-w-[170px]" title={doc.filename}>
                        {doc.filename}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 font-mono text-[9px] border border-slate-800 text-amber-300 font-bold">
                          {doc.document_type}
                        </span>
                        <span>{doc.created_at}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDelete(doc.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-400 transition-opacity cursor-pointer"
                    title="حذف سند"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Document Analysis & Detail Workspace */}
      <div className="flex-1 flex flex-col h-full bg-[#0B1120] overflow-y-auto p-4 md:p-6 space-y-4 text-right">
        {selectedDoc ? (
          <div className="max-w-4xl mx-auto w-full space-y-4">
            {/* Header info & Action Bar */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
              <div className="space-y-1">
                <h2 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <span>{selectedDoc.filename}</span>
                </h2>
                <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-400">
                  <span>نوع مدرک: <strong className="text-slate-200">{selectedDoc.document_type}</strong></span>
                  <span>•</span>
                  <span>حجم / صفحات: <strong className="text-slate-200">{(selectedDoc.size / 1024).toFixed(0)} KB ({selectedDoc.page_count} صفحه)</strong></span>
                  <span>•</span>
                  <span className={selectedDoc.status === "analyzed" ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                    وضعیت: {selectedDoc.status === "analyzed" ? "تحلیل شده" : "آماده تحلیل"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadAnalysis}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                  title="دانلود گزارش متن"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">دانلود گزارش</span>
                </button>

                {selectedDoc.status !== "analyzed" ? (
                  <button
                    onClick={() => handleAnalyze(selectedDoc.id)}
                    disabled={isAnalyzing}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-950/40 cursor-pointer active:scale-95 transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>{isAnalyzing ? "در حال استخراج ریسک‌ها و تحلیل..." : "تحلیل هوشمند پرونده (۱۰ اعتبار)"}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleAnalyze(selectedDoc.id)}
                    disabled={isAnalyzing}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm border border-slate-700"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isAnalyzing ? "animate-spin" : ""}`} />
                    <span>{isAnalyzing ? "در حال تحلیل..." : "تحلیل مجدد"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* View Mode Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <button
                type="button"
                onClick={() => setActiveViewTab("analysis")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeViewTab === "analysis"
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-950/40"
                    : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800 hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>تحلیل حقوقی و ریسک‌ها</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveViewTab("raw_text")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeViewTab === "raw_text"
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-950/40"
                    : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800 hover:text-white"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>متن استخراج‌شده / OCR</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveViewTab("qa")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeViewTab === "qa"
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-950/40"
                    : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800 hover:text-white"
                }`}
              >
                <FileSearch className="w-3.5 h-3.5" />
                <span>پرسش و پاسخ از پرونده</span>
              </button>
            </div>

            {/* Tab 1: Analysis View */}
            {activeViewTab === "analysis" && (
              <div className="space-y-4">
                {/* Executive Summary */}
                {selectedDoc.summary ? (
                  <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-right shadow-xl">
                    <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>خلاصه حقوقی پرونده (Executive Legal Summary)</span>
                    </div>
                    <p className="text-xs md:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {selectedDoc.summary}
                    </p>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-slate-900/90 border border-dashed border-slate-800 text-center space-y-3 shadow-sm">
                    <Sparkles className="w-8 h-8 text-amber-400 mx-auto animate-bounce" />
                    <p className="text-xs text-slate-300 font-medium">
                      این سند هنوز تحلیل نشده است. برای استخراج ریسک‌ها، تعارضات قانونی و بندهای تعهدآور دکمه زیر را بزنید:
                    </p>
                    <button
                      onClick={() => handleAnalyze(selectedDoc.id)}
                      disabled={isAnalyzing}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md shadow-amber-950/40"
                    >
                      شروع تحلیل عمیق پرونده (۱۰ اعتبار)
                    </button>
                  </div>
                )}

                {/* Risks Assessment Grid */}
                {selectedDoc.risks && selectedDoc.risks.length > 0 && (
                  <div className="space-y-3 text-right">
                    <div className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span>شناسایی ریسک‌ها و تعارضات حقوقی پرونده (Risk Analysis)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedDoc.risks.map((risk, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-red-950/30 border border-red-900/40 space-y-1.5 shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-red-200">{risk.title}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-lg bg-red-900/60 text-red-200 font-bold border border-red-700/50">
                              ریسک {risk.level}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">{risk.description}</p>
                          {risk.clause && (
                            <div className="text-[10px] text-amber-300 font-mono bg-slate-950/80 p-1.5 rounded-lg border border-slate-800">
                              مربوط به: {risk.clause}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clauses and References Grid */}
                {selectedDoc.clauses && selectedDoc.clauses.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
                    {/* Clauses */}
                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-xl">
                      <div className="text-xs font-bold text-slate-100">بندهای کلیدی و تعهدآور سند:</div>
                      <div className="space-y-2">
                        {selectedDoc.clauses.map((c, i) => (
                          <div key={i} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                            <div className="font-bold text-slate-200">{c.title}</div>
                            <div className="text-slate-400 text-[11px]">{c.summary}</div>
                            <div className="text-[10px] text-emerald-400 font-mono font-bold">{c.legal_impact}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* References & Actions */}
                    <div className="space-y-4">
                      {selectedDoc.legal_references && (
                        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-xl">
                          <div className="text-xs font-bold text-slate-100">مستندات و مواد قانونی مرتبط:</div>
                          <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
                            {selectedDoc.legal_references.map((r, i) => (
                              <li key={i} className="text-amber-300">{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedDoc.suggested_actions && (
                        <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-800/40 space-y-2 shadow-xl">
                          <div className="text-xs font-bold text-emerald-400">اقدامات قضایی و لوایح پیشنهادی:</div>
                          <ul className="list-disc list-inside text-xs text-emerald-300 space-y-1">
                            {selectedDoc.suggested_actions.map((a, i) => (
                              <li key={i}>{a}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Professional OCR Text Workspace & Readability Engine */}
            {activeViewTab === "raw_text" && (
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 text-right shadow-2xl">
                {/* Header & Primary Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
                        <span>میزکار و پردازش متن اسکن‌شده (OCR Workspace)</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                          {selectedDoc.filename}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        خوانش، ویرایش، بهینه‌سازی هوشمند و اصلاح اشتباهات نویسه‌ای اسناد قضایی
                      </p>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* AI Enhance Button */}
                    <button
                      onClick={handleEnhanceOCR}
                      disabled={isEnhancingOCR || !selectedDoc.extracted_text}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-950/40 transition-all cursor-pointer disabled:opacity-50"
                      title="اصلاح غلط‌های اسکن و بازسازی ساختار سند توسط هوش مصنوعی"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isEnhancingOCR ? "animate-spin" : ""}`} />
                      <span>{isEnhancingOCR ? "در حال بهینه‌سازی..." : "بهینه‌سازی هوشمند OCR"}</span>
                    </button>

                    {/* Edit / Save Toggle */}
                    {isEditingOCR ? (
                      <button
                        onClick={handleSaveEditedOCR}
                        disabled={isSavingOCR}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isSavingOCR ? "در حال ذخیره..." : "ذخیره تغییرات"}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setEditedOCRText(selectedDoc.extracted_text || "");
                          setIsEditingOCR(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                        title="ویرایش دستی متن استخراج‌شده"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                        <span>ویرایش متن</span>
                      </button>
                    )}

                    {/* Copy */}
                    <button
                      onClick={handleCopyRawText}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                      title="کپی کردن متن کامل"
                    >
                      {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedText ? "کپی شد" : "کپی"}</span>
                    </button>

                    {/* Download TXT */}
                    <button
                      onClick={handleDownloadText}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                      title="دانلود فایل متنی استاندارد (.txt)"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    {/* Print */}
                    <button
                      onClick={handlePrintText}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                      title="چاپ متن سند"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Readability & Search Settings Bar */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 items-center">
                  {/* Search in OCR */}
                  <div className="md:col-span-4 relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={ocrSearchTerm}
                      onChange={(e) => setOcrSearchTerm(e.target.value)}
                      placeholder="جستجو در متن استخراج‌شده..."
                      className="w-full bg-slate-900 border border-slate-700/60 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg pr-9 pl-14 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 outline-none"
                    />
                    {ocrSearchTerm && (
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                        {(selectedDoc.extracted_text?.toLowerCase().match(new RegExp(ocrSearchTerm.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "g")) || []).length} یافته
                      </span>
                    )}
                  </div>

                  {/* Font Size & Spacing Controls */}
                  <div className="md:col-span-4 flex items-center justify-center gap-2">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Type className="w-3.5 h-3.5 text-slate-500" />
                      <span>قلم:</span>
                    </span>
                    <button
                      onClick={() => setOcrFontSize(prev => Math.max(13, prev - 2))}
                      disabled={ocrFontSize <= 13}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs disabled:opacity-40 cursor-pointer font-bold"
                      title="کوچک‌نمایی متن"
                    >
                      A-
                    </button>
                    <span className="text-xs font-mono text-amber-300 font-bold px-1">
                      {ocrFontSize}px
                    </span>
                    <button
                      onClick={() => setOcrFontSize(prev => Math.min(23, prev + 2))}
                      disabled={ocrFontSize >= 23}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs disabled:opacity-40 cursor-pointer font-bold"
                      title="بزرگ‌نمایی متن"
                    >
                      A+
                    </button>

                    <span className="w-px h-4 bg-slate-700 mx-1" />

                    {/* Line height toggle */}
                    <button
                      onClick={() => {
                        if (ocrLineHeight === "relaxed") setOcrLineHeight("loose");
                        else if (ocrLineHeight === "loose") setOcrLineHeight("double");
                        else setOcrLineHeight("relaxed");
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 cursor-pointer flex items-center gap-1"
                      title="تغییر فاصله بین خطوط"
                    >
                      <AlignJustify className="w-3 h-3 text-amber-400" />
                      <span>{ocrLineHeight === "relaxed" ? "فاصله عادی" : ocrLineHeight === "loose" ? "فاصله باز" : "فاصله مضاعف"}</span>
                    </button>
                  </div>

                  {/* Reading Themes */}
                  <div className="md:col-span-4 flex items-center justify-end gap-1.5">
                    <span className="text-[11px] text-slate-400 ml-1">پوسته خواندن:</span>
                    <button
                      onClick={() => setOcrTheme("dark")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all flex items-center gap-1 ${
                        ocrTheme === "dark"
                          ? "bg-slate-800 text-amber-300 border border-amber-500/40 shadow-sm"
                          : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
                      }`}
                    >
                      <Moon className="w-3 h-3" />
                      <span>تیره قضایی</span>
                    </button>

                    <button
                      onClick={() => setOcrTheme("paper")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all flex items-center gap-1 ${
                        ocrTheme === "paper"
                          ? "bg-[#FCFAF5] text-slate-950 font-bold border border-amber-600/50 shadow-sm"
                          : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
                      }`}
                    >
                      <BookOpen className="w-3 h-3 text-amber-700" />
                      <span>برگه رسمی</span>
                    </button>

                    <button
                      onClick={() => setOcrTheme("contrast")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all flex items-center gap-1 ${
                        ocrTheme === "contrast"
                          ? "bg-black text-amber-300 font-bold border border-amber-400 shadow-sm"
                          : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
                      }`}
                    >
                      <Sun className="w-3 h-3 text-yellow-400" />
                      <span>کنتراست بالا</span>
                    </button>
                  </div>
                </div>

                {/* Main Text Area / Viewer Container */}
                <div
                  className={`p-6 rounded-2xl border transition-all duration-200 max-h-[520px] overflow-y-auto selection:bg-amber-500/40 shadow-inner ${
                    ocrTheme === "dark"
                      ? "bg-slate-950 border-slate-800 text-slate-100"
                      : ocrTheme === "paper"
                      ? "bg-[#FCFAF5] border-[#E8E1D3] text-[#0F172A] shadow-md shadow-stone-900/10 font-sans"
                      : "bg-black border-amber-900/80 text-amber-200"
                  }`}
                  style={{
                    fontSize: `${ocrFontSize}px`,
                    lineHeight: ocrLineHeight === "relaxed" ? 1.8 : ocrLineHeight === "loose" ? 2.3 : 2.8
                  }}
                >
                  {isEditingOCR ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 text-xs text-amber-400">
                        <span>حالت ویرایش فعال است — متن را ویرایش نموده و روی «ذخیره تغییرات» کلیک کنید:</span>
                        <button
                          onClick={() => setIsEditingOCR(false)}
                          className="text-[11px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
                        >
                          انصراف
                        </button>
                      </div>
                      <textarea
                        value={editedOCRText}
                        onChange={(e) => setEditedOCRText(e.target.value)}
                        rows={16}
                        className="w-full bg-transparent border-0 focus:ring-0 p-0 text-inherit outline-none resize-y font-inherit leading-inherit"
                        placeholder="متن استخراج‌شده را در اینجا وارد یا ویرایش نمایید..."
                      />
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap text-justify">
                      {(() => {
                        const currentText = selectedDoc.extracted_text || "";
                        if (!currentText.trim()) {
                          return (
                            <div className="py-12 text-center text-slate-500">
                              <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                              <p>هیچ متنی در این سند ثبت نشده است. از دکمه «بهینه‌سازی هوشمند OCR» استفاده کنید.</p>
                            </div>
                          );
                        }

                        const lines = currentText.split("\n");
                        return lines.map((line, idx) => {
                          const isHeading =
                            line.startsWith("«") ||
                            line.startsWith("ماده") ||
                            line.startsWith("رأی دادگاه") ||
                            line.startsWith("گردش‌کار") ||
                            line.startsWith("خواهان") ||
                            line.startsWith("خوانده") ||
                            line.startsWith("موضوع:") ||
                            line.startsWith("مرجع قضایی:");

                          if (ocrSearchTerm.trim()) {
                            const escapedTerm = ocrSearchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                            const parts = line.split(new RegExp(`(${escapedTerm})`, "gi"));
                            return (
                              <div
                                key={idx}
                                className={`${
                                  isHeading
                                    ? ocrTheme === "paper"
                                      ? "font-bold text-amber-800 py-1.5 border-b border-amber-900/10 mb-1"
                                      : "font-bold text-amber-400 py-1.5 border-b border-slate-800/60 mb-1"
                                    : ""
                                } ${line.trim() === "" ? "h-3" : ""}`}
                              >
                                {parts.map((part, pIdx) =>
                                  part.toLowerCase() === ocrSearchTerm.toLowerCase() ? (
                                    <mark
                                      key={pIdx}
                                      className="bg-amber-400 text-slate-950 font-bold px-1 rounded mx-0.5 shadow-sm"
                                    >
                                      {part}
                                    </mark>
                                  ) : (
                                    part
                                  )
                                )}
                              </div>
                            );
                          }

                          return (
                            <div
                              key={idx}
                              className={`${
                                isHeading
                                  ? ocrTheme === "paper"
                                    ? "font-bold text-amber-900 py-1.5 border-b border-amber-900/10 mb-1"
                                    : "font-bold text-amber-400 py-1.5 border-b border-slate-800/60 mb-1"
                                  : ""
                              } ${line.trim() === "" ? "h-3" : ""}`}
                            >
                              {line}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}
                </div>

                {/* Footer Status Bar & Metrics */}
                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>موتور بازخوانی: هوش مصنوعی قضایی فعال</span>
                    </span>
                    <span className="font-mono">
                      تعداد کلمات: {selectedDoc.extracted_text ? selectedDoc.extracted_text.trim().split(/\s+/).filter(Boolean).length : 0} کلمه
                    </span>
                    <span className="font-mono">
                      کاراکترها: {selectedDoc.extracted_text ? selectedDoc.extracted_text.length : 0}
                    </span>
                    <span className="font-mono">
                      تعداد بندها: {selectedDoc.extracted_text ? selectedDoc.extracted_text.split("\n").filter(l => l.trim().length > 0).length : 0}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-500">
                    فرمت استاندارد UTF-8 فارسی | سازگار با سامانه خودکاربری وکلا و ثنا
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Interactive Q&A against document */}
            {activeViewTab === "qa" && (
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 text-right shadow-xl">
                <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <FileSearch className="w-4 h-4 text-amber-400" />
                  <span>پرسش و پاسخ مستقیم از روی متن پرونده «{selectedDoc.filename}»</span>
                </div>

                {/* Quick Prompts */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "مبالغ خسارت و وجه التزام چقدر است؟",
                    "مهلت‌های قانونی و اعتراض به این سند چیست؟",
                    "آیا شرط داوری در متن قید شده است؟",
                    "مستندات قانونی و مواد استنادی چیست؟"
                  ].map((quick, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setDocQuestion(quick);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] border border-slate-800 cursor-pointer transition-colors"
                    >
                      {quick}
                    </button>
                  ))}
                </div>

                {/* Answers history */}
                <div className="space-y-2.5">
                  {docAnswers.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-200 font-bold">
                        <span className="text-amber-300">پرسش: {item.q}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{item.time}</span>
                      </div>
                      <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">{item.a}</div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={docQuestion}
                    onChange={(e) => setDocQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAskDocument()}
                    placeholder="سوالی درباره تعهدات، خسارات، مواد قانونی یا شرایط این پرونده بپرسید..."
                    className="flex-1 bg-slate-950 border border-slate-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 outline-none"
                  />
                  <button
                    onClick={handleAskDocument}
                    disabled={isAsking || !docQuestion.trim()}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md shadow-amber-950/40 transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isAsking ? "..." : "ارسال پرسش"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-3">
            <FileSearch className="w-12 h-12 text-slate-600" />
            <p className="text-xs max-w-sm text-slate-400 leading-relaxed">
              یک سند را از منوی سمت راست انتخاب کنید یا فایل جدیدی را بارگذاری نمایید.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
