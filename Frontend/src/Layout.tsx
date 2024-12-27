import { Toaster } from 'react-hot-toast'
import { Outlet } from 'react-router-dom'

function Layout() {
  return (
    <>
      <Toaster position='top-right' />
      <Outlet />
    </>
  )
}

export default Layout