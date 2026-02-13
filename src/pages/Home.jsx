import Stories from '../components/feed/Stories';
import Post from '../components/feed/Post';

const Home = () => {
    const posts = [
        {
            id: 1,
            username: 'alex_dev',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
            image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=600&fit=crop',
            caption: 'Coding away on a new project! 💻 #react #developer'
        },
        {
            id: 2,
            username: 'travel_bug',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
            image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&h=600&fit=crop',
            caption: 'Switzerland is breathtaking 🏔️'
        },
        {
            id: 3,
            username: 'foodie_life',
            avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop',
            image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=600&fit=crop',
            caption: 'Best ramen in town 🍜'
        }
    ];

    return (
        <div className="bg-black min-h-screen text-white">
            <Stories />
            <div className="max-w-lg mx-auto md:mt-4">
                {posts.map(post => (
                    <Post
                        key={post.id}
                        username={post.username}
                        avatar={post.avatar}
                        image={post.image}
                        caption={post.caption}
                    />
                ))}
            </div>
        </div>
    );
};
export default Home;
