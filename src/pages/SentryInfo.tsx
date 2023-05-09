import { useState } from "react";
import AltTabs from "../components/Tabs";
import TimeRangeTextField from "../components/TimeRangeTextField";
import { SentryDataPeriods } from "../type";

const Sentry = () => {
    const [openIssue, setOpenIssue] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState<SentryDataPeriods>(
        SentryDataPeriods.OneDay
    );

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
            <TimeRangeTextField
                {...{ searchQuery, setSearchQuery }}
            />
            <AltTabs
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
            />
        </div>
    );
};

export default Sentry;
