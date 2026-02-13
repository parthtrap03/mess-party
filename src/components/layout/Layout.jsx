import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import TopNav from './TopNav';

const Layout = () => {
    return (
        <div className="flex h-screen bg-black text-white overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 fixed h-full border-r border-gray-800">
                <Sidebar />
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 md:ml-64 flex flex-col h-full relative">
                {/* Mobile Top Nav */}
                <div className="md:hidden">
                    <TopNav />
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto no-scrollbar pb-16 md:pb-0 pt-14 md:pt-0">
                    <div className="max-w-4xl mx-auto w-full">
                        <Outlet />
                    </div>
                </div>

                {/* Mobile Bottom Nav */}
                <div className="md:hidden">
                    <BottomNav />
                </div>
            </main>
        </div>
    );
};

export default Layout;
