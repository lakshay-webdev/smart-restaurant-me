import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";
import axios from "axios";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const conversationId = user?.email || "guest_" + Date.now();

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`/api/chat/${encodeURIComponent(conversationId)}`);
      setMessages(res.data);
    } catch {}
  };

  useEffect(() => {
    if (!open) return;
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 3000);
    return () => clearInterval(pollRef.current);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      await axios.post("/api/chat", {
        conversationId,
        sender: "user",
        senderEmail: user?.email || "guest",
        message: input.trim(),
      });
      setInput("");
      fetchMessages();
    } catch {}
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-[55] flex items-center gap-2">
        {!open && (
          <motion.span
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-amber-500 text-black text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg hidden sm:block"
          >
            Chat with us
          </motion.span>
        )}
        <button
          onClick={() => setOpen(!open)}
          className="relative bg-amber-500 text-black p-3.5 rounded-full shadow-lg shadow-amber-500/30 hover:bg-amber-400 transition-all hover:scale-110 active:scale-95"
        >
          {!open && (
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0b0b0b] animate-pulse" />
          )}
          {open ? <X size={22} /> : <MessageCircle size={22} />}
        </button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-36 right-4 md:bottom-20 md:right-6 z-[55] w-80 sm:w-96 bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="bg-amber-500 px-4 py-3 flex items-center justify-between">
              <div>
                <h3 className="text-black font-semibold text-sm">LaCasa Support</h3>
                <p className="text-black/60 text-[10px]">We typically reply in minutes</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-black/60 hover:text-black">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="h-72 overflow-y-auto p-3 space-y-2 scrollbar-hide">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <MessageCircle size={32} className="mx-auto text-white/10 mb-2" />
                  <p className="text-white/30 text-xs">Start a conversation</p>
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-xl text-xs ${
                      msg.sender === "user"
                        ? "bg-amber-500 text-black rounded-br-sm"
                        : "bg-white/10 text-white rounded-bl-sm"
                    }`}
                  >
                    {msg.message}
                    <div className={`text-[9px] mt-1 ${msg.sender === "user" ? "text-black/40" : "text-white/30"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-white/10 p-2 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 bg-white/[0.06] text-white text-sm px-3 py-2 rounded-xl placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                maxLength={500}
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                className="bg-amber-500 text-black p-2 rounded-xl hover:bg-amber-400 transition disabled:opacity-40"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
