import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db, auth } from "../firebase";
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

const categories = ["All", "Food", "Travel", "Shopping", "Bills", "Salary", "Other"];

const TransactionList = ({ onEdit }) => {
  const [transactions, setTransactions] = useState([]);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterType, setFilterType] = useState("All");

  useEffect(() => {
    if (!auth.currentUser) return;
    let q = query(
      collection(db, "transactions"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("date", "desc")
    );
    if (filterCategory !== "All" && filterType === "All") {
      q = query(
        collection(db, "transactions"),
        where("userId", "==", auth.currentUser.uid),
        where("category", "==", filterCategory),
        orderBy("date", "desc")
      );
    }
    if (filterType !== "All" && filterCategory === "All") {
      q = query(
        collection(db, "transactions"),
        where("userId", "==", auth.currentUser.uid),
        where("type", "==", filterType),
        orderBy("date", "desc")
      );
    }
    if (filterType !== "All" && filterCategory !== "All") {
      q = query(
        collection(db, "transactions"),
        where("userId", "==", auth.currentUser.uid),
        where("category", "==", filterCategory),
        where("type", "==", filterType),
        orderBy("date", "desc")
      );
    }
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [filterCategory, filterType]);

  return (
    <div className="relative mt-8 bg-white rounded-2xl shadow-lg p-4 sm:p-8">
      <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6 items-center">
        <label className="text-gray-700 font-medium">Category:</label>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400">
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <label className="text-gray-700 font-medium ml-0 sm:ml-4">Type:</label>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="All">All</option>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">Transaction History</h2>
      <div className="overflow-x-auto">
        <table className="min-w-[600px] sm:min-w-full border rounded-2xl overflow-hidden shadow-sm text-xs sm:text-base">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold">Title</th>
              <th className="border px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold">Category</th>
              <th className="border px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold">Amount</th>
              <th className="border px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold">Type</th>
              <th className="border px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold">Date</th>
              <th className="border px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 sm:py-12 text-gray-400 text-base sm:text-lg font-medium bg-gray-50">No transactions found. Add your first transaction!</td>
              </tr>
            )}
            {transactions.map((tx, idx) => (
              <tr
                key={tx.id}
                className={
                  `transition-colors duration-150 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50`
                }
              >
                <td className="border px-2 sm:px-4 py-2 sm:py-3 font-medium text-gray-800">{tx.title}</td>
                <td className="border px-2 sm:px-4 py-2 sm:py-3 text-gray-700">{tx.category}</td>
                <td className="border px-2 sm:px-4 py-2 sm:py-3 text-blue-700 font-semibold">₹{tx.amount}</td>
                <td className="border px-2 sm:px-4 py-2 sm:py-3 capitalize text-xs sm:text-sm font-semibold {tx.type === 'income' ? 'text-green-600' : 'text-red-600'}">
                  {tx.type}
                </td>
                <td className="border px-2 sm:px-4 py-2 sm:py-3 text-gray-600">{new Date(tx.date.seconds ? tx.date.seconds * 1000 : tx.date).toLocaleDateString()}</td>
                <td className="border px-2 sm:px-4 py-2 sm:py-3 flex gap-2 items-center">
                  <button
                    onClick={() => onEdit && onEdit(tx)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded transition-colors duration-200 border border-blue-100 hover:border-blue-400 bg-blue-50 hover:bg-blue-100"
                    title="Edit"
                  >
                    <PencilSquareIcon className="w-5 h-5" /> Edit
                  </button>
                  <DeleteButton id={tx.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DeleteButton = ({ id }) => {
  const handleDelete = async () => {
    if (window.confirm("Delete this transaction?")) {
      await import("firebase/firestore").then(({ deleteDoc, doc }) =>
        deleteDoc(doc(db, "transactions", id))
      );
    }
  };
  return (
    <button
      onClick={handleDelete}
      className="flex items-center gap-1 text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded transition-colors duration-200 border border-red-100 hover:border-red-400 bg-red-50 hover:bg-red-100"
      title="Delete"
    >
      <TrashIcon className="w-5 h-5" /> Delete
    </button>
  );
};

export default TransactionList;
