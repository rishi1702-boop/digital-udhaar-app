import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ChatWidget from '../Chat/ChatWidget';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        <Outlet />
        <footer className="app-footer">
          <p>&copy; {new Date().getFullYear()} Digital Udhaar Khata. All rights reserved.</p>
        </footer>
      </main>
      <ChatWidget />
    </div>
  );
};

export default Layout;
