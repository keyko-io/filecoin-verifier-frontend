import { useContext, useEffect, useState } from "react";
import { config } from "../../../config";
import * as Logger from "../../../logger";
import { Data } from "../../../context/Data/Index";
import { useLargeRequestsContext } from "../../../context/LargeRequests";

type NotaryTabsProps = {
    tabs: string;
    changeStateTabs: (indexTab: string) => void;
    verifiedClientsLength: number;
};

const NotaryTabs = ({
    changeStateTabs,
    tabs,
    verifiedClientsLength,
}: NotaryTabsProps) => {
    const context = useContext(Data);
    const { count } = useLargeRequestsContext();

    const selectedTab = (tabIndex: string) => {
        return tabs === tabIndex ? "selected" : "";
    };

    // FIXME
    // useEffect(() => {
    //     const handler = async () => {
    //         try {
    //             const label = "bot:readyToSign";
    //             const rawLargeIssuesAll =
    //                 await context?.github?.fetchGithubIssues(
    //                     config?.onboardingLargeOwner,
    //                     config?.onboardingLargeClientRepo,
    //                     state,
    //                     label
    //                 );
    //             const count = rawLargeIssuesAll?.length || 0;
    //             if (
    //                 Number(count) !==
    //                 Number(context?.largeClientRequests?.length)
    //             ) {
    //                 await Logger.BasicLogger({
    //                     message:
    //                         "Github count: " +
    //                         count +
    //                         " , Dashboard Count: " +
    //                         context?.largeClientRequests?.length,
    //                 });
    //             }
    //         } catch (error) {
    //             console.log(error);
    //             await Logger.BasicLogger({
    //                 message: "Error: Cant log number of requests",
    //             });
    //         }
    //     };
    //     handler();
    // }, [context?.github, context?.largeClientRequests]);

    return (
        <>
            <div className="tabs">
                <div
                    className={selectedTab("1")}
                    onClick={() => {
                        changeStateTabs("1");
                    }}
                >
                    Public Requests ({context.clientRequests.length})
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
                    Large Requests (
                    {count})
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
    );
};

export default NotaryTabs;
