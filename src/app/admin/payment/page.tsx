"use client";
import React, { useEffect, useState } from "react";
import { AdminService } from "@/core/api/admin/admin.service";
import { Payment, Subscription, TestPaymentIntentResponse, ConfirmTestPaymentResult } from "@/core/api/admin/types/admin.interface";
import {
  FlipCard
} from "@/theme/ui/flipcards";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const paymentColumns = [
  { label: "Payment ID", key: "_id" },
  { label: "User", key: "user" },
  { label: "Amount", key: "amount" },
  { label: "Currency", key: "currency" },
  { label: "Status", key: "status" },
  { label: "PaymentIntentId", key: "paymentIntentId" },
  { label: "Created At", key: "createdAt" },
  { label: "Actions", key: "actions" },
];

const subscriptionColumns = [
  { label: "Subscription ID", key: "id" },
  { label: "Customer", key: "customer" },
  { label: "Status", key: "status" },
  { label: "Current Period Start", key: "current_period_start" },
  { label: "Current Period End", key: "current_period_end" },
  { label: "Cancel At Period End", key: "cancel_at_period_end" },
  { label: "Canceled At", key: "canceled_at" },
  { label: "Actions", key: "actions" },
];

function formatDate(ts?: number | string) {
  if (!ts) return "-";
  const date = typeof ts === "number" ? new Date(ts * 1000) : new Date(ts);
  return date.toLocaleString();
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_xxx');

// Add a helper to detect test mode
const isTestMode = (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '').startsWith('pk_test_');

function ConfirmTestPaymentForm({ clientSecret, onResult }: { clientSecret: string, onResult: (result: ConfirmTestPaymentResult) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!stripe || !elements) {
      setError('Stripe.js has not loaded');
      setLoading(false);
      return;
    }
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found');
      setLoading(false);
      return;
    }
    const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });
    if (error) {
      setError(error.message || 'Payment failed');
      setLoading(false);
      onResult({ error: { message: error.message || 'Payment failed' } });
      return;
    }
    setLoading(false);
    onResult({ paymentIntent: paymentIntent as unknown as Record<string, unknown> });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 bg-gray-900 border border-gray-800 rounded-lg p-6 flex flex-col gap-4 w-full max-w-md shadow-lg">
      <div className="flex flex-col gap-2">
        <label className="text-gray-200 font-semibold">Test Card Details</label>
        <CardElement className="px-3 py-2 rounded bg-gray-800 text-gray-100 border border-gray-700" options={{ style: { base: { fontSize: '16px', color: '#fff' } } }} />
        <div className="text-xs text-gray-400 mt-1">Use 4242 4242 4242 4242, any future date, any CVC</div>
      </div>
      <button type="submit" className="px-4 py-2 rounded bg-[#ff3c00] text-white font-semibold hover:bg-[#ff6a00] transition" disabled={loading}>
        {loading ? 'Confirming...' : 'Confirm Test Payment'}
      </button>
      {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
    </form>
  );
}

function PaymentIntentSummary({ intent }: { intent: Record<string, unknown> }) {
  // Only show key fields by default
  const [showDetails, setShowDetails] = useState(false);
  if (!intent) return null;
  // Helper to format timestamp
  const formatDate = (ts?: number) => ts ? new Date(ts * 1000).toLocaleString() : '-';
  // Helper to format amount
  const formatAmount = (amount?: number, currency?: string) => {
    if (typeof amount !== 'number') return '-';
    const symbol = currency === 'gbp' ? '£' : currency === 'usd' ? '$' : '';
    return symbol + (amount / 100).toFixed(2);
  };
  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 mt-2">
      <div className="flex flex-wrap gap-4 items-center justify-between mb-2">
        <div>
          <span className="font-semibold text-gray-300">Intent ID:</span> <span className="font-mono text-orange-300">{intent.id as string}</span>
        </div>
        <div>
          <span className="font-semibold text-gray-300">Status:</span> <span className="font-mono text-orange-300">{intent.status as string}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-8 mb-2">
        <div>
          <span className="font-semibold text-gray-300">Amount:</span> <span className="font-mono">{formatAmount(intent.amount as number, intent.currency as string)}</span>
        </div>
        <div>
          <span className="font-semibold text-gray-300">Currency:</span> <span className="font-mono uppercase">{intent.currency as string}</span>
        </div>
        <div>
          <span className="font-semibold text-gray-300">Created:</span> <span className="font-mono">{formatDate(intent.created as number)}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-8 mb-2">
        <div>
          <span className="font-semibold text-gray-300">Client Secret:</span> <span className="font-mono text-xs break-all">{intent.client_secret as string}</span>
        </div>
      </div>
      <button
        className="mt-2 px-3 py-1 rounded bg-gray-800 text-gray-200 hover:bg-gray-700 text-xs font-semibold"
        onClick={() => setShowDetails(v => !v)}
      >
        {showDetails ? 'Hide Advanced Details' : 'Show Advanced Details'}
      </button>
      {showDetails && (
        <div className="mt-4 bg-gray-800 rounded p-3 overflow-x-auto">
          <pre className="text-xs text-gray-300 whitespace-pre-wrap break-all">{JSON.stringify(intent, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default function LedgerManagementPage() {
  // Payments state
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [paymentsPageSize, setPaymentsPageSize] = useState(20);
  const [paymentsTotal, setPaymentsTotal] = useState(0);
  const [paymentsSearch, setPaymentsSearch] = useState("");
  const [expandedPaymentId, setExpandedPaymentId] = useState<string | null>(null);
  const [refundLoading, setRefundLoading] = useState<string | null>(null);
  const [refundError, setRefundError] = useState<string | null>(null);

  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subsLoading, setSubsLoading] = useState(true);
  const [subsError, setSubsError] = useState<string | null>(null);
  const [subsPage, setSubsPage] = useState(1);
  const [subsPageSize, setSubsPageSize] = useState(20);
  const [subsTotal, setSubsTotal] = useState(0);
  const [subsSearch, setSubsSearch] = useState("");
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Test Payment state
  const [showTestPayment, setShowTestPayment] = useState(false);
  const [testAmount, setTestAmount] = useState(1);
  const [testCurrency] = useState('GBP');
  const [testMetadata, setTestMetadata] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestPaymentIntentResponse | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  // Fetch payments
  useEffect(() => {
    setPaymentsLoading(true);
    setPaymentsError(null);
    // TODO: Add backend support for pagination/search if needed
    AdminService.listPayments()
      .then((data) => {
        setPayments(Array.isArray(data) ? data : []);
        setPaymentsTotal(Array.isArray(data) ? data.length : 0);
        setPaymentsLoading(false);
      })
      .catch((err) => {
        setPaymentsError((err as Error)?.message || "Failed to load payments");
        setPaymentsLoading(false);
      });
  }, [paymentsPage, paymentsPageSize, paymentsSearch]);

  // Fetch subscriptions
  useEffect(() => {
    setSubsLoading(true);
    setSubsError(null);
    // TODO: Add backend support for pagination/search if needed
    AdminService.listSubscriptions()
      .then((data) => {
        setSubscriptions(Array.isArray(data) ? data : []);
        setSubsTotal(Array.isArray(data) ? data.length : 0);
        setSubsLoading(false);
      })
      .catch((err) => {
        setSubsError((err as Error)?.message || "Failed to load subscriptions");
        setSubsLoading(false);
      });
  }, [subsPage, subsPageSize, subsSearch]);

  // Metrics for flip cards
  const totalPayments = payments.length;
  const totalPaymentsValue = payments.reduce((sum, p) => sum + (p.amount || 0), 0) / 100;
  const totalRefunded = payments.filter(p => p.status === "refunded").length;
  const totalRefundedValue = payments.filter(p => p.status === "refunded").reduce((sum, p) => sum + (p.amount || 0), 0) / 100;
  const now = new Date();
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const paymentsLast30 = payments.filter(p => p.createdAt && new Date(p.createdAt) > last30Days);
  const revenueLast30 = paymentsLast30.reduce((sum, p) => sum + (p.amount || 0), 0) / 100;
  const paymentsCountLast30 = paymentsLast30.length;
  const totalSubs = subscriptions.length;
  const activeSubs = subscriptions.filter(s => s.status === "active").length;

  // Refund payment
  const handleRefund = async (payment: Payment) => {
    setRefundLoading(payment._id);
    setRefundError(null);
    try {
      await AdminService.refundPayment(payment.paymentIntentId);
      // Refresh payments
      const data = await AdminService.listPayments();
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      setRefundError((err as Error)?.message || "Failed to refund payment");
    } finally {
      setRefundLoading(null);
    }
  };

  // Cancel subscription
  const handleCancelSub = async (sub: Subscription) => {
    setCancelLoading(sub.id);
    setCancelError(null);
    try {
      await AdminService.cancelSubscription(sub.id);
      // Refresh subscriptions
      const data = await AdminService.listSubscriptions();
      setSubscriptions(Array.isArray(data) ? data : []);
    } catch (err) {
      setCancelError((err as Error)?.message || "Failed to cancel subscription");
    } finally {
      setCancelLoading(null);
    }
  };

  // Pagination helpers
  const paymentsTotalPages = Math.ceil(paymentsTotal / paymentsPageSize);
  const subsTotalPages = Math.ceil(subsTotal / subsPageSize);

  return (
    <div className="min-h-screen w-full bg-gray-950 text-gray-100 px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full mb-12">
        <div className="w-full h-48 relative">
          <FlipCard
            front={
              <div className="flex-1 flex flex-col items-center justify-center">
                <div
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer select-none"
                >
                  <span className="text-5xl font-extrabold text-white drop-shadow-xl">{paymentsLoading ? <span className="animate-pulse">...</span> : totalPayments}</span>
                  <span className="text-base text-gray-200 mt-2 font-medium">Total Payments</span>
                </div>
              </div>
            }
            back={
              <div className="flex-1 flex flex-col items-center justify-center">
                <div
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer select-none"
                >
                  <span className="text-2xl font-bold text-[#ff3c00] mb-2">${paymentsLoading ? <span className="animate-pulse">...</span> : totalPaymentsValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  <span className="text-gray-200 text-center">Total value of all payments</span>
                </div>
              </div>
            }
            className="w-full h-full"
          />
        </div>
        <div className="w-full h-48 relative">
          <FlipCard
            front={
              <div className="flex-1 flex flex-col items-center justify-center">
                <div
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer select-none"
                >
                  <span className="text-5xl font-extrabold text-white drop-shadow-xl">{subsLoading ? <span className="animate-pulse">...</span> : totalSubs}</span>
                  <span className="text-base text-gray-200 mt-2 font-medium">Total Subscriptions</span>
                </div>
              </div>
            }
            back={
              <div className="flex-1 flex flex-col items-center justify-center">
                <div
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer select-none"
                >
                  <span className="text-2xl font-bold text-[#ff3c00] mb-2">{subsLoading ? <span className="animate-pulse">...</span> : activeSubs}</span>
                  <span className="text-gray-200 text-center">Active subscriptions</span>
                </div>
              </div>
            }
            className="w-full h-full"
          />
        </div>
        <div className="w-full h-48 relative">
          <FlipCard
            front={
              <div className="flex-1 flex flex-col items-center justify-center">
                <div
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer select-none"
                >
                  <span className="text-5xl font-extrabold text-white drop-shadow-xl">{paymentsLoading ? <span className="animate-pulse">...</span> : totalRefunded}</span>
                  <span className="text-base text-gray-200 mt-2 font-medium">Total Refunded</span>
                </div>
              </div>
            }
            back={
              <div className="flex-1 flex flex-col items-center justify-center">
                <div
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer select-none"
                >
                  <span className="text-2xl font-bold text-[#ff3c00] mb-2">${paymentsLoading ? <span className="animate-pulse">...</span> : totalRefundedValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  <span className="text-gray-200 text-center">Total value refunded</span>
                </div>
              </div>
            }
            className="w-full h-full"
          />
        </div>
        <div className="w-full h-48 relative">
          <FlipCard
            front={
              <div className="flex-1 flex flex-col items-center justify-center">
                <div
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer select-none"
                >
                  <span className="text-5xl font-extrabold text-white drop-shadow-xl">{paymentsLoading ? <span className="animate-pulse">...</span> : `$${revenueLast30.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}</span>
                  <span className="text-base text-gray-200 mt-2 font-medium">Revenue (30d)</span>
                </div>
              </div>
            }
            back={
              <div className="flex-1 flex flex-col items-center justify-center">
                <div
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer select-none"
                >
                  <span className="text-2xl font-bold text-[#ff3c00] mb-2">{paymentsLoading ? <span className="animate-pulse">...</span> : paymentsCountLast30}</span>
                  <span className="text-gray-200 text-center">Payments in last 30 days</span>
                </div>
              </div>
            }
            className="w-full h-full"
          />
        </div>
      </div>
      {/* Test Payment Button & Form */}
      <div className="mb-8 flex flex-col items-start gap-2">
        <div className="flex items-center gap-3">
          <button
            className="px-4 py-2 rounded bg-[#ff3c00] text-white font-semibold hover:bg-[#ff6a00] transition shadow disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setShowTestPayment(v => !v)}
            disabled={!isTestMode}
          >
            {showTestPayment ? 'Cancel Test Payment' : 'Test Payment'}
          </button>
          <span>
            <button
              type="button"
              className={`px-3 py-1 rounded font-bold text-xs border ${isTestMode ? 'bg-green-900 text-green-300 border-green-600' : 'bg-red-900 text-red-300 border-red-600'} cursor-default`}
              tabIndex={-1}
              disabled
            >
              {isTestMode ? 'TEST MODE' : 'LIVE MODE'}
            </button>
          </span>
        </div>
        {showTestPayment && (
          <div
            className="mt-4 bg-gray-900 border border-gray-800 rounded-lg p-6 flex flex-col gap-4 w-full max-w-md shadow-lg"
          >
            <div className="flex flex-col gap-2">
              <label className="text-gray-200 font-semibold">Amount (£)</label>
              <input
                type="number"
                min={0.01}
                step={0.01}
                className="px-3 py-2 rounded bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00]"
                value={testAmount}
                onChange={e => setTestAmount(Number(e.target.value))}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-gray-200 font-semibold">Currency</label>
              <input
                type="text"
                className="px-3 py-2 rounded bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00]"
                value={testCurrency}
                readOnly
                disabled
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-gray-200 font-semibold">Metadata (JSON, optional)</label>
              <input
                type="text"
                className="px-3 py-2 rounded bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00] font-mono"
                value={testMetadata}
                onChange={e => setTestMetadata(e.target.value)}
                placeholder='{"test":true}'
              />
            </div>
            <div className="flex gap-4 items-center mt-2">
              <button
                type="button"
                className="px-4 py-2 rounded bg-[#ff3c00] text-white font-semibold hover:bg-[#ff6a00] transition"
                disabled={testLoading}
                onClick={async () => {
                  setTestLoading(true);
                  setTestError(null);
                  setTestResult(null);
                  try {
                    const metadataObj = testMetadata ? JSON.parse(testMetadata) : undefined;
                    // Convert pounds to pence (cents)
                    const amountInCents = Math.round(Number(testAmount) * 100);
                    const result = await AdminService.testPaymentIntent({ amount: amountInCents, currency: testCurrency, metadata: metadataObj });
                    setTestResult(result);
                  } catch (err) {
                    setTestError((err as Error)?.message || 'Failed to create test payment intent');
                  } finally {
                    setTestLoading(false);
                  }
                }}
              >
                {testLoading ? 'Testing...' : 'Submit Test Payment'}
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded bg-gray-700 text-gray-200 hover:bg-gray-600 transition"
                onClick={() => { setShowTestPayment(false); setTestResult(null); setTestError(null); }}
                disabled={testLoading}
              >
                Cancel
              </button>
            </div>
            {testError && <div className="text-red-400 text-sm mt-2">{testError}</div>}
            {testResult && (
              <div className="bg-gray-800 rounded p-4 mt-2 text-xs text-gray-200 break-all">
                <div className="mb-2 font-bold text-[#ff3c00]">Test Payment Intent Created!</div>
                <div><span className="font-semibold">Client Secret:</span> <span className="font-mono">{testResult.clientSecret}</span></div>
                <div className="mt-2"><span className="font-semibold">Intent:</span>
                  <PaymentIntentSummary intent={testResult.intent} />
                </div>
                {/* Confirm Test Payment UI */}
                <div className="mt-4">
                  <Elements stripe={stripePromise} options={{ clientSecret: testResult.clientSecret }}>
                    <ConfirmTestPaymentForm clientSecret={testResult.clientSecret} onResult={(result: ConfirmTestPaymentResult) => {
                      setTestResult(r => r ? { ...r, confirmResult: result } : null);
                    }} />
                  </Elements>
                  {testResult.confirmResult && (
                    <div className="mt-4 p-4 rounded bg-gray-900 border border-gray-700">
                      <div className="font-semibold text-[#ff3c00] mb-2">Confirmation Result:</div>
                      {testResult.confirmResult.paymentIntent ? (
                        <PaymentIntentSummary intent={testResult.confirmResult.paymentIntent as Record<string, unknown>} />
                      ) : (
                        <div className="text-red-400 text-sm">{testResult.confirmResult.error?.message || 'Unknown error'}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Payments Table Card */}
      <div className="bg-gray-900 rounded-xl shadow-lg p-4 overflow-x-auto border border-gray-800 mb-12">
        <div className="flex flex-wrap gap-4 mb-4 items-center justify-between">
          <input
            type="text"
            placeholder="Search by user, status, or intent..."
            className="px-3 py-2 rounded-md bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00]"
            value={paymentsSearch}
            onChange={e => { setPaymentsSearch(e.target.value); setPaymentsPage(1); }}
          />
          <div className="flex gap-2 items-center ml-auto">
            <button
              className="px-3 py-1 rounded bg-gray-800 text-gray-300 disabled:opacity-50"
              onClick={() => setPaymentsPage(paymentsPage - 1)}
              disabled={paymentsPage <= 1}
            >Prev</button>
            <span className="text-gray-300">Page {paymentsPage} of {paymentsTotalPages}</span>
            <button
              className="px-3 py-1 rounded bg-gray-800 text-gray-300 disabled:opacity-50"
              onClick={() => setPaymentsPage(paymentsPage + 1)}
              disabled={paymentsPage >= paymentsTotalPages}
            >Next</button>
            <select
              className="px-2 py-1 rounded bg-gray-800 text-gray-100 border border-gray-700"
              value={paymentsPageSize}
              onChange={e => { setPaymentsPageSize(Number(e.target.value)); setPaymentsPage(1); }}
            >
              {[10, 20, 50, 100].map(size => (
                <option key={size} value={size}>{size} / page</option>
              ))}
            </select>
          </div>
        </div>
        {paymentsLoading ? (
          <div className="text-center text-gray-400 py-8">Loading payments...</div>
        ) : paymentsError ? (
          <div className="text-center text-red-400 py-8">{paymentsError}</div>
        ) : payments.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No payments found.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-800">
            <thead>
              <tr>
                {paymentColumns.map((col) => (
                  <th key={col.key} className="px-4 py-2 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments
                .slice((paymentsPage - 1) * paymentsPageSize, paymentsPage * paymentsPageSize)
                .map((payment) => (
                  <React.Fragment key={payment._id}>
                    <tr className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                      <td className="px-4 py-2 font-mono text-xs text-gray-200">{payment._id}</td>
                      <td className="px-4 py-2">{payment.user || <span className="text-gray-500">-</span>}</td>
                      <td className="px-4 py-2">{payment.amount / 100}</td>
                      <td className="px-4 py-2 uppercase">{payment.currency}</td>
                      <td className="px-4 py-2">{payment.status}</td>
                      <td className="px-4 py-2 font-mono text-xs text-gray-400">{payment.paymentIntentId}</td>
                      <td className="px-4 py-2 text-xs">{payment.createdAt ? formatDate(payment.createdAt) : "-"}</td>
                      <td className="px-4 py-2">
                        <button
                          className="px-2 py-1 rounded bg-[#ff3c00] text-white font-semibold hover:bg-[#ff6a00] transition text-xs"
                          disabled={refundLoading === payment._id || payment.status === 'refunded'}
                          onClick={() => handleRefund(payment)}
                        >
                          {refundLoading === payment._id ? "Refunding..." : payment.status === 'refunded' ? "Refunded" : "Refund"}
                        </button>
                        {refundError && refundLoading === payment._id && (
                          <div className="text-red-400 text-xs mt-1">{refundError}</div>
                        )}
                        <button
                          className="ml-2 px-2 py-1 rounded bg-gray-700 text-gray-200 hover:bg-gray-600 transition text-xs"
                          onClick={() => setExpandedPaymentId(expandedPaymentId === payment._id ? null : payment._id)}
                        >
                          {expandedPaymentId === payment._id ? "Hide" : "Details"}
                        </button>
                      </td>
                    </tr>
                    {expandedPaymentId === payment._id && (
                      <tr>
                        <td colSpan={paymentColumns.length} className="bg-gray-800/80 px-8 py-6">
                          <PaymentIntentSummary intent={{ ...payment }} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Subscriptions Table Card */}
      <div className="bg-gray-900 rounded-xl shadow-lg p-4 overflow-x-auto border border-gray-800">
        <div className="flex flex-wrap gap-4 mb-4 items-center justify-between">
          <input
            type="text"
            placeholder="Search by customer, status, or sub ID..."
            className="px-3 py-2 rounded-md bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00]"
            value={subsSearch}
            onChange={e => { setSubsSearch(e.target.value); setSubsPage(1); }}
          />
          <div className="flex gap-2 items-center ml-auto">
            <button
              className="px-3 py-1 rounded bg-gray-800 text-gray-300 disabled:opacity-50"
              onClick={() => setSubsPage(subsPage - 1)}
              disabled={subsPage <= 1}
            >Prev</button>
            <span className="text-gray-300">Page {subsPage} of {subsTotalPages}</span>
            <button
              className="px-3 py-1 rounded bg-gray-800 text-gray-300 disabled:opacity-50"
              onClick={() => setSubsPage(subsPage + 1)}
              disabled={subsPage >= subsTotalPages}
            >Next</button>
            <select
              className="px-2 py-1 rounded bg-gray-800 text-gray-100 border border-gray-700"
              value={subsPageSize}
              onChange={e => { setSubsPageSize(Number(e.target.value)); setSubsPage(1); }}
            >
              {[10, 20, 50, 100].map(size => (
                <option key={size} value={size}>{size} / page</option>
              ))}
            </select>
          </div>
        </div>
        {subsLoading ? (
          <div className="text-center text-gray-400 py-8">Loading subscriptions...</div>
        ) : subsError ? (
          <div className="text-center text-red-400 py-8">{subsError}</div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No subscriptions found.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-800">
            <thead>
              <tr>
                {subscriptionColumns.map((col) => (
                  <th key={col.key} className="px-4 py-2 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subscriptions
                .slice((subsPage - 1) * subsPageSize, subsPage * subsPageSize)
                .map((sub) => (
                  <React.Fragment key={sub.id}>
                    <tr className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                      <td className="px-4 py-2 font-mono text-xs text-gray-200">{sub.id}</td>
                      <td className="px-4 py-2">{sub.customer}</td>
                      <td className="px-4 py-2">{sub.status}</td>
                      <td className="px-4 py-2 text-xs">{sub.current_period_start ? formatDate(sub.current_period_start) : "-"}</td>
                      <td className="px-4 py-2 text-xs">{sub.current_period_end ? formatDate(sub.current_period_end) : "-"}</td>
                      <td className="px-4 py-2">{sub.cancel_at_period_end ? "Yes" : "No"}</td>
                      <td className="px-4 py-2 text-xs">{sub.canceled_at ? formatDate(sub.canceled_at) : "-"}</td>
                      <td className="px-4 py-2">
                        <button
                          className="px-2 py-1 rounded bg-[#ff3c00] text-white font-semibold hover:bg-[#ff6a00] transition text-xs"
                          disabled={cancelLoading === sub.id || sub.status === 'canceled'}
                          onClick={() => handleCancelSub(sub)}
                        >
                          {cancelLoading === sub.id ? "Canceling..." : sub.status === 'canceled' ? "Canceled" : "Cancel"}
                        </button>
                        {cancelError && cancelLoading === sub.id && (
                          <div className="text-red-400 text-xs mt-1">{cancelError}</div>
                        )}
                        <button
                          className="ml-2 px-2 py-1 rounded bg-gray-700 text-gray-200 hover:bg-gray-600 transition text-xs"
                          onClick={() => setExpandedSubId(expandedSubId === sub.id ? null : sub.id)}
                        >
                          {expandedSubId === sub.id ? "Hide" : "Details"}
                        </button>
                      </td>
                    </tr>
                    {expandedSubId === sub.id && (
                      <tr>
                        <td colSpan={subscriptionColumns.length} className="bg-gray-800/80 px-8 py-6">
                          <PaymentIntentSummary intent={{ ...sub }} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
