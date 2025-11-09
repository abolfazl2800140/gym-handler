import { useState, useEffect } from "react";
import PersianDatePicker from "./PersianDatePicker";

function MemberForm({ member, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    birthDate: "",
    memberType: "ورزشکار",
    membershipLevel: "برنزی",
    subscriptionStatus: "فعال",
  });

  useEffect(() => {
    if (member) {
      setFormData(member);
    }
  }, [member]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 max-w-2xl w-full mx-4 border border-white/20">
        <h2 className="text-2xl font-bold mb-6 text-white">
          {member ? "ویرایش عضو" : "افزودن عضو جدید"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2 text-sm">نام *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-white/40"
              />
            </div>

            <div>
              <label className="block text-white mb-2 text-sm">
                نام خانوادگی *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-white/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2 text-sm">
                شماره تماس *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                pattern="09[0-9]{9}"
                placeholder="09121234567"
                className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-white/40"
              />
            </div>

            <div>
              <PersianDatePicker
                label="تاریخ تولد"
                value={formData.birthDate}
                onChange={(date) =>
                  setFormData({ ...formData, birthDate: date })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2 text-sm">
                نوع عضویت *
              </label>
              <select
                name="memberType"
                value={formData.memberType}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-white/40"
              >
                <option className="text-black" value="مربی">
                  مربی
                </option>
                <option className="text-black" value="ورزشکار">
                  ورزشکار
                </option>
                <option className="text-black" value="پرسنل">
                  پرسنل
                </option>
              </select>
            </div>

            <div>
              <label className="block text-white mb-2 text-sm">
                سطح عضویت *
              </label>
              <select
                name="membershipLevel"
                value={formData.membershipLevel}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-white/40"
              >
                <option className="text-black" value="برنزی">
                  برنزی
                </option>
                <option className="text-black" value="نقره‌ای">
                  نقره‌ای
                </option>
                <option className="text-black" value="طلایی">
                  طلایی
                </option>
                <option className="text-black" value="پلاتینیوم">
                  پلاتینیوم
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-white mb-2 text-sm">
              وضعیت اشتراک *
            </label>
            <select
              name="subscriptionStatus"
              value={formData.subscriptionStatus}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-white/40"
            >
              <option className="text-black" value="فعال">
                فعال
              </option>
              <option className="text-black" value="غیرفعال">
                غیرفعال
              </option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-white/90 transition-all"
            >
              {member ? "ذخیره تغییرات" : "افزودن عضو"}
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

export default MemberForm;
