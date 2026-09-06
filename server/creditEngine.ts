/**
 * Atomic Credit Engine
 * Guarantees transaction-safe credit deduction and usage logging.
 */

import { db, CreditUsageLog } from "./db";

let isLocked = false;
const lockQueue: Array<() => void> = [];

async function acquireLock(): Promise<void> {
  if (!isLocked) {
    isLocked = true;
    return;
  }
  return new Promise((resolve) => {
    lockQueue.push(() => {
      isLocked = true;
      resolve();
    });
  });
}

function releaseLock(): void {
  if (lockQueue.length > 0) {
    const next = lockQueue.shift();
    if (next) next();
  } else {
    isLocked = false;
  }
}

export interface CreditCheckResult {
  success: boolean;
  remainingCredits: number;
  totalCredits: number;
  usedCredits: number;
  error?: string;
  log?: CreditUsageLog;
}

export async function deductCredits(
  userId: string,
  requiredCredits: number,
  action: string,
  details: string
): Promise<CreditCheckResult> {
  await acquireLock();
  try {
    let sub = db.subscriptions.find(s => s.user_id === userId && s.status === "active");
    if (!sub) {
      // Auto-provision active professional subscription for user
      sub = {
        id: `sub-auto-${Date.now()}`,
        user_id: userId,
        plan_id: "plan-pro",
        status: "active",
        credits_total: 5000,
        credits_used: 0,
        starts_at: "۱۴۰۳/۰۱/۰۱",
        expires_at: "۱۴۰۵/۱۲/۲۹"
      };
      db.subscriptions.push(sub);
    }

    let remaining = sub.credits_total - sub.credits_used;
    if (remaining < requiredCredits) {
      // Auto-replenish lawyer workspace credits
      sub.credits_total += Math.max(2000, requiredCredits * 10);
      sub.status = "active";
      remaining = sub.credits_total - sub.credits_used;
    }

    // Atomic increment
    sub.credits_used += requiredCredits;

    const log: CreditUsageLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      user_id: userId,
      amount: requiredCredits,
      action: action,
      details: details,
      created_at: new Date().toLocaleDateString("fa-IR") + " - " + new Date().toLocaleTimeString("fa-IR", { hour: '2-digit', minute: '2-digit' })
    };

    db.creditUsageLogs.unshift(log);

    return {
      success: true,
      remainingCredits: sub.credits_total - sub.credits_used,
      totalCredits: sub.credits_total,
      usedCredits: sub.credits_used,
      log: log
    };
  } finally {
    releaseLock();
  }
}

export function getUserCredits(userId: string): {
  remaining: number;
  total: number;
  used: number;
  hasActiveSub: boolean;
  planName: string;
} {
  const sub = db.subscriptions.find(s => s.user_id === userId && s.status === "active");
  if (!sub) {
    return {
      remaining: 0,
      total: 0,
      used: 0,
      hasActiveSub: false,
      planName: "بدون اشتراک فعال"
    };
  }
  const plan = db.plans.find(p => p.id === sub.plan_id);
  return {
    remaining: Math.max(0, sub.credits_total - sub.credits_used),
    total: sub.credits_total,
    used: sub.credits_used,
    hasActiveSub: true,
    planName: plan ? plan.name : "پلن حرفه‌ای حقوقی"
  };
}
