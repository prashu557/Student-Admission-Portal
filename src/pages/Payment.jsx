import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, IndianRupee, ReceiptText, WalletCards } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiUrl } from "../lib/api";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

const statusStyles = {
  Paid: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Partial: "bg-blue-50 text-blue-700",
};

export default function Payment() {
  const { student } = useAuth();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPayments = useCallback(async () => {
    if (!student?.Legacy_ID) return;

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        legacyId: student.Legacy_ID,
        email: student.Email || "",
      });
      const response = await fetch(apiUrl(`/payments?${params.toString()}`));
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Failed to fetch payment details");
      }

      setPayment(data.payment);
    } catch (fetchError) {
      console.error("FETCH_PAYMENTS_ERROR:", fetchError);
      setError(fetchError.message || "Failed to fetch payment details");
    } finally {
      setLoading(false);
    }
  }, [student]);

  useEffect(() => {
    const timeout = window.setTimeout(fetchPayments, 0);
    return () => window.clearTimeout(timeout);
  }, [fetchPayments]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Payments</h1>
        <p className="text-gray-500 mt-1">Track fee status, transactions, and remaining balance.</p>
      </motion.div>

      {loading && <div className="rounded-2xl bg-white p-6 text-gray-500 shadow-sm">Loading payment details...</div>}
      {error && <div className="rounded-2xl bg-red-50 p-6 text-red-700">{error}</div>}

      {!loading && payment && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard icon={WalletCards} label="Payment Status" value={payment.status} badge />
            <MetricCard icon={IndianRupee} label="Total Fees" value={formatCurrency(payment.totalFees)} />
            <MetricCard icon={CreditCard} label="Paid Amount" value={formatCurrency(payment.paidAmount)} />
            <MetricCard icon={ReceiptText} label="Remaining" value={formatCurrency(payment.remainingAmount)} />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm xl:col-span-1">
              <h2 className="text-lg font-bold text-gray-900">Fee Breakdown</h2>
              <div className="mt-5 space-y-3">
                {payment.feeBreakdown.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                    <span className="text-sm font-medium text-gray-600">{item.label}</span>
                    <span className="font-bold text-gray-900">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm xl:col-span-2">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Payment History</h2>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[payment.status]}`}>
                  {payment.status}
                </span>
              </div>

              {payment.history.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-5 text-sm text-gray-500">
                  No payment transactions recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                      <tr>
                        <th className="px-4 py-3">Transaction ID</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Method</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {payment.history.map((item) => (
                        <tr key={item.id || item.transactionId}>
                          <td className="px-4 py-3 font-semibold text-gray-900">{item.transactionId}</td>
                          <td className="px-4 py-3 text-gray-600">{new Date(item.paymentDate).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-gray-600">{item.method}</td>
                          <td className="px-4 py-3 font-bold text-gray-900">{formatCurrency(item.amount)}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[item.status] || statusStyles.Pending}`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, badge = false }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          {badge ? (
            <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-bold ${statusStyles[value] || statusStyles.Pending}`}>
              {value}
            </span>
          ) : (
            <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          )}
        </div>
        <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}
