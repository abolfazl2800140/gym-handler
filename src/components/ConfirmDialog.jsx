function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 max-w-md w-full mx-4 border border-white/20">
        <h2 className="text-2xl font-bold mb-4 text-white">{title}</h2>
        <p className="text-white/80 mb-6">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all"
          >
            تایید
          </button>
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all border border-white/20"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
