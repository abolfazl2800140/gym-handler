import { useState, useEffect } from "react";
import PersianDatePicker from "./PersianDatePicker";
import { membersAPI } from "../services/api";
import '../styles/UserForm.css';

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
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{transaction ? "ویرایش تراکنش" : "ثبت تراکنش جدید"}</h2>
          <button onClick={onCancel} className="close-button">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">نوع *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="درآمد">درآمد</option>
                <option value="هزینه">هزینه</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="amount">مبلغ (تومان) *</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0"
                placeholder="مبلغ"
              />
              {formData.amount && (
                <small className="form-hint">
                  {new Intl.NumberFormat("fa-IR").format(formData.amount)} تومان
                </small>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="title">عنوان *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="عنوان تراکنش"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">توضیحات</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="توضیحات تراکنش"
              className="w-full px-4 py-3 sm:py-3 border-2 border-gray-200 rounded-lg text-base sm:text-sm transition-all resize-vertical text-gray-800 bg-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">دسته‌بندی *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="شهریه">شهریه</option>
                <option value="تجهیزات">تجهیزات</option>
                <option value="حقوق">حقوق</option>
                <option value="سایر">سایر</option>
              </select>
            </div>

            <div className="form-group">
              <PersianDatePicker
                label="تاریخ"
                required
                value={formData.date}
                onChange={(date) => setFormData({ ...formData, date })}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="memberId">عضو مرتبط (اختیاری)</label>
            <select
              id="memberId"
              name="memberId"
              value={formData.memberId}
              onChange={handleChange}
            >
              <option value="">انتخاب کنید</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.firstName} {member.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">
              انصراف
            </button>
            <button type="submit" className="btn-submit">
              {transaction ? "ذخیره تغییرات" : "ثبت تراکنش"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TransactionForm;
