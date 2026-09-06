import fs from "fs";
import path from "path";
import https from "https";

export interface ExtractedJudgeSource {
  id: string;
  source_type: "LAW" | "REGULATION" | "CIRCULAR" | "JUDICIAL_PRECEDENT" | "UNITY_JUDGMENT" | "SUPREME_COURT_DECISION";
  title: string;
  document_number?: string;
  date?: string;
  authority: string;
  category: "حقوق مدنی" | "کیفری و جزا" | "آیین دادرسی" | "دیوان عدالت اداری و اداری" | "آرای وحدت رویه" | "حقوق تجارت و شرکت‌ها" | "خانواده و امور حسبی" | "کار و تأمین اجتماعی" | "املاک و اراضی و ثبت" | "مالیات و گمرک";
  text: string;
  keywords: string[];
  metadata: {
    judge_id: number;
    case_no?: string;
    court_type?: string;
    court_branch?: string;
    judges?: string;
    holding?: string;
    legal_basis?: string;
    opinion_type?: string;
    source_url: string;
    attribute_url: string;
    binding: boolean;
    source_platform: string;
  };
  created_at?: string;
}

const OUTPUT_FILE = path.join(process.cwd(), "server", "data", "ara_jri_judges_100_to_1000.json");

const agent = new https.Agent({
  keepAlive: true,
  maxSockets: 30,
  timeout: 10000
});

function httpGet(url: string, timeout = 9000): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      agent,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      },
      timeout
    }, (res) => {
      let data = "";
      res.setEncoding("utf8");
      res.on("data", chunk => { data += chunk; });
      res.on("end", () => resolve(data));
    });

    req.on("error", (err) => reject(err));
    req.on("timeout", () => {
      req.destroy(new Error("Request timed out"));
    });
  });
}

function detectCategory(title: string, holding: string, text: string): ExtractedJudgeSource["category"] {
  const combined = (title + " " + holding + " " + text.slice(0, 1500)).toLowerCase();

  if (/سرقت|کلاهبرداری|خیانت در امانت|دیه|قتل|جرم|کیفر|مجازات|مواد مخدر|شلاق|زندان|حبس|تعزیر|قصاص|اتهام|شکایت کیفری|ضرب و جرح|جعل|کلاهبردار|قاچاق/.test(combined)) {
    return "کیفری و جزا";
  }
  if (/طلاق|مهریه|نفقه|تمکین|حضانت|مهرالمسمی|اجرت‌المثل|ولایت|ترکه|ارث|وصیت|متوفی|امور حسبی|موت فرضی|قیمومیت/.test(combined)) {
    return "خانواده و امور حسبی";
  }
  if (/داور|داوری|ابلاغ|صلاحیت|تجدیدنظر|فرجام|واخواهی|رد دادرس|اجرای احکام|ماده ۳۵۸|ماده ۴۸۹|ماده ۵۲۲|هزینه دادرسی|دستور موقت|تأمین خواسته|دادخواست|رد دعوی/.test(combined)) {
    return "آیین دادرسی";
  }
  if (/دیوان عدالت|ابطال مصوبه|شهرداری|کمیسیون ماده ۱۰۰|کارمند|تخلفات اداری|بیمه خدمات درمانی|دولتی|دستگاه اجرایی/.test(combined)) {
    return "دیوان عدالت اداری و اداری";
  }
  if (/چک|سفته|برات|ورشکستگی|اسناد تجاری|شرکت|ثبت شرکت|هیأت مدیره|مدیرعامل|سهام|تاجر|تجاری/.test(combined)) {
    return "حقوق تجارت و شرکت‌ها";
  }
  if (/کارگر|کارفرما|تأمین اجتماعی|قانون کار|بیمه بیکاری|اخراج|حق سنوات|اداره کار|حوادث ناشی از کار/.test(combined)) {
    return "کار و تأمین اجتماعی";
  }
  if (/ملک|زمین|اراضی|سند رسمی|ماده ۱۴۷|ثبت اسناد|افراز|دستور فروش|خلع ید|تصرف عدوانی|اجاره|مستأجر|سرقفلی|حق کسب و پیشه|مستغل|پلاک ثبتی/.test(combined)) {
    return "املاک و اراضی و ثبت";
  }
  if (/مالیات|دارایی|گمرک|ارزش افزوده|ممیز مالیاتی/.test(combined)) {
    return "مالیات و گمرک";
  }
  return "حقوق مدنی";
}

async function extractJudgeRecord(id: number): Promise<ExtractedJudgeSource | null> {
  const textUrl = `https://ara.jri.ac.ir/Judge/Text/${id}`;
  const attrUrl = `https://ara.jri.ac.ir/Judge/Attribute/${id}`;

  let textHtml = "";
  let attrHtml = "";

  // Fetch Text
  try {
    textHtml = await httpGet(textUrl, 10000);
  } catch (e: any) {
    try {
      // Retry once
      await new Promise(r => setTimeout(r, 800));
      textHtml = await httpGet(textUrl, 12000);
    } catch (e2: any) {
      console.warn(`[Skip ID ${id}] Text fetch failed: ${e2.message}`);
      return null;
    }
  }

  // Fetch Attribute (optional fallback)
  try {
    attrHtml = await httpGet(attrUrl, 8000);
  } catch (e: any) {
    // If attribute fetch fails, we continue with empty attribute html
    attrHtml = "";
  }

  // Parse Title
  let rawTitle = textHtml.match(/<h1 class=[\x27"]Title3D[\x27"][^>]*>([\s\S]*?)<\/h1>/i)?.[1] || "";
  let cleanTitle = rawTitle.replace(/<[^>]+>/g, "").replace(/^[\s\S]*?عنوان\s*:\s*/i, "").replace(/\s+/g, " ").trim();
  if (!cleanTitle) {
    const tMatch = textHtml.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() || "";
    cleanTitle = tMatch.replace(/^[\s\S]*?عنوان\s*:\s*/i, "").trim() || `دادنامه شماره ${id}`;
  }
  const title = cleanTitle;

  // Parse Holding (پیام رأی)
  let holding = textHtml.match(/<b>پیام:\s*<\/b>([\s\S]*?)<\/span>/i)?.[1] || "";
  holding = holding.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

  // Parse Legal Basis (مستندات)
  let legalBasis = textHtml.match(/<b>مستندات:\s*<\/b>([\s\S]*?)<\/div>/i)?.[1] || "";
  legalBasis = legalBasis.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

  // Parse Document Number and Date from Text page header
  const docNumMatch = textHtml.match(/<b>شماره دادنامه قطعی\s*:<\/b>\s*<br\s*\/?>\s*([0-9]+)/i);
  let docNumber = docNumMatch ? docNumMatch[1].trim() : "";

  const dateMatch = textHtml.match(/<b>\s*تاریخ دادنامه قطعی\s*:<\/b>\s*<br\s*\/?>\s*([0-9\/\-]+)/i);
  let date = dateMatch ? dateMatch[1].trim() : "";

  // Court type from select in Text page
  const selectCourtMatch = textHtml.match(/<select[^>]*id="Judge_ID"[^>]*>[\s\S]*?<option[^>]*>([\s\S]*?)<\/option>/i);
  let courtTypeFromText = selectCourtMatch ? selectCourtMatch[1].trim() : "";

  // Parse Attribute Table if present
  let branch = "";
  let judges = "";
  let courtType = courtTypeFromText || "دادگاه تجدیدنظر استان";
  let opinionType = "رأی شعبه";

  if (attrHtml) {
    const table = attrHtml.match(/<table class="TableForm">([\s\S]*?)<\/table>/i)?.[1] || "";
    const rows = table.match(/<tr>([\s\S]*?)<\/tr>/gi) || [];
    const meta: Record<string, string> = {};
    for (const row of rows) {
      const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
      if (cells && cells.length >= 2) {
        const k = cells[0].replace(/<[^>]+>/g, "").replace(/[*:]/g, "").replace(/\s+/g, " ").trim();
        const v = cells[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
        if (k && v) meta[k] = v;
      }
    }
    if (meta["شماره دادنامه"]) docNumber = meta["شماره دادنامه"];
    if (meta["تاریخ دادنامه"]) date = meta["تاریخ دادنامه"];
    if (meta["نوع مرجع"]) courtType = meta["نوع مرجع"];
    if (meta["شعبه"]) branch = meta["شعبه"];
    if (meta["قاضی"]) judges = meta["قاضی"];
    if (meta["نوع رأی"]) opinionType = meta["نوع رأی"];
  }

  // Parse Judgment Text from treeText
  let judgmentText = "";
  const startIdx = textHtml.indexOf("id=\"treeText\"");
  if (startIdx !== -1) {
    const afterStart = textHtml.slice(startIdx);
    const contentStart = afterStart.indexOf(">") + 1;
    let rawContent = afterStart.slice(contentStart);
    const dropIdx = rawContent.indexOf("<div class=\"dropdown");
    if (dropIdx !== -1) {
      rawContent = rawContent.slice(0, dropIdx);
    } else {
      const endDiv = rawContent.indexOf("</div>");
      if (endDiv !== -1) rawContent = rawContent.slice(0, endDiv);
    }
    judgmentText = rawContent
      .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n\n【$1】\n")
      .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n\n【$1】\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<p[^>]*>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  // Extract branch or judges from judgmentText if still empty
  if (!branch) {
    const bMatch = judgmentText.match(/رئیس شعب[هۀ]\s*(\d+[^\n\-]+)/);
    if (bMatch) branch = `شعبه ${bMatch[1].trim()}`;
  }
  if (!judges) {
    const jMatch = judgmentText.match(/مستشار دادگاه\s*\n\s*([^\n]+)/);
    if (jMatch) judges = jMatch[1].trim();
  }

  const category = detectCategory(title, holding, judgmentText);

  let authority = branch ? `${branch} (${courtType})` : `${courtType} (سامانه ملی آرای قضایی)`;
  let sourceType: ExtractedJudgeSource["source_type"] = "JUDICIAL_PRECEDENT";
  let isBinding = false;

  if (courtType.includes("دیوان عالی") || title.includes("دیوان عالی")) {
    sourceType = "SUPREME_COURT_DECISION";
  }
  if (title.includes("وحدت رویه") || holding.includes("وحدت رویه") || opinionType.includes("وحدت رویه")) {
    sourceType = "UNITY_JUDGMENT";
    isBinding = true;
  }

  // Compose text sections
  const textSections: string[] = [];
  textSections.push(`【عنوان و موضوع دادنامه】:\n${title}`);
  if (holding) {
    textSections.push(`【پیام حقوقی و مبنای تصمیم دادگاه】:\n${holding}`);
  }
  textSections.push(`【مشخصات دادرسی و ارکان پرونده】:\n• شماره دادنامه: ${docNumber || id}\n• تاریخ صدور دادنامه: ${date || "نامشخص"}\n• نوع مرجع رسیدگی: ${courtType}\n• شعبه صادرکننده: ${branch || "شعبه رسیدگی‌کننده"}\n• قضات دادگاه: ${judges || "نامشخص"}\n• نوع رأی: ${opinionType}`);
  if (legalBasis) {
    textSections.push(`【مستندات قانونی استنادی】:\n${legalBasis}`);
  }
  if (judgmentText) {
    textSections.push(`【متن صریح و گردشکار دادنامه】:\n${judgmentText}`);
  }

  const fullText = textSections.join("\n\n");

  const keywordsSet = new Set<string>([
    "رویه قضایی",
    "دادنامه",
    "سامانه ملی آرای قضایی",
    "ara.jri.ac.ir",
    `دادنامه ${id}`,
    category
  ]);
  if (branch) keywordsSet.add(branch);
  if (docNumber) keywordsSet.add(docNumber);
  if (courtType) keywordsSet.add(courtType);
  if (judges) {
    for (const j of judges.split(/[,،\-\/]+/)) {
      const cleanJ = j.trim();
      if (cleanJ.length > 2) keywordsSet.add(`قاضی ${cleanJ}`);
    }
  }
  for (const w of (title + " " + holding).split(/[\s،؛:\(\)\-\.\/]+/)) {
    if (w.length >= 4 && !/^(برای|اینکه|نسبت|توسط|گردیده|می‌باشد|صادره|مورخه|موضوع|حکایت|اشعار|مراتب|دادنامه)$/.test(w)) {
      keywordsSet.add(w);
    }
  }

  return {
    id: `src-jri-judge-${id}`,
    source_type: sourceType,
    title: `دادنامه شماره ${docNumber || id}: ${title}`,
    document_number: docNumber || String(id),
    date: date || "نامشخص",
    authority: authority,
    category: category,
    text: fullText,
    keywords: Array.from(keywordsSet).slice(0, 15),
    metadata: {
      judge_id: id,
      case_no: docNumber,
      court_type: courtType,
      court_branch: branch,
      judges: judges,
      holding: holding,
      legal_basis: legalBasis,
      opinion_type: opinionType,
      source_url: textUrl,
      attribute_url: attrUrl,
      binding: isBinding,
      source_platform: "سامانه ملی آرای قضایی - پژوهشگاه قوه قضاییه"
    },
    created_at: date || "۱۴۰۳/۰۱/۰۱"
  };
}

async function main() {
  const START_ID = 100;
  const END_ID = 1000;
  const TOTAL = END_ID - START_ID + 1; // 901
  const NUM_WORKERS = 20;

  console.log(`=== شروع استخراج دادنامه‌های ۱۰۰ تا ۱۰۰۰ (${TOTAL} دادنامه) ===`);

  const dir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const recordsMap = new Map<number, ExtractedJudgeSource>();
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      const raw = fs.readFileSync(OUTPUT_FILE, "utf-8");
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        for (const item of list) {
          if (item.metadata?.judge_id) {
            recordsMap.set(item.metadata.judge_id, item);
          }
        }
        console.log(`Loaded ${recordsMap.size} already extracted records.`);
      }
    } catch (e) {
      console.warn("Could not parse existing output file.");
    }
  }

  const idsQueue: number[] = [];
  for (let id = START_ID; id <= END_ID; id++) {
    if (!recordsMap.has(id)) {
      idsQueue.push(id);
    }
  }

  console.log(`Remaining IDs to fetch: ${idsQueue.length}`);
  if (idsQueue.length === 0) {
    console.log("All IDs already extracted!");
    return;
  }

  let queueIdx = 0;
  let completedSinceLastSave = 0;

  const saveToDisk = () => {
    const list = Array.from(recordsMap.values()).sort((a, b) => a.metadata.judge_id - b.metadata.judge_id);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(list, null, 2), "utf-8");
  };

  async function worker(workerId: number) {
    while (true) {
      let currentId: number;
      // Thread-safe-ish index increment in single-threaded JS event loop
      if (queueIdx >= idsQueue.length) {
        break;
      }
      currentId = idsQueue[queueIdx++];

      const res = await extractJudgeRecord(currentId);
      if (res) {
        recordsMap.set(currentId, res);
      }
      completedSinceLastSave++;

      if (completedSinceLastSave >= 20 || queueIdx >= idsQueue.length) {
        completedSinceLastSave = 0;
        saveToDisk();
        console.log(`Progress: ${recordsMap.size}/${TOTAL} extracted (${Math.round((recordsMap.size / TOTAL) * 100)}%)`);
      }
    }
  }

  const workers = Array.from({ length: NUM_WORKERS }, (_, i) => worker(i + 1));
  await Promise.all(workers);

  saveToDisk();
  console.log(`\n=== پایان استخراج! تعداد کل دادنامه‌ها: ${recordsMap.size} ===`);
  console.log(`مسیر فایل خروجی: ${OUTPUT_FILE}`);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
