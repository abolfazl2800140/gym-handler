import { useState, useEffect } from "react";
import PersianDatePicker from "./PersianDatePicker";
import { membersAPI } from "../services/api";

function TransactionForm({ transaction, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    type: "درآمد",
    amount: "",
    title: "",
    description: "",
    category: "شهریه",
    date: new Date().toISOString().split("T")[0],
    memberId: "",
  });

  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetchMembers();
  }, []);

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

  useEffect(() => {
    if (transaction) {
      setFormData({
        ...transaction,
        date: transaction.date.split("T")[0],
        memberId: transaction.memberId || "",
      });
    }
  }, [transaction]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      amount: Number(formData.amount),
      date: new Date(formData.date).toISOString(),
      memberId: formData.memberId || null,
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 max-w-2xl w-full mx-4 border border-white/20 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-white">
          {transaction ? "ویرایش تراکنش" : "ثبت تراکنش جدید"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2 text-sm">نوع *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-white/40"
              >
                <option value="درآمد">درآمد</option>
                <option value="هزینه">هزینه</option>
              </select>
            </div>

            <div>
              <label className="block text-white mb-2 text-sm">
                مبلغ (تومان) *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-white/40"
              />
              {formData.amount && (
                <div className="mt-2 text-sm text-white/80">
                  {new Intl.NumberFormat("fa-IR").format(formData.amount)} تومان
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-white mb-2 text-sm">عنوان *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-white/40"
            />
          </div>

          <div>
            <label className="block text-white mb-2 text-sm">توضیحات</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-white/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2 text-sm">
                دسته‌بندی *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-white/40"
              >
                <option value="شهریه">شهریه</option>
                <option value="تجهیزات">تجهیزات</option>
                <option value="حقوق">حقوق</option>
                <option value="سایر">سایر</option>
              </select>
            </div>

            <div>
              <PersianDatePicker
                label="تاریخ"
                required
                value={formData.date}
                onChange={(date) => setFormData({ ...formData, date })}
              />
            </div>
          </div>

          <div>
            <label className="block text-white mb-2 text-sm">
              عضو مرتبط (اختیاری)
            </label>
            <select
              name="memberId"
              value={formData.memberId}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-white/40"
            >
              <option value="">انتخاب کنید</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.firstName} {member.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-white/90 transition-all"
            >
              {transaction ? "ذخیره تغییرات" : "ثبت تراکنش"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all border border-white/20"
            >
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TransactionForm;
