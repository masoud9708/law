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
  FileCheck2,
  FileDown,
  Edit3,
  RotateCcw,
  Layers,
  Plus,
  X,
  Bookmark
} from "lucide-react";

interface DraftingViewProps {
  onCreditDeducted: () => void;
}

export const LEGAL_CLAUSES = [
  {
    title: "شرط داوری سازمانی (مرکز داوری اتاق بازرگانی / کانون وکلا)",
    summary: "حل و فصل کلیه اختلافات از طریق داوری حقوقی بدون نیاز به ارجاع به دادگاه",
    text: "کلیه اختلافات و دعاوی ناشی از این قرارداد و یا راجع به آن از جمله انعقاد، اعتبار، فسخ، نقض، تفسیر یا اجرای آن به مرکز داوری کانون وکلای دادگستری / اتاق بازرگانی ارجاع می‌گردد که مطابق با قانون داوری تجاری و اساسنامه آن به صورت قطعی و لازم‌الاجرا حل و فصل گردد. شرط داوری حاضر مستقل از قرارداد اصلی معتبر و لازم‌الاتباع خواهد بود."
  },
  {
    title: "شرط وجه التزام تخلف از تحویل یا تنظیم سند (ماده ۲۳۰ ق.م)",
    summary: "خسارت عدم انجام تعهد روزانه به انضمام اصل تعهد",
    text: "در صورتی که متعهد در موعد مقرر نسبت به انجام تعهد قراردادی خود (اعم از تحویل مبیع یا حضور در دفترخانه جهت تنظیم سند رسمی انتقال) اقدام ننماید، مکلف است به ازای هر روز تأخیر، مبلغ ... ریال به عنوان وجه التزام و خسارت تأخیر به طرف مقابل بپردازد. مطالبه این خسارت مانع از مطالبه و الزام به اجرای اصل تعهد نخواهد بود."
  },
  {
    title: "شرط انفساخ معامله در صورت برگشت چک‌های ثمن",
    summary: "سقوط خودکار معامله بدون نیاز به دادخواست تأیید فسخ",
    text: "عدم وصول یا برگشت هر یک از چک‌های تسلیمی بابت ثمن معامله به هر دلیل در سررسید مقرر، موجب انفساخ خودبه‌خودی این معامله به اراده طرفین بدون نیاز به صدور حکم قضایی خواهد شد و فروشنده مستحق تحویل فوری مبیع و دریافت خسارت تخلف قراردادی خواهد بود."
  },
  {
    title: "شرط اسقاط کافه خیارات به استثنای خیار تدلیس",
    summary: "قطع هرگونه ادعای بعدی فسخ به استناد غبن، عیب یا رؤیت",
    text: "کافه خیارات قانونی خصوصاً خیار غبن ولو افحش و فاحش، خیار عیب، رؤیت و تخلف از وصف از طرفین اسقاط گردید؛ مگر خیار تدلیس که طبق موازین شرعی و آمره قانونی غیرقابل اسقاط است."
  },
  {
    title: "شرط فورس ماژور و تعلیق آثار قرارداد (مواد ۲۲۷ و ۲۲۹ ق.م)",
    summary: "حوادث قهری غیرمترقبه خارج از کنترل طرفین",
    text: "در صورت وقوع حوادث غیرمترقبه، قهری و غیرقابل پیش‌بینی که خارج از حیطه کنترل و اقتدار متعاقدین باشد و مانع از اجرای تعهد گردد، اجرای تعهدات تا زمان رفع مانع معلق گردیده و وجه التزامی تعلق نخواهد گرفت. در صورت تداوم بیش از ۳ ماه، هر یک از طرفین حق فسخ توافق‌نامه را خواهند داشت."
  },
  {
    title: "اقامتگاه قانونی، ابلاغ الکترونیک (سامانه ثنا) و دادگاه صالح",
    summary: "رسمیت ابلاغ پیامکی و عدم نیاز به اخطاریه فیزیکی",
    text: "اقامتگاه قانونی طرفین همان نشانی اعلامی در این سند و مشخصات ثبت‌شده در سامانه ابلاغ الکترونیک قضایی (ثنا) می‌باشد. هرگونه ابلاغ و اخطاریه ارسالی به این نشانی یا از طریق کارپوشه ثنا، ابلاغ قانونی و قطعی محسوب می‌گردد و طرفین متعهدند هرگونه تغییر نشانی را ظرف ۴۸ ساعت کتباً اعلام نمایند."
  }
];

const DRAFT_TEMPLATES = [
  { id: "دادخواست", label: "دادخواست حقوقی", desc: "بدوی، شورای حل اختلاف، الزام به تعهدات" },
  { id: "لایحه دفاعیه", label: "لایحه دفاعیه تخصصی", desc: "دفاع در جلسه دادگاه، رد ادعای خواهان" },
  { id: "شکواییه", label: "شکواییه کیفری", desc: "کلاهبرداری، خیانت در امانت، صدور چک بلامحل" },
  { id: "اظهارنامه", label: "اظهارنامه رسمی قضایی", desc: "ارسال اخطار رسمی قبل از طرح دعوا" },
  { id: "تجدیدنظرخواهی", label: "دادخواست تجدیدنظر", desc: "اعتراض به دادنامه بدوی در مهلت ۲۰ روزه" },
  { id: "فرجام‌خواهی", label: "لایحه فرجام‌خواهی", desc: "دیوان عالی کشور با استناد به موازین شرعی و قانونی" },
  { id: "قرارداد", label: "قرارداد حقوقی و تجاری", desc: "مشارکت در ساخت، اجاره، خرید و فروش، صلح" }
];

const PRESET_CASES = [
  {
    name: "مطالبه وجه چک صیادی + تأخیر تأدیه",
    draftType: "دادخواست",
    plaintiff: "آقای رضا حسینی با وکالت اینجانب",
    defendant: "آقای مسعود تهرانی (صادرکننده چک)",
    subject: "صدور اجرائیه و مطالبه وجه چک صیادی به شماره صیاد ۱۲۳۴۵۶۷۸۹ به مبلغ ۵۰۰،۰۰۰،۰۰۰ ریال به انضمام خسارت تأخیر تأدیه و کلیه هزینه‌های دادرسی",
    court: "شورای حل اختلاف / دادگاه عمومی حقوقی مجتمع شهید صدر تهران",
    facts: "خوانده محترم در قبال ثمن معامله یک فقره چک صیادی به شماره صیادی ۱۲۳۴۵۶۷۸۹ به تاریخ ۱۴۰۲/۱۰/۲۰ عهده بانک ملت صادر نموده که به علت کسر موجودی منتهی به صدور گواهی عدم پرداخت با کد رهگیری ثبت‌شده در سامانه یکپارچه بانک مرکزی گردیده است.",
    evidence: "۱. اصل و تصویر مصدق چک صیادی ۲. گواهی عدم پرداخت بانک محال‌علیه ۳. تصویر وکالت‌نامه الکترونیک وکیل",
    customArticles: "ماده ۲۳ قانون صدور چک مصوب ۱۳۹۷ و ماده ۵۲۲ قانون آیین دادرسی مدنی و مواد ۱۹۸ و ۵۱۹ ق.آ.د.م"
  },
  {
    name: "دستور تخلیه فوری ملک (قانون ۷۶)",
    draftType: "دادخواست",
    plaintiff: "آقای محمود علوی (موجر)",
    defendant: "آقای کامران رستمی (مستأجر)",
    subject: "تقاضای صدور دستور تخلیه فوری یک باب آپارتمان مسکونی به انضمام خسارات دادرسی",
    court: "شورای حل اختلاف حوزه ۲۳ تهران",
    facts: "به موجب قرارداد اجاره عادی تنظیمی به شماره سند ۱۴۰۱/۴۲ به تاریخ ۱۴۰۱/۰۷/۰۱ با امضای دو نفر شاهد معتبر، عین مستأجره به مدت یک سال به خوانده اجاره داده شد. با انقضای مدت در تاریخ ۱۴۰۲/۰۷/۰۱، خوانده علی‌رغم مراجعات مکرر از تخلیه و تحویل ملک امتناع می‌ورزد. ودیعه نیز نزد صندوق دادگستری تودیع می‌گردد.",
    evidence: "۱. قرارداد اجاره با امضای دو نفر شاهد ۲. سند مالکیت رسمی تک‌برگ ۳. گواهی تودیع ودیعه نزد دادگستری",
    customArticles: "مواد ۲، ۳ و ۴ قانون روابط موجر و مستأجر مصوب ۱۳۷۶ و آیین‌نامه اجرایی آن"
  },
  {
    name: "الزام به تنظیم سند رسمی و تحویل مبیع",
    draftType: "دادخواست",
    plaintiff: "خانم سارا کریمی با وکالت اینجانب",
    defendant: "آقای بهروز شایسته (سازنده و فروشنده)",
    subject: "الزام خوانده به تنظیم سند رسمی انتقال پلاک ثبتی ۱۲۴/۸۵۶ و تحویل مبیع و مطالبه وجه التزام قراردادی روزانه",
    court: "دادگاه عمومی حقوقی مجتمع قضایی شهید بهشتی تهران",
    facts: "به موجب مبایعه‌نامه شماره ۴۵۸۲، خوانده متعهد گردید در تاریخ ۱۴۰۲/۰۶/۱۵ در دفترخانه شماره ۸۵ تهران حاضر و سند رسمی آپارتمان را منتقل نماید. اینجانب در موعد مقرر با تهیه الباقی ثمن حاضر ولیکن خوانده حضور نیافته و گواهی عدم حضور صادر گردید.",
    evidence: "۱. تصویر مصدق مبایعه‌نامه ۲. گواهی عدم حضور دفترخانه ۳. استعلام ثبتی پلاک ملک ۴. اظهارنامه رسمی",
    customArticles: "مواد ۱۰، ۲۱۹، ۲۲۰ و ۲۳۰ قانون مدنی و مواد ۱۹۸ و ۵۱۵ و ۵۱۹ قانون آیین دادرسی مدنی"
  },
  {
    name: "شکواییه کلاهبرداری رایانه‌ای",
    draftType: "شکواییه",
    plaintiff: "آقای علی نادری (شاکی)",
    defendant: "ناشناس / صاحب حساب مقصد به نام نیما فرهمند",
    subject: "کلاهبرداری رایانه‌ای و برداشت غیرمجاز اینترنتی از حساب بانکی به مبلغ ۸۵۰ میلیون ریال",
    court: "دادسرا عمومی و انقلاب ویژه جرایم رایانه‌ای (ناحیه ۳۱ تهران)",
    facts: "مشتکی‌عنه از طریق ارسال پیامک جعلی سامانه ثنا و هدایت اینجانب به درگاه پرداخت فیشینگ جعلی، مبادرت به اخذ اطلاعات کارت و انتقال غیرمجاز مبلغ ۸۵ میلیون تومان از حساب بانک ملی اینجانب به شماره شبای مقصد نموده است.",
    evidence: "۱. گردش حساب بانکی ممهور به مهر شعبه ۲. تصویر پیامک دریافتی و لینک مخرب ۳. گزارش اولیه پلیس فتا",
    customArticles: "ماده ۱۳ قانون جرایم رایانه‌ای (ماده ۷۴۱ قانون مجازات اسلامی بخش تعزیرات)"
  },
  {
    name: "لایحه دفاعیه سفته (ایراد عدم واخواست تجاری)",
    draftType: "لایحه دفاعیه",
    plaintiff: "آقای جمشید خدابنده (خواهان)",
    defendant: "آقای جواد قاسمی با وکالت اینجانب (خوانده)",
    subject: "لایحه دفاعیه در پاسخ به دعوای مطالبه وجه سفته و خسارت تأخیر تأدیه",
    court: "شعبه ۴۲ دادگاه عمومی حقوقی مجتمع شهید صدر تهران",
    facts: "خواهان بدون انجام تشریفات قانونی واخواست (اعتراض عدم تأدیه ظرف ۱۰ روز از سررسید موضوع ماده ۲۸۰ ق.ت)، مبادرت به طرح دعوا نموده است. لذا سفته تنظیمی خصیصه سند تجاری را از دست داده و تبدیل به سند عادی شده و مشمول مزایای اسناد تجاری و توقیف بدون تودیع خسارت احتمالی نمی‌باشد. همچنین اصل دین از طریق حواله بانکی تسویه گردیده است.",
    evidence: "۱. مستندات عدم انجام واخواست در موعد قانونی ۲. پرینت واریزی‌های بانکی به حساب خواهان ۳. مواد ۲۴۹، ۲۸۰ و ۲۸۶ قانون تجارت",
    customArticles: "مواد ۲۴۹، ۲۸۰ و ۲۸۶ قانون تجارت و ماده ۱۹۸ قانون آیین دادرسی مدنی"
  },
  {
    name: "دادخواست الزام زوجه به تمکین",
    draftType: "دادخواست",
    plaintiff: "آقای میلاد احمدی (زوج)",
    defendant: "خانم نسترن صبوری (زوجه)",
    subject: "صدور حکم الزام خوانده به تمکین و ایفای وظایف زوجیت و بازگشت به منزل مشترک",
    court: "دادگاه خانواده مجتمع قضایی شهید محلاتی تهران",
    facts: "خوانده محترم بدون هرگونه مانع مشروع قانونی یا شرعی و بدون اجازه اینجانب، منزل مشترک زناشویی را ترک نموده و علی‌رغم تهیه مسکن مناسب و ارسال اظهارنامه رسمی مبنی بر بازگشت، از بازگشت و ایفای وظایف زناشویی استنکاف می‌ورزد.",
    evidence: "۱. تصویر سند ازدواج رسمی شماره ۲۱۴۵، ۲. اظهارنامه رسمی ابلاغ‌شده به خوانده، ۳. استشهادیه محلی و گزارش کلانتری مبنی بر ترک منزل",
    customArticles: "مواد ۱۱۰۲، ۱۱۰۳، ۱۱۰۴ و ۱۱۱۴ قانون مدنی"
  },
  {
    name: "فسخ قرارداد به استناد خیار تخلف از شرط",
    draftType: "دادخواست",
    plaintiff: "آقای کیانوش راد با وکالت اینجانب",
    defendant: "شرکت فنی مهندسی البرز سازه",
    subject: "صدور حکم مبنی بر تأیید و اعلان فسخ قرارداد مشارکت شماره ۹۸ و مطالبه خسارات قراردادی",
    court: "دادگاه عمومی حقوقی مجتمع قضایی ونک تهران",
    facts: "خوانده متعهد بوده است طبق بند ۴ قرارداد، پایان‌کار و صورت‌مجلس تفکیکی را ظرف ۶ ماه اخذ نماید و شرط گردیده در صورت تخلف، خواهان حق فسخ قرارداد را دارد. با انقضای موعد و ارسال اظهارنامه رسمی مبنی بر اعمال حق فسخ، دعوای حاضر جهت اعلام مراتب تقدیم می‌گردد.",
    evidence: "۱. قرارداد شماره ۹۸، ۲. اظهارنامه رسمی اعمال حق فسخ، ۳. استعلام وضعیت ثبتی و گواهی شهرداری",
    customArticles: "مواد ۲۳۴، ۲۳۷، ۲۳۹ و ۴۴۴ قانون مدنی"
  },
  {
    name: "اظهارنامه هشدار فسخ و ایفای تعهد",
    draftType: "اظهارنامه",
    plaintiff: "آقای فرزاد کاظمی (مخاطب را مطلع می‌سازد)",
    defendant: "آقای حامد شریفی (مخاطب)",
    subject: "اخطار قانونی مبنی بر ایفای تعهد قراردادی ظرف ۷۲ ساعت و هشدار فسخ و مطالبه خسارت",
    court: "دفتر خدمات الکترونیک قضایی / دادگستری تهران",
    facts: "به شما مخاطب محترم اخطار می‌گردد حداکثر ظرف مدت ۷۲ ساعت از تاریخ ابلاغ این اظهارنامه نسبت به ایفای تعهد قراردادی خود به موجب قرارداد مورخ ۱۴۰۲/۰۵/۱۰ اقدام فرمایید؛ در غیر این صورت مراتب فسخ یک‌جانبه اعمال و پرونده جهت مطالبه خسارات به مراجع قضایی ارجاع خواهد شد.",
    evidence: "۱. قرارداد منعقده بین طرفین، ۲. فیش‌های واریزی",
    customArticles: "ماده ۱۵۶ قانون آیین دادرسی مدنی و مواد ۲۲۶ الی ۲۳۰ قانون مدنی"
  }
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
  const [isEditing, setIsEditing] = useState(false);
  const [citations, setCitations] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Legal Clauses Library Modal State
  const [showClausesModal, setShowClausesModal] = useState(false);
  const [copiedClauseIdx, setCopiedClauseIdx] = useState<number | null>(null);

  const insertClauseToFacts = (clauseText: string) => {
    setFacts(prev => prev ? `${prev}\n\n[شرط قراردادی الحاقی]:\n${clauseText}` : `[شرط قراردادی الحاقی]:\n${clauseText}`);
    setShowClausesModal(false);
  };

  const copyClauseText = (clauseText: string, idx: number) => {
    navigator.clipboard.writeText(clauseText);
    setCopiedClauseIdx(idx);
    setTimeout(() => setCopiedClauseIdx(null), 2000);
  };

  const applyPreset = (preset: typeof PRESET_CASES[0]) => {
    setDraftType(preset.draftType);
    setPlaintiff(preset.plaintiff);
    setDefendant(preset.defendant);
    setSubject(preset.subject);
    setCourt(preset.court);
    setFacts(preset.facts);
    setEvidence(preset.evidence);
    setCustomArticles(preset.customArticles);
  };

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
      setIsEditing(false);
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

  const handleExportWord = () => {
    if (!generatedDraft) return;
    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="fa">
      <head>
        <meta charset="utf-8">
        <title>${subject || "سند حقوقی"}</title>
        <style>
          body { font-family: 'B Nazanin', Tahoma, Arial, sans-serif; direction: rtl; text-align: justify; line-height: 2; padding: 40px; font-size: 14pt; }
          .header { text-align: center; margin-bottom: 25px; font-weight: bold; font-size: 16pt; }
          .sub-header { text-align: center; margin-bottom: 35px; font-size: 11pt; color: #555; }
          .content { line-height: 2.2; white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <div class="header">بسمه‌تعالی</div>
        <div class="sub-header">جمهوری اسلامی ایران • قوه قضائیه</div>
        <div class="content">${generatedDraft.replace(/\n/g, "<br>")}</div>
      </body>
      </html>
    `;
    const blob = new Blob(["\ufeff" + htmlContent], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${draftType}-${Date.now()}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

          {/* Presets Bar */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-300">الگوهای آماده دعاوی و دادخواست‌های پرتکرار:</label>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESET_CASES.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-[11px] text-amber-300 font-medium text-right truncate transition-all cursor-pointer"
                  title={p.name}
                >
                  ⚡ {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Template Selection Pills */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">نوع سند قضایی:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DRAFT_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => setDraftType(tmpl.id)}
                  className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                    draftType === tmpl.id
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-xs"
                      : "bg-slate-950 text-slate-400 border-slate-800/80 hover:bg-slate-800/40"
                  }`}
                >
                  <div className="text-xs font-bold">{tmpl.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 truncate">{tmpl.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Parties Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">خواهان / شاکی:</label>
              <input
                type="text"
                value={plaintiff}
                onChange={(e) => setPlaintiff(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">خوانده / مشتکی‌عنه:</label>
              <input
                type="text"
                value={defendant}
                onChange={(e) => setDefendant(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Subject & Court */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">موضوع خواسته / شکایت:</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">مرجع رسیدگی‌کننده:</label>
              <input
                type="text"
                value={court}
                onChange={(e) => setCourt(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Facts */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">شرح ماوقع و فکت‌های کلیدی پرونده:</label>
              <button
                type="button"
                onClick={() => setShowClausesModal(true)}
                className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-bold px-2 py-0.5 rounded-md bg-amber-950/40 border border-amber-500/30 transition-all cursor-pointer"
              >
                <Bookmark className="w-3 h-3" />
                <span>گنجینه شروط حقوقی</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={facts}
              onChange={(e) => setFacts(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-500 rounded-xl p-3 text-slate-100 text-xs focus:outline-none leading-relaxed"
            />
          </div>

          {/* Evidences & Custom Articles */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">دلایل و منضمات (مدارک):</label>
              <input
                type="text"
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">مواد قانونی مدنظر (اختیاری):</label>
              <input
                type="text"
                value={customArticles}
                onChange={(e) => setCustomArticles(e.target.value)}
                placeholder="مثال: مواد ۱۰ و ۲۱۹ قانون مدنی"
                className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none"
              />
            </div>
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
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                    isEditing ? "bg-amber-500/20 text-amber-300 border-amber-500/50" : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                  }`}
                  title="ویرایش مستقیم متن سند"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isEditing ? "اتمام ویرایش" : "ویرایش متن"}</span>
                </button>

                <button
                  onClick={handleExportWord}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-blue-200 text-xs font-bold border border-blue-700/60 transition-colors cursor-pointer"
                  title="دانلود با فرمت Word (.doc)"
                >
                  <FileDown className="w-3.5 h-3.5 text-blue-400" />
                  <span>خروجی Word</span>
                </button>

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

                {isEditing ? (
                  <textarea
                    value={generatedDraft}
                    onChange={(e) => setGeneratedDraft(e.target.value)}
                    rows={16}
                    className="w-full bg-slate-950 p-4 rounded-xl border border-amber-500/50 text-slate-100 font-serif text-xs md:text-sm leading-loose focus:outline-none"
                  />
                ) : (
                  <div className="leading-loose text-slate-200">
                    {generatedDraft}
                  </div>
                )}

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
                  مشخصات پرونده یا یکی از الگوهای آماده بالا را انتخاب کرده و دکمه «تدوین و استخراج» را بفشارید.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legal Clauses Library Modal */}
      {showClausesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-right">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-100">گنجینه شروط حقوقی و شرط ضمن عقد معتبر</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowClausesModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              <p className="text-xs text-slate-400">
                شروط استاندارد زیر توسط حقوق‌دانان تدوین شده است. می‌توانید هر شرط را مستقیماً به شرح دادخواست/قرارداد اضافه کنید یا متن آن را کپی نمایید:
              </p>
              {LEGAL_CLAUSES.map((clause, idx) => (
                <div key={idx} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2 hover:border-amber-500/40 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300">{clause.title}</span>
                    <span className="text-[10px] text-slate-400">{clause.summary}</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-serif bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 select-all">
                    {clause.text}
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => copyClauseText(clause.text, idx)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {copiedClauseIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedClauseIdx === idx ? "کپی شد" : "کپی متن شرط"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => insertClauseToFacts(clause.text)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>افزودن به شرح ماوقع</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
              <span>تطابق کامل با قوانین مدنی، تجارت و آیین دادرسی مدنی</span>
              <button
                type="button"
                onClick={() => setShowClausesModal(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-all cursor-pointer"
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
