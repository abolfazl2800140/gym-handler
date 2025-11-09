import { useState, useEffect, useRef } from "react";
import { aiAPI } from "../services/api";

function AIAssistant() {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchSuggestions();
        // Welcome message
        setMessages([
            {
                type: "ai",
                content: "سلام! من دستیار هوشمند باشگاه هستم. می‌تونم درباره اعضا، مالی، و حضور و غیاب بهت کمک کنم. چه سوالی داری؟",
                timestamp: new Date(),
            },
        ]);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchSuggestions = async () => {
        try {
            const response = await aiAPI.getSuggestions();
            setSuggestions(response.data);
        } catch (error) {
            console.error("Error fetching suggestions:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || loading) return;

        const userMessage = {
            type: "user",
            content: inputValue,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");
        setLoading(true);

        try {
            const response = await aiAPI.ask(inputValue);

            const aiMessage = {
                type: "ai",
                content: response.data.answer,
                timestamp: new Date(response.data.timestamp),
            };

            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error("Error asking AI:", error);

            const errorMessage = {
                type: "error",
                content:
                    error.message === "کلید API نامعتبر است"
                        ? "⚠️ کلید API هوش مصنوعی تنظیم نشده است. لطفاً در فایل backend/.env کلید Gemini API را تنظیم کنید."
                        : "❌ متأسفانه خطایی رخ داد. لطفاً دوباره تلاش کنید.",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setInputValue(suggestion);
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-black">🤖 دستیار هوشمند</h1>
                <p className="text-gray-600 mt-2">
                    از هوش مصنوعی درباره باشگاه خود سوال بپرسید
                </p>
            </div>

            {/* Suggestions */}
            {messages.length === 1 && (
                <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                        💡 سوالات پیشنهادی:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition-colors"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${message.type === "user" ? "justify-end" : "justify-start"
                                }`}
                        >
                            <div
                                className={`max-w-[80%] rounded-lg p-4 ${message.type === "user"
                                        ? "bg-indigo-600 text-white"
                                        : message.type === "error"
                                            ? "bg-red-50 text-red-800 border border-red-200"
                                            : "bg-gray-100 text-gray-800"
                                    }`}
                            >
                                <div className="whitespace-pre-wrap">{message.content}</div>
                                <div
                                    className={`text-xs mt-2 ${message.type === "user"
                                            ? "text-indigo-200"
                                            : "text-gray-500"
                                        }`}
                                >
                                    {message.timestamp.toLocaleTimeString("fa-IR", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 rounded-lg p-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div
                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                        style={{ animationDelay: "0.2s" }}
                                    ></div>
                                    <div
                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                        style={{ animationDelay: "0.4s" }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form
                    onSubmit={handleSubmit}
                    className="border-t border-gray-200 p-4 bg-gray-50"
                >
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="سوال خود را بپرسید..."
                            disabled={loading}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                        />
                        <button
                            type="submit"
                            disabled={loading || !inputValue.trim()}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "..." : "ارسال"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AIAssistant;
