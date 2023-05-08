import { MenuItem, TextField , Box} from "@mui/material";
import axios from "axios";
import _ from "lodash";
import { useEffect, useState } from "react";
import StackedBarsChart from "../components/BarsChart";
import BugReportIcon from '@mui/icons-material/BugReport';
import {
    SentryDataPeriods,
    SentryDataTypes,
    SentryInfo,
} from "../type";
import { config } from "../config";

const groupEventsByDay = (data: { dateCreated: string }[]) => {
    const result = _.groupBy(data, (i) => {
        const d = new Date(i.dateCreated).toDateString().split(" ");
        if (d.length < 3)
            return new Date(i.dateCreated).toDateString(); // just to be safe
        const res = d[1] + "/" + d[2];
        return res;
    });

    return result;
};

const range = [
    {
        value: SentryDataPeriods.SevenDays,
        label: "last 7 Days",
    },
    {
        value: SentryDataPeriods.TwoWeeks,
        label: "last 14 days",
    },
    {
        value: SentryDataPeriods.OneDay,
        label: "last 24 hours",
    },
];

const constructSentryUrl = (
    period: string,
    type: SentryDataTypes
) => {
    const baseUrl = `${config.apiUri}/stats/${type}/${period}`;
    return baseUrl;
};

const fetchSentryData = async (
    period: SentryDataPeriods,
    type: SentryDataTypes
) => {
    try {
        const url = constructSentryUrl(period, type);
        const response = await axios.get(url);
        if (response.status < 300 && response.status > 199) {
            return response.data;
        }
        return [];
    } catch (error) {
        console.error(error);
        return [];
    }
};

const Sentry = () => {
    const [infoData, setInfoData] = useState<SentryInfo>(
        {} as SentryInfo
    );
    const [openIssue, setOpenIssue] = useState(0)
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState<SentryDataPeriods>(
        SentryDataPeriods.SevenDays
    );

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const signingStats = await fetchSentryData(
                searchQuery,
                SentryDataTypes.SigningStats
            );
            const loginStats = await fetchSentryData(
                searchQuery,
                SentryDataTypes.LoginStats
            );

            setInfoData({
                requestProposed: groupEventsByDay(
                    signingStats.requestProposed
                ),
                requestApproved: groupEventsByDay(
                    signingStats.requestApproved
                ),
                proposalFailed: groupEventsByDay(
                    signingStats.proposalFailed
                ),
                approvalFailed: groupEventsByDay(
                    signingStats.approvalFailed
                ),
                ghLogins: groupEventsByDay(loginStats.ghLogins),
                ghTokenLoading: groupEventsByDay(
                    loginStats.ghTokenLoading
                ),  
                ledgerLogins: groupEventsByDay(
                    loginStats.ledgerLogins
                ),
                ledgerLoginsFail: groupEventsByDay(
                    loginStats.ledgerLoginsFail
                ),
            });
            setIsLoading(false);
        };
        fetchData();
    }, [searchQuery]);


     useEffect(() => {
       fetch(`${config.apiUri}/stats/issues`)
       .then(res => res.json())
       .then(openIssue => setOpenIssue(openIssue.count))
     }, [])

    return (
        <div
            style={{
                width: "1440px",
                margin: "10rem auto",
            }}
        >   
            <h4
                style={{
                    textAlign: "center",
                    marginBottom: "6rem",
                    fontSize: "36px",
                }}
            >
                Fil+ App Data Metrics
            </h4>
            <div style={{ display : "flex", justifyContent : "space-between", alignItems : "center", paddingBottom : "2rem" }}>
                <div>
                     <TextField
                id="outlined-select-currency"
                select
                label="Select time range"
                value={searchQuery}
                sx={{ minWidth: "14rem" }}
                onChange={(e) =>
                    setSearchQuery(
                        e.target.value as SentryDataPeriods
                    )
                }
            >
                {range.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
                 </TextField>
                </div>
                <Box               
                    sx={{
                     border : "1px solid #C4C4C4", 
                     padding : "1rem" , 
                     borderRadius : "4px" ,
                     display : "flex" ,
                     alignItems : "center",
                     fontWeight : "600",
                        "&:hover": { 
                        cursor: 'pointer',
                        borderColor : "black"
                        }
                    }}
                    onClick={() => window.open(
                        "https://github.com/keyko-io/filecoin-verifier-frontend/issues",
                        "_blank"
                      )}
                    >
                       <BugReportIcon sx={{pr : "0.5rem"}} />
                       Number of bugs reported : {openIssue}
                </Box>          
            </div>
           
            {isLoading ? (
                <div
                    style={{
                        textAlign: "center",
                        minHeight: "30rem",
                        width: "100%",
                    }}
                >
                    Loading metrics...{" "}
                </div>
            ) : infoData && !isLoading ? (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            searchQuery === SentryDataPeriods.TwoWeeks
                                ? "1fr"
                                : "1fr 1fr",
                        gap: "40px"        
                    }}
                >
                    {Object.keys(infoData).map((key: string) => {
                        const data =
                            infoData[key as keyof SentryInfo];
                        let total = 0;
                        const response = Object.keys(data).map(
                            (k) => {
                                total += data[k].length;
                                return {
                                    x: k,
                                    y: data[k].length,
                                };
                            }
                        ).reverse();

                        return (
                            <div style={{
                                border : "1px solid #C4C4C4", 
                                borderRadius : "4px" ,
                                }}>
                                <h2 style={{ marginBottom : searchQuery === "24h" ? "" : "40px", padding : "20px", paddingTop: "20px",  display : "flex",
                                    justifyContent : "space-between",
                                    alignItems : "center",
                                    fontSize : "24px",
                                    fontWeight: "normal",
                                    borderBottom : searchQuery === "24h" ? "" : "1px solid #C4C4C4",                               
                                 }}>
                                    <span>{neededTitles[key] || key}</span>
                                    <span style={{
                                    border: "2px solid rgb(15 147 153 / 60%)",
                                    padding : "10px" , fontSize : "16px" , borderRadius: "4px",
                                    }}>Total: {total} </span>
                                </h2>
                            
                                {total > 0 && (
                                    <StackedBarsChart
                                        searchQuery={searchQuery}
                                        data={response}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div>No data found</div>
            )}
        </div>
    );
};

const neededTitles: any = {
    ghLogins: "Github Logins",
    ledgerLogins: "Ledger Logins",
    ghTokenLoading: "Github Token Loaded",
    requestProposed: "Request Proposed",
    requestApproved: "Request Approved",
    proposalFailed : "Proposal Failed",
    approvalFailed : "Approval Failed",
    ledgerLoginsFail : "Ledger Login Failed"
 };

export default Sentry;
