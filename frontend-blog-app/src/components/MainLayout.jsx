import React from 'react'
import Header from './Header';
import Footer from './Footer';

const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <main className="flex-grow w-full">{children}</main>
    </div>
  );
};

export default MainLayout