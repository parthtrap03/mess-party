import ChatInterface from '../components/chat/ChatInterface';
import { Sparkles } from 'lucide-react';

const AIChat = () => {
    return (
        <div className="h-[calc(100vh-64px)] md:h-screen flex flex-col bg-black">
            {/* AI Header / Info Area */}
            <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-2 text-center text-xs text-white">
                <p className="flex items-center justify-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    AI is learning from your active conversations.
                </p>
            </div>

            <div className="flex-1">
                <ChatInterface userId="ai_bot" isAI={true} />
            </div>
        </div>
    );
};
export default AIChat;
