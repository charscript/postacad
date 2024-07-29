import Bottombar from '@/components/shared/Bottombar'
import LeftSidebar from '@/components/shared/LeftSidebar'
import Topbar from '@/components/shared/Topbar'
import { Outlet } from 'react-router-dom'
import RightSidebar from '@/components/shared/RightSidebar'
import { useState } from 'react'

const RootLayout = () => {

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Topbar />
      <LeftSidebar />


      <Outlet />
      <RightSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Bottombar />

    </>
  )
}

export default RootLayout