const Profile = () => {
    return (
        <div className="p-4">
            <div className="flex gap-4 items-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gray-700"></div>
                <div>
                    <h2 className="text-xl font-bold">username</h2>
                    <p className="text-gray-400">Bio goes here...</p>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-1">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="aspect-square bg-gray-800 rounded-sm"></div>
                ))}
            </div>
        </div>
    );
};
export default Profile;
