import React, { useState, useEffect } from "react";
import { User, ActiveTab } from "./types";
import { api } from "./lib/api";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { ChatView } from "./components/chat/ChatView";
import { DraftingView } from "./components/drafting/DraftingView";
import { DocumentsView } from "./components/documents/DocumentsView";
import { KnowledgeBaseView } from "./components/knowledge/KnowledgeBaseView";
import { BillingView } from "./components/billing/BillingView";
import { AdminView } from "./components/admin/AdminView";
import { ArchitectureView } from "./components/architecture/ArchitectureView";
import { AuthModal } from "./components/auth/AuthModal";

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("chat");
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<{ remaining: number; total: number; used: number; planName: string }>({
    remaining: 1500,
    total: 2000,
    used: 500,
    planName: "پلن سازمانی وکلا"
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const data = await api.getMe();
      setUser(data.user);
      if (data.credits) {
        setCredits(data.credits);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSwitchUser = async () => {
    if (!user) return;
    const targetUserId = user.id === "usr-admin-1" ? "usr-lawyer-2" : "usr-admin-1";
    try {
      const res = await api.switchUser(targetUserId);
      setUser(res.user);
      await loadCurrentUser();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col font-sans selection:bg-amber-900/50 selection:text-amber-200">
      {/* Top Header */}
      <Header
        user={user}
        credits={credits}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSwitchUser={handleSwitchUser}
      />

      {/* Main App Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic Views */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#0B1120]">
          {activeTab === "chat" && <ChatView onCreditDeducted={loadCurrentUser} />}
          {activeTab === "draft" && <DraftingView onCreditDeducted={loadCurrentUser} />}
          {activeTab === "documents" && <DocumentsView onCreditDeducted={loadCurrentUser} />}
          {activeTab === "knowledge" && <KnowledgeBaseView />}
          {activeTab === "billing" && <BillingView onPlanPurchased={loadCurrentUser} />}
          {activeTab === "admin" && <AdminView />}
          {activeTab === "architecture" && <ArchitectureView />}
        </main>
      </div>

      {/* Professional Status Footer Bar */}
      <footer className="h-8 bg-[#090D16] text-slate-400 flex items-center px-4 lg:px-6 justify-between text-[11px] shrink-0 border-t border-slate-800/80 select-none">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>سیستم: <strong className="text-emerald-400 font-semibold">عملیاتی و امن</strong></span>
          </span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline">نسخه موتور: <span className="font-mono text-slate-300">v2.4.0 (Legal RAG Stable)</span></span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline">زمان پاسخگویی RAG: <span className="font-mono text-amber-400">۱.۲ ثانیه</span></span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span className="hidden sm:inline font-mono text-slate-500">مبتنی بر قوانین مصوب جمهوری اسلامی ایران</span>
          <span className="text-slate-300 font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>پلتفرم تخصصی حقوقی ژوریست</span>
          </span>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthenticated={(newUser) => {
          setUser(newUser);
          loadCurrentUser();
        }}
      />
    </div>
  );
}

export default App;
