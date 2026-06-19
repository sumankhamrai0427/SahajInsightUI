import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { useEffect, useState } from "react";
import { ChartConfig } from "./ReportDesignerTable";

interface ChatMessage {
  role: "ai" | "user";
  message: string;
}

interface ChatSidebarProps {
  onClose: () => void;
  userName: string;
  onSend: (message: string) => Promise<string | null>;
  charts: ChartConfig[];

  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export default function ReportDesignerChatSidebar({
  onClose,
  userName,
  onSend,
  charts,
  messages,
  setMessages
}: ChatSidebarProps) {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const hasCharts = charts && charts.length > 0;

  // ✅ initial greeting (only once)
  useEffect(() => {
    if (messages.length > 0) return;

    if (!hasCharts) {
      setMessages([
        {
          role: "ai",
          message: `Hi ${userName}\nPlease create at least one chart before using the assistant.`
        }
      ]);
    } else {
      setMessages([
        {
          role: "ai",
          message: `Hi ${userName}\nHow can I help you with your chart?`
        }
      ]);
    }
  }, [hasCharts, userName, messages.length, setMessages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input;

    // USER message
    setMessages(prev => [
      ...prev,
      { role: "user", message: userText }
    ]);

    setInput("");
    setIsTyping(true);

    const aiText = await onSend(userText);

    setIsTyping(false);

    if (aiText) {
      setMessages(prev => [
        ...prev,
        { role: "ai", message: aiText }
      ]);
    }
  };

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white border-l shadow-lg flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Report Designer Analysis</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-black">
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-3 bg-gray-50">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] px-3 py-2 rounded-xl text-sm whitespace-pre-line
                ${m.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-white text-gray-700 border rounded-bl-none"
                }`}
            >
              {m.message}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border rounded-xl px-3 py-2 flex items-center gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t h-14  flex items-center gap-2 p-2 bg-white">
        <input
          value={input}
          disabled={!hasCharts}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="w-9 h-9 flex items-center justify-center bg-[#7CA1F3] text-white rounded-full hover:bg-blue-500 transition"
        >
          <SendRoundedIcon sx={{ fontSize: 18 }} />
        </button>
      </div>
    </div>
  );
}
