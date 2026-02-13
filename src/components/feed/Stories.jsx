const Stories = () => {
    // Generate dummy stories
    const stories = Array.from({ length: 8 }).map((_, i) => ({
        id: i,
        username: `user_${i}`,
    }));

    return (
        <div className="flex gap-4 overflow-x-auto no-scrollbar p-4 border-b border-gray-800 bg-black">
            {stories.map((story) => (
                <div key={story.id} className="flex flex-col items-center gap-1 min-w-[70px]">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]">
                        <div className="w-full h-full rounded-full border-2 border-black bg-gray-800"></div>
                    </div>
                    <span className="text-xs text-gray-300 truncate w-16 text-center">{story.username}</span>
                </div>
            ))}
        </div>
    );
};

export default Stories;
