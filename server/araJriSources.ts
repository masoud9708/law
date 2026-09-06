import fs from "fs";
import path from "path";
import { LegalSource } from "./db";
import { buildEnrichedLegalSource } from "./enrichAllPages";

/**
 * مجموعه آراء و مستندات قانونی استخراج‌شده از سامانه ملی آرای قضایی پژوهشگاه قوه قضاییه (صفحات ۱ تا ۷۱)
 * مرجع رسمی: https://ara.jri.ac.ir/Law/Index?layout=True&page=5&Slayout=True
 */
export const DETAILED_ARA_JRI_SOURCES: LegalSource[] = [
  {
    id: "src-jri-852",
    source_type: "UNITY_JUDGMENT",
    title: "رأی وحدت رویه شماره ۸۵۲ هیأت عمومی دیوان عالی کشور (ترهین مال غیر با سند عادی)",
    document_number: "۸۵۲",
    date: "۱۴۰۳/۰۶/۲۰",
    authority: "هیأت عمومی دیوان عالی کشور (سامانه ملی آرای قضایی)",
    category: "آرای وحدت رویه",
    text: "هرگاه شخصی با علم به اینکه مالی را قبلاً با سند عادی به دیگری منتقل کرده، آن را بدون مجوز قانونی نزد بانک یا مراجع قضایی در رهن یا وثیقه قرار دهد، این اقدام انطباق کامل با ماده ۲ قانون مجازات اشخاصی که مال غیر را به عوض مال خود معرفی می‌نمایند مصوب ۱۳۰۸ داشته و مرتکب در حکم کلاهبردار شناخته می‌شود و به مجازات شروع به کلاهبرداری یا کلاهبرداری تام محکوم می‌گردد.",
    keywords: ["رأی وحدت رویه ۸۵۲", "انتقال مال غیر", "سند عادی", "رهن نزد بانک", "کلاهبرداری", "وثیقه‌گذاری مال غیر", "ara.jri.ac.ir"],
    metadata: {
      citation_code: "1403/852",
      binding: true,
      source_url: "https://ara.jri.ac.ir/Law/Index?layout=True&page=5&Slayout=True",
      page: 5,
      source_platform: "سامانه ملی آرای قضایی - پژوهشگاه قوه قضاییه"
    },
    created_at: "۱۴۰۳/۰۶/۲۰"
  },
  {
    id: "src-jri-851",
    source_type: "UNITY_JUDGMENT",
    title: "رأی وحدت رویه شماره ۸۵۱ هیأت عمومی دیوان عالی کشور (صلاحیت دعاوی تعهدات شعب بانک)",
    document_number: "۸۵۱",
    date: "۱۴۰۳/۰۶/۲۰",
    authority: "هیأت عمومی دیوان عالی کشور (سامانه ملی آرای قضایی)",
    category: "آرای وحدت رویه",
    text: "با توجه به اینکه شعب بانک‌ها واحدهای اجرایی و متعهد در قبال مشتریان هستند، دعاوی ناشی از تعهدات و تسهیلات هر شعبه در صلاحیت دادگاه عمومی حقوقی محل استقرار همان شعبه است؛ در صورت ادغام بانک‌ها نیز شعبه جدید به عنوان قائم‌مقام شناخته شده و صلاحیت محلی دادگاه محل استقرار شعبه حفظ می‌گردد.",
    keywords: ["رأی وحدت رویه ۸۵۱", "صلاحیت دادگاه", "شعب بانک", "قرارداد تسهیلات", "ادغام بانک‌ها", "اقامتگاه خوانده", "ara.jri.ac.ir"],
    metadata: {
      citation_code: "1403/851",
      binding: true,
      source_url: "https://ara.jri.ac.ir/Law/Index?layout=True&page=5&Slayout=True",
      page: 5,
      source_platform: "سامانه ملی آرای قضایی - پژوهشگاه قوه قضاییه"
    },
    created_at: "۱۴۰۳/۰۶/۲۰"
  },
  {
    id: "src-jri-850",
    source_type: "UNITY_JUDGMENT",
    title: "رأی وحدت رویه شماره ۸۵۰ هیأت عمومی دیوان عالی کشور (مبنای خسارت تأخیر تأدیه)",
    document_number: "۸۵۰",
    date: "۱۴۰۳/۰۵/۱۶",
    authority: "هیأت عمومی دیوان عالی کشور (سامانه ملی آرای قضایی)",
    category: "آرای وحدت رویه",
    text: "در خصوص دعاوی مطالبه خسارت تأخیر تأدیه موضوع ماده ۵۲۲ قانون آیین دادرسی مدنی، محاسبه خسارت باید با توجه به تغییر فاحش قیمت‌ها بر مبنای شاخص تورم اعلامی از سوی بانک مرکزی جمهوری اسلامی ایران بر حسب شاخص سالانه و تغییرات شاخص ماهانه مربوطه از تاریخ مطالبه یا سررسید تا زمان تادیه محاسبه شود.",
    keywords: ["رأی وحدت رویه ۸۵۰", "خسارت تأخیر تأدیه", "ماده ۵۲۲", "شاخص بانک مرکزی", "تورم سالانه", "شاخص ماهانه", "وجه رایج", "ara.jri.ac.ir"],
    metadata: {
      citation_code: "1403/850",
      binding: true,
      source_url: "https://ara.jri.ac.ir/Law/Index?layout=True&page=5&Slayout=True",
      page: 5,
      source_platform: "سامانه ملی آرای قضایی - پژوهشگاه قوه قضاییه"
    },
    created_at: "۱۴۰۳/۰۵/۱۶"
  },
  {
    id: "src-jri-847",
    source_type: "UNITY_JUDGMENT",
    title: "رأی وحدت رویه شماره ۸۴۷ هیأت عمومی دیوان عالی کشور (معامله وکیل به قیمت نامتعارف و مصلحت موکل)",
    document_number: "۸۴۷",
    date: "۱۴۰۳/۰۲/۲۵",
    authority: "هیأت عمومی دیوان عالی کشور (سامانه ملی آرای قضایی)",
    category: "آرای وحدت رویه",
    text: "بر اساس ماده ۶۶۷ قانون مدنی، وکیل موظف است در تمام اقدامات و تصرفات خود غبطه و مصلحت موکل را رعایت نماید. هرگاه وکیل با سوء استفاده از اطلاق اختیارات وکالت‌نامه، ملک یا مال موکل را به قیمتی بسیار پایین، غیرمتعارف و ثمن بخس به خود یا دیگری واگذار کند، اقدام وی به لحاظ خروج از حدود مصلحت موکل فضولی تلقی گردیده و بدون اذن و تنفیذ موکل باطل و بی‌اثر است.",
    keywords: ["رأی وحدت رویه ۸۴۷", "مصلحت موکل", "ماده ۶۶۷ قانون مدنی", "ثمن بخس", "معامله فضولی وکیل", "سوء استفاده از وکالت", "ara.jri.ac.ir"],
    metadata: {
      citation_code: "1403/847",
      binding: true,
      source_url: "https://ara.jri.ac.ir/Law/Index?layout=True&page=5&Slayout=True",
      page: 5,
      source_platform: "سامانه ملی آرای قضایی - پژوهشگاه قوه قضاییه"
    },
    created_at: "۱۴۰۳/۰۲/۲۵"
  },
  {
    id: "src-jri-846",
    source_type: "UNITY_JUDGMENT",
    title: "رأی وحدت رویه شماره ۸۴۶ هیأت عمومی دیوان عالی کشور (تخفیف مجازات در صدور رأی جرایم مواد مخدر)",
    document_number: "۸۴۶",
    date: "۱۴۰۳/۰۱/۲۸",
    authority: "هیأت عمومی دیوان عالی کشور (سامانه ملی آرای قضایی)",
    category: "آرای وحدت رویه",
    text: "ممنوعیت استفاده از نهادهای ارفاقی مقرر در تبصره الحاقی به ماده ۴۵ قانون اصلاح قانون مبارزه با مواد مخدر مصوب ۱۳۹۶، صرفاً ناظر به مرحله پس از صدور حکم قطعی و در زمان اجرای مجازات است و مانع از اعمال مقررات عام تخفیف مجازات (مواد ۳۷ و ۳۸ قانون مجازات اسلامی) توسط دادگاه رسیدگی‌کننده در مرحله صدور حکم نمی‌باشد.",
    keywords: ["رأی وحدت رویه ۸۴۶", "تخفیف مجازات", "مواد مخدر", "ماده ۴۵ الحاقی", "نهادهای ارفاقی", "مرحله صدور حکم", "ara.jri.ac.ir"],
    metadata: {
      citation_code: "1403/846",
      binding: true,
      source_url: "https://ara.jri.ac.ir/Law/Index?layout=True&page=5&Slayout=True",
      page: 5,
      source_platform: "سامانه ملی آرای قضایی - پژوهشگاه قوه قضاییه"
    },
    created_at: "۱۴۰۳/۰۱/۲۸"
  },
  {
    id: "src-jri-855",
    source_type: "UNITY_JUDGMENT",
    title: "رأی وحدت رویه شماره ۸۵۵ هیأت عمومی دیوان عالی کشور (فرجام‌خواهی در موضوعات غیرقابل تفکیک)",
    document_number: "۸۵۵",
    date: "۱۴۰۳/۰۹/۱۳",
    authority: "هیأت عمومی دیوان عالی کشور (سامانه ملی آرای قضایی)",
    category: "آرای وحدت رویه",
    text: "در دعاویی که موضوع خواسته یا حکم غیرقابل تجزیه و تفکیک است، اسقاط حق اعتراض یا تجدیدنظرخواهی توسط احد از اصحاب دعوا یا انقضای مهلت نسبت به او، حق سایر اصحاب دعوا را برای فرجام‌خواهی در دیوان عالی کشور ساقط نمی‌کند و دیوان مکلف به رسیدگی فرجامی به کل دعوا می‌باشد.",
    keywords: ["رأی وحدت رویه ۸۵۵", "فرجام خواهی", "دیوان عالی کشور", "اسقاط حق تجدیدنظر", "موضوع غیرقابل تفکیک", "ara.jri.ac.ir"],
    metadata: {
      citation_code: "1403/855",
      binding: true,
      source_url: "https://ara.jri.ac.ir/Law/Index?layout=True&page=5&Slayout=True",
      page: 5,
      source_platform: "سامانه ملی آرای قضایی - پژوهشگاه قوه قضاییه"
    },
    created_at: "۱۴۰۳/۰۹/۱۳"
  },
  {
    id: "src-jri-841",
    source_type: "UNITY_JUDGMENT",
    title: "رأی وحدت رویه شماره ۸۴۱ هیأت عمومی دیوان عالی کشور (قلمرو حل اختلاف صلاحیت توسط دیوان عالی)",
    document_number: "۸۴۱",
    date: "۱۴۰۲/۰۹/۲۱",
    authority: "هیأت عمومی دیوان عالی کشور (سامانه ملی آرای قضایی)",
    category: "آرای وحدت رویه",
    text: "حل اختلاف در صلاحیت توسط دیوان عالی کشور طبق قانون آیین دادرسی مدنی، منحصر به اختلاف بین دادگاه‌های دو حوزه قضایی از دو استان، اختلاف میان دادگاه‌های عمومی، نظامی و انقلاب و نفی صلاحیت دادگاه‌های دادگستری به شایستگی مراجع غیرقضایی است و در سایر موارد حل اختلاف بر عهده دادگاه تجدیدنظر استان مربوطه می‌باشد.",
    keywords: ["رأی وحدت رویه ۸۴۱", "اختلاف در صلاحیت", "دیوان عالی کشور", "دادگاه تجدیدنظر استان", "صلاحیت مراجع غیرقضایی", "ara.jri.ac.ir"],
    metadata: {
      citation_code: "1402/841",
      binding: true,
      source_url: "https://ara.jri.ac.ir/Law/Index?layout=True&page=5&Slayout=True",
      page: 5,
      source_platform: "سامانه ملی آرای قضایی - پژوهشگاه قوه قضاییه"
    },
    created_at: "۱۴۰۲/۰۹/۲۱"
  },
  {
    id: "src-jri-840",
    source_type: "UNITY_JUDGMENT",
    title: "رأی وحدت رویه شماره ۸۴۰ هیأت عمومی دیوان عالی کشور (عدول از سوگند در قسامه و اعاده دادرسی)",
    document_number: "۸۴۰",
    date: "۱۴۰۲/۰۹/۲۱",
    authority: "هیأت عمومی دیوان عالی کشور (سامانه ملی آرای قضایی)",
    category: "آرای وحدت رویه",
    text: "در صورتی که پس از صدور حکم قطعی به استناد قسامه، تعدادی از اداکنندگان سوگند از سوگند خود عدول نمایند به گونه‌ای که تعداد حلفاء از حد نصاب مقرر در قانون مجازات اسلامی کمتر شود، محکوم‌علیه حق درخواست اعاده دادرسی در دیوان عالی کشور را بر اساس ماده ۴۷۴ قانون آیین دادرسی کیفری دارد.",
    keywords: ["رأی وحدت رویه ۸۴۰", "قسامه", "عدول از سوگند", "اعاده دادرسی کیفری", "ماده ۴۷۴", "دیوان عالی کشور", "ara.jri.ac.ir"],
    metadata: {
      citation_code: "1402/840",
      binding: true,
      source_url: "https://ara.jri.ac.ir/Law/Index?layout=True&page=5&Slayout=True",
      page: 5,
      source_platform: "سامانه ملی آرای قضایی - پژوهشگاه قوه قضاییه"
    },
    created_at: "۱۴۰۲/۰۹/۲۱"
  },
  {
    id: "src-jri-836",
    source_type: "UNITY_JUDGMENT",
    title: "رأی وحدت رویه شماره ۸۳۶ هیأت عمومی دیوان عالی کشور (غیرمالی بودن هزینه دادرسی دعوای ابطال رأی داوری)",
    document_number: "۸۳۶",
    date: "۱۴۰۲/۰۶/۲۸",
    authority: "هیأت عمومی دیوان عالی کشور (سامانه ملی آرای قضایی)",
    category: "آرای وحدت رویه",
    text: "دعوای ابطال رأی داوری حتی در مواردی که موضوع رأی داور مطالبه وجه یا مال معین باشد، از حیث صلاحیت و هزینه دادرسی دعوای غیرمالی تلقی می‌شود و دادگاه‌ها و دفاتر خدمات الکترونیک قضایی صرفاً مجاز به اخذ هزینه دادرسی دعاوی غیرمالی می‌باشند.",
    keywords: ["رأی وحدت رویه ۸۳۶", "ابطال رأی داور", "هزینه دادرسی غیرمالی", "داوری", "دفاتر خدمات قضایی", "ara.jri.ac.ir"],
    metadata: {
      citation_code: "1402/836",
      binding: true,
      source_url: "https://ara.jri.ac.ir/Law/Index?layout=True&page=5&Slayout=True",
      page: 5,
      source_platform: "سامانه ملی آرای قضایی - پژوهشگاه قوه قضاییه"
    },
    created_at: "۱۴۰۲/۰۶/۲۸"
  },
  {
    id: "src-jri-835",
    source_type: "UNITY_JUDGMENT",
    title: "رأی وحدت رویه شماره ۸۳۵ هیأت عمومی دیوان عالی کشور (صلاحیت مراجع اداری و دادگاه‌ها در خسارات ناشی از تصمیمات اداری)",
    document_number: "۸۳۵",
    date: "۱۴۰۲/۰۵/۳۱",
    authority: "هیأت عمومی دیوان عالی کشور (سامانه ملی آرای قضایی)",
    category: "آرای وحدت رویه",
    text: "مطالبه خسارت ناشی از اقدامات و تصمیمات واحدهای دولتی یا کارمندان، موکول به احراز اولیه تخلف یا ابطال تصمیم در دیوان عدالت اداری یا مراجع ذی‌صلاح قانونی است و پس از احراز تخلف اداری، دادگاه عمومی حقوقی دادگستری صالح به تعیین میزان و حکم به جبران خسارت وارده می‌باشد.",
    keywords: ["رأی وحدت رویه ۸۳۵", "خسارت اقدامات اداری", "دیوان عدالت اداری", "مسئولیت مدنی دولت", "دادگاه عمومی حقوقی", "ara.jri.ac.ir"],
    metadata: {
      citation_code: "1402/835",
      binding: true,
      source_url: "https://ara.jri.ac.ir/Law/Index?layout=True&page=5&Slayout=True",
      page: 5,
      source_platform: "سامانه ملی آرای قضایی - پژوهشگاه قوه قضاییه"
    },
    created_at: "۱۴۰۲/۰۵/۳۱"
  },
  {
    id: "src-jri-834",
    source_type: "UNITY_JUDGMENT",
    title: "رأی وحدت رویه شماره ۸۳۴ هیأت عمومی دیوان عالی کشور (پرداخت دیه از بیت‌المال در قتل و صدمات)",
    document_number: "۸۳۴",
    date: "۱۴۰۲/۰۴/۲۰",
    authority: "هیأت عمومی دیوان عالی کشور (سامانه ملی آرای قضایی)",
    category: "آرای وحدت رویه",
    text: "در مواردی که مرتکب صدمه بدنی یا قتل به دلیل متواری شدن یا عدم شناسایی مشخص نباشد و امکان استیفای دیه از اموال وی یا عاقله میسر نگردد، به منظور جلوگیری از هدر رفتن خون و حق آسیب‌دیده، دیه متعلقه مستنداً به ماده ۴۸۷ قانون مجازات اسلامی از محل بیت‌المال پرداخت خواهد شد.",
    keywords: ["رأی وحدت رویه ۸۳۴", "دیه از بیت‌المال", "قتل نامعلوم", "صدمه بدنی", "متواری شدن مرتکب", "ماده ۴۸۷", "ara.jri.ac.ir"],
    metadata: {
      citation_code: "1402/834",
      binding: true,
      source_url: "https://ara.jri.ac.ir/Law/Index?layout=True&page=5&Slayout=True",
      page: 5,
      source_platform: "سامانه ملی آرای قضایی - پژوهشگاه قوه قضاییه"
    },
    created_at: "۱۴۰۲/۰۴/۲۰"
  },
  {
    id: "src-jri-830",
    source_type: "UNITY_JUDGMENT",
    title: "رأی وحدت رویه شماره ۸۳۰ هیأت عمومی دیوان عالی کشور (رسیدگی به دادخواست اعسار پیش از بازداشت)",
    document_number: "۸۳۰",
    date: "۱۴۰۱/۱۰/۲۷",
    authority: "هیأت عمومی دیوان عالی کشور (سامانه ملی آرای قضایی)",
    category: "آرای وحدت رویه",
    text: "مستفاد از ماده ۳ قانون نحوه اجرای محکومیت‌های مالی، هرگاه محکوم‌علیه ظرف ۳۰ روز پس از ابلاغ اجرائیه دادخواست اعسار از پرداخت محکوم‌به را تقدیم دادگاه نماید، تا زمان صدور حکم قطعی نسبت به ادعای اعسار، حبس و بازداشت وی ممنوع است و دادگاه مکلف است قبل از هرگونه بازداشت به دادخواست اعسار رسیدگی کند.",
    keywords: ["رأی وحدت رویه ۸۳۰", "اعسار از محکوم‌به", "ماده ۳ محکومیت‌های مالی", "منع بازداشت بدهکار", "مهلت ۳۰ روزه", "اجرای احکام", "ara.jri.ac.ir"],
    metadata: {
      citation_code: "1401/830",
      binding: true,
      source_url: "https://ara.jri.ac.ir/Law/Index?layout=True&page=5&Slayout=True",
      page: 5,
      source_platform: "سامانه ملی آرای قضایی - پژوهشگاه قوه قضاییه"
    },
    created_at: "۱۴۰۱/۱۰/۲۷"
  },
  {
    id: "src-jri-828",
    source_type: "UNITY_JUDGMENT",
    title: "رأی وحدت رویه شماره ۸۲۸ هیأت عمومی دیوان عالی کشور (صلاحیت دعاوی اراضی ملی و مستثنیات کشاورزی)",
    document_number: "۸۲۸",
    date: "۱۴۰۱/۰۹/۲۹",
    authority: "هیأت عمومی دیوان عالی کشور (سامانه ملی آرای قضایی)",
    category: "آرای وحدت رویه",
    text: "رسیدگی به اعتراضات اشخاص نسبت به تشخیص منابع ملی و اراضی موات بر اساس قانون تعیین تکلیف اراضی اختلافی موضوع ماده ۵۶ قانون حفاظت و بهره‌برداری از جنگل‌ها، در صلاحیت شعب ویژه دادگاه عمومی حقوقی محل وقوع ملک است و شعب مکلف به احراز سوابق احیاء و بررسی ادله کشاورزان می‌باشند.",
    keywords: ["رأی وحدت رویه ۸۲۸", "اراضی ملی", "ماده ۵۶ جنگل‌ها", "مستثنیات اراضی", "سوابق احیاء کشاورزی", "دادگاه عمومی حقوقی", "ara.jri.ac.ir"],
    metadata: {
      citation_code: "1401/828",
      binding: true,
      source_url: "https://ara.jri.ac.ir/Law/Index?layout=True&page=5&Slayout=True",
      page: 5,
      source_platform: "سامانه ملی آرای قضایی - پژوهشگاه قوه قضاییه"
    },
    created_at: "۱۴۰۱/۰۹/۲۹"
  },
  {
    id: "src-jri-822",
    source_type: "UNITY_JUDGMENT",
    title: "رأی وحدت رویه شماره ۸۲۲ هیأت عمومی دیوان عالی کشور (آنی بودن بزه تغییر غیرمجاز کاربری اراضی و مرور زمان)",
    document_number: "۸۲۲",
    date: "۱۴۰۱/۰۳/۳۱",
    authority: "هیأت عمومی دیوان عالی کشور (سامانه ملی آرای قضایی)",
    category: "آرای وحدت رویه",
    text: "جرم تغییر غیرمجاز کاربری اراضی زراعی و باغ‌ها موضوع ماده ۳ قانون حفظ کاربری اراضی زراعی و باغ‌ها، جرمی آنی است که با اقدام به تغییر کاربری محقق می‌گردد و جرمی مستمر به شمار نمی‌آید؛ لذا مشمول مقررات مرور زمان تعقیب در جرایم تعزیری درجه هفت (موضوع ماده ۱۰۵ قانون مجازات اسلامی) بوده و با انقضای ۳ سال از زمان وقوع، مشمول مرور زمان و موقوفی تعقیب می‌گردد.",
    keywords: ["رأی وحدت رویه ۸۲۲", "تغییر غیرمجاز کاربری", "جرم آنی", "مرور زمان کیفری", "ماده ۱۰۵ مجازات", "حفظ کاربری اراضی", "ara.jri.ac.ir"],
    metadata: {
      citation_code: "1401/822",
      binding: true,
      source_url: "https://ara.jri.ac.ir/Law/Index?layout=True&page=5&Slayout=True",
      page: 5,
      source_platform: "سامانه ملی آرای قضایی - پژوهشگاه قوه قضاییه"
    },
    created_at: "۱۴۰۱/۰۳/۳۱"
  },
  {
    id: "src-jri-810",
    source_type: "UNITY_JUDGMENT",
    title: "رأی وحدت رویه شماره ۸۱۰ هیأت عمومی دیوان عالی کشور (شرط فسخ در صورت برگشت چک و استرداد مبیع از ایادی بعدی)",
    document_number: "۸۱۰",
    date: "۱۴۰۰/۰۳/۰۴",
    authority: "هیأت عمومی دیوان عالی کشور (سامانه ملی آرای قضایی)",
    category: "آرای وحدت رویه",
    text: "مستفاد از مواد ۲۱۹، ۲۲۰ و ۳۹۹ قانون مدنی، چنانچه در قرارداد بیع شرط شود که در صورت عدم وصول هر یک از چک‌های اقساط ثمن، فروشنده حق فسخ قرارداد و استرداد عین مبیع را دارد، با تحقق شرط و اعمال فسخ، قرارداد منحل گردیده و انتقال بعدی مال توسط خریدار به اشخاص ثالث، مانع از استرداد مبیع به فروشنده نخستین نخواهد بود؛ زیرا مالکیت منتقل‌الیه از ابتدا متزلزل بوده است.",
    keywords: ["رأی وحدت رویه ۸۱۰", "فسخ بیع", "چک برگشتی ثمن", "استرداد مبیع", "انتقال به شخص ثالث", "مالکیت متزلزل", "ماده ۳۹۹ مدنی", "ara.jri.ac.ir"],
    metadata: {
      citation_code: "1400/810",
      binding: true,
      source_url: "https://ara.jri.ac.ir/Law/Index?layout=True&page=5&Slayout=True",
      page: 5,
      source_platform: "سامانه ملی آرای قضایی - پژوهشگاه قوه قضاییه"
    },
    created_at: "۱۴۰۰/۰۳/۰۴"
  },
  {
    id: "src-jri-880",
    source_type: "UNITY_JUDGMENT",
    title: "رأی وحدت رویه شماره ۸۸۰ هیأت عمومی دیوان عالی کشور (عدم جواز منع خروج از کشور در جرایم مواد مخدر داخلی)",
    document_number: "۸۸۰",
    date: "۱۴۰۳/۰۵/۰۲",
    authority: "هیأت عمومی دیوان عالی کشور (سامانه ملی آرای قضایی ara.jri.ac.ir)",
    category: "آرای وحدت رویه",
    text: "با عنایت به اصل قانونی بودن مجازات‌ها و ماده ۲۳ قانون مجازات اسلامی، تعیین مجازات تکمیلی منع خروج از کشور برای جرایم موضوع قانون مبارزه با مواد مخدر که صرفاً در محدوده داخل کشور ارتکاب یافته و فاقد جنبه قاچاق بین‌المللی یا خروج غیرمجاز مرزی است، فاقد توجیه قانونی بوده و دادگاه‌ها مجاز به اعمال این مجازات تکمیلی بدون نص صریح نمی‌باشند.",
    keywords: ["رأی وحدت رویه ۸۸۰", "منع خروج از کشور", "مواد مخدر", "مجازات تکمیلی", "اصل قانونی بودن جرم", "ara.jri.ac.ir"],
    metadata: {
      citation_code: "1403/880",
      binding: true,
      source_url: "https://ara.jri.ac.ir/Law/Index?layout=True&page=5&Slayout=True",
      page: 5,
      source_platform: "سامانه ملی آرای قضایی - پژوهشگاه قوه قضاییه"
    },
    created_at: "۱۴۰۳/۰۵/۰۲"
  },
  {
    id: "src-jri-879",
    source_type: "UNITY_JUDGMENT",
    title: "رأی وحدت رویه شماره ۸۷۹ هیأت عمومی دیوان عالی کشور (صلاحیت دادگاه کیفری دو در تغییر کاربری و قلع بنا)",
    document_number: "۸۷۹",
    date: "۱۴۰۳/۰۴/۱۹",
    authority: "هیأت عمومی دیوان عالی کشور (سامانه ملی آرای قضایی ara.jri.ac.ir)",
    category: "آرای وحدت رویه",
    text: "رسیدگی به اتهام تغییر غیرمجاز کاربری اراضی زراعی و باغ‌ها موضوع قانون حفظ کاربری اراضی زراعی و باغ‌ها و اتخاذ تصمیم پیرامون قلع و قمع بنا و عوارض قانونی در صلاحیت ذاتی دادگاه کیفری دو است و مراجع غیرقضایی حق اتخاذ تصمیم نهایی قضایی در ماهیت این پرونده‌ها را ندارند.",
    keywords: ["رأی وحدت رویه ۸۷۹", "تغییر کاربری اراضی", "قلع و قمع بنا", "دادگاه کیفری دو", "صلاحیت ذاتی", "ara.jri.ac.ir"],
    metadata: {
      citation_code: "1403/879",
      binding: true,
      source_url: "https://ara.jri.ac.ir/Law/Index?layout=True&page=5&Slayout=True",
      page: 5,
      source_platform: "سامانه ملی آرای قضایی - پژوهشگاه قوه قضاییه"
    },
    created_at: "۱۴۰۳/۰۴/۱۹"
  }
];

/**
 * بارگذاری کلیه مستندات صفحات ۱ تا ۷۱ استخراج‌شده از سامانه ملی آرای قضایی
 */
function loadAllPagesData(): LegalSource[] {
  try {
    const filePath = path.join(process.cwd(), "server", "data", "ara_jri_pages_1_to_71.json");
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error loading ara_jri_pages_1_to_71.json:", err);
  }
  return [];
}

/**
 * بارگذاری کلیه دادنامه‌های استخراج‌شده ۱۰۰ تا ۱۰۰۰ از سامانه ملی آرای قضایی
 */
export function loadJudges100To1000Data(): LegalSource[] {
  try {
    const filePath = path.join(process.cwd(), "server", "data", "ara_jri_judges_100_to_1000.json");
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error loading ara_jri_judges_100_to_1000.json:", err);
  }
  return [];
}

/**
 * بارگذاری کلیه دادنامه‌های استخراج‌شده ۱۰۰۰ تا ۱۰۰۰۰ از سامانه ملی آرای قضایی
 */
export function loadJudges1000To10000Data(): LegalSource[] {
  try {
    const filePath = path.join(process.cwd(), "server", "data", "ara_jri_judges_1000_to_10000.json");
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error loading ara_jri_judges_1000_to_10000.json:", err);
  }
  return [];
}

/**
 * بارگذاری تمام دادنامه‌های استخراج‌شده شعب (از ۱۰۰ تا ۱۰۰۰۰)
 */
export function loadAllJudgesData(): LegalSource[] {
  const map = new Map<string, LegalSource>();
  for (const item of loadJudges100To1000Data()) {
    map.set(item.id, item);
  }
  for (const item of loadJudges1000To10000Data()) {
    map.set(item.id, item);
  }
  return Array.from(map.values());
}

const rawScraped = loadAllPagesData();
const judgesScraped = loadJudges100To1000Data();
const judges1000Scraped = loadJudges1000To10000Data();
const seenIds = new Set<string>();
const combinedList: LegalSource[] = [];

// اولویت با آرای تحلیلی تفصیلی است
for (const item of DETAILED_ARA_JRI_SOURCES) {
  seenIds.add(item.id);
  combinedList.push(item);
}

// سپس افزودن کل مستندات صفحات ۱ تا ۷۱
for (const item of rawScraped) {
  if (!seenIds.has(item.id)) {
    seenIds.add(item.id);
    combinedList.push(item);
  }
}

// سپس افزودن دادنامه‌های مراجع و شعب ۱۰۰ تا ۱۰۰۰
for (const item of judgesScraped) {
  if (!seenIds.has(item.id)) {
    seenIds.add(item.id);
    combinedList.push(item);
  }
}

// سپس افزودن دادنامه‌های مراجع و شعب ۱۰۰۰ تا ۱۰۰۰۰
for (const item of judges1000Scraped) {
  if (!seenIds.has(item.id)) {
    seenIds.add(item.id);
    combinedList.push(item);
  }
}

export const ARA_JRI_LEGAL_SOURCES: LegalSource[] = combinedList;
export const ARA_JRI_JUDGES_SOURCES: LegalSource[] = [...judgesScraped, ...judges1000Scraped];

/**
 * خزنده زنده (Live Crawler) برای استخراج صفحه مشخص از سامانه ملی آرای قضایی
 */
export async function crawlAraJriPage(page: number): Promise<LegalSource[]> {
  const targetPage = Math.max(1, Math.min(71, page));
  const url = `https://ara.jri.ac.ir/Law/Index?layout=True&page=${targetPage}&Slayout=True`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) {
      console.warn(`Remote page ${targetPage} returned ${res.status}, falling back to preloaded archive`);
      return ARA_JRI_LEGAL_SOURCES.filter(s => s.metadata?.page === targetPage);
    }

    const html = await res.text();
    const divLaws = html.split("<div class=\"divLaws\">");
    const parsedItems: LegalSource[] = [];

    for (let i = 1; i < divLaws.length; i++) {
      const chunk = divLaws[i];
      const lawIdMatch = chunk.match(/Laws=(\d+)/) || chunk.match(/id="Title(\d+)"/);
      const lawId = lawIdMatch ? lawIdMatch[1] : `p${targetPage}-${i}`;
      const dateMatch = chunk.match(/<span class="font-weight-normal float-left">([^<]*)<\/span>/);
      const date = dateMatch ? dateMatch[1].trim() : "";
      const ilawsMatch = chunk.match(/href="(https:\/\/ilaws\.net\/ViewText\/\d+)"/);
      const ilawsUrl = ilawsMatch ? ilawsMatch[1] : "";
      const titleMatch = chunk.match(/<div id="Title\d+"[^>]*>([\s\S]*?)<\/div>/);
      let title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim().replace(/\s+/g, " ") : "";

      const numMatch = title.match(/^(\d+)\)\s*(.*)$/);
      let docNumber = "";
      if (numMatch) {
        docNumber = numMatch[1];
        title = numMatch[2];
      }

      const relatedMatch = chunk.match(/href="\/Judge\/Index\?Laws=\d+">(\d+)\)\s*رأی<\/a>/);
      const relatedCount = relatedMatch ? parseInt(relatedMatch[1], 10) : 0;

      let sourceType: LegalSource["source_type"] = "UNITY_JUDGMENT";
      let category: LegalSource["category"] = "آرای وحدت رویه";
      let isBinding = true;

      let authority = "هیأت عمومی دیوان عالی کشور (آرای وحدت رویه)";
      if (title.includes("دیوان عدالت") || title.includes("ابطال")) {
        authority = "هیأت عمومی دیوان عدالت اداری (آرای وحدت رویه و ابطال مصوبات)";
      } else if (title.includes("نظر مشورتی")) {
        authority = "اداره کل حقوقی قوه قضاییه (نظریات مشورتی استنادی)";
      } else if (title.startsWith("اصل ")) {
        authority = "اصول کلی حقوقی و فقهی حاکم بر محاکم (مستند قضایی)";
      }

      const rawItem = {
        id: `src-jri-${lawId}`,
        source_type: sourceType,
        title: title || `رأی وحدت رویه شماره ${lawId}`,
        document_number: docNumber || lawId,
        date: date || "نامشخص",
        authority: authority,
        category: category,
        metadata: {
          page: targetPage,
          law_id: lawId,
          source_url: url,
          external_view_url: ilawsUrl,
          related_judgments_url: `https://ara.jri.ac.ir/Judge/Index?Laws=${lawId}`,
          related_judgments_count: relatedCount,
          binding: isBinding,
          source_platform: "سامانه ملی آرای قضایی - پژوهشگاه قوه قضاییه"
        },
        created_at: date || "۱۴۰۳/۰۱/۰۱"
      };

      parsedItems.push(buildEnrichedLegalSource(rawItem, i));
    }

    return parsedItems.length > 0
      ? parsedItems
      : ARA_JRI_LEGAL_SOURCES.filter(s => s.metadata?.page === targetPage);
  } catch (err) {
    console.error(`Crawl page ${targetPage} error:`, err);
    return ARA_JRI_LEGAL_SOURCES.filter(s => s.metadata?.page === targetPage);
  }
}

