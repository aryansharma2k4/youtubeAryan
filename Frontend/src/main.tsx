import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Dashboard from './components/dashboard.tsx'
import VideoPlay from './components/VideoPlay.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './Layout.tsx'
import SignUp from './components/SignUp.tsx'
import Login from './components/Login.tsx'
import { Toaster } from 'react-hot-toast'
import PublishVideo from './components/PublishVideo.tsx'
import Home from './components/Home.tsx'

const Router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/sign-up",
        element: <SignUp/>
      },
      {
        path: "/sign-in",
        element: <Login/>
      },
      {
        path: "",
        element: <Home/>
      },{
        path: "/video/:id",
        element: <VideoPlay />
      },{
        path: "/publishVideo",
        element: <PublishVideo />
      },{
        path: "/u/:id",
        element: <Dashboard />
      }
    ]

  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={Router} />
    <Toaster position='top-right' />
  </StrictMode>,
)
