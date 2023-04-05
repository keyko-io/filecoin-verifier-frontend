import React from "react"
import { useLocation } from "react-router-dom"
import Footer from "./Footer/Footer"
import Header from "./Header/Header"
import { Toaster } from "react-hot-toast"

export interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const excludeHeaderPaths = ["/app"]

  let { pathname } = useLocation()

  const isAdminPage = pathname === "/admin"

  return (
    <>
      <Toaster
        position="top-right"
        containerStyle={{
          top: 80,
        }}
      />
      {!excludeHeaderPaths.includes(pathname) && !isAdminPage && <Header />}
      {children}
      {!isAdminPage && <Footer />}
    </>
  )
}

export default Layout
