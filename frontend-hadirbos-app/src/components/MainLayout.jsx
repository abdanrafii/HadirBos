import React from 'react'

const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <main className="flex-grow w-full">{children}</main>
    </div>
  );
};

export default MainLayout