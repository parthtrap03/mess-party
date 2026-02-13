import { Heart, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const TopNav = () => {
    return (
        <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-black/90 backdrop-blur-md border-b border-gray-800 flex justify-between items-center px-4 z-50">
            <Link to="/home">
                <h1 className="text-xl font-bold italic text-white">SocialAI</h1>
            </Link>

            <div className="flex items-center gap-5 text-white">
                <Link to="/home/notifications">
                    <Heart className="w-6 h-6" />
                </Link>
                <Link to="/home/messages">
                    <MessageCircle className="w-6 h-6" />
                </Link>
            </div>
        </div>
    );
};

export default TopNav;
