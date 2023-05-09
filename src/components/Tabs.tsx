import BugReportIcon from "@mui/icons-material/BugReport";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import * as React from "react";
import StackedBarsChart from "../components/BarsChart";
import { config } from "../config";
import { METRICES_TITLES } from "../constants";
import {
    BlockchainsTabProps,
    ChartsViewProps,
    SentryDataPeriods,
    SentryDataTypes,
    TabsInput,
    UserTabProps,
} from "../type";
import { fetchSentryData, groupEventsByDay } from "../utils";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        "aria-controls": `simple-tabpanel-${index}`,
    };
}

const ChartsView = (i: ChartsViewProps) => {
    const { searchQuery, infoData } = i;

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns:
                    searchQuery === SentryDataPeriods.TwoWeeks
                        ? "1fr"
                        : "1fr 1fr",
                gap: "40px",
            }}
        >
            {Object.keys(infoData).map((key: string) => {
                const data = infoData[key];
                let total = 0;
                const response = Object.keys(data)
                    .map((k) => {
                        total += data[k].length;
                        return {
                            x: k,
                            y: data[k].length,
                        };
                    })
                    .reverse();

                return (
                    <div
                        style={{
                            border: "1px solid #C4C4C4",
                            borderRadius: "4px",
                        }}
                    >
                        <h2
                            style={{
                                marginBottom:
                                    searchQuery === "24h"
                                        ? ""
                                        : "40px",
                                padding: "20px",
                                paddingTop: "20px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                fontSize: "24px",
                                fontWeight: "normal",
                                borderBottom:
                                    searchQuery === "24h"
                                        ? ""
                                        : "1px solid #C4C4C4",
                            }}
                        >
                            <span>{METRICES_TITLES[key] || key}</span>
                            <span
                                style={{
                                    border: "2px solid rgb(15 147 153 / 60%)",
                                    padding: "10px",
                                    fontSize: "16px",
                                    borderRadius: "4px",
                                }}
                            >
                                Total: {total}
                            </span>
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
    );
};

const UserTab = (i: UserTabProps) => {
    const [isLoading, setIsLoading] = React.useState(false);
    const { searchQuery } = i;
    const [infoData, setInfoData] = React.useState({});

    React.useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const loginStats = await fetchSentryData(
                searchQuery,
                SentryDataTypes.LoginStats
            );

            setInfoData({
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

    return isLoading ? (
        <div>Loading...</div>
    ) : (
        <ChartsView searchQuery={searchQuery} infoData={infoData} />
    );
};

const BlockchainTab = (i: BlockchainsTabProps) => {
    const { searchQuery } = i;
    const [isLoading, setIsLoading] = React.useState(false);
    const [infoData, setInfoData] = React.useState({});

    React.useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const signingStats = await fetchSentryData(
                searchQuery,
                SentryDataTypes.SigningStats
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
            });
            setIsLoading(false);
        };
        fetchData();
    }, [searchQuery]);

    return isLoading ? (
        <div>Loading...</div>
    ) : (
        <ChartsView searchQuery={searchQuery} infoData={infoData} />
    );
};

const BugsTab = () => {
    const [openIssue, setOpenIssue] = React.useState(0);

    React.useEffect(() => {
        fetch(`${config.apiUri}/stats/issues`)
            .then((res) => res.json())
            .then((openIssue) => setOpenIssue(openIssue.count));
    }, []);

    return (
        <Box
            sx={{
                border: "1px solid #C4C4C4",
                padding: "1rem",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                fontWeight: "600",
                "&:hover": {
                    cursor: "pointer",
                    borderColor: "black",
                },
            }}
            onClick={() =>
                window.open(
                    "https://github.com/keyko-io/filecoin-verifier-frontend/issues",
                    "_blank"
                )
            }
        >
            <BugReportIcon sx={{ pr: "0.5rem" }} />
            Number of bugs reported : {openIssue}
        </Box>
    );
};

const MetricesTabs = (i: TabsInput) => {
    const { searchQuery, setSearchQuery, setIsLoading, isLoading } =
        i;
    const [value, setValue] = React.useState(0);

    const handleChange = (
        event: React.SyntheticEvent,
        newValue: number
    ) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: "100%" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    aria-label="basic tabs example"
                >
                    <Tab label="Bugs" {...a11yProps(0)} />
                    <Tab label="Blockchain" {...a11yProps(1)} />
                    <Tab label="User" {...a11yProps(2)} />
                </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
                <BugsTab />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <BlockchainTab searchQuery={searchQuery} />
            </TabPanel>
            <TabPanel value={value} index={2}>
                <UserTab searchQuery={searchQuery} />
            </TabPanel>
        </Box>
    );
};

export default MetricesTabs;
