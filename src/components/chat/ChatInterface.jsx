import { useState } from 'react';
import { Send, Bot, User } from 'lucide-react';
import clsx from 'clsx';
import useChatStore from "../../context/useChatStore";

const ChatInterface = ({ userId, isAI = false }) => {
    const { conversations, sendMessage, generateAIContext } = useChatStore();
    const messages = conversations[userId] || [];
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        sendMessage(userId, inputValue, 'me');
        setInputValue("");

        // Simulated Response
        if (isAI) {
            setIsTyping(true);
            setTimeout(() => {
                const context = generateAIContext();
                // Simple heuristic response for "training" demo
                let response = "I'm still learning from your chats. Go chat with others to teach me!";

                if (inputValue.toLowerCase().includes('what do i like') || inputValue.toLowerCase().includes('who am i')) {
                    response = `Based on your chats, here is what I know:\n${context.slice(0, 200)}...`;
                } else {
                    response = `I processed that using my context trained on your ${Object.keys(conversations).length - 1} conversations.`;
                }

                sendMessage(userId, response, 'them');
                setIsTyping(false);
            }, 1500);
        } else {
            // Simulate friend reply
            setTimeout(() => {
                sendMessage(userId, "That's interesting!", 'them');
            }, 3000);
        }
    };

    return (
        <div className="flex flex-col h-full bg-black text-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-800 flex items-center gap-3">
                <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center", isAI ? "bg-blue-600" : "bg-gray-700")}>
                    {isAI ? <Bot className="w-6 h-6" /> : <User className="w-6 h-6" />}
                </div>
                <div>
                    <h2 className="font-bold">{isAI ? "AI Assistant" : "User Name"}</h2>
                    <p className="text-xs text-gray-400">{isAI ? "Online • Learning Mode" : "Online"}</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={clsx("flex", msg.sender === 'me' ? "justify-end" : "justify-start")}>
                        <div className={clsx(
                            "max-w-[70%] p-3 rounded-2xl text-sm",
                            msg.sender === 'me' ? "bg-blue-600 text-white rounded-br-none" : "bg-gray-800 text-gray-200 rounded-bl-none"
                        )}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-gray-800 text-gray-200 p-3 rounded-2xl rounded-bl-none text-sm animate-pulse">
                            Thinking...
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-800 flex items-center gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Message..."
                    className="flex-1 bg-gray-900 border-none rounded-full px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button onClick={handleSend} className="p-2 text-blue-500 hover:bg-gray-900 rounded-full">
                    <Send className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default ChatInterface;
