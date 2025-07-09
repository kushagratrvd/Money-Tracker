import { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

const categories = ["Food", "Travel", "Shopping", "Bills", "Salary", "Other"];

const TransactionForm = ({ editTx, clearEdit, onSuccess }) => {
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [date, setDate] = useState("");
    const [type, setType] = useState("expense");

    useEffect(() => {
        if (editTx) {
            setTitle(editTx.title);
            setAmount(editTx.amount);
            setCategory(editTx.category);
            setDate(editTx.date.seconds ? new Date(editTx.date.seconds * 1000).toISOString().slice(0, 10) : editTx.date);
            setType(editTx.type);
        } else {
            setTitle("");
            setAmount("");
            setCategory("");
            setDate("");
            setType("expense");
        }
    }, [editTx]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editTx) {
                // Update
                await updateDoc(doc(db, "transactions", editTx.id), {
                    title,
                    category,
                    amount: Number(amount),
                    date: new Date(date),
                    type,
                });
                alert("Transaction updated!");
                clearEdit();
            } else {
                // Add
                await addDoc(collection(db, "transactions"), {
                    title,
                    category,
                    amount: Number(amount),
                    date: new Date(date),
                    type,
                    userId: auth.currentUser.uid,
                    createdAt: serverTimestamp()
                });
                alert("Transaction added successfully");
            }
            setTitle("");
            setAmount("");
            setCategory("");
            setDate("");
            setType("expense");
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Error:", error);
            alert("Error saving transaction, please login");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base" required>
                    <option value="" disabled>Select category</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" placeholder="Date" value={date} onChange={(e) => setDate(e.target.value)}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={type} onChange={e => setType(e.target.value)}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base">
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                </select>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <button type="submit" className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow transition-colors duration-200">
                    {editTx ? "Update" : "Add"} Transaction
                </button>
                {editTx && (
                    <button type="button" onClick={clearEdit} className="w-full sm:w-auto bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded shadow transition-colors duration-200">
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
};

export default TransactionForm;