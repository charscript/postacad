import Bottombar from '@/components/shared/Bottombar';
import LeftSidebar from '@/components/shared/LeftSidebar';
import Topbar from '@/components/shared/Topbar';
import { Outlet } from 'react-router-dom';
import RightSidebar from '@/components/shared/RightSidebar';
import { useState } from 'react';

const RootLayout = () => {
  const [isOpen, setIsOpen] = useState(false);

  function getFullscreenElement() {
    return document.fullscreenElement;
  }

  function toggleFullscreen() {
    if (getFullscreenElement()) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen().catch((e) => {
        console.log(e);
      });
    }
  }

  function isSmallDevice() {
    return window.matchMedia("(max-width: 768px)").matches; // Ajusta el tamaño según tus necesidades
  }

  return (
    <>
      <div
        className="w-full md:flex"
        onClick={() => {
          if (isSmallDevice()) {
            toggleFullscreen();
          }
        }}
        style={{ cursor: 'pointer' }}
      >
        <Topbar />
        <LeftSidebar />

        <section className="flex flex-1 h-full">
          <Outlet />
        </section>
        <RightSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
        <Bottombar />
      </div>
    </>
  );
};

export default RootLayout;