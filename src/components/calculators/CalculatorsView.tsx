import React, { useState } from "react";
import {
  Calculator,
  Calendar,
  Scale,
  Coins,
  TrendingUp,
  Clock,
  Check,
  Copy,
  FileText,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  Percent,
  Layers,
  HeartHandshake,
  Users
} from "lucide-react";

// Central Bank of Iran Annual Consumer Price Index (1395 = 100 base)
const CBI_ANNUAL_INDICES: Record<number, number> = {
  1360: 0.16,
  1361: 0.19,
  1362: 0.23,
  1363: 0.26,
  1364: 0.27,
  1365: 0.34,
  1366: 0.43,
  1367: 0.55,
  1368: 0.65,
  1369: 0.71,
  1370: 0.86,
  1371: 1.07,
  1372: 1.31,
  1373: 1.77,
  1374: 2.65,
  1375: 3.26,
  1376: 3.83,
  1377: 4.52,
  1378: 5.43,
  1379: 6.12,
  1380: 5.12,
  1381: 5.93,
  1382: 6.86,
  1383: 7.91,
  1384: 8.73,
  1385: 9.77,
  1386: 11.57,
  1387: 14.51,
  1388: 16.07,
  1389: 18.06,
  1390: 21.95,
  1391: 28.65,
  1392: 38.60,
  1393: 44.62,
  1394: 49.92,
  1395: 54.91,
  1396: 60.18,
  1397: 78.96,
  1398: 106.01,
  1399: 144.60,
  1400: 201.90,
  1401: 295.80,
  1402: 432.50,
  1403: 630.20,
  1404: 880.00
};

const MONTHS = [
  { id: 1, name: "فروردین" },
  { id: 2, name: "اردیبهشت" },
  { id: 3, name: "خرداد" },
  { id: 4, name: "تیر" },
  { id: 5, name: "مرداد" },
  { id: 6, name: "شهریور" },
  { id: 7, name: "مهر" },
  { id: 8, name: "آبان" },
  { id: 9, name: "آذر" },
  { id: 10, name: "دی" },
  { id: 11, name: "بهمن" },
  { id: 12, name: "اسفند" }
];

// Helper to convert number to Persian words
function numberToPersianWords(num: number): string {
  if (!num || isNaN(num)) return "صفر";
  const units = ["", "یک", "دو", "سه", "چهار", "پنج", "شش", "هفت", "هشت", "نه"];
  const teens = ["ده", "یازده", "دوازده", "سیزده", "چهارده", "پانزده", "شانزده", "هفده", "هجده", "نوزده"];
  const tens = ["", "", "بیست", "سی", "چهل", "پنجاه", "شصت", "هفتاد", "هشتاد", "نود"];
  const hundreds = ["", "یکصد", "دویست", "سیصد", "چهارصد", "پانصد", "ششصد", "هفتصد", "هشتصد", "نهصد"];
  const thousands = ["", "هزار", "میلیون", "میلیارد", "تریلیون"];

  const parts: string[] = [];
  let chunkCount = 0;
  let n = Math.floor(Math.abs(num));

  while (n > 0) {
    const chunk = n % 1000;
    if (chunk > 0) {
      const h = Math.floor(chunk / 100);
      const rem = chunk % 100;
      const t = Math.floor(rem / 10);
      const u = rem % 10;
      const subParts: string[] = [];

      if (h > 0) subParts.push(hundreds[h]);
      if (rem >= 10 && rem < 20) {
        subParts.push(teens[rem - 10]);
      } else {
        if (t > 0) subParts.push(tens[t]);
        if (u > 0) subParts.push(units[u]);
      }

      let chunkStr = subParts.join(" و ");
      if (thousands[chunkCount]) {
        chunkStr += " " + thousands[chunkCount];
      }
      parts.unshift(chunkStr);
    }
    n = Math.floor(n / 1000);
    chunkCount++;
  }

  return parts.length > 0 ? parts.join(" و ") : "صفر";
}

export const CalculatorsView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<"delay" | "court_fees" | "diyeh" | "deadlines" | "mehrieh" | "inheritance">("delay");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // 1. State for Delay Damages
  const [principalAmount, setPrincipalAmount] = useState<number>(100000000); // 100m rials
  const [amountUnit, setAmountUnit] = useState<"rial" | "toman">("toman");
  const [dueYear, setDueYear] = useState<number>(1398);
  const [dueMonth, setDueMonth] = useState<number>(6);
  const [paymentYear, setPaymentYear] = useState<number>(1403);
  const [paymentMonth, setPaymentMonth] = useState<number>(12);

  // 2. State for Court Fees
  const [claimAmount, setClaimAmount] = useState<number>(500000000); // 500m tomans
  const [claimStage, setClaimStage] = useState<"primary" | "appeal" | "supreme">("primary");
  const [isFinancial, setIsFinancial] = useState<boolean>(true);
  const [lawyerTariffIncluded, setLawyerTariffIncluded] = useState<boolean>(true);

  // 3. State for Diyeh
  const [diyehYear, setDiyehYear] = useState<number>(1403);
  const [isSacredMonth, setIsSacredMonth] = useState<boolean>(false);
  const [selectedInjury, setSelectedInjury] = useState<string>("custom");
  const [customPercent, setCustomPercent] = useState<number>(10);

  // 4. State for Deadlines
  const [noticeDate, setNoticeDate] = useState<string>("1403/۰۸/۱۵");
  const [actionType, setActionType] = useState<"appeal" | "supreme" | "default_judgment" | "court_order" | "defect">("appeal");
  const [isResidentInIran, setIsResidentInIran] = useState<boolean>(true);

  // 5. State for Mehrieh
  const [mehriehType, setMehriehType] = useState<"cash" | "coin">("cash");
  const [mehriehContractYear, setMehriehContractYear] = useState<number>(1380);
  const [mehriehDemandYear, setMehriehDemandYear] = useState<number>(1403);
  const [mehriehCashAmount, setMehriehCashAmount] = useState<number>(5000000); // 5m tomans
  const [mehriehCashUnit, setMehriehCashUnit] = useState<"toman" | "rial">("toman");
  const [isHusbandDeceased, setIsHusbandDeceased] = useState<boolean>(false);
  const [husbandDeathYear, setHusbandDeathYear] = useState<number>(1402);
  const [mehriehCoinsCount, setMehriehCoinsCount] = useState<number>(110);
  const [goldCoinPriceToman, setGoldCoinPriceToman] = useState<number>(51000000);

  // 6. State for Inheritance
  const [estateTotalTomans, setEstateTotalTomans] = useState<number>(2400000000); // 2.4b tomans
  const [deceasedGender, setDeceasedGender] = useState<"male" | "female">("male");
  const [hasSpouse, setHasSpouse] = useState<boolean>(true);
  const [wivesCount, setWivesCount] = useState<number>(1);
  const [hasFather, setHasFather] = useState<boolean>(true);
  const [hasMother, setHasMother] = useState<boolean>(true);
  const [sonsCount, setSonsCount] = useState<number>(2);
  const [daughtersCount, setDaughtersCount] = useState<number>(1);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // Calculations: Delay damages
  const rawPrincipal = amountUnit === "toman" ? principalAmount * 10 : principalAmount;
  const dueIndex = CBI_ANNUAL_INDICES[dueYear] || 100;
  const paymentIndex = CBI_ANNUAL_INDICES[paymentYear] || 630.2;
  const ratio = paymentIndex / dueIndex;
  const totalDueRial = Math.round(rawPrincipal * ratio);
  const delayDamageRial = Math.max(0, totalDueRial - rawPrincipal);
  const delayDamageToman = Math.round(delayDamageRial / 10);
  const totalDueToman = Math.round(totalDueRial / 10);

  // Calculations: Court Fees
  const claimRials = claimAmount * 10;
  let courtFeeRials = 0;
  let lawyerFeeRials = 0;

  if (isFinancial) {
    if (claimStage === "primary") {
      // بدوی: تا ۲۰۰ میلیون ریال ۲.۵٪ و مازاد بر آن ۳.۵٪
      const threshold = 200000000;
      if (claimRials <= threshold) {
        courtFeeRials = claimRials * 0.025;
      } else {
        courtFeeRials = (threshold * 0.025) + ((claimRials - threshold) * 0.035);
      }
    } else if (claimStage === "appeal") {
      // تجدیدنظر: ۴.۵٪
      courtFeeRials = claimRials * 0.045;
    } else {
      // فرجام خواهی: ۵.۵٪
      courtFeeRials = claimRials * 0.055;
    }

    // تعرفه حق‌الوکاله طبق آیین‌نامه مصوب ۱۳۹۸:
    // تا ۵۰۰ میلیون ریال ۸٪، ۵۰۰ میلیون تا ۲ میلیارد ریال ۷٪، ۲ تا ۱۰ میلیارد ریال ۵٪، مازاد بر ۱۰ میلیارد ریال ۳٪
    const b1 = 500000000;
    const b2 = 2000000000;
    const b3 = 10000000000;
    if (claimRials <= b1) {
      lawyerFeeRials = claimRials * 0.08;
    } else if (claimRials <= b2) {
      lawyerFeeRials = (b1 * 0.08) + ((claimRials - b1) * 0.07);
    } else if (claimRials <= b3) {
      lawyerFeeRials = (b1 * 0.08) + ((b2 - b1) * 0.07) + ((claimRials - b2) * 0.05);
    } else {
      lawyerFeeRials = (b1 * 0.08) + ((b2 - b1) * 0.07) + ((b3 - b2) * 0.05) + ((claimRials - b3) * 0.03);
    }
  } else {
    // غیرمالی
    courtFeeRials = 2000000; // میانگین ۲۰۰ هزار تومان
    lawyerFeeRials = 30000000; // ۳ میلیون تومان
  }

  const lawyerTaxStampRials = Math.round(lawyerFeeRials * 0.05); // ۵٪ تمبر مالیاتی وکیل
  const barAssociationShareRials = Math.round(lawyerFeeRials * 0.04); // ۴٪ صندوق حمایت

  // Calculations: Diyeh
  // دیه سال ۱۴۰۳: ۱۲ میلیارد ریال ماه عادی، ۱۶ میلیارد ریال ماه حرام
  const baseDiyehRials = isSacredMonth ? 16000000000 : 12000000000;
  const finalDiyehRials = Math.round(baseDiyehRials * (customPercent / 100));
  const finalDiyehToman = Math.round(finalDiyehRials / 10);

  // Calculations: Deadlines
  let deadlineDays = 20;
  let deadlineTitle = "تجدیدنظرخواهی از دادنامه بدوی";
  let deadlineLawRef = "ماده ۳۳۶ قانون آیین دادرسی مدنی";

  if (actionType === "appeal") {
    deadlineDays = isResidentInIran ? 20 : 60;
    deadlineTitle = "تجدیدنظرخواهی از دادنامه بدوی";
    deadlineLawRef = "ماده ۳۳۶ ق.آ.د.م";
  } else if (actionType === "supreme") {
    deadlineDays = isResidentInIran ? 20 : 60;
    deadlineTitle = "فرجام‌خواهی در دیوان عالی کشور";
    deadlineLawRef = "ماده ۳۹۷ ق.آ.د.م";
  } else if (actionType === "default_judgment") {
    deadlineDays = isResidentInIran ? 20 : 60;
    deadlineTitle = "واخواهی از حکم غیابی";
    deadlineLawRef = "ماده ۳۰۶ ق.آ.د.م";
  } else if (actionType === "court_order") {
    deadlineDays = isResidentInIran ? 10 : 20;
    deadlineTitle = "اعتراض به قرارهای قابل تجدیدنظر دادگاه";
    deadlineLawRef = "ماده ۳۳۲ ق.آ.د.م";
  } else if (actionType === "defect") {
    deadlineDays = 10;
    deadlineTitle = "مهلت رفع نقص دادخواست توسط مدیر دفتر";
    deadlineLawRef = "ماده ۵۴ ق.آ.د.م";
  }

  // Calculations: Mehrieh
  const effectivePriorYear = isHusbandDeceased
    ? Math.max(1360, husbandDeathYear - 1)
    : Math.max(1360, mehriehDemandYear - 1);
  const contractIdx = CBI_ANNUAL_INDICES[mehriehContractYear] || 1;
  const priorYearIdx = CBI_ANNUAL_INDICES[effectivePriorYear] || CBI_ANNUAL_INDICES[1402] || 432.5;
  const mehriehRatio = priorYearIdx / contractIdx;

  const rawMehriehRials = mehriehCashUnit === "toman" ? mehriehCashAmount * 10 : mehriehCashAmount;
  const updatedMehriehRials = Math.round(rawMehriehRials * mehriehRatio);
  const updatedMehriehTomans = Math.round(updatedMehriehRials / 10);
  const coinsTotalTomans = mehriehCoinsCount * goldCoinPriceToman;

  // Calculations: Inheritance (طبقه اول - ماده ۸۶۱ الی ۹۰۷ قانون مدنی)
  const hasChildren = (sonsCount + daughtersCount) > 0;
  let spousePercent = 0;
  let spouseRule = "";
  if (hasSpouse) {
    if (deceasedGender === "male") {
      spousePercent = hasChildren ? 12.5 : 25.0; // ۱/۸ با فرزند یا ۱/۴ بدون فرزند
      spouseRule = hasChildren ? "۱/۸ ماترک منقول و بهای غیرمنقول" : "۱/۴ ماترک منقول و بهای غیرمنقول";
    } else {
      spousePercent = hasChildren ? 25.0 : 50.0; // ۱/۴ با فرزند یا ۱/۲ بدون فرزند
      spouseRule = hasChildren ? "۱/۴ از کل ماترک" : "۱/۲ از کل ماترک";
    }
  }

  let fatherPercent = 0;
  let fatherRule = "";
  if (hasFather) {
    if (hasChildren) {
      fatherPercent = 100 / 6; // ۱/۶
      fatherRule = "۱/۶ ترکه (فرض قرآنی با وجود فرزند)";
    } else {
      fatherRule = "باقیمانده ترکه پس از فرض مادر و همسر به قرابت";
    }
  }

  let motherPercent = 0;
  let motherRule = "";
  if (hasMother) {
    if (hasChildren) {
      motherPercent = 100 / 6; // ۱/۶
      motherRule = "۱/۶ ترکه (فرض قرآنی با وجود فرزند)";
    } else {
      motherPercent = 100 / 3; // ۱/۳
      motherRule = "۱/۳ ترکه (فرض قرآنی بدون فرزند و حاجب)";
    }
  }

  if (!hasChildren && hasFather) {
    fatherPercent = Math.max(0, 100 - spousePercent - motherPercent);
  }

  const fixedDeductedPercent = spousePercent + (hasChildren ? fatherPercent : 0) + motherPercent;
  const childrenTotalPercent = Math.max(0, 100 - fixedDeductedPercent);

  let sonSharePercent = 0;
  let daughterSharePercent = 0;

  if (hasChildren) {
    const totalUnits = (sonsCount * 2) + daughtersCount;
    if (totalUnits > 0) {
      const unitPercent = childrenTotalPercent / totalUnits;
      sonSharePercent = unitPercent * 2;
      daughterSharePercent = unitPercent;
    }
  }

  const spouseTotalToman = Math.round(estateTotalTomans * (spousePercent / 100));
  const eachWifeToman = wivesCount > 0 ? Math.round(spouseTotalToman / wivesCount) : 0;
  const fatherTotalToman = Math.round(estateTotalTomans * (fatherPercent / 100));
  const motherTotalToman = Math.round(estateTotalTomans * (motherPercent / 100));
  const eachSonToman = Math.round(estateTotalTomans * (sonSharePercent / 100));
  const eachDaughterToman = Math.round(estateTotalTomans * (daughterSharePercent / 100));

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-6rem)] overflow-y-auto bg-[#090D16] p-4 lg:p-6 gap-6 text-right">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-l from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>سامانه هوشمند محاسبات قضایی و مواعد قانونی</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 font-mono">
                ماده ۵۲۲ و تعرفه ۱۴۰۳
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              محاسبه آنلاین و خودکار خسارت تأخیر تأدیه بر اساس شاخص بانک مرکزی، هزینه دادرسی، تعرفه حق‌الوکاله و تمبر مالیاتی و مواعد دادرسی
            </p>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/90 rounded-xl border border-slate-800 self-stretch md:self-auto">
          <button
            onClick={() => setActiveSubTab("delay")}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "delay"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>خسارت تأخیر تأدیه</span>
          </button>
          <button
            onClick={() => setActiveSubTab("court_fees")}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "court_fees"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>هزینه دادرسی و تمبر</span>
          </button>
          <button
            onClick={() => setActiveSubTab("diyeh")}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "diyeh"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>دیه و ارش ۱۴۰۳</span>
          </button>
          <button
            onClick={() => setActiveSubTab("deadlines")}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "deadlines"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>مواعد قانونی</span>
          </button>
          <button
            onClick={() => setActiveSubTab("mehrieh")}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "mehrieh"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>مهریه به نرخ روز</span>
          </button>
          <button
            onClick={() => setActiveSubTab("inheritance")}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "inheritance"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>سهم‌الارث قانونی</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Delay Damages (ماده ۵۲۲) */}
      {activeSubTab === "delay" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                اطلاعات بدهی و مواعد طلب
              </span>
              <span className="text-[11px] text-amber-400/80 font-mono">شاخص بانک مرکزی</span>
            </div>

            {/* Principal Amount Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">مبلغ اصل طلب</label>
                <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setAmountUnit("toman")}
                    className={`px-2 py-0.5 rounded ${amountUnit === "toman" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400"}`}
                  >
                    تومان
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmountUnit("rial")}
                    className={`px-2 py-0.5 rounded ${amountUnit === "rial" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400"}`}
                  >
                    ریال
                  </button>
                </div>
              </div>
              <input
                type="number"
                value={principalAmount}
                onChange={(e) => setPrincipalAmount(Number(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                placeholder="مبلغ را وارد فرمایید..."
              />
              <p className="text-[11px] text-slate-400">
                به حروف: <strong className="text-amber-300">{numberToPersianWords(principalAmount)} {amountUnit === "toman" ? "تومان" : "ریال"}</strong>
              </p>
            </div>

            {/* Due Date (سررسید) */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                تاریخ سررسید دین (زمان مطالبه یا برگشت چک)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">سال سررسید:</span>
                  <select
                    value={dueYear}
                    onChange={(e) => setDueYear(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  >
                    {Object.keys(CBI_ANNUAL_INDICES).map((y) => (
                      <option key={y} value={y}>سال {y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">ماه سررسید:</span>
                  <select
                    value={dueMonth}
                    onChange={(e) => setDueMonth(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  >
                    {MONTHS.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                شاخص تورم مبنا (سال {dueYear}): <span className="text-amber-300 font-bold">{dueIndex.toFixed(2)}</span>
              </p>
            </div>

            {/* Payment Date (زمان تأدیه / روز جاری) */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                تاریخ محاسبه یا پرداخت (زمان تأدیه)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">سال تأدیه:</span>
                  <select
                    value={paymentYear}
                    onChange={(e) => setPaymentYear(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  >
                    {Object.keys(CBI_ANNUAL_INDICES).map((y) => (
                      <option key={y} value={y}>سال {y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">ماه تأدیه:</span>
                  <select
                    value={paymentMonth}
                    onChange={(e) => setPaymentMonth(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  >
                    {MONTHS.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                شاخص تورم زمان پرداخت (سال {paymentYear}): <span className="text-emerald-300 font-bold">{paymentIndex.toFixed(2)}</span>
              </p>
            </div>

            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                طبق ماده ۵۲۲ قانون آیین دادرسی مدنی، شرط تعلق خسارت تأخیر، تغییر فاحش قیمت سالانه اعلامی بانک مرکزی، تمکن مدیون و امتناع وی و مطالبه دائن می‌باشد.
              </span>
            </div>
          </div>

          {/* Results & Legal Brief Preview */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-400" />
                  نتیجه محاسبه خسارت تأخیر تأدیه
                </span>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
                  نرخ تورم دوره: {(ratio * 100 - 100).toFixed(1)}%
                </span>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-950/90 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">اصل طلب</span>
                  <p className="text-sm sm:text-base font-black font-mono text-slate-200">
                    {(amountUnit === "toman" ? principalAmount : Math.round(principalAmount / 10)).toLocaleString("fa-IR")}
                    <span className="text-[10px] font-sans text-slate-400 mr-1">تومان</span>
                  </p>
                </div>
                <div className="p-3.5 bg-amber-950/30 rounded-xl border border-amber-500/30">
                  <span className="text-[11px] text-amber-300/80 block mb-1">میزان خسارت تأخیر</span>
                  <p className="text-sm sm:text-base font-black font-mono text-amber-400">
                    {delayDamageToman.toLocaleString("fa-IR")}
                    <span className="text-[10px] font-sans text-amber-300 mr-1">تومان</span>
                  </p>
                </div>
                <div className="p-3.5 bg-emerald-950/30 rounded-xl border border-emerald-500/40">
                  <span className="text-[11px] text-emerald-300/80 block mb-1">مجموع کل قابل مطالبه</span>
                  <p className="text-sm sm:text-base font-black font-mono text-emerald-400">
                    {totalDueToman.toLocaleString("fa-IR")}
                    <span className="text-[10px] font-sans text-emerald-300 mr-1">تومان</span>
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-[11px] text-slate-400">مجموع قابل پرداخت به حروف:</span>
                <p className="text-xs font-bold text-amber-300 leading-relaxed">
                  {numberToPersianWords(totalDueToman)} تومان ({numberToPersianWords(totalDueRial)} ریال)
                </p>
              </div>

              {/* Ready Court Petition Formulation */}
              <div className="space-y-2 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    متن آماده جهت درج در ستون خواسته دادخواست / لایحه دفاعیه
                  </span>
                  <button
                    onClick={() => {
                      const brief = `خواسته: مطالبه اصل طلب به مبلغ ${(amountUnit === "toman" ? principalAmount : Math.round(principalAmount / 10)).toLocaleString("fa-IR")} تومان به انضمام کلیه خسارات دادرسی و خسارت تأخیر تأدیه بر مبنای شاخص تورم اعلامی بانک مرکزی جمهوری اسلامی ایران از تاریخ سررسید (${dueYear}/${dueMonth}) لغایت یوم اجرای کامل دادنامه مستنداً به ماده ۵۲۲ قانون آیین دادرسی دادگاه‌های عمومی و انقلاب در امور مدنی.`;
                      copyToClipboard(brief, "brief-delay");
                    }}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    {copiedText === "brief-delay" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedText === "brief-delay" ? "کپی شد" : "کپی متن خواسته"}</span>
                  </button>
                </div>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 font-serif leading-relaxed select-all">
                  «مطالبه اصل طلب به مبلغ {(amountUnit === "toman" ? principalAmount : Math.round(principalAmount / 10)).toLocaleString("fa-IR")} تومان به انضمام کلیه خسارات دادرسی و خسارت تأخیر تأدیه بر مبنای جدول شاخص‌های تورم سالانه و ماهانه بانک مرکزی جمهوری اسلامی ایران از تاریخ سررسید ({dueYear}/{dueMonth}) لغایت روز وصول و اجرای کامل حکم مستنداً به ماده ۵۲۲ قانون آیین دادرسی مدنی با جلب نظر کارشناس رسمی دادگستری.»
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Court Fees & Lawyer Tariff */}
      {activeSubTab === "court_fees" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-400" />
                مشخصات دعوا و بهای خواسته
              </span>
              <span className="text-[11px] text-amber-400 font-mono">تعرفه مصوب قوه قضائیه</span>
            </div>

            {/* Financial / Non-Financial */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">نوع دعوا</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsFinancial(true)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    isFinancial
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/60"
                      : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  دعوای مالی (مطالبه، چک، قرارداد)
                </button>
                <button
                  type="button"
                  onClick={() => setIsFinancial(false)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    !isFinancial
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/60"
                      : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  دعوای غیرمالی (حسبی، تخلیه، تمکین)
                </button>
              </div>
            </div>

            {/* Claim Amount */}
            {isFinancial && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">بهای خواسته (تومان)</label>
                <input
                  type="number"
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-sm focus:outline-none"
                />
                <p className="text-[11px] text-slate-400">
                  معادل: <strong className="text-amber-300">{numberToPersianWords(claimAmount)} تومان</strong>
                </p>
              </div>
            )}

            {/* Court Stage */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">مرحله رسیدگی قضایی</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setClaimStage("primary")}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border ${
                    claimStage === "primary" ? "bg-amber-500 text-slate-950 font-bold border-amber-500" : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  بدوی (۲.۵ الی ۳.۵٪)
                </button>
                <button
                  type="button"
                  onClick={() => setClaimStage("appeal")}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border ${
                    claimStage === "appeal" ? "bg-amber-500 text-slate-950 font-bold border-amber-500" : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  تجدیدنظر (۴.۵٪)
                </button>
                <button
                  type="button"
                  onClick={() => setClaimStage("supreme")}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border ${
                    claimStage === "supreme" ? "bg-amber-500 text-slate-950 font-bold border-amber-500" : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  فرجام‌خواهی (۵.۵٪)
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400">
              <p>• در مرحله بدوی: بهای خواسته تا ۲۰ میلیون تومان ۲.۵٪ و نسبت به مازاد آن ۳.۵٪ محاسبه می‌شود.</p>
              <p>• تمبر مالیاتی وکیل ۵٪ حق‌الوکاله قانونی محاسبه می‌گردد.</p>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-sm font-bold text-amber-300">محاسبه تعرفه‌ها و هزینه‌ها</span>
                <span className="text-xs text-slate-400 font-mono">واحد: تومان</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">هزینه دادرسی دادگستری</span>
                  <p className="text-lg font-black font-mono text-emerald-400">
                    {Math.round(courtFeeRials / 10).toLocaleString("fa-IR")}
                    <span className="text-xs font-sans text-slate-400 mr-1">تومان</span>
                  </p>
                  <p className="text-[10px] text-slate-500">واریز به حساب خزانه دادگستری</p>
                </div>

                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">تعرفه مصوب حق‌الوکاله وکیل</span>
                  <p className="text-lg font-black font-mono text-amber-400">
                    {Math.round(lawyerFeeRials / 10).toLocaleString("fa-IR")}
                    <span className="text-xs font-sans text-slate-400 mr-1">تومان</span>
                  </p>
                  <p className="text-[10px] text-slate-500">طبق آیین‌نامه تعرفه مصوب قوه قضائیه</p>
                </div>

                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">ابطال تمبر مالیاتی وکیل (۵٪)</span>
                  <p className="text-lg font-black font-mono text-blue-400">
                    {Math.round(lawyerTaxStampRials / 10).toLocaleString("fa-IR")}
                    <span className="text-xs font-sans text-slate-400 mr-1">تومان</span>
                  </p>
                  <p className="text-[10px] text-slate-500">ماده ۱۰۳ قانون مالیات‌های مستقیم</p>
                </div>

                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">سهم کانون وکلا و صندوق حمایت (۴٪)</span>
                  <p className="text-lg font-black font-mono text-purple-400">
                    {Math.round(barAssociationShareRials / 10).toLocaleString("fa-IR")}
                    <span className="text-xs font-sans text-slate-400 mr-1">تومان</span>
                  </p>
                  <p className="text-[10px] text-slate-500">سهم قانونی کانون / مرکز وکلا</p>
                </div>
              </div>

              {/* Total Summary */}
              <div className="p-4 bg-gradient-to-r from-amber-950/30 via-slate-950 to-slate-950 rounded-xl border border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-300 font-bold block">مجموع هزینه‌های قانونی دعوا:</span>
                  <span className="text-xs text-amber-300 font-medium">
                    {numberToPersianWords(Math.round((courtFeeRials + lawyerFeeRials) / 10))} تومان
                  </span>
                </div>
                <div className="text-left font-mono text-xl font-black text-amber-400">
                  {Math.round((courtFeeRials + lawyerFeeRials) / 10).toLocaleString("fa-IR")}
                  <span className="text-xs font-sans text-slate-400 mr-1">تومان</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Diyeh and Arsh 1403 */}
      {activeSubTab === "diyeh" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                تعیین نرخ و ضوابط دیه
              </span>
              <span className="text-[11px] text-amber-400 font-mono">سال ۱۴۰۳ و ۱۴۰۴</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">مقررات ماه‌های حرام (تغلیظ دیه)</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsSacredMonth(false)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border ${
                    !isSacredMonth ? "bg-amber-500 text-slate-950 border-amber-500" : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  ماه عادی (۱۲ میلیارد ریال)
                </button>
                <button
                  type="button"
                  onClick={() => setIsSacredMonth(true)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border ${
                    isSacredMonth ? "bg-amber-500 text-slate-950 border-amber-500" : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  ماه حرام (۱۶ میلیارد ریال)
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                ماه‌های حرام: رجب، ذی‌القعده، ذی‌الحجه و محرم (تغلیظ نیازمند وقوع صدمه و فوت هر دو در ماه حرام است).
              </p>
            </div>

            {/* Common Injuries Quick Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">نوع جراحت یا درصد ارش</label>
              <select
                value={selectedInjury}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedInjury(val);
                  if (val === "harese") setCustomPercent(1);
                  else if (val === "damie") setCustomPercent(2);
                  else if (val === "motelahame") setCustomPercent(3);
                  else if (val === "semhaq") setCustomPercent(4);
                  else if (val === "muzehe") setCustomPercent(5);
                  else if (val === "hasheme") setCustomPercent(10);
                  else if (val === "munaqqele") setCustomPercent(15);
                  else if (val === "mamoome") setCustomPercent(33.33);
                  else if (val === "jaefe") setCustomPercent(33.33);
                  else if (val === "bone_fracture") setCustomPercent(8);
                  else if (val === "full_diyeh") setCustomPercent(100);
                }}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
              >
                <option value="custom">درصد دلخواه (ارش تعیین‌شده توسط پزشکی قانونی)</option>
                <option value="full_diyeh">دیه کامل نفس (۱۰۰٪)</option>
                <option value="harese">جراحت حارصه (خراشیدگی پوست بدون خونریزی - ۱٪)</option>
                <option value="damie">جراحت دامیه (بریدگی با خونریزی اندک - ۲٪)</option>
                <option value="motelahame">جراحت متلاحمه (بریدگی عمیق گوشت - ۳٪)</option>
                <option value="semhaq">جراحت سمحاق (رسیدن جراحت به پوست نازک استخوان - ۴٪)</option>
                <option value="muzehe">جراحت موضحه (پدیدار شدن استخوان سفید - ۵٪)</option>
                <option value="hasheme">جراحت هاشمه (شکستگی استخوان - ۱۰٪)</option>
                <option value="munaqqele">جراحت منقله (جا‌به‌جایی استخوان شکسته - ۱۵٪)</option>
                <option value="mamoome">جراحت مامومه (رسیدن جراحت به کیسه مغز - ۳۳.۳۳٪)</option>
                <option value="jaefe">جراحت جائفه (وارد شدن شیء به حفره شکم یا سینه - ۳۳.۳۳٪)</option>
                <option value="bone_fracture">شکستگی استخوان با عیب و نقص (۸٪)</option>
              </select>
            </div>

            {/* Custom Percent Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">درصد دیه یا ارش:</span>
                <span className="text-amber-400 font-mono font-bold">{customPercent}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="100"
                step="0.1"
                value={customPercent}
                onChange={(e) => {
                  setCustomPercent(Number(e.target.value));
                  setSelectedInjury("custom");
                }}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-sm font-bold text-amber-300">نتیجه محاسبه دیه و ارش</span>
                <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono">
                  {customPercent}% از دیه کامل
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-slate-950/90 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">مبلغ به ریال</span>
                  <p className="text-xl font-mono font-black text-emerald-400">
                    {finalDiyehRials.toLocaleString("fa-IR")}
                    <span className="text-xs font-sans text-slate-400 mr-1">ریال</span>
                  </p>
                </div>
                <div className="p-4 bg-amber-950/30 rounded-xl border border-amber-500/30">
                  <span className="text-xs text-amber-300/80 block mb-1">مبلغ به تومان</span>
                  <p className="text-xl font-mono font-black text-amber-400">
                    {finalDiyehToman.toLocaleString("fa-IR")}
                    <span className="text-xs font-sans text-amber-300 mr-1">تومان</span>
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">مبلغ دیه به حروف:</span>
                <p className="text-xs font-bold text-slate-200">
                  {numberToPersianWords(finalDiyehToman)} تومان ({numberToPersianWords(finalDiyehRials)} ریال)
                </p>
              </div>

              {/* Court Brief Extract */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">بند استنادی در شکواییه و لایحه دیه:</span>
                  <button
                    onClick={() => {
                      const text = `محکومیت متهم به پرداخت ارش و دیه مقدر بر مبنای نظریه پزشکی قانونی به میزان ${customPercent} درصد از دیه کامل مرد مسلمان (معادل ${finalDiyehToman.toLocaleString("fa-IR")} تومان) بر اساس نرخ دیه زمان پرداخت مستنداً به ماده ۴۹۰ و ۷۰۹ قانون مجازات اسلامی مصوب ۱۳۹۲.`;
                      copyToClipboard(text, "diyeh-brief");
                    }}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    {copiedText === "diyeh-brief" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedText === "diyeh-brief" ? "کپی شد" : "کپی متن استناد"}</span>
                  </button>
                </div>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 font-serif leading-relaxed select-all">
                  «تقاضای محکومیت مرتکب به پرداخت دیه مقدر و ارش صدمات وارده به میزان {customPercent} درصد دیه کامل بر طبق گواهی نهایی پزشکی قانونی معادل {finalDiyehToman.toLocaleString("fa-IR")} تومان بر مبنای نرخ زمان اجرای حکم وفق ماده ۴۹۰ قانون مجازات اسلامی.»
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Legal Deadlines and Procedure Calendar */}
      {activeSubTab === "deadlines" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                محاسبه مواعد دادرسی (مواد ۴۴۲ الی ۴۴۶ ق.آ.د.م)
              </span>
              <span className="text-[11px] text-amber-400 font-mono">قانون آیین دادرسی مدنی</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">نوع اقدام قضایی یا مهلت اعتراض</label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
              >
                <option value="appeal">تجدیدنظرخواهی از دادنامه بدوی (۲۰ روز / ۲ ماه)</option>
                <option value="supreme">فرجام‌خواهی در دیوان عالی کشور (۲۰ روز / ۲ ماه)</option>
                <option value="default_judgment">واخواهی از حکم غیابی (۲۰ روز / ۲ ماه)</option>
                <option value="court_order">اعتراض به قرارهای قابل تجدیدنظر دادگاه (۱۰ روز)</option>
                <option value="defect">مهلت رفع نقص دادخواست پس از اخطاریه دفتر (۱۰ روز)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">محل اقامت شخص ابلاغ‌شونده</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsResidentInIran(true)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border ${
                    isResidentInIran ? "bg-amber-500 text-slate-950 border-amber-500" : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  مقیم داخل کشور (۲۰ روز)
                </button>
                <button
                  type="button"
                  onClick={() => setIsResidentInIran(false)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border ${
                    !isResidentInIran ? "bg-amber-500 text-slate-950 border-amber-500" : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  مقیم خارج از کشور (۲ ماه)
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">تاریخ ابلاغ در سامانه ثنا (روزشمار)</label>
              <input
                type="text"
                value={noticeDate}
                onChange={(e) => setNoticeDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-sm focus:border-amber-500 focus:outline-none"
                placeholder="مثال: ۱۴۰۳/۰۸/۱۵"
              />
              <p className="text-[10px] text-slate-400">
                تاریخ مندرج در ابلاغیه الکترونیکی سامانه ابلاغ الکترونیک قضایی (ثنا).
              </p>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
              <p className="font-bold text-slate-300">قواعد آمره احتساب مواعد قانونی:</p>
              <p>• ماده ۴۴۵ ق.آ.د.م: «روز ابلاغ و روز اقدام جزء مدت محسوب نمی‌شود.»</p>
              <p>• ماده ۴۴۴ ق.آ.د.م: چنانچه آخرین روز مهلت مصادف با روز تعطیل باشد، آن روز به حساب نیامده و مهلت در اولین روز پس از تعطیل به پایان می‌رسد.</p>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  نتیجه محاسبه مهلت اعتراض و پایان موعد
                </span>
                <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-emerald-300 font-mono font-bold">
                  {deadlineLawRef}
                </span>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">عنوان اقدام حقوقی:</span>
                  <span className="text-slate-100 font-bold">{deadlineTitle}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">مدت قانونی مهلت:</span>
                  <span className="text-amber-400 font-mono font-black">{deadlineDays} روز کامل</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">نحوه احتساب روزها:</span>
                  <span className="text-emerald-400 font-mono">روز ابلاغ + ۱ الی روز ابلاغ + {deadlineDays} + ۱ روز اقدام</span>
                </div>
              </div>

              <div className="p-4 bg-amber-950/30 rounded-xl border border-amber-500/40 space-y-2">
                <span className="text-xs text-amber-300 font-bold block">ملاحظه مهم جهت جلوگیری از رد دادخواست:</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  توصیه می‌شود ثبت دادخواست یا لایحه را به روزهای پایانی موعد موکول نفرمایید، زیرا هرگونه قطعی سامانه خدمات الکترونیک قضایی یا دفاتر خدمات قضایی عذر موجه موضوع ماده ۳۰۶ تلقی نمی‌گردد.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    const text = `اخطار قانونی موعد: تاریخ ابلاغ دادنامه: ${noticeDate} | اقدام: ${deadlineTitle} | مهلت قانونی: ${deadlineDays} روز کامل مستنداً به ${deadlineLawRef} و مواد ۴۴۲ الی ۴۴۶ قانون آیین دادرسی مدنی (روز ابلاغ و اقدام جزء مدت احتساب نمی‌شود).`;
                    copyToClipboard(text, "deadline-note");
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {copiedText === "deadline-note" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedText === "deadline-note" ? "یادداشت موعد کپی شد" : "کپی گزارش موعد دادرسی در پرونده"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Tab 5: Mehrieh to Today's Rate (تبصره ماده ۱۰۸۲ قانون مدنی) */}
      {activeSubTab === "mehrieh" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-amber-400" />
                اطلاعات سند نکاحیه و مهریه
              </span>
              <span className="text-[11px] text-amber-400 font-mono">تبصره ماده ۱۰۸۲ ق.م</span>
            </div>

            {/* Mehrieh Type: Cash or Coins */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">نوع تعهد مهریه</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMehriehType("cash")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    mehriehType === "cash"
                      ? "bg-amber-500 text-slate-950 border-amber-500"
                      : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  وجه نقد (ریال / تومان)
                </button>
                <button
                  type="button"
                  onClick={() => setMehriehType("coin")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    mehriehType === "coin"
                      ? "bg-amber-500 text-slate-950 border-amber-500"
                      : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  سکه تمام بهار آزادی
                </button>
              </div>
            </div>

            {mehriehType === "cash" ? (
              <>
                {/* Cash Amount */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">مبلغ مهریه در سند ازدواج</label>
                    <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setMehriehCashUnit("toman")}
                        className={`px-2 py-0.5 rounded ${mehriehCashUnit === "toman" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400"}`}
                      >
                        تومان
                      </button>
                      <button
                        type="button"
                        onClick={() => setMehriehCashUnit("rial")}
                        className={`px-2 py-0.5 rounded ${mehriehCashUnit === "rial" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400"}`}
                      >
                        ریال
                      </button>
                    </div>
                  </div>
                  <input
                    type="number"
                    value={mehriehCashAmount}
                    onChange={(e) => setMehriehCashAmount(Number(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-sm focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400">
                    به حروف: <strong className="text-amber-300">{numberToPersianWords(mehriehCashAmount)} {mehriehCashUnit === "toman" ? "تومان" : "ریال"}</strong>
                  </p>
                </div>

                {/* Contract Year */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">سال وقوع و ثبت رسمی عقد</label>
                  <select
                    value={mehriehContractYear}
                    onChange={(e) => setMehriehContractYear(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none font-mono"
                  >
                    {Object.keys(CBI_ANNUAL_INDICES).map((yr) => (
                      <option key={yr} value={yr}>سال {yr}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400">
                    شاخص بانک مرکزی سال عقد ({mehriehContractYear}): <strong className="text-amber-300 font-mono">{contractIdx.toFixed(2)}</strong>
                  </p>
                </div>

                {/* Husband Status: Alive / Deceased */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <label className="text-xs font-semibold text-slate-300">وضعیت حیات زوج (بدهکار مهریه)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsHusbandDeceased(false)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border ${
                        !isHusbandDeceased ? "bg-amber-500/20 text-amber-300 border-amber-500/60" : "bg-slate-950 text-slate-400 border-slate-800"
                      }`}
                    >
                      زوج در قید حیات است
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsHusbandDeceased(true)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border ${
                        isHusbandDeceased ? "bg-amber-500/20 text-amber-300 border-amber-500/60" : "bg-slate-950 text-slate-400 border-slate-800"
                      }`}
                    >
                      زوج فوت کرده است
                    </button>
                  </div>
                </div>

                {isHusbandDeceased ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">سال فوت زوج</label>
                    <select
                      value={husbandDeathYear}
                      onChange={(e) => setHusbandDeathYear(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none font-mono"
                    >
                      {Object.keys(CBI_ANNUAL_INDICES).map((yr) => (
                        <option key={yr} value={yr}>سال {yr}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400">
                      ملاک محاسبه: شاخص سال فوت زوج ({effectivePriorYear}) = <strong className="text-emerald-400 font-mono">{priorYearIdx.toFixed(2)}</strong>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">سال مطالبه یا صدور اجراییه</label>
                    <select
                      value={mehriehDemandYear}
                      onChange={(e) => setMehriehDemandYear(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none font-mono"
                    >
                      {Object.keys(CBI_ANNUAL_INDICES).map((yr) => (
                        <option key={yr} value={yr}>سال {yr}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400">
                      ملاک آیین‌نامه اجرایی: شاخص سال قبل از مطالبه ({effectivePriorYear}) = <strong className="text-emerald-400 font-mono">{priorYearIdx.toFixed(2)}</strong>
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Coin count & Price */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">تعداد سکه بهار آزادی مندرج در عقدنامه</label>
                  <input
                    type="number"
                    value={mehriehCoinsCount}
                    onChange={(e) => setMehriehCoinsCount(Number(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">قیمت روز هر سکه بهار آزادی (تومان)</label>
                  <input
                    type="number"
                    value={goldCoinPriceToman}
                    onChange={(e) => setGoldCoinPriceToman(Number(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-sm focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400">
                    معادل: <strong className="text-amber-300">{numberToPersianWords(goldCoinPriceToman)} تومان</strong>
                  </p>
                </div>
              </>
            )}

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
              <p className="font-bold text-slate-300">مستند قانونی محاسبه:</p>
              <p>• ماده واحده قانون الحاق یک تبصره به ماده ۱۰۸۲ قانون مدنی مصوب ۱۳۷۶/۰۴/۲۹ مجلس شورای اسلامی.</p>
              <p>• فرمول آیین‌نامه هیأت وزیران: (مبلغ مهریه × شاخص سال قبل از مطالبه) ÷ شاخص سال وقوع عقد.</p>
            </div>
          </div>

          {/* Mehrieh Results */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-amber-400" />
                  نتیجه رسمی محاسبه ارزش روز مهریه
                </span>
                <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-emerald-300 font-mono font-bold">
                  تبصره ماده ۱۰۸۲ ق.م
                </span>
              </div>

              {mehriehType === "cash" ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 block">شاخص سال عقد ({mehriehContractYear})</span>
                      <span className="text-xs font-mono font-bold text-slate-200">{contractIdx.toFixed(2)}</span>
                    </div>
                    <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 block">شاخص سال مبنا ({effectivePriorYear})</span>
                      <span className="text-xs font-mono font-bold text-slate-200">{priorYearIdx.toFixed(2)}</span>
                    </div>
                    <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1 col-span-2 md:col-span-1">
                      <span className="text-[10px] text-slate-400 block">ضریب رشد ارزش</span>
                      <span className="text-xs font-mono font-bold text-amber-400">{mehriehRatio.toFixed(2)} برابر</span>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-950/30 rounded-xl border border-emerald-500/40 space-y-2">
                    <span className="text-xs text-emerald-400 font-bold block">مبلغ مهریه تعدیل‌شده به نرخ روز:</span>
                    <div className="text-2xl font-black text-white font-mono flex items-baseline gap-2">
                      <span>{updatedMehriehTomans.toLocaleString()}</span>
                      <span className="text-sm font-sans font-normal text-slate-300">تومان</span>
                    </div>
                    <div className="text-xs text-slate-300 pt-1 border-t border-emerald-900/60 font-mono">
                      معادل: <strong className="text-emerald-300">{updatedMehriehRials.toLocaleString()} ریال</strong>
                    </div>
                    <p className="text-xs text-amber-300 pt-1 leading-relaxed">
                      به حروف: <strong>{numberToPersianWords(updatedMehriehTomans)} تومان</strong>
                    </p>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-amber-950/30 rounded-xl border border-amber-500/40 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">تعداد کل مسکوکات:</span>
                    <span className="text-amber-300 font-bold font-mono">{mehriehCoinsCount} سکه بهار آزادی</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">نرخ روز هر سکه:</span>
                    <span className="text-slate-100 font-mono">{goldCoinPriceToman.toLocaleString()} تومان</span>
                  </div>
                  <div className="pt-2 border-t border-amber-900/60">
                    <span className="text-xs text-amber-300 font-bold block mb-1">ارزش روز مجموع سکه‌ها:</span>
                    <div className="text-2xl font-black text-white font-mono flex items-baseline gap-2">
                      <span>{coinsTotalTomans.toLocaleString()}</span>
                      <span className="text-sm font-sans font-normal text-slate-300">تومان</span>
                    </div>
                    <p className="text-xs text-slate-300 pt-1">
                      به حروف: <strong className="text-amber-300">{numberToPersianWords(coinsTotalTomans)} تومان</strong>
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950/80 rounded-lg text-[11px] text-slate-400 space-y-1">
                    <p className="text-amber-300 font-bold">• قانون حمایت خانواده مصوب ۱۳۹۱ (ماده ۲۲):</p>
                    <p>وصول مهریه تا سقف ۱۱۰ سکه تمام بهار آزادی یا معادل ریالی آن مشمول ماده ۳ قانون نحوه اجرای محکومیت‌های مالی و حبس مدیون است. مازاد بر آن منوط به احراز ملائت مالی زوج می‌باشد.</p>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={() => {
                    const text = mehriehType === "cash"
                      ? `گزارش رسمی تعدیل مهریه به نرخ روز:\nمستند قانونی: تبصره الحاقی به ماده ۱۰۸۲ قانون مدنی و آیین‌نامه اجرایی\nمبلغ مندرج در سند ازدواج: ${mehriehCashAmount.toLocaleString()} ${mehriehCashUnit === "toman" ? "تومان" : "ریال"}\nسال وقوع عقد: ${mehriehContractYear} (شاخص: ${contractIdx})\nسال مبنای محاسبه: ${effectivePriorYear} (شاخص: ${priorYearIdx})\nمبلغ نهایی مهریه به نرخ روز: ${updatedMehriehTomans.toLocaleString()} تومان (${numberToPersianWords(updatedMehriehTomans)} تومان).`
                      : `گزارش مهریه سکه بهار آزادی:\nتعداد مسکوکات: ${mehriehCoinsCount} سکه تمام بهار آزادی\nبهای روز هر سکه: ${goldCoinPriceToman.toLocaleString()} تومان\nمجموع ارزش روز: ${coinsTotalTomans.toLocaleString()} تومان (${numberToPersianWords(coinsTotalTomans)} تومان)\nمستند به ماده ۲۲ قانون حمایت خانواده مصوب ۱۳۹۱.`;
                    copyToClipboard(text, "mehrieh-note");
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {copiedText === "mehrieh-note" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedText === "mehrieh-note" ? "متن گزارش کپی شد" : "کپی گزارش جهت درج در دادخواست مهریه"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Inheritance Calculator (تقسیم ماترک طبقه اول مواد ۸۶۱ الی ۹۰۷ قانون مدنی) */}
      {activeSubTab === "inheritance" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                مشخصات متوفی و ورثه طبقه اول
              </span>
              <span className="text-[11px] text-amber-400 font-mono">مواد ۸۶۱ الی ۹۰۷ ق.م</span>
            </div>

            {/* Estate Amount */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">کل ارزش خالص ماترک (تومان)</label>
              <input
                type="number"
                value={estateTotalTomans}
                onChange={(e) => setEstateTotalTomans(Number(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-sm focus:outline-none"
              />
              <p className="text-[11px] text-slate-400">
                به حروف: <strong className="text-amber-300">{numberToPersianWords(estateTotalTomans)} تومان</strong>
              </p>
              <p className="text-[10px] text-slate-500">
                * ارزش ترکه پس از کسر بدهی‌ها، مهریه، وصایا (تا ۱/۳) و هزینه‌های واجب کفن‌ودفن.
              </p>
            </div>

            {/* Deceased Gender */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">جنسیت متوفی</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeceasedGender("male")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border ${
                    deceasedGender === "male" ? "bg-amber-500 text-slate-950 border-amber-500" : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  متوفی مرد است (دارای زوجه)
                </button>
                <button
                  type="button"
                  onClick={() => setDeceasedGender("female")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border ${
                    deceasedGender === "female" ? "bg-amber-500 text-slate-950 border-amber-500" : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  متوفی زن است (دارای زوج)
                </button>
              </div>
            </div>

            {/* Spouse in Life */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">همسر دائمی در قید حیات است؟</label>
                <input
                  type="checkbox"
                  checked={hasSpouse}
                  onChange={(e) => setHasSpouse(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
              </div>
              {hasSpouse && deceasedGender === "male" && (
                <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs">
                  <span className="text-slate-400">تعداد همسران دائمی همزمان:</span>
                  <select
                    value={wivesCount}
                    onChange={(e) => setWivesCount(Number(e.target.value))}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs"
                  >
                    <option value={1}>۱ همسر</option>
                    <option value={2}>۲ همسر</option>
                    <option value={3}>۳ همسر</option>
                    <option value={4}>۴ همسر</option>
                  </select>
                </div>
              )}
            </div>

            {/* Parents */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block">والدین متوفی در قید حیات:</label>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasFather}
                    onChange={(e) => setHasFather(e.target.checked)}
                    className="accent-amber-500"
                  />
                  <span className="text-slate-200">پدر متوفی</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasMother}
                    onChange={(e) => setHasMother(e.target.checked)}
                    className="accent-amber-500"
                  />
                  <span className="text-slate-200">مادر متوفی</span>
                </label>
              </div>
            </div>

            {/* Children */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block">فرزندان متوفی:</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">تعداد پسران:</span>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={sonsCount}
                    onChange={(e) => setSonsCount(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono text-center"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">تعداد دختران:</span>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={daughtersCount}
                    onChange={(e) => setDaughtersCount(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono text-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Inheritance Results */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  جدول تسهیم قانونی سهم‌الارث ورثه
                </span>
                <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-emerald-300 font-mono font-bold">
                  طبقه اول انحصار وراثت
                </span>
              </div>

              {/* Shares Breakdown Table */}
              <div className="space-y-2">
                {hasSpouse && (
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white block">همسر ({deceasedGender === "male" ? "زوجه" : "زوج"})</span>
                      <span className="text-[10px] text-slate-400">{spouseRule}</span>
                    </div>
                    <div className="text-left">
                      <span className="font-mono font-bold text-amber-400 text-sm block">
                        {deceasedGender === "male" && wivesCount > 1
                          ? `هر همسر: ${eachWifeToman.toLocaleString()} تومان`
                          : `${spouseTotalToman.toLocaleString()} تومان`}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{spousePercent.toFixed(2)}٪ از کل ماترک</span>
                    </div>
                  </div>
                )}

                {hasFather && (
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white block">پدر متوفی</span>
                      <span className="text-[10px] text-slate-400">{fatherRule}</span>
                    </div>
                    <div className="text-left">
                      <span className="font-mono font-bold text-slate-100 text-sm block">{fatherTotalToman.toLocaleString()} تومان</span>
                      <span className="text-[10px] text-slate-400 font-mono">{fatherPercent.toFixed(2)}٪ از کل ماترک</span>
                    </div>
                  </div>
                )}

                {hasMother && (
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white block">مادر متوفی</span>
                      <span className="text-[10px] text-slate-400">{motherRule}</span>
                    </div>
                    <div className="text-left">
                      <span className="font-mono font-bold text-slate-100 text-sm block">{motherTotalToman.toLocaleString()} تومان</span>
                      <span className="text-[10px] text-slate-400 font-mono">{motherPercent.toFixed(2)}٪ از کل ماترک</span>
                    </div>
                  </div>
                )}

                {sonsCount > 0 && (
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-emerald-300 block">پسران ({sonsCount} نفر)</span>
                      <span className="text-[10px] text-slate-400">به نسبت ۲ برابر سهم دختر (ماده ۹۰۷ ق.م)</span>
                    </div>
                    <div className="text-left">
                      <span className="font-mono font-bold text-emerald-400 text-sm block">هر پسر: {eachSonToman.toLocaleString()} تومان</span>
                      <span className="text-[10px] text-slate-400 font-mono">مجموع: {(eachSonToman * sonsCount).toLocaleString()} تومان</span>
                    </div>
                  </div>
                )}

                {daughtersCount > 0 && (
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-purple-300 block">دختران ({daughtersCount} نفر)</span>
                      <span className="text-[10px] text-slate-400">به نسبت ۱ سهم (ماده ۹۰۷ ق.م)</span>
                    </div>
                    <div className="text-left">
                      <span className="font-mono font-bold text-purple-400 text-sm block">هر دختر: {eachDaughterToman.toLocaleString()} تومان</span>
                      <span className="text-[10px] text-slate-400 font-mono">مجموع: {(eachDaughterToman * daughtersCount).toLocaleString()} تومان</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Total Check Note */}
              <div className="p-3.5 bg-slate-950/90 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                <span className="text-slate-400">کل ترکه مورد تسهیم:</span>
                <span className="font-mono font-bold text-white text-sm">{estateTotalTomans.toLocaleString()} تومان</span>
              </div>

              <div className="p-3.5 bg-amber-950/30 rounded-xl border border-amber-500/40 text-[11px] text-slate-300 space-y-1 leading-relaxed">
                <span className="font-bold text-amber-300 block">مستندات قانونی قانون مدنی:</span>
                <p>• ماده ۹۰۷ ق.م: «اگر متوفی ابوین نداشته و یک یا چند نفر اولاد داشته باشد... اگر اولاد متعدد باشند و بعضی از آن‌ها پسر و بعضی دختر، پسر دو برابر دختر می‌برد.»</p>
                <p>• ماده ۹۴۰ الی ۹۴۹ ق.م در خصوص سهم زوجه و زوج از ماترک متوفی.</p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    let text = `صورت تقسیم قانونی ترکه (انحصار وراثت طبقه اول):\nمجموع ارزش ماترک: ${estateTotalTomans.toLocaleString()} تومان (${numberToPersianWords(estateTotalTomans)} تومان)\n`;
                    if (hasSpouse) text += `• سهم همسر: ${spouseTotalToman.toLocaleString()} تومان (${spouseRule})\n`;
                    if (hasFather) text += `• سهم پدر: ${fatherTotalToman.toLocaleString()} تومان\n`;
                    if (hasMother) text += `• سهم مادر: ${motherTotalToman.toLocaleString()} تومان\n`;
                    if (sonsCount > 0) text += `• سهم هر پسر (${sonsCount} پسر): ${eachSonToman.toLocaleString()} تومان\n`;
                    if (daughtersCount > 0) text += `• سهم هر دختر (${daughtersCount} دختر): ${eachDaughterToman.toLocaleString()} تومان\n`;
                    text += `مستنداً به مواد ۸۶۱ الی ۹۰۷ قانون مدنی جمهوری اسلامی ایران.`;
                    copyToClipboard(text, "inheritance-note");
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {copiedText === "inheritance-note" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedText === "inheritance-note" ? "صورت تقسیم ترکه کپی شد" : "کپی صورت‌جلسه تقسیم ترکه جهت الصاق به پرونده"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
