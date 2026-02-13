import { useState } from 'react';
import useChatStore from '../context/useChatStore';
import ChatInterface from '../components/chat/ChatInterface';
import { User, MessageCircle } from 'lucide-react';
import clsx from 'clsx';

const Messages = () => {
    const { conversations } = useChatStore();
    const [selectedUser, setSelectedUser] = useState(null);

    // Filter out AI bot from regular messages list
    const users = Object.keys(conversations).filter(id => id !== 'ai_bot');

    return (
        <div className="flex h-[calc(100vh-64px)] md:h-screen bg-black text-white">
            {/* Contacts List - Hidden on mobile if chat is open */}
            <div className={clsx(
                "w-full md:w-1/3 border-r border-gray-800 flex flex-col",
                selectedUser ? "hidden md:flex" : "flex"
            )}>
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <span className="text-2xl">username</span>
                        <span className="text-xs bg-gray-800 px-2 py-1 rounded-full">v1.0</span>
                    </h1>
                    <MessageCircle className="w-6 h-6" />
                </div>

                <div className="flex-1 overflow-y-auto">
                    {users.map(userId => (
                        <div
                            key={userId}
                            onClick={() => setSelectedUser(userId)}
                            className={clsx(
                                "flex items-center gap-3 p-4 hover:bg-gray-900 cursor-pointer transition-colors",
                                selectedUser === userId ? "bg-gray-900" : ""
                            )}
                        >
                            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                                <User className="w-6 h-6 text-gray-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold">{userId}</h3>
                                <p className="text-sm text-gray-400 truncate">
                                    {conversations[userId][conversations[userId].length - 1]?.text || "Start chatting..."}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Fake extra users */}
                    {['user_2', 'user_3'].map(id => (
                        <div
                            key={id}
                            onClick={() => setSelectedUser(id)} // This will create new chat in store on first message
                            className="flex items-center gap-3 p-4 hover:bg-gray-900 cursor-pointer transition-colors"
                        >
                            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                                <User className="w-6 h-6 text-gray-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold">{id}</h3>
                                <p className="text-sm text-gray-400">Tap to chat</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Window */}
            <div className={clsx(
                "flex-1 bg-black flex flex-col",
                !selectedUser ? "hidden md:flex" : "flex"
            )}>
                {selectedUser ? (
                    <>
                        <div className="md:hidden p-2">
                            <button onClick={() => setSelectedUser(null)} className="text-blue-500">Back</button>
                        </div>
                        <ChatInterface userId={selectedUser} />
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <div className="w-24 h-24 rounded-full border-2 border-white flex items-center justify-center mb-4">
                            <MessageCircle className="w-12 h-12" />
                        </div>
                        <h2 className="text-2xl font-light">Your Messages</h2>
                        <p className="text-gray-400 mt-2">Send private photos and messages to a friend or group.</p>
                        <button className="mt-4 bg-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                            Send Message
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
export default Messages;
