import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';

const Post = ({ username, image, caption, avatar }) => {
    return (
        <div className="bg-black text-white border-b border-gray-800 pb-4 mb-4">
            {/* Header */}
            <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]">
                        <div className="w-full h-full rounded-full border-2 border-black bg-gray-200 overflow-hidden">
                            <img src={avatar} alt={username} className="w-full h-full object-cover" />
                        </div>
                    </div>
                    <span className="font-semibold text-sm">{username}</span>
                </div>
                <button>
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            {/* Image */}
            <div className="w-full aspect-square bg-gray-900">
                <img src={image} alt="Post content" className="w-full h-full object-cover" />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-4">
                    <button className="hover:text-gray-400"><Heart className="w-6 h-6" /></button>
                    <button className="hover:text-gray-400"><MessageCircle className="w-6 h-6" /></button>
                    <button className="hover:text-gray-400"><Send className="w-6 h-6" /></button>
                </div>
                <button className="hover:text-gray-400"><Bookmark className="w-6 h-6" /></button>
            </div>

            {/* Caption/Likes */}
            <div className="px-3">
                <p className="font-semibold text-sm mb-1">1,234 likes</p>
                <p className="text-sm">
                    <span className="font-semibold mr-2">{username}</span>
                    {caption}
                </p>
                <button className="text-gray-400 text-sm mt-1">View all 12 comments</button>
            </div>
        </div>
    );
};

export default Post;
