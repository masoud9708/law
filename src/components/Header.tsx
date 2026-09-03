import React from "react";
import { User, ActiveTab } from "../types";
import { Scale, Zap, ShieldCheck, UserCheck, Bell, Sparkles, Layers, Search, FileText } from "lucide-react";

interface HeaderProps {
  user: User | null;
  credits: { remaining: number; total: number; used: number; planName: string };
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAuth: () => void;
  onSwitchUser: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  credits,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onSwitchUser
}) => {
  return (
    <header className="h-16 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40 shrink-0">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 bg-slate-950 border border-slate-700/80 rounded-lg flex items-center justify-center text-white shadow-inner shrink-0 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent"></div>
          <div className="w-5 h-5 border-2 border-amber-400/90 rounded-sm rotate-45 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg lg:text-xl font-black tracking-tight text-white flex items-center">
              <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">LegalAI</span>
              <span className="text-slate-400 font-light text-xs lg:text-sm mr-2">| دستیار هوشمند حقوقی</span>
            </h1>
            <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800/80 text-amber-300 border border-slate-700/80 font-mono font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              مبتنی بر RAG و قوانین مدنی
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions & Credits */}
      <div className="flex items-center gap-3 lg:gap-5">
        {/* Architecture Pipeline Quick Link */}
        <button
          onClick={() => setActiveTab("architecture")}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            activeTab === "architecture"
              ? "bg-slate-800 text-amber-300 border-amber-500/50 shadow-sm"
              : "bg-slate-950/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white hover:border-slate-700"
          }`}
          title="مشاهده معماری ۳۵ بندی و خط لوله پردازش هوش مصنوعی"
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>معماری ۳۵ بندی</span>
        </button>

        {/* Credit Badge */}
        <button
          onClick={() => setActiveTab("billing")}
          className="bg-amber-950/40 border border-amber-500/40 hover:border-amber-400 hover:bg-amber-900/40 px-3.5 py-1.5 rounded-full flex items-center gap-2 transition-all shadow-sm group cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
          <span className="text-amber-300 text-xs font-bold hidden xs:inline">اعتبار باقی‌مانده:</span>
          <span className="text-amber-200 text-xs sm:text-sm font-mono font-black">{credits.remaining.toLocaleString("fa-IR")}</span>
          <span className="text-amber-400/80 text-[11px] font-medium hidden sm:inline">واحد</span>
        </button>

        {/* User Role Switcher / Profile */}
        {user ? (
          <div className="flex items-center gap-3 border-r pr-3 sm:pr-5 border-slate-800">
            <div
              onClick={onSwitchUser}
              className="text-left hidden sm:block cursor-pointer hover:opacity-80 transition-opacity"
              title="کلیک جهت تغییر نقش بین مدیر و وکیل"
            >
              <p className="text-xs font-bold leading-none text-slate-100">{user.name}</p>
              <p className="text-[10px] text-slate-400 mt-1 leading-none font-medium">
                {user.role === "SUPER_ADMIN" ? "پنل مدیریت کل" : "پنل وکلا - پایه یک"}
              </p>
            </div>

            <button
              onClick={onOpenAuth}
              className="w-9 h-9 bg-slate-800 hover:bg-slate-700 rounded-full border border-slate-700 flex items-center justify-center text-amber-300 text-xs font-bold transition-colors cursor-pointer shadow-sm"
              title="پروفایل و مدیریت سشن‌ها"
            >
              {user.name.charAt(0)}
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            ورود / ثبت‌نام
          </button>
        )}
      </div>
    </header>
  );
};
