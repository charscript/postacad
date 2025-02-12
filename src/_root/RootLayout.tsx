import Bottombar from '@/components/shared/Bottombar';
import LeftSidebar from '@/components/shared/LeftSidebar';
import Topbar from '@/components/shared/Topbar';
import { Outlet } from 'react-router-dom';
import RightSidebar from '@/components/shared/RightSidebar';
import { useState } from 'react';

const RootLayout = () => {
  const [isOpen, setIsOpen] = useState(false);



  return (
    <>
      <div
        className="w-full h-screen md:flex overflow-hidden ">
        <Topbar />
        <LeftSidebar />

        <section className="flex flex-1 h-full overflow-auto">
          <Outlet />
        </section>
        <RightSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
        <Bottombar />
      </div>
    </>
  );
};

export default RootLayout;