import { useState } from "react";
import MetricesTabs from "../components/Tabs";
import TimeRangeTextField from "../components/TimeRangeTextField";
import { SentryDataPeriods } from "../type";

const Sentry = () => {
    const [openIssue, setOpenIssue] = useState(0);
    const [searchQuery, setSearchQuery] = useState<SentryDataPeriods>(
        SentryDataPeriods.SevenDays
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
                Fil+ notary app and GitHub tooling metrics
            </h4>
            <TimeRangeTextField
                {...{ searchQuery, setSearchQuery }}
            />
            <MetricesTabs
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />
        </div>
    );
};

export default Sentry;
