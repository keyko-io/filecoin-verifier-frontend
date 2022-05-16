import React from 'react'
import { useLocation } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import Banner from '../components/Banner';
import Footer from '../components/Common/Footer'
import Header from '../components/Common/Header'
import { bannerState } from '../recoil-atoms/banner-atom';


const Layout = ({ children }: any) => {
    const excludeHeaderPaths = ['/app'];
    const [isBannerShowing, setIsBannerShowing] = useRecoilState(bannerState);

    let { pathname } = useLocation();

    return (<>
        {!excludeHeaderPaths.includes(pathname) && <Header />}
        {pathname === "/" && isBannerShowing && <Banner setIsBannerShowing={setIsBannerShowing} />}
        {children}
        <Footer />
    </>
    )
}

export default Layout