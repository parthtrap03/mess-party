const Explore = () => {
    return (
        <div className="p-4 grid grid-cols-3 gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <div key={i} className="aspect-square bg-gray-800 rounded-sm"></div>
            ))}
        </div>
    );
};
export default Explore;
