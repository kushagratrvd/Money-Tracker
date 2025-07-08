import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { Plus } from 'lucide-react'

import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";
import DashboardSummaryAndChart from "../components/DashboardSummaryAndChart";

export default function Dashboard() {
  const navigate = useNavigate();
  const [editTx, setEditTx] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(true);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  const handleAdd = () => {
    setEditTx(null);
    setIsOpen(true);
  };
  const handleEdit = (tx) => {
    setEditTx(tx);
    setIsOpen(true);
  };

  useEffect(() => {
    if (sessionStorage.getItem("money-tracker-help-shown")) {
      setShowHelp(false);
    }
  }, []);
  const handleCloseHelp = () => {
    setShowHelp(false);
    sessionStorage.setItem("money-tracker-help-shown", "1");
  };

  return (
    <div className="relative min-h-screen bg-gray-50 p-4">
      <Dialog open={showHelp} onClose={handleCloseHelp} className="fixed z-20 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen backdrop-blur-sm bg-white/30">
          <Dialog.Panel className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md text-center">
            <Dialog.Title className="text-2xl font-bold mb-4 text-blue-700">Welcome to Money Tracker!</Dialog.Title>
            <div className="mb-4 text-gray-700 text-lg">
              <p className="mb-2">To <span className="font-semibold text-blue-600">add a transaction</span>, click the <span className="inline-block bg-blue-600 text-white rounded-full w-8 h-8 text-xl font-bold align-middle">+</span> button at the bottom right.</p>
              <p className="mb-2">Track your <span className="font-semibold text-blue-600">expenses by day or month</span> using the chart and toggle above the summary.</p>
              <p className="mb-2">Edit or delete transactions anytime from the list below.</p>
            </div>
            <button onClick={handleCloseHelp} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow font-semibold transition-colors duration-200">Got it!</button>
          </Dialog.Panel>
        </div>
      </Dialog>

      

<button 
  className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-16 h-16 shadow-lg flex items-center justify-center transition-colors duration-200" 
  onClick={handleAdd} 
  aria-label="Add Transaction"
>
  <Plus size={24} />
</button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="fixed z-10 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen backdrop-blur-sm bg-white/30">
          <Dialog.Panel className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <Dialog.Title className="text-xl font-bold mb-4">{editTx ? "Edit Transaction" : "Add Transaction"}</Dialog.Title>
            <TransactionForm
              onSuccess={() => setIsOpen(false)}
              editTx={editTx}
              clearEdit={() => setEditTx(null)}
            />
            <button onClick={() => setIsOpen(false)} className="mt-4 text-gray-500 hover:text-gray-700">Close</button>
          </Dialog.Panel>
        </div>
      </Dialog>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow transition-colors duration-200">
          Logout
        </button>
      </div>
      
      <DashboardSummaryAndChart />
      <TransactionList onEdit={handleEdit} />
    </div>
  );
}