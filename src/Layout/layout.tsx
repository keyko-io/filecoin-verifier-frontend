import React from 'react'
import { useLocation } from 'react-router-dom';
import Footer from '../components/Common/Footer'
import Header from '../components/Common/Header'

const Layout = ({ children }: any) => {
    const excludeHeaderPaths = ['/app'];

    let { pathname } = useLocation();

    return (<>
        {!excludeHeaderPaths.includes(pathname) && <Header />}
        {children}
        <Footer />
    </>
    )
}

export default Layout