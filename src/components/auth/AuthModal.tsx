import React, { useState } from "react";
import { User } from "../../types";
import { api } from "../../lib/api";
import { ShieldCheck, Phone, KeyRound, User as UserIcon, Mail, CheckCircle2, Lock } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthenticated }) => {
  const [step, setStep] = useState<"phone" | "otp" | "profile">("phone");
  const [phone, setPhone] = useState("09121234567");
  const [code, setCode] = useState("12345");
  const [name, setName] = useState("دکتر مهدی");
  const [familyName, setFamilyName] = useState("انصاری");
  const [role, setRole] = useState("LAWYER");
  const [licenseNumber, setLicenseNumber] = useState("140199283");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpHint, setOtpHint] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError("شماره همراه معتبر وارد فرمایید.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.requestOtp(phone);
      if (res.debugOtp) {
        setOtpHint(`کد پیامک‌شده: ${res.debugOtp}`);
      }
      setStep("otp");
    } catch (err: any) {
      setError(err.message || "خطا در ارسال پیامک");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.verifyOtp(phone, code);
      if (res.isNew) {
        setStep("profile");
      } else {
        onAuthenticated(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "کد تأیید نادرست است.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, family_name: familyName, role, license_number: licenseNumber })
      }).then(r => r.json());

      if (res.user) {
        onAuthenticated(res.user);
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-right space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Lock className="w-4 h-4" />
            <span>احراز هویت و ورود وکلا (OTP Login)</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* STEP 1: Phone */}
        {step === "phone" && (
          <form onSubmit={handleRequestOtp} className="space-y-4 text-xs">
            <p className="text-slate-300 leading-relaxed">
              شماره تلفن همراه خود را جهت دریافت کد تأیید یکبار مصرف ۵ رقمی وارد فرمایید:
            </p>

            <div>
              <label className="block text-slate-400 mb-1">شماره موبایل:</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl pr-9 pl-3 py-2.5 text-xs text-slate-100 font-mono text-left outline-none"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
            >
              {isLoading ? "در حال ارسال..." : "دریافت کد تأیید پیامکی"}
            </button>
          </form>
        )}

        {/* STEP 2: OTP */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
            <p className="text-slate-300 leading-relaxed">
              کد ارسال شده به شماره <span className="text-amber-300 font-mono">{phone}</span> را وارد نمایید:
            </p>

            {otpHint && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-300 text-[11px] font-mono border border-emerald-500/20 text-center">
                {otpHint} (کد پیش‌فرض: ۱۲۳۴۵)
              </div>
            )}

            <div>
              <label className="block text-slate-400 mb-1">کد ۵ رقمی:</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="۱۲۳۴۵"
                  maxLength={6}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl pr-9 pl-3 py-2.5 text-sm text-center text-slate-100 font-mono tracking-widest outline-none"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
            >
              {isLoading ? "در حال اعتبارسنجی..." : "تأیید و ورود به پلتفرم"}
            </button>

            <button
              type="button"
              onClick={() => setStep("phone")}
              className="w-full text-center text-slate-400 hover:text-slate-200 text-[11px]"
            >
              ویرایش شماره موبایل
            </button>
          </form>
        )}

        {/* STEP 3: Profile Completion */}
        {step === "profile" && (
          <form onSubmit={handleCompleteProfile} className="space-y-3 text-xs">
            <p className="text-slate-300 text-xs">لطفاً مشخصات حساب کاربری خود را تکمیل فرمایید:</p>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 mb-1">نام:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">نام خانوادگی:</label>
                <input
                  type="text"
                  required
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">نقش تخصصی:</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 outline-none"
              >
                <option value="LAWYER">وکیل پایه یک دادگستری / کارآموز وکالت</option>
                <option value="ADMIN">کارشناس حقوقی / مشاور قضایی</option>
                <option value="USER">کاربر عادی / متقاضی خدمات حقوقی</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">شماره پروانه وکالت (اختیاری):</label>
              <input
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 outline-none font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md mt-2"
            >
              ذخیره و دریافت ۱۰۰ اعتبار اولیه رایگان
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
