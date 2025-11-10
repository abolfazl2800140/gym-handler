import { useNavigate } from 'react-router-dom';
import '../styles/Forbidden.css';

function Forbidden() {
  const navigate = useNavigate();

  return (
    <div className="forbidden-container">
      <div className="forbidden-content">
        <div className="forbidden-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        </div>
        <h1>403</h1>
        <h2>دسترسی ممنوع</h2>
        <p>شما دسترسی لازم برای مشاهده این صفحه را ندارید.</p>
        <button onClick={() => navigate('/members')} className="back-button">
          بازگشت به صفحه اصلی
        </button>
      </div>
    </div>
  );
}

export default Forbidden;
