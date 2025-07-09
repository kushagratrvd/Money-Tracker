import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

function getMonthYear(date) {
  const d = new Date(date.seconds ? date.seconds * 1000 : date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getDay(date) {
  const d = new Date(date.seconds ? date.seconds * 1000 : date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const DashboardSummaryAndChart = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [viewMode, setViewMode] = useState("day");

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", auth.currentUser.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const months = Array.from(new Set(transactions.map(tx => getMonthYear(tx.date)))).sort().reverse();

  const filtered = transactions.filter(tx => getMonthYear(tx.date) === selectedMonth);

  const totalIncome = filtered.filter(tx => tx.type === "income").reduce((sum, tx) => sum + Number(tx.amount), 0);
  const totalExpense = filtered.filter(tx => tx.type === "expense").reduce((sum, tx) => sum + Number(tx.amount), 0);
  const totalBalance = totalIncome - totalExpense;

  let chartData = [];
  if (viewMode === "day") {
    const dayMap = {};
    filtered.forEach(tx => {
      if (tx.type === "expense") {
        const day = getDay(tx.date);
        if (!dayMap[day]) dayMap[day] = 0;
        dayMap[day] += Number(tx.amount);
      }
    });
    chartData = Object.entries(dayMap).map(([date, value]) => ({ date, value })).sort((a, b) => a.date.localeCompare(b.date));
  } else {
    const monthMap = {};
    transactions.forEach(tx => {
      if (tx.type === "expense") {
        const month = getMonthYear(tx.date);
        if (!monthMap[month]) monthMap[month] = 0;
        monthMap[month] += Number(tx.amount);
      }
    });
    chartData = Object.entries(monthMap).map(([date, value]) => ({ date, value })).sort((a, b) => a.date.localeCompare(b.date));
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="font-semibold">Month:</span>
        <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="border p-1 rounded">
          {months.map(month => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <button
            className={`px-3 py-1 rounded ${viewMode === "day" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => setViewMode("day")}
          >
            By Day
          </button>
          <button
            className={`px-3 py-1 rounded ${viewMode === "month" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => setViewMode("month")}
          >
            By Month
          </button>
        </div>
      </div>
      <div className="w-full h-56 sm:h-64 mb-6 max-w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" name="Expenses" stroke="#ff4d4f" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="bg-green-100 text-green-800 p-4 rounded text-center flex-1">
          <div className="font-bold text-lg">Total Balance</div>
          <div className="text-xl sm:text-2xl">₹{totalBalance}</div>
        </div>
        <div className="bg-blue-100 text-blue-800 p-4 rounded text-center flex-1">
          <div className="font-bold text-lg">Total Income</div>
          <div className="text-xl sm:text-2xl">₹{totalIncome}</div>
        </div>
        <div className="bg-red-100 text-red-800 p-4 rounded text-center flex-1">
          <div className="font-bold text-lg">Total Expenses</div>
          <div className="text-xl sm:text-2xl">₹{totalExpense}</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSummaryAndChart; 