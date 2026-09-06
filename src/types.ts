export type AssistantType = "LEGAL_CHAT" | "LEGAL_DRAFT" | "DOCUMENT_ANALYSIS" | "RESEARCH";

export type SourceType =
  | "LAW"
  | "JUDGMENT"
  | "UNITY_JUDGMENT"
  | "ADVISORY_OPINION"
  | "JUDICIAL_SESSION"
  | "ADMINISTRATIVE_OPINION"
  | "ADMIN_COURT_JUDGMENT"
  | "CIRCULAR";

export type LegalCategory =
  | "حقوق مدنی"
  | "کیفری و جزا"
  | "آیین دادرسی"
  | "دیوان عدالت اداری و اداری"
  | "آرای وحدت رویه"
  | "حقوق تجارت و شرکت‌ها"
  | "خانواده و امور حسبی"
  | "کار و تأمین اجتماعی"
  | "املاک و اراضی و ثبت"
  | "مالیات و گمرک";

export interface LegalSourceAnalysis {
  summary: string;
  holding: string;
  reasoning: string;
  litigation_application: string;
  related_laws: string[];
  practical_points: string[];
}

export interface LegalSource {
  id: string;
  source_type: SourceType;
  title: string;
  document_number: string;
  date: string;
  authority: string;
  category: LegalCategory;
  article?: string;
  text: string;
  keywords: string[];
  metadata: Record<string, any>;
  created_at: string;
  year?: number;
  law_type?: string;
  analysis?: LegalSourceAnalysis;
}

export interface User {
  id: string;
  phone: string;
  name: string;
  family_name: string;
  email: string;
  is_active: boolean;
  role: "USER" | "LAWYER" | "ADMIN" | "SUPER_ADMIN";
  license_number?: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  device: string;
  browser: string;
  ip: string;
  user_agent: string;
  is_current: boolean;
  expires_at: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  assistant_type: AssistantType;
  created_at: string;
  updated_at: string;
}

export interface Citation {
  id: string;
  message_id: string;
  source_id: string;
  citation_text: string;
  source_title: string;
  source_type: string;
  article?: string;
  confidence: number;
  verified: boolean;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  model: string;
  status: "completed" | "streaming" | "failed";
  input_tokens: number;
  output_tokens: number;
  credit_cost: number;
  latency_ms?: number;
  retrieval_count?: number;
  citations?: Citation[];
  created_at: string;
}

export interface DocumentRecord {
  id: string;
  user_id: string;
  filename: string;
  mime_type: string;
  size: number;
  storage_key: string;
  status: "uploaded" | "processing" | "ocr_completed" | "indexed" | "analyzed" | "failed";
  page_count: number;
  document_type: "دادنامه" | "قرارداد" | "لایحه دفاعیه" | "اظهارنامه" | "سند ملکی" | "متفرقه";
  summary?: string;
  extracted_text?: string;
  risks?: Array<{ level: "HIGH" | "MEDIUM" | "LOW"; title: string; description: string; clause?: string }>;
  clauses?: Array<{ title: string; summary: string; legal_impact: string }>;
  legal_references?: string[];
  suggested_actions?: string[];
  created_at: string;
}

export interface Plan {
  id: string;
  name: string;
  tagline: string;
  price: number;
  credits: number;
  duration_days: number;
  features: string[];
  is_active: boolean;
  badge?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  credits_total: number;
  credits_used: number;
  starts_at: string;
  expires_at: string;
  status: "active" | "expired" | "exhausted";
}

export interface Transaction {
  id: string;
  user_id: string;
  subscription_id?: string;
  plan_name: string;
  amount: number;
  gateway: string;
  authority: string;
  reference_id?: string;
  status: "PAID" | "PENDING" | "FAILED";
  created_at: string;
  verified_at?: string;
}

export interface CreditUsageLog {
  id: string;
  user_id: string;
  amount: number;
  action: string;
  details: string;
  created_at: string;
}

export type ActiveTab = "chat" | "draft" | "documents" | "knowledge" | "billing" | "admin" | "architecture";
