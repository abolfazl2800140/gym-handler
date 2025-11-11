import { FaExclamationTriangle } from "react-icons/fa";

function ConfirmDialog({ title, message, onConfirm, onCancel, confirmText = "تایید", cancelText = "انصراف", type = "danger" }) {
  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          icon: "text-red-500",
          button: "bg-red-500 hover:bg-red-600"
        };
      case "warning":
        return {
          icon: "text-yellow-500",
          button: "bg-yellow-500 hover:bg-yellow-600"
        };
      case "info":
        return {
          icon: "text-blue-500",
          button: "bg-blue-500 hover:bg-blue-600"
        };
      default:
        return {
          icon: "text-red-500",
          button: "bg-red-500 hover:bg-red-600"
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center ${styles.icon}`}>
              <FaExclamationTriangle className="text-2xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 text-base leading-relaxed">{message}</p>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-6 py-3 text-white rounded-lg font-medium transition-all ${styles.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
