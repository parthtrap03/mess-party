import { Home, Search, PlusSquare, MessageCircle, Heart, User, Menu, Bot } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';

const Sidebar = () => {
    const location = useLocation();

    const navItems = [
        { icon: Home, label: 'Home', path: '/home' },
        { icon: Search, label: 'Search', path: '/home/explore' },
        { icon: Bot, label: 'AI Assistant', path: '/home/ai-chat' }, // Highlighting the AI feature
        { icon: MessageCircle, label: 'Messages', path: '/home/messages' },
        { icon: Heart, label: 'Notifications', path: '/home/notifications' },
        { icon: PlusSquare, label: 'Create', path: '/home/create' },
        { icon: User, label: 'Profile', path: '/home/profile' },
    ];

    return (
        <div className="hidden md:flex flex-col h-screen w-64 border-r border-gray-800 bg-black text-white fixed left-0 top-0 px-4 py-6 z-50">
            <Link to="/" className="mb-10 px-2">
                <h1 className="text-2xl font-bold tracking-wide italic">SocialAI</h1>
            </Link>

            <nav className="flex-1 flex flex-col gap-2">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={clsx(
                                "flex items-center gap-4 p-3 rounded-lg transition-all duration-200 group",
                                isActive ? "font-bold" : "hover:bg-gray-900"
                            )}
                        >
                            <item.icon
                                className={clsx(
                                    "w-6 h-6 transition-transform group-hover:scale-105",
                                    isActive ? "stroke-[3px]" : "stroke-2"
                                )}
                            />
                            <span className="text-base">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto px-2">
                <button className="flex items-center gap-4 p-3 w-full rounded-lg hover:bg-gray-900 transition-all font-medium">
                    <Menu className="w-6 h-6" />
                    <span>More</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
