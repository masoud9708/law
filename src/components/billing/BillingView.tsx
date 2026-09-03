import React, { useState, useEffect } from "react";
import { Plan, CreditUsageLog, Transaction } from "../../types";
import { api } from "../../lib/api";
import {
  CreditCard,
  Zap,
  CheckCircle,
  Clock,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  Receipt,
  Layers
} from "lucide-react";

interface BillingViewProps {
  onPlanPurchased: () => void;
}

export const BillingView: React.FC<BillingViewProps> = ({ onPlanPurchased }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [credits, setCredits] = useState<{ remaining: number; total: number; used: number; planName: string }>({
    remaining: 0,
    total: 0,
    used: 0,
    planName: ""
  });
  const [logs, setLogs] = useState<CreditUsageLog[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      const [plansData, creditsData] = await Promise.all([
        api.getPlans(),
        api.getCredits()
      ]);
      setPlans(plansData.plans);
      setCredits(creditsData.credits);
      setLogs(creditsData.logs);
      setTransactions(creditsData.transactions);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePurchasePlan = async (planId: string) => {
    setIsCheckingOut(planId);
    try {
      const res = await api.createPayment(planId, "زرین‌پال");
      if (res.success && res.paymentUrl) {
        try {
          await fetch(res.paymentUrl, { headers: { "Accept": "application/json" } });
        } catch {
          // fallback
        }
        await loadBillingData();
        onPlanPurchased();
        setSuccessMsg("پرداخت با موفقیت شبیه‌سازی شد و اعتبارات به حساب افزوده گردید!");
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckingOut(null);
    }
  };

  return (
    <div className="flex-1 h-[calc(100vh-6rem)] overflow-y-auto bg-[#090D16] p-4 lg:p-8 space-y-8">
      {/* Alert */}
      {successMsg && (
        <div className="max-w-6xl mx-auto p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      {/* 1. Credit Status & Atomic Engine Overview */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Current Balance */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 text-right space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">کیف پول و اعتبار شما</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20">
              <Zap className="w-5 h-5 fill-amber-400 text-amber-400" />
            </span>
          </div>
          <div className="text-3xl font-black text-white font-mono flex items-baseline gap-2">
            <span>{credits.remaining}</span>
            <span className="text-xs font-bold text-amber-400">واحد اعتبار</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (credits.remaining / (credits.total || 1)) * 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>پلن فعال: <strong className="text-amber-300">{credits.planName}</strong></span>
            <span>سقف تخصیص‌یافته: <strong className="text-slate-200">{credits.total}</strong></span>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 text-right space-y-2 shadow-xl">
          <span className="text-xs font-bold text-slate-100">تعرفه مصرف عملیات حقوقی</span>
          <div className="space-y-2 pt-1 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span>پرسش در چت حقوقی (RAG + مواد قوانین):</span>
              <span className="font-mono text-amber-300 font-bold bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">۵ اعتبار</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>تنظیم دادخواست و لایحه رسمی:</span>
              <span className="font-mono text-amber-300 font-bold bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">۱۵ اعتبار</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>تحلیل عمیق دادنامه / پرونده (OCR):</span>
              <span className="font-mono text-amber-300 font-bold bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">۱۰ اعتبار</span>
            </div>
          </div>
        </div>

        {/* Atomic Transaction Guarantee */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 text-right space-y-2 shadow-xl">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>تضمین تراکنش اتمیک PostgreSQL</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            کسر اعتبارات به صورت ایزوله با دستور <code className="text-emerald-300 font-mono font-bold bg-slate-950 px-1 py-0.5 rounded border border-slate-800">FOR UPDATE</code> انجام پذیرفته و در صورت بروز هرگونه خطای هوش مصنوعی، اعتبار به حساب بازگردانده می‌شود.
          </p>
        </div>
      </div>

      {/* 2. Subscription Plans */}
      <div className="max-w-6xl mx-auto space-y-4 text-right">
        <div className="space-y-1">
          <h3 className="text-base md:text-lg font-bold text-white">خرید بسته و شارژ حساب وکلا</h3>
          <p className="text-xs text-slate-400">پلن‌های اختصاصی برای وکلا، کارشناسان رسمی و دفاتر حقوقی</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isSelected = plan.name === credits.planName;
            return (
              <div
                key={plan.id}
                className={`p-6 rounded-2xl flex flex-col justify-between border transition-all text-right relative bg-slate-900/90 ${
                  plan.badge
                    ? "border-2 border-amber-500 shadow-xl shadow-amber-950/20"
                    : "border-slate-800 hover:border-slate-700 shadow-xl"
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 right-6 bg-amber-500 text-slate-950 font-bold text-[10px] px-3 py-0.5 rounded-full shadow-md">
                    {plan.badge}
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-bold text-white">{plan.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">{plan.tagline}</p>
                  </div>

                  <div className="py-3 border-y border-slate-800">
                    <div className="text-2xl font-black text-white font-mono">
                      {(plan.price / 10).toLocaleString("fa-IR")}{" "}
                      <span className="text-xs font-normal text-slate-400">تومان / ماهانه</span>
                    </div>
                    <div className="text-xs text-amber-400 font-bold mt-1">
                      {plan.credits.toLocaleString("fa-IR")} واحد اعتبار پردازش RAG
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => handlePurchasePlan(plan.id)}
                    disabled={isCheckingOut === plan.id}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      plan.badge
                        ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-950/40"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                    }`}
                  >
                    {isCheckingOut === plan.id ? (
                      <span>در حال اتصال به درگاه...</span>
                    ) : (
                      <>
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>انتخاب و شارژ آنی</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Real-time Credit Usage Logs Table */}
      <div className="max-w-6xl mx-auto space-y-3 text-right">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-amber-400" />
            <span>گزارش تراکنش‌ها و ریز مصرف اعتبارات (Audit Logs)</span>
          </h4>
        </div>

        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] font-bold">
                <tr>
                  <th className="p-3.5">عملیات / موضوع</th>
                  <th className="p-3.5">توضیحات استعلام</th>
                  <th className="p-3.5">میزان کسر</th>
                  <th className="p-3.5">زمان ثبت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-500">
                      هنوز لاگ مصرفی ثبت نگردیده است.
                    </td>
                  </tr>
                ) : (
                  logs.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-850 transition-colors">
                      <td className="p-3.5 font-bold text-white">{l.action}</td>
                      <td className="p-3.5 text-slate-300">{l.details}</td>
                      <td className="p-3.5 font-mono text-red-400 font-bold">-{l.amount} واحد</td>
                      <td className="p-3.5 text-slate-500 font-mono text-[11px]">{l.created_at}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
