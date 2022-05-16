import React from 'react'
import { SetterOrUpdater } from 'recoil'

type BannerProps = {
    setIsBannerShowing: SetterOrUpdater<boolean>
}

const Banner = ({ setIsBannerShowing }: BannerProps) => {
    return (
        <div
            style={{ padding: "15px", borderTop: "1px solid blue", marginTop: "60px", color: "blue", background: "white", fontSize: "16px", textAlign: "center" }}
        ><span style={{ marginRight: "5px" }}> &#128226;</span>  Join us for Filecoin Plus Day 2022 on June 7th in person in Austin, TX, or online! Click <a style={{ color: "blue" }} href="https://lu.ma/fil-plus-day" rel="noopener noreferrer" target="_blank" >here</a> to learn more and register to participate. <span onClick={() => setIsBannerShowing(false)} style={{ position: "absolute", right: "30px", cursor: "pointer", color: "black" }}>X</span></div>
    )
}

export default Banner