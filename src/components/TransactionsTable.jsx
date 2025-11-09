import { useState } from "react";

function TransactionsTable({ transactions }) {
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fa-IR").format(amount) + " تومان";
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "date":
        comparison = new Date(a.date) - new Date(b.date);
        break;
      case "amount":
        comparison = a.amount - b.amount;
        break;
      case "title":
        comparison = a.title.localeCompare(b.title);
        break;
      default:
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        📋 تراکنش‌های دوره انتخابی ({transactions.length} مورد)
      </h3>
      
      {transactions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th
                  className="text-right py-3 px-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("title")}
                >
                  عنوان {sortBy === "title" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="text-right py-3 px-4">نوع</th>
                <th className="text-right py-3 px-4">دسته‌بندی</th>
                <th
                  class