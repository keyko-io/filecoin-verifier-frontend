import React from "react"

type NotaryTabsProps = {
    tabs: string;
    changeStateTabs: any,
    ctx: any,
    verifiedClientsLength: any,
    dataCancelLength: any,
}

const NotaryTabs = ({ changeStateTabs, tabs, ctx, dataCancelLength, verifiedClientsLength }: NotaryTabsProps) => {

    const selectedTab = (tabIndex: string) => {
        return tabs === tabIndex ? "selected" : ""
    }

    return (
        <>
            <div className="tabs">
                <div
                    className={selectedTab("1")}
                    onClick={() => {
                        changeStateTabs("1");
                    }}
                >
                    Public Requests ({ctx.clientRequests.length})
                </div>
                <div
                    className={selectedTab("2")}
                    onClick={() => {
                        changeStateTabs("2");
                    }}
                >
                    Verified clients ({verifiedClientsLength})
                </div>
                <div
                    className={selectedTab("3")}
                    onClick={() => {
                        changeStateTabs("3");
                    }}
                >
                    Large Requests ({ctx.largeClientRequests.length})
                </div>

                <div
                    className={selectedTab("4")}
                    onClick={() => {
                        changeStateTabs("4");
                    }}
                >
                    Proposed Requests
                </div>
            </div>
        </>
    )
}

export default NotaryTabs