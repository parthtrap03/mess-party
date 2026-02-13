import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useChatStore = create(
    persist(
        (set, get) => ({
            conversations: {
                'user_1': [
                    { id: 1, text: "Hey! How are you?", sender: 'them', timestamp: Date.now() - 100000 },
                    { id: 2, text: "I'm doing good, just working on this React app.", sender: 'me', timestamp: Date.now() - 50000 },
                ],
                'ai_bot': [
                    { id: 1, text: "Hello! I am your AI assistant. I learn from your chats. How can I help?", sender: 'them', timestamp: Date.now() }
                ]
            },
            activeUserId: null,

            setActiveUser: (id) => set({ activeUserId: id }),

            sendMessage: (userId, text, sender = 'me') => {
                set((state) => {
                    const currentMessages = state.conversations[userId] || [];
                    const newMessage = {
                        id: Date.now(),
                        text,
                        sender,
                        timestamp: Date.now(),
                    };
                    return {
                        conversations: {
                            ...state.conversations,
                            [userId]: [...currentMessages, newMessage],
                        }
                    };
                });
            },

            // AI "Training" Logic (Simple Simulation)
            // It consolidates all user messages into a single context string
            generateAIContext: () => {
                const state = get();
                let context = "You are an AI assistant. Here is what I know about the user based on their chat history:\n";

                Object.entries(state.conversations).forEach(([uid, msgs]) => {
                    if (uid === 'ai_bot') return; // Don't learn from talking to yourself
                    msgs.forEach(msg => {
                        const role = msg.sender === 'me' ? "User" : "Friend";
                        context += `${role}: ${msg.text}\n`;
                    });
                });
                return context;
            }
        }),
        {
            name: 'social-ai-storage', // unique name
        }
    )
);

export default useChatStore;
