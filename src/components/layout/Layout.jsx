import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children, footerVariant = 'full', hideNavbar = false }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background">
      {!hideNavbar && <Navbar />}
      <main className="flex-grow w-full">
        {children}
      </main>
      <Footer variant={footerVariant} />
    </div>
  );
};

export default Layout;
