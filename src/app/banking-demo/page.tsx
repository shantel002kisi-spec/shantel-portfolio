"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState, useSyncExternalStore } from "react";
import {
  createCustomer,
  deleteCustomer,
  getBankDemoServerSnapshot,
  getBankDemoSnapshot,
  postDeposit,
  postTransfer,
  postWithdrawal,
  resetBankDemo,
  subscribeToBankDemo,
  updateCustomer,
  type AccountType,
  type DemoCustomer,
  type DemoTransaction,
} from "./banking-demo-store";
import "./banking-demo.css";

type Tab = "overview" | "customers" | "transfers" | "reports";
type Modal =
  | { type: "deposit" | "withdraw"; accountNo: number }
  | { type: "transfer"; accountNo?: number }
  | { type: "create" }
  | { type: "edit" | "delete"; accountNo: number }
  | null;

const money = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });
const formatMoney = (amount: number) => money.format(amount);
const formatDate = (date: string) => new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(date));
const displayName = (customer: DemoCustomer) => `${customer.firstName} ${customer.lastName}`;

export default function BankingDemoPage() {
  const state = useSyncExternalStore(subscribeToBankDemo, getBankDemoSnapshot, getBankDemoServerSnapshot);
  const [tab, setTab] = useState<Tab>("overview");
  const [query, setQuery] = useState("");
  const [selectedAccountNo, setSelectedAccountNo] = useState<number | null>(1234);
  const [modal, setModal] = useState<Modal>(null);
  const [operator, setOperator] = useState<"full" | "limited">("full");
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const canManage = true;
  const canAdminister = operator === "full";

  const customers = state.customers;
  const selectedCustomer = customers.find((customer) => customer.accountNo === selectedAccountNo) ?? customers[0] ?? null;
  const filteredCustomers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return customers;
    return customers.filter((customer) => `${customer.firstName} ${customer.lastName} ${customer.accountNo} ${customer.accountType}`.toLowerCase().includes(normalized));
  }, [customers, query]);
  const totalBalance = customers.reduce((sum, customer) => sum + customer.balance, 0);
  const expectedInterest = customers.reduce((sum, customer) => sum + (customer.accountType === "Savings" ? customer.balance * customer.interestRate : 0), 0);
  const overdraftUsed = customers.reduce((sum, customer) => sum + Math.max(0, -customer.balance), 0);
  const recentTransactions = state.transactions.slice(0, 6);

  function flash(type: "success" | "error", text: string) {
    setNotice({ type, text });
    window.setTimeout(() => setNotice((current) => current?.text === text ? null : current), 4200);
  }

  function submitAction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!modal) return;
    if (!canAdminister && modal.type === "create") {
      flash("error", "Switch to Full access demo mode to change demo data.");
      return;
    }
    const data = new FormData(event.currentTarget);
    try {
      if (modal.type === "deposit" || modal.type === "withdraw") {
        const amount = Number(data.get("amount"));
        if (modal.type === "deposit") postDeposit(modal.accountNo, amount);
        else postWithdrawal(modal.accountNo, amount);
        flash("success", `${modal.type === "deposit" ? "Deposit" : "Withdrawal"} recorded in the demo ledger.`);
      } else if (modal.type === "transfer") {
        const senderNo = Number(data.get("senderNo"));
        const receiverNo = Number(data.get("receiverNo"));
        postTransfer(senderNo, receiverNo, Number(data.get("amount")));
        flash("success", `Demo transfer posted from ${senderNo} to ${receiverNo}.`);
      } else if (modal.type === "create") {
        const accountType = data.get("accountType") as AccountType;
        const accountNo = createCustomer({
          firstName: String(data.get("firstName") ?? ""),
          lastName: String(data.get("lastName") ?? ""),
          accountType,
          balance: Number(data.get("balance")),
          interestRate: accountType === "Savings" ? Number(data.get("interestRate")) / 100 : 0,
          overdraftLimit: accountType === "Current" ? Number(data.get("overdraftLimit")) : 0,
        });
        setSelectedAccountNo(accountNo);
        setTab("customers");
        flash("success", `Fictional demo account ${accountNo} created.`);
      } else if (modal.type === "edit") {
        const accountType = data.get("accountType") as AccountType;
        updateCustomer(modal.accountNo, {
          firstName: String(data.get("firstName") ?? ""),
          lastName: String(data.get("lastName") ?? ""),
          accountType,
          interestRate: accountType === "Savings" ? Number(data.get("interestRate")) / 100 : 0,
          overdraftLimit: accountType === "Current" ? Number(data.get("overdraftLimit")) : 0,
        });
        flash("success", "Demo customer profile updated.");
      }
      setModal(null);
    } catch (error) {
      flash("error", error instanceof Error ? error.message : "That action could not be completed.");
    }
  }

  function confirmDelete() {
    if (modal?.type !== "delete" || !canAdminister) return;
    try {
      deleteCustomer(modal.accountNo);
      if (selectedAccountNo === modal.accountNo) setSelectedAccountNo(customers.find((customer) => customer.accountNo !== modal.accountNo)?.accountNo ?? null);
      setModal(null);
      flash("success", `Demo account ${modal.accountNo} deleted.`);
    } catch (error) {
      flash("error", error instanceof Error ? error.message : "That account could not be deleted.");
    }
  }

  function runReset() {
    resetBankDemo();
    setSelectedAccountNo(1234);
    setQuery("");
    setTab("overview");
    flash("success", "Demo workspace reset to its fictional sample data.");
  }

  const tabItems: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "⌂" },
    { id: "customers", label: "Customers", icon: "◉" },
    { id: "transfers", label: "Transfers", icon: "⇄" },
    { id: "reports", label: "Reports", icon: "▥" },
  ];

  return (
    <main className="bank-demo">
      <div className="demo-safety-banner"><span className="demo-safety-dot" /> PORTFOLIO PRACTICE SYSTEM <i>·</i> FICTIONAL DATA ONLY <span>NO REAL ACCOUNTS OR PAYMENTS</span></div>
      <header className="demo-header">
        <Link href="/" className="demo-brand" aria-label="Return to Shantel's portfolio"><span className="demo-brand-mark">S<span>.</span></span><span>FIELDNOTE <small>BANKING DEMO</small></span></Link>
        <div className="demo-header-right"><span className="local-indicator"><i /> SAVED IN THIS BROWSER</span><label className="role-switch">DEMO ROLE<select value={operator} onChange={(event) => setOperator(event.target.value as "full" | "limited")} aria-label="Select a demo permission role"><option value="full">Full access</option><option value="limited">Limited admin</option></select></label><button type="button" className="reset-button" onClick={runReset}>Reset demo</button><Link href="/" className="back-link">Portfolio ↗</Link></div>
      </header>

      <div className="demo-shell">
        <aside className="demo-sidebar" aria-label="Bank demo navigation">
          <div className="workspace-label"><span>WORKSPACE</span><strong><i /> Personal practice</strong></div>
          <nav className="demo-nav">{tabItems.map((item) => <button type="button" key={item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)} aria-current={tab === item.id ? "page" : undefined}><span>{item.icon}</span>{item.label}{item.id === "customers" && <small>{customers.length}</small>}</button>)}</nav>
          <div className="sidebar-note"><span className="note-icon">✳</span><strong>A safe space to explore.</strong><p>Everything here is a browser-only simulation. No bank connections, credentials, or real money.</p></div>
          <div className="sidebar-foot"><span>DEMO BUILD · 01</span><span>DESIGNED & BUILT BY SHANTEL KISI</span></div>
        </aside>

        <section className="demo-main">
          <div className="demo-topline"><span>PERSONAL WORKSPACE <i>/</i> {tab.toUpperCase()}</span><span>LOCAL DEMO · DATA STAYS ON THIS DEVICE</span></div>
          {notice && <div className={`demo-toast demo-toast--${notice.type}`} role="status"><span>{notice.type === "success" ? "✓" : "!"}</span>{notice.text}<button type="button" onClick={() => setNotice(null)} aria-label="Dismiss message">×</button></div>}
          {tab === "overview" && <Overview customers={customers} totalBalance={totalBalance} expectedInterest={expectedInterest} overdraftUsed={overdraftUsed} transactions={recentTransactions} onNavigate={setTab} onSelectAccount={(accountNo) => { setSelectedAccountNo(accountNo); setTab("customers"); }} />}
          {tab === "customers" && <CustomersView customers={filteredCustomers} query={query} setQuery={setQuery} selected={selectedCustomer} canManage={canManage} canAdminister={canAdminister} setSelectedAccountNo={setSelectedAccountNo} onAction={setModal} />}
          {tab === "transfers" && <TransfersView customers={customers} canManage={canManage} onTransfer={() => setModal({ type: "transfer" })} transactions={state.transactions.filter((transaction) => transaction.type.startsWith("Transfer")).slice(0, 8)} />}
          {tab === "reports" && <ReportsView customers={customers} transactions={state.transactions} totalBalance={totalBalance} expectedInterest={expectedInterest} overdraftUsed={overdraftUsed} />}
          <footer className="demo-footer"><span>THIS IS A PORTFOLIO SIMULATION, NOT A FINANCIAL SERVICE.</span><span>DEMO DATA IS FICTIONAL · RESET ANYTIME</span></footer>
        </section>
      </div>

      {modal && <ActionDialog modal={modal} customers={customers} selected={customers.find((customer) => customer.accountNo === ("accountNo" in modal ? modal.accountNo : -1)) ?? null} onClose={() => setModal(null)} onSubmit={submitAction} onDelete={confirmDelete} canManage={canManage} canAdminister={canAdminister} />}
    </main>
  );
}

function Overview({ customers, totalBalance, expectedInterest, overdraftUsed, transactions, onNavigate, onSelectAccount }: {
  customers: DemoCustomer[]; totalBalance: number; expectedInterest: number; overdraftUsed: number; transactions: DemoTransaction[]; onNavigate: (tab: Tab) => void; onSelectAccount: (accountNo: number) => void;
}) {
  return <>
    <div className="welcome-row"><div><span className="page-eyebrow">INTERACTIVE BANKING SYSTEM · DEMO ENVIRONMENT</span><h1>Your banking<br /><em>workspace.</em></h1><p>A small, safe simulation of the account-management system I built in Python.</p></div><div className="welcome-stamp"><span>SK</span><small>BUILD Nº 001</small></div></div>
    <div className="metrics-grid">
      <Metric label="DEMO ACCOUNTS" value={String(customers.length).padStart(2, "0")} suffix="active profiles" tone="green" />
      <Metric label="TOTAL DEMO BALANCE" value={formatMoney(totalBalance)} suffix="fictional funds" tone="dark" />
      <Metric label="EST. SAVINGS INTEREST" value={formatMoney(expectedInterest)} suffix="projected annually" tone="blue" />
      <Metric label="OVERDRAFT USED" value={formatMoney(overdraftUsed)} suffix="demo accounts" tone="sand" />
    </div>
    <div className="overview-columns">
      <section className="surface-card account-surface"><div className="card-heading"><div><span className="section-overline">THE PORTFOLIO</span><h2>Customer accounts</h2></div><button type="button" className="quiet-link" onClick={() => onNavigate("customers")}>View all <span>↗</span></button></div>
        <div className="account-preview-list">{customers.slice(0, 4).map((customer, index) => <button type="button" className="account-preview" key={customer.accountNo} onClick={() => onSelectAccount(customer.accountNo)}><span className={`account-avatar account-avatar--${index % 4}`}>{customer.firstName[0]}{customer.lastName[0]}</span><span className="account-preview-name"><strong>{displayName(customer)}</strong><small>ACCT ···· {String(customer.accountNo).slice(-4)} <i>·</i> {customer.accountType}</small></span><span className="account-preview-balance">{formatMoney(customer.balance)}</span><span className="row-arrow">↗</span></button>)}</div>
      </section>
      <section className="surface-card activity-surface"><div className="card-heading"><div><span className="section-overline">LIVE LEDGER</span><h2>Recent activity</h2></div><button type="button" className="quiet-link" onClick={() => onNavigate("reports")}>Report <span>↗</span></button></div><TransactionList transactions={transactions} compact /></section>
    </div>
    <div className="quick-actions"><div><span className="section-overline">PICK UP THE CONTROLS</span><h2>Try a workflow.</h2></div><button type="button" onClick={() => onNavigate("customers")}><span>01</span> Find a customer <i>↗</i></button><button type="button" onClick={() => onNavigate("transfers")}><span>02</span> Make a transfer <i>↗</i></button><button type="button" onClick={() => onNavigate("reports")}><span>03</span> Review the report <i>↗</i></button></div>
  </>;
}

function Metric({ label, value, suffix, tone }: { label: string; value: string; suffix: string; tone: string }) {
  return <article className={`metric-card metric-card--${tone}`}><span>{label}</span><strong>{value}</strong><small>{suffix}</small><i aria-hidden="true">✳</i></article>;
}

function CustomersView({ customers, query, setQuery, selected, canManage, canAdminister, setSelectedAccountNo, onAction }: {
  customers: DemoCustomer[]; query: string; setQuery: (query: string) => void; selected: DemoCustomer | null; canManage: boolean; canAdminister: boolean; setSelectedAccountNo: (accountNo: number) => void; onAction: (modal: Modal) => void;
}) {
  return <>
    <div className="subpage-heading"><div><span className="page-eyebrow">ACCOUNTS / DIRECTORY</span><h1>People &amp; <em>accounts.</em></h1><p>Find a profile, inspect account rules, and safely try account operations.</p></div>{canAdminister && <button type="button" className="primary-action" onClick={() => onAction({ type: "create" })}>＋ New account</button>}</div>
    <div className="customers-layout"><section className="surface-card directory-card"><div className="directory-search"><label htmlFor="customer-search">SEARCH CUSTOMERS</label><span>⌕</span><input id="customer-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, account number, type…" /></div><div className="directory-list">{customers.map((customer, index) => <button type="button" key={customer.accountNo} className={`directory-person ${selected?.accountNo === customer.accountNo ? "selected" : ""}`} onClick={() => setSelectedAccountNo(customer.accountNo)}><span className={`account-avatar account-avatar--${index % 4}`}>{customer.firstName[0]}{customer.lastName[0]}</span><span><strong>{displayName(customer)}</strong><small>•••• {String(customer.accountNo).slice(-4)}</small></span><span className={`type-pill type-pill--${customer.accountType.toLowerCase()}`}>{customer.accountType}</span></button>)}{customers.length === 0 && <p className="empty-search">No demo accounts match that search.</p>}</div><p className="fictional-list-note">FICTIONAL SAMPLE CUSTOMERS · NO REAL CUSTOMER DATA</p></section>
      <section className="surface-card customer-detail-card">{selected ? <><div className="detail-top"><span className={`account-avatar account-avatar--${selected.accountNo % 4}`}>{selected.firstName[0]}{selected.lastName[0]}</span><span className={`type-pill type-pill--${selected.accountType.toLowerCase()}`}>{selected.accountType} account</span><button type="button" className="detail-menu" aria-label="Edit selected account" onClick={() => onAction({ type: "edit", accountNo: selected.accountNo })} disabled={!canManage}>•••</button></div><span className="section-overline">ACCOUNT {selected.accountNo}</span><h2 className="detail-name">{displayName(selected)}</h2><p className="detail-since">Demo profile · opened {formatDate(selected.createdAt).split(",")[0]}</p><div className="balance-block"><span>AVAILABLE BALANCE</span><strong>{formatMoney(selected.balance)}</strong><small>{selected.accountType === "Current" ? `Overdraft limit ${formatMoney(selected.overdraftLimit)}` : `${(selected.interestRate * 100).toFixed(2)}% illustrative interest rate`}</small></div><div className="account-action-grid"><button type="button" onClick={() => onAction({ type: "deposit", accountNo: selected.accountNo })} disabled={!canManage}><span>＋</span> Deposit</button><button type="button" onClick={() => onAction({ type: "withdraw", accountNo: selected.accountNo })} disabled={!canManage}><span>−</span> Withdraw</button><button type="button" onClick={() => onAction({ type: "transfer", accountNo: selected.accountNo })} disabled={!canManage}><span>⇄</span> Transfer</button><button type="button" onClick={() => onAction({ type: "edit", accountNo: selected.accountNo })} disabled={!canManage}><span>⌁</span> Edit profile</button></div><div className="detail-bottom"><span>SIMULATED LEDGER</span>{canAdminister && <button type="button" className="danger-link" onClick={() => onAction({ type: "delete", accountNo: selected.accountNo })}>Delete demo account</button>}</div></> : <div className="empty-detail"><span>◉</span><strong>No demo accounts yet</strong><p>Create a fictional account to explore this screen.</p></div>}</section></div>
  </>;
}

function TransfersView({ customers, canManage, onTransfer, transactions }: { customers: DemoCustomer[]; canManage: boolean; onTransfer: () => void; transactions: DemoTransaction[] }) {
  return <><div className="subpage-heading"><div><span className="page-eyebrow">PAYMENTS / INTERNAL DEMO</span><h1>Move money,<br /><em>not real money.</em></h1><p>Try a simulated transfer between fictional customer accounts.</p></div><span className="safe-chip">NO BANK CONNECTION</span></div><section className="transfer-panel"><div className="transfer-panel-copy"><span className="section-overline">INTERNAL TRANSFER</span><h2>One ledger.<br /><em>Two sides.</em></h2><p>Each successful transfer validates the sender’s balance and posts matching debit and credit entries together.</p><div className="transfer-stat"><span>READY ACCOUNTS</span><strong>{customers.length.toString().padStart(2, "0")}</strong></div></div><div className="transfer-visual"><div className="transfer-node transfer-node--from"><span>FROM</span><strong>Account</strong><i>↗</i></div><div className="transfer-path"><span>£</span><i /></div><div className="transfer-node transfer-node--to"><span>TO</span><strong>Account</strong><i>↙</i></div><button className="primary-action" type="button" onClick={onTransfer} disabled={!canManage || customers.length < 2}>＋ Start a demo transfer</button></div></section><section className="surface-card transfer-history"><div className="card-heading"><div><span className="section-overline">AUDIT TRAIL</span><h2>Recent transfers</h2></div><span className="safe-chip">SIMULATED</span></div><TransactionList transactions={transactions} />{transactions.length === 0 && <p className="empty-search">No transfers yet. Run a demo to create the first entries.</p>}</section></>;
}

function ReportsView({ customers, transactions, totalBalance, expectedInterest, overdraftUsed }: { customers: DemoCustomer[]; transactions: DemoTransaction[]; totalBalance: number; expectedInterest: number; overdraftUsed: number }) {
  const maximum = Math.max(1, ...customers.map((customer) => Math.abs(customer.balance)));
  const deposits = transactions.filter((transaction) => transaction.type === "Deposit" || transaction.type === "Transfer in").reduce((sum, transaction) => sum + transaction.amount, 0);
  const withdrawals = transactions.filter((transaction) => transaction.type === "Withdrawal" || transaction.type === "Transfer out").reduce((sum, transaction) => sum + transaction.amount, 0);
  return <><div className="subpage-heading"><div><span className="page-eyebrow">ANALYTICS / MANAGEMENT VIEW</span><h1>A clearer <em>picture.</em></h1><p>A live summary derived from the fictional accounts and demo ledger.</p></div><span className="safe-chip">DEMO REPORT</span></div><div className="report-summary"><Metric label="CUSTOMERS" value={String(customers.length).padStart(2, "0")} suffix="fictional records" tone="green" /><Metric label="TOTAL BALANCES" value={formatMoney(totalBalance)} suffix="sample portfolio" tone="dark" /><Metric label="POTENTIAL INTEREST" value={formatMoney(expectedInterest)} suffix="illustrative annual" tone="blue" /><Metric label="OVERDRAFT IN USE" value={formatMoney(overdraftUsed)} suffix="sample portfolio" tone="sand" /></div><div className="report-columns"><section className="surface-card balances-report"><div className="card-heading"><div><span className="section-overline">BALANCE DISTRIBUTION</span><h2>By account</h2></div><span className="mini-label">GBP · DEMO</span></div>{customers.map((customer, index) => <div className="balance-row" key={customer.accountNo}><div><span className={`account-avatar account-avatar--${index % 4}`}>{customer.firstName[0]}{customer.lastName[0]}</span><span><strong>{displayName(customer)}</strong><small>•••• {String(customer.accountNo).slice(-4)}</small></span></div><div className="balance-bar-track"><i style={{ width: `${Math.min(100, Math.abs(customer.balance) / maximum * 100)}%` }} /></div><strong className={customer.balance < 0 ? "negative" : ""}>{formatMoney(customer.balance)}</strong></div>)}</section><section className="surface-card report-flow"><div className="card-heading"><div><span className="section-overline">LEDGER TOTALS</span><h2>Cash movement</h2></div></div><div className="flow-row"><span className="flow-icon flow-icon--in">↓</span><span><strong>Credits in</strong><small>Deposits + transfers received</small></span><strong>{formatMoney(deposits)}</strong></div><div className="flow-row"><span className="flow-icon flow-icon--out">↑</span><span><strong>Credits out</strong><small>Withdrawals + transfers sent</small></span><strong>{formatMoney(withdrawals)}</strong></div><div className="flow-total"><span>NET MOVEMENT</span><strong>{formatMoney(deposits - withdrawals)}</strong></div></section></div><section className="surface-card all-activity"><div className="card-heading"><div><span className="section-overline">FULL SAMPLE LEDGER</span><h2>Transaction history</h2></div><span className="safe-chip">{transactions.length} ENTRIES</span></div><TransactionList transactions={transactions.slice(0, 12)} />{transactions.length === 0 && <p className="empty-search">The demo ledger is clear.</p>}</section></>;
}

function TransactionList({ transactions, compact = false }: { transactions: DemoTransaction[]; compact?: boolean }) {
  if (!transactions.length) return <p className="empty-search">No activity yet. Try a demo operation.</p>;
  return <div className={`transaction-list ${compact ? "transaction-list--compact" : ""}`}>{transactions.map((transaction) => <div className="transaction-row" key={transaction.id}><span className={`transaction-icon transaction-icon--${transaction.type === "Withdrawal" || transaction.type === "Transfer out" ? "out" : "in"}`}>{transaction.type === "Withdrawal" || transaction.type === "Transfer out" ? "↗" : transaction.type === "Account opened" ? "＋" : "↙"}</span><span className="transaction-info"><strong>{transaction.type}</strong><small>{transaction.note} <i>·</i> #{transaction.accountNo}</small></span><span className="transaction-date">{formatDate(transaction.timestamp)}</span><strong className={`transaction-amount ${transaction.type === "Withdrawal" || transaction.type === "Transfer out" ? "negative" : "positive"}`}>{transaction.type === "Withdrawal" || transaction.type === "Transfer out" ? "−" : "+"}{formatMoney(transaction.amount)}</strong></div>)}</div>;
}

function ActionDialog({ modal, customers, selected, onClose, onSubmit, onDelete, canManage, canAdminister }: {
  modal: Exclude<Modal, null>; customers: DemoCustomer[]; selected: DemoCustomer | null; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onDelete: () => void; canManage: boolean; canAdminister: boolean;
}) {
  const title = modal.type === "deposit" ? "Record a deposit" : modal.type === "withdraw" ? "Record a withdrawal" : modal.type === "transfer" ? "Move demo funds" : modal.type === "create" ? "Open a demo account" : modal.type === "edit" ? "Edit customer profile" : "Delete this demo account?";
  const customer = selected;
  return <div className="bank-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="bank-dialog" role="dialog" aria-modal="true" aria-labelledby="bank-dialog-title"><button className="bank-dialog-close" type="button" onClick={onClose} aria-label="Close dialog">×</button><span className="section-overline">PRACTICE SYSTEM · DEMO ACTION</span><h2 id="bank-dialog-title">{title}</h2>
    {(modal.type === "deposit" || modal.type === "withdraw") && <form onSubmit={onSubmit}><label>Customer account<span className="fixed-field">{customer ? `${displayName(customer)} · ${customer.accountNo}` : modal.accountNo}</span></label><label>Amount in GBP<input name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" required autoFocus /></label><div className="dialog-note">This changes sample data saved only in this browser.</div><div className="dialog-actions"><button className="secondary-action" type="button" onClick={onClose}>Cancel</button><button className="primary-action" type="submit" disabled={!canManage}>Confirm {modal.type}</button></div></form>}
    {modal.type === "transfer" && <form onSubmit={onSubmit}><label>From account<select name="senderNo" defaultValue={modal.accountNo ?? customers[0]?.accountNo} required>{customers.map((account) => <option key={account.accountNo} value={account.accountNo}>{displayName(account)} · {account.accountNo} · {formatMoney(account.balance)}</option>)}</select></label><label>To account<select name="receiverNo" defaultValue={customers.find((account) => account.accountNo !== (modal.accountNo ?? customers[0]?.accountNo))?.accountNo} required>{customers.map((account) => <option key={account.accountNo} value={account.accountNo}>{displayName(account)} · {account.accountNo}</option>)}</select></label><label>Amount in GBP<input name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" required /></label><div className="dialog-note">Both sides of the demo ledger update together. No real payment is made.</div><div className="dialog-actions"><button className="secondary-action" type="button" onClick={onClose}>Cancel</button><button className="primary-action" type="submit" disabled={!canManage || customers.length < 2}>Review transfer</button></div></form>}
    {modal.type === "create" && <form onSubmit={onSubmit}><div className="form-pair"><label>First name<input name="firstName" maxLength={40} required autoFocus /></label><label>Last name<input name="lastName" maxLength={40} required /></label></div><label>Account type<select name="accountType"><option>Savings</option><option>Current</option></select></label><label>Opening balance<input name="balance" type="number" min="0" step="0.01" defaultValue="100" required /></label><label>Savings interest rate (%)<input name="interestRate" type="number" min="0" max="25" step="0.1" defaultValue="2.5" /></label><label>Current account overdraft limit<input name="overdraftLimit" type="number" min="0" step="50" defaultValue="500" /></label><div className="dialog-note">Use fictional names only. The account is not connected to a real bank.</div><div className="dialog-actions"><button className="secondary-action" type="button" onClick={onClose}>Cancel</button><button className="primary-action" type="submit" disabled={!canAdminister}>Create demo account</button></div></form>}
    {modal.type === "edit" && customer && <form onSubmit={onSubmit}><div className="form-pair"><label>First name<input name="firstName" maxLength={40} defaultValue={customer.firstName} required autoFocus /></label><label>Last name<input name="lastName" maxLength={40} defaultValue={customer.lastName} required /></label></div><label>Account type<select name="accountType" defaultValue={customer.accountType}><option>Savings</option><option>Current</option></select></label><label>Savings interest rate (%)<input name="interestRate" type="number" min="0" max="25" step="0.1" defaultValue={customer.interestRate * 100} /></label><label>Current account overdraft limit<input name="overdraftLimit" type="number" min="0" step="50" defaultValue={customer.overdraftLimit} /></label><div className="dialog-actions"><button className="secondary-action" type="button" onClick={onClose}>Cancel</button><button className="primary-action" type="submit" disabled={!canManage}>Save profile</button></div></form>}
    {modal.type === "delete" && customer && <><p className="delete-warning">You are removing fictional sample account <strong>{displayName(customer)} · {customer.accountNo}</strong> from this browser’s demo data. This cannot be undone except by resetting the sample workspace.</p><div className="dialog-actions"><button className="secondary-action" type="button" onClick={onClose}>Keep account</button><button className="primary-action danger-button" type="button" onClick={onDelete} disabled={!canAdminister}>Delete demo account</button></div></>}
  </section></div>;
}
