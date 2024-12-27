import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './Layout.tsx'
import SignUp from './components/SignUp.tsx'
import Login from './components/Login.tsx'
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
      }
    ]

  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={Router} />
  </StrictMode>,
)
