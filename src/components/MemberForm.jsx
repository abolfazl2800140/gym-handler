import { useState, useEffect } from "react";
import PersianDatePicker from "./PersianDatePicker";
import '../styles/UserForm.css';

function MemberForm({ member, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    birthDate: "",
    memberType: "ورزشکار",
    membershipLevel: "برنزی",
    subscriptionStatus: "فعال",
    gender: "مرد",
    username: "",
  });

  const [suggestedUsername, setSuggestedUsername] = useState("");

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
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // اگر نام یا نام خانوادگی تغییر کرد، username پیشنهادی بساز
    if ((name === 'firstName' || name === 'lastName') && !member) {
      const firstName = name === 'firstName' ? value : formData.firstName;
      const lastName = name === 'lastName' ? value : formData.lastName;

      if (firstName && lastName) {
        const suggested = `${transliterate(firstName)}.${transliterate(lastName)}`.toLowerCase();
        setSuggestedUsername(suggested);

        // اگر username خالی است، پیشنهاد رو بذار
        if (!formData.username) {
          setFormData(prev => ({ ...prev, username: suggested }));
        }
      }
    }
  };

  // تبدیل فارسی به انگلیسی
  const transliterate = (text) => {
    const map = {
      'ا': 'a', 'آ': 'a', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ث': 's', 'ج': 'j', 'چ': 'ch',
      'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'z', 'ر': 'r', 'ز': 'z', 'ژ': 'zh', 'س': 's',
      'ش': 'sh', 'ص': 's', 'ض': 'z', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh', 'ف': 'f',
      'ق': 'gh', 'ک': 'k', 'گ': 'g', 'ل': 'l', 'م': 'm', 'ن': 'n', 'و': 'v', 'ه': 'h',
      'ی': 'i', 'ئ': 'i', 'ة': 'e', ' ': '.'
    };
    return text.split('').map(char => map[char] || char).join('');
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{member ? "ویرایش عضو" : "افزودن عضو جدید"}</h2>
          <button onClick={onCancel} className="close-button">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">نام *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="نام"
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">نام خانوادگی *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="نام خانوادگی"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">شماره تماس *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                pattern="09[0-9]{9}"
                placeholder="09121234567"
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender">جنسیت *</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="مرد">مرد</option>
                <option value="زن">زن</option>
              </select>
            </div>
          </div>

          {!member && (
            <div className="form-group">
              <label htmlFor="username">نام کاربری (انگلیسی) *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                pattern="[a-z0-9._-]+"
                placeholder="ali.ahmadi"
                style={{ direction: 'ltr', textAlign: 'left' }}
              />
              {suggestedUsername && (
                <small style={{ color: '#718096', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  💡 پیشنهاد: {suggestedUsername}
                </small>
              )}
              <small style={{ color: '#718096', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                فقط حروف انگلیسی کوچک، اعداد، نقطه، خط تیره و زیرخط مجاز است
              </small>
            </div>
          )}

          <div className="form-group">
            <PersianDatePicker
              label="تاریخ تولد"
              value={formData.birthDate}
              onChange={(date) =>
                setFormData({ ...formData, birthDate: date })
              }
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="memberType">نوع عضویت *</label>
              <select
                id="memberType"
                name="memberType"
                value={formData.memberType}
                onChange={handleChange}
                required
              >
                <option value="مربی">مربی</option>
                <option value="ورزشکار">ورزشکار</option>
                <option value="پرسنل">پرسنل</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="membershipLevel">سطح عضویت *</label>
              <select
                id="membershipLevel"
                name="membershipLevel"
                value={formData.membershipLevel}
                onChange={handleChange}
                required
              >
                <option value="برنزی">برنزی</option>
                <option value="نقره‌ای">نقره‌ای</option>
                <option value="طلایی">طلایی</option>
                <option value="پلاتینیوم">پلاتینیوم</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="subscriptionStatus">وضعیت اشتراک *</label>
            <select
              id="subscriptionStatus"
              name="subscriptionStatus"
              value={formData.subscriptionStatus}
              onChange={handleChange}
              required
            >
              <option value="فعال">فعال</option>
              <option value="غیرفعال">غیرفعال</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">
              انصراف
            </button>
            <button type="submit" className="btn-submit">
              {member ? "ذخیره تغییرات" : "افزودن عضو"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MemberForm;
