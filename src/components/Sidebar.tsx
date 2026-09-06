import React from "react";
import { ActiveTab } from "../types";
import {
  MessageSquareText,
  FilePenLine,
  FileSearch,
  BookOpen,
  Calculator,
  CreditCard,
  Settings,
  Layers,
  Sparkles,
  ShieldAlert,
  ChevronLeft
} from "lucide-react";

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems: Array<{
    id: ActiveTab;
    label: string;
    sublabel: string;
    icon: React.ElementType;
    badge?: string;
  }> = [
    {
      id: "chat",
      label: "مشاوره و چت حقوقی",
      sublabel: "Legal Chat & RAG",
      icon: MessageSquareText,
      badge: "Gemini 3.8"
    },
    {
      id: "draft",
      label: "تنظیم دادخواست و لوایح",
      sublabel: "Legal Drafting Engine",
      icon: FilePenLine,
      badge: "فرمت رسمی"
    },
    {
      id: "calculators",
      label: "محاسبات قضایی و مواعد",
      sublabel: "Legal & Delay Calculators",
      icon: Calculator,
      badge: "ماده ۵۲۲"
    },
    {
      id: "documents",
      label: "تحلیل اسناد و پرونده",
      sublabel: "Doc AI & OCR",
      icon: FileSearch
    },
    {
      id: "knowledge",
      label: "پایگاه قوانین و آراء",
      sublabel: "Knowledge Base",
      icon: BookOpen
    },
    {
      id: "billing",
      label: "پلن‌ها و مدیریت اعتبار",
      sublabel: "Billing & Plans",
      icon: CreditCard
    },
    {
      id: "admin",
      label: "پنل مدیریت و پایش",
      sublabel: "Admin & Metrics",
      icon: Settings
    },
    {
      id: "architecture",
      label: "معماری ۳۵ بندی سیستم",
      sublabel: "System Blueprint",
      icon: Layers,
      badge: "Full Stack"
    }
  ];

  return (
    <aside className="w-full lg:w-64 bg-slate-900/95 border-l border-slate-800 flex flex-col justify-between shrink-0 select-none">
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          بخش‌های تخصصی سامانه
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-right transition-all group cursor-pointer ${
                isActive
                  ? "bg-gradient-to-l from-slate-800/90 to-slate-800/40 text-amber-300 border-r-2 border-amber-500 font-bold shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                    isActive
                      ? "bg-slate-950 text-amber-400 border border-amber-500/40 shadow-xs"
                      : "bg-slate-800/80 text-slate-400 group-hover:text-amber-300 group-hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className={`text-xs font-bold leading-tight ${isActive ? "text-slate-100" : "text-slate-300 group-hover:text-white"}`}>
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">{item.sublabel}</div>
                </div>
              </div>

              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                    isActive
                      ? "bg-amber-950/80 text-amber-300 border border-amber-500/40 font-semibold"
                      : "bg-slate-800 text-slate-400 group-hover:text-slate-300"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Trust & Citation Guarantee Box */}
      <div className="p-3.5 m-3 rounded-xl bg-slate-950/80 border border-slate-800/90 text-right space-y-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"></div>
        <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>تضمین استناد معتبر (RAG)</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          تمام پاسخ‌ها با مواد مصوب قانون مدنی، مجازات اسلامی و آرای وحدت رویه دیوان عالی کشور اعتبارسنجی می‌شوند.
        </p>
      </div>
    </aside>
  );
};
