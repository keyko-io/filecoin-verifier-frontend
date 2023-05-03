import { MenuItem, TextField } from "@mui/material";
import axios from "axios";
import _ from "lodash";
import { useEffect, useState } from "react";
import StackedBarsChart from "../components/BarsChart";
import {
    SentryDataPeriods,
    SentryDataTypes,
    SentryInfo,
} from "../type";

const groupEventsByDay = (data: { dateCreated: string }[]) => {
    const result = _.groupBy(data, (i) => {
        const d = new Date(i.dateCreated).toDateString().split(" ");
        if(d.length < 3) return new Date(i.dateCreated).toDateString(); // just to be safe
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
    const baseUrl = `${process.env.REACT_APP_BACK_END_URL}/stats/${type}/${period}`;
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
                ghLogins: groupEventsByDay(loginStats.ghLogins),
                ledgerLogins: groupEventsByDay(
                    loginStats.ledgerLogins
                ),
                ghTokenLoading: groupEventsByDay(
                    loginStats.ghTokenLoading
                ),
            });
            setIsLoading(false);
        };
        fetchData();
    }, [searchQuery]);

    return (
        <div
            style={{
                width: "1400px",
                padding: "0 20px",
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
                FILECOIN PLUS DATA METRICS
            </h4>
            <TextField
                id="outlined-select-currency"
                select
                label="Select time range"
                value={searchQuery}
                sx={{ mb: "2rem", minWidth: "14rem" }}
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
                        height: "50rem",
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        overflow: "scroll",
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
                        );

                        return (
                            <div>
                                <h2>
                                    {neededTitles[key] || key}, Count:
                                    {total}
                                </h2>
                                {total > 0 && <StackedBarsChart data={response.reverse()} /> }
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
};

export default Sentry;
