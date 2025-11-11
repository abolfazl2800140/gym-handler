import { useState, useEffect } from "react";
import { FaMoneyBillWave, FaDollarSign, FaChartLine, FaChartBar, FaFileExcel, FaPlus } from "react-icons/fa";
import StatCard from "../components/StatCard";
import TransactionForm from "../components/TransactionForm";
import TransactionFilters from "../components/TransactionFilters";
import ConfirmDialog from "../components/ConfirmDialog";
import FinancialChart from "../components/FinancialChart";
import * as XLSX from "xlsx";
import { transactionsAPI, membersAPI } from "../services/api";

function Financial() {
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingTransactionId, setDeletingTransactionId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState("همه");
  const [members, setMembers] = useState([]);
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTransactions();
    fetchMembers();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await transactionsAPI.getAll();
      setTransactions(response.data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('خطا در دریافت تراکنش‌ها');
      // Fallback to localStorage
      const savedTransactions = localStorage.getItem("transactions");
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await membersAPI.getAll();
      setMembers(response.data);
    } catch (err) {
      console.error('Error fetching members:', err);
      // Fallback to localStorage
      const savedMembers = localStorage.getItem("members");
      if (savedMembers) {
        setMembers(JSON.parse(savedMembers));
      }
    }
  };

  const getMemberName = (memberId) => {
    if (!memberId) return "-";
    const member = members.find((m) => m.id === memberId);
    return member ? `${member.firstName} ${member.lastName}` : "-";
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const memberName = getMemberName(transaction.memberId);
    const matchesSearch =
      transaction.title.includes(searchTerm) || memberName.includes(searchTerm);
    const matchesType = !typeFilter || transaction.type === typeFilter;
    const matchesCategory =
      !categoryFilter || transaction.category === categoryFilter;

    let matchesDateRange = true;
    if (dateRangeFilter !== "همه") {
      const transactionDate = new Date(transaction.date);
      const now = new Date();
      const diffTime = now - transactionDate;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (dateRangeFilter === "امروز") matchesDateRange = diffDays < 1;
      else if (dateRangeFilter === "هفته") matchesDateRange = diffDays < 7;
      else if (dateRangeFilter === "ماه") matchesDateRange = diffDays < 30;
      else if (dateRangeFilter === "سال") matchesDateRange = diffDays < 365;
    }

    return matchesSearch && matchesType && matchesCategory && matchesDateRange;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let aValue, bValue;

    if (sortField === "date") {
      aValue = new Date(a.date).getTime();
      bValue = new Date(b.date).getTime();
    } else if (sortField === "amount") {
      aValue = a.amount;
      bValue = b.amount;
    } else if (sortField === "title") {
      aValue = a.title;
      bValue = b.title;
    }

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const calculateStats = () => {
    const income = transactions
      .filter((t) => t.type === "درآمد")
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter((t) => t.type === "هزینه")
      .reduce((sum, t) => sum + t.amount, 0);

    const profit = income - expense;
    const count = transactions.length;

    return { income, expense, profit, count };
  };

  const stats = calculateStats();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fa-IR").format(amount) + " تومان";
  };

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setShowForm(true);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleSaveTransaction = async (formData) => {
    try {
      setLoading(true);
      setError(null);

      if (editingTransaction) {
        await transactionsAPI.update(editingTransaction.id, formData);
      } else {
        await transactionsAPI.create(formData);
      }

      await fetchTransactions();
      setShowForm(false);
      setEditingTransaction(null);
    } catch (err) {
      console.error('Error saving transaction:', err);
      setError('خطا در ذخیره تراکنش');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (transactionId) => {
    setDeletingTransactionId(transactionId);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      await transactionsAPI.delete(deletingTransactionId);
      await fetchTransactions();
      setShowDeleteDialog(false);
      setDeletingTransactionId(null);
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError('خطا در حذف تراکنش');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setDeletingTransactionId(null);
  };

  const handleExportToExcel = () => {
    const exportData = sortedTransactions.map((transaction) => ({
      نوع: transaction.type,
      عنوان: transaction.title,
      "مبلغ (تومان)": transaction.amount,
      "عضو مرتبط": getMemberName(transaction.memberId),
      دسته‌بندی: transaction.category,
      تاریخ: new Date(transaction.date).toLocaleDateString("fa-IR"),
      توضیحات: transaction.description || "-",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);

    const colWidths = [
      { wch: 10 },
      { wch: 25 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 30 },
    ];
    ws["!cols"] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "تراکنش‌ها");

    const summaryData = [
      { عنوان: "کل درآمد", "مبلغ (تومان)": stats.income },
      { عنوان: "کل هزینه", "مبلغ (تومان)": stats.expense },
      { عنوان: "سود خالص", "مبلغ (تومان)": stats.profit },
      { عنوان: "تعداد تراکنش", "مبلغ (تومان)": stats.count },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "خلاصه");

    const fileName = `گزارش_مالی_${new Date()
      .toLocaleDateString("fa-IR")
      .replace(/\//g, "-")}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black flex items-center gap-2">
          <FaMoneyBillWave /> مدیریت مالی
        </h1>
        <div className="flex gap-3">
          <button
            onClick={handleExportToExcel}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all flex items-center gap-2"
          >
            <FaFileExcel /> خروجی Excel
          </button>
          <button
            onClick={handleAddTransaction}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <FaPlus /> ثبت تراکنش جدید
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          title="کل درآمد"
          value={formatCurrency(stats.income)}
          icon={<FaDollarSign />}
          color="green"
        />
        <StatCard
          title="کل هزینه"
          value={formatCurrency(stats.expense)}
          icon={<FaMoneyBillWave />}
          color="red"
        />
        <StatCard
          title="سود خالص"
          value={formatCurrency(stats.profit)}
          icon={<FaChartLine />}
          color={stats.profit >= 0 ? "green" : "red"}
        />
        <StatCard
          title="تعداد تراکنش"
          value={stats.count}
          icon={<FaChartBar />}
          color="purple"
        />
      </div>

      <TransactionFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        dateRangeFilter={dateRangeFilter}
        onDateRangeChange={setDateRangeFilter}
      />

      <div className="bg-white backdrop-blur-lg rounded-xl overflow-hidden shadow-lg">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-4 text-right text-sm font-medium text-black">
                نوع
              </th>
              <th
                className="px-6 py-4 text-right text-sm font-medium text-black cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort("title")}
              >
                عنوان{" "}
                {sortField === "title" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="px-6 py-4 text-right text-sm font-medium text-black cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort("amount")}
              >
                مبلغ{" "}
                {sortField === "amount" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th className="px-6 py-4 text-right text-sm font-medium text-black">
                عضو مرتبط
              </th>
              <th className="px-6 py-4 text-right text-sm font-medium text-black">
                دسته‌بندی
              </th>
              <th
                className="px-6 py-4 text-right text-sm font-medium text-black cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort("date")}
              >
                تاریخ{" "}
                {sortField === "date" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th className="px-6 py-4 text-right text-sm font-medium text-black">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedTransactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${transaction.type === "درآمد"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                      }`}
                  >
                    {transaction.type}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-black">
                  {transaction.title}
                </td>
                <td className="px-6 py-4 text-black">
                  {formatCurrency(transaction.amount)}
                </td>
                <td className="px-6 py-4 text-black">
                  {getMemberName(transaction.memberId)}
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {transaction.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-black">
                  {new Date(transaction.date).toLocaleDateString("fa-IR")}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditTransaction(transaction)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      ویرایش
                    </button>
                    <button
                      onClick={() => handleDeleteClick(transaction.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sortedTransactions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            هیچ تراکنشی یافت نشد
          </div>
        )}
      </div>

      <FinancialChart transactions={transactions} />

      {showForm && (
        <TransactionForm
          transaction={editingTransaction}
          onSave={handleSaveTransaction}
          onCancel={() => {
            setShowForm(false);
            setEditingTransaction(null);
          }}
        />
      )}

      {showDeleteDialog && (
        <ConfirmDialog
          title="حذف تراکنش"
          message="آیا از حذف این تراکنش اطمینان دارید؟ این عملیات قابل بازگشت نیست."
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}

export default Financial;
