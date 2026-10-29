"use client";

export type AccountType = "Savings" | "Current";
export type TransactionType = "Deposit" | "Withdrawal" | "Transfer in" | "Transfer out" | "Account opened";

export type DemoCustomer = {
  accountNo: number;
  firstName: string;
  lastName: string;
  accountType: AccountType;
  balance: number;
  interestRate: number;
  overdraftLimit: number;
  createdAt: string;
};

export type DemoTransaction = {
  id: string;
  accountNo: number;
  type: TransactionType;
  amount: number;
  note: string;
  timestamp: string;
  relatedAccount?: number;
};

export type BankDemoState = {
  customers: DemoCustomer[];
  transactions: DemoTransaction[];
};

const STORAGE_KEY = "shantel-banking-demo-v1";
const SERVER_STATE: BankDemoState = {
  customers: [
    { accountNo: 1234, firstName: "Avery", lastName: "Morgan", accountType: "Savings", balance: 5240, interestRate: 0.025, overdraftLimit: 0, createdAt: "2026-01-12T09:00:00.000Z" },
    { accountNo: 1235, firstName: "Jordan", lastName: "Taylor", accountType: "Current", balance: 2185.5, interestRate: 0, overdraftLimit: 500, createdAt: "2026-02-08T10:30:00.000Z" },
    { accountNo: 1236, firstName: "Morgan", lastName: "Reed", accountType: "Savings", balance: 12450.75, interestRate: 0.03, overdraftLimit: 0, createdAt: "2026-03-16T12:00:00.000Z" },
    { accountNo: 1237, firstName: "Riley", lastName: "Chen", accountType: "Current", balance: 310, interestRate: 0, overdraftLimit: 750, createdAt: "2026-04-02T08:45:00.000Z" },
  ],
  transactions: [
    { id: "seed-1", accountNo: 1234, type: "Deposit", amount: 250, note: "Monthly deposit", timestamp: "2026-10-14T10:12:00.000Z" },
    { id: "seed-2", accountNo: 1235, type: "Withdrawal", amount: 42.8, note: "Cash withdrawal", timestamp: "2026-10-13T14:35:00.000Z" },
    { id: "seed-3", accountNo: 1236, type: "Transfer in", amount: 175, note: "Demo transfer", timestamp: "2026-10-12T09:20:00.000Z", relatedAccount: 1234 },
    { id: "seed-4", accountNo: 1237, type: "Deposit", amount: 90, note: "Counter deposit", timestamp: "2026-10-11T11:05:00.000Z" },
  ],
};

function copyState(state: BankDemoState): BankDemoState {
  return { customers: state.customers.map((customer) => ({ ...customer })), transactions: state.transactions.map((transaction) => ({ ...transaction })) };
}

function isDemoState(value: unknown): value is BankDemoState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<BankDemoState>;
  return Array.isArray(candidate.customers) && Array.isArray(candidate.transactions)
    && candidate.customers.every((customer) => customer && Number.isFinite(customer.accountNo) && typeof customer.firstName === "string" && typeof customer.lastName === "string" && Number.isFinite(customer.balance))
    && candidate.transactions.every((transaction) => transaction && typeof transaction.id === "string" && Number.isFinite(transaction.accountNo) && Number.isFinite(transaction.amount));
}

let snapshot = copyState(SERVER_STATE);
if (typeof window !== "undefined") {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (isDemoState(parsed)) snapshot = parsed;
    }
  } catch {
    // Keep the fictional in-memory sample if local storage is unavailable or malformed.
  }
}

const listeners = new Set<() => void>();

function commit(next: BankDemoState) {
  snapshot = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // The demo remains usable in memory if the browser blocks local storage.
  }
  listeners.forEach((listener) => listener());
}

export function subscribeToBankDemo(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getBankDemoSnapshot() {
  return snapshot;
}

export function getBankDemoServerSnapshot() {
  return SERVER_STATE;
}

export function resetBankDemo() {
  commit(copyState(SERVER_STATE));
}

function addTransaction(state: BankDemoState, transaction: Omit<DemoTransaction, "id" | "timestamp">) {
  state.transactions.unshift({ ...transaction, id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`, timestamp: new Date().toISOString() });
}

function requirePositiveAmount(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter an amount greater than £0.00.");
}

export function postDeposit(accountNo: number, amount: number) {
  requirePositiveAmount(amount);
  const next = copyState(snapshot);
  const customer = next.customers.find((account) => account.accountNo === accountNo);
  if (!customer) throw new Error("That demo account could not be found.");
  customer.balance = Number((customer.balance + amount).toFixed(2));
  addTransaction(next, { accountNo, type: "Deposit", amount, note: "Demo cash deposit" });
  commit(next);
}

export function postWithdrawal(accountNo: number, amount: number) {
  requirePositiveAmount(amount);
  const next = copyState(snapshot);
  const customer = next.customers.find((account) => account.accountNo === accountNo);
  if (!customer) throw new Error("That demo account could not be found.");
  const minimumBalance = customer.accountType === "Current" ? -customer.overdraftLimit : 0;
  if (customer.balance - amount < minimumBalance) throw new Error("This withdrawal exceeds the available balance or overdraft limit.");
  customer.balance = Number((customer.balance - amount).toFixed(2));
  addTransaction(next, { accountNo, type: "Withdrawal", amount, note: "Demo cash withdrawal" });
  commit(next);
}

export function postTransfer(senderNo: number, receiverNo: number, amount: number) {
  requirePositiveAmount(amount);
  if (senderNo === receiverNo) throw new Error("Choose two different accounts.");
  const next = copyState(snapshot);
  const sender = next.customers.find((account) => account.accountNo === senderNo);
  const receiver = next.customers.find((account) => account.accountNo === receiverNo);
  if (!sender || !receiver) throw new Error("Choose two existing demo accounts.");
  const minimumBalance = sender.accountType === "Current" ? -sender.overdraftLimit : 0;
  if (sender.balance - amount < minimumBalance) throw new Error("The sending account does not have enough available funds.");
  sender.balance = Number((sender.balance - amount).toFixed(2));
  receiver.balance = Number((receiver.balance + amount).toFixed(2));
  addTransaction(next, { accountNo: senderNo, type: "Transfer out", amount, note: `Transfer to ${receiverNo}`, relatedAccount: receiverNo });
  addTransaction(next, { accountNo: receiverNo, type: "Transfer in", amount, note: `Transfer from ${senderNo}`, relatedAccount: senderNo });
  commit(next);
}

export function createCustomer(input: Omit<DemoCustomer, "accountNo" | "createdAt">) {
  if (!input.firstName.trim() || !input.lastName.trim()) throw new Error("Enter a first and last name for this fictional demo account.");
  if (!Number.isFinite(input.balance) || input.balance < 0) throw new Error("Opening balance must be £0.00 or more.");
  const next = copyState(snapshot);
  const accountNo = Math.max(1200, ...next.customers.map((customer) => customer.accountNo)) + 1;
  const customer: DemoCustomer = { ...input, firstName: input.firstName.trim(), lastName: input.lastName.trim(), balance: Number(input.balance.toFixed(2)), accountNo, createdAt: new Date().toISOString() };
  next.customers.push(customer);
  addTransaction(next, { accountNo, type: "Account opened", amount: customer.balance, note: "Fictional demo account created" });
  commit(next);
  return accountNo;
}

export function updateCustomer(accountNo: number, patch: Pick<DemoCustomer, "firstName" | "lastName" | "accountType" | "interestRate" | "overdraftLimit">) {
  if (!patch.firstName.trim() || !patch.lastName.trim()) throw new Error("First and last name are required.");
  const next = copyState(snapshot);
  const customer = next.customers.find((account) => account.accountNo === accountNo);
  if (!customer) throw new Error("That demo account could not be found.");
  Object.assign(customer, { ...patch, firstName: patch.firstName.trim(), lastName: patch.lastName.trim() });
  commit(next);
}

export function deleteCustomer(accountNo: number) {
  const next = copyState(snapshot);
  if (!next.customers.some((customer) => customer.accountNo === accountNo)) throw new Error("That demo account could not be found.");
  next.customers = next.customers.filter((customer) => customer.accountNo !== accountNo);
  commit(next);
}
