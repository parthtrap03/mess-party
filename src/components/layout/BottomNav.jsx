import { Home, Search, PlusSquare, MessageCircle, User, Bot } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';

const BottomNav = () => {
    const location = useLocation();

    const navItems = [
        { icon: Home, path: '/home' },
        { icon: Search, path: '/home/explore' },
        { icon: PlusSquare, path: '/home/create' },
        { icon: Bot, path: '/home/ai-chat' },
        { icon: User, path: '/home/profile' },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black border-t border-gray-800 flex justify-around items-center z-50 px-2">
            {navItems.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                    <Link
                        key={index}
                        to={item.path}
                        className="p-2 transition-transform active:scale-90"
                    >
                        <item.icon
                            className={clsx(
                                "w-7 h-7 text-white",
                                isActive ? "stroke-[3px]" : "stroke-2 opacity-80"
                            )}
                        />
                    </Link>
                );
            })}
        </div>
    );
};

export default BottomNav;
