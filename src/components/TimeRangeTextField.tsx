import { MenuItem, TextField } from "@material-ui/core";
import { METRICES_TIME_RANGE_OPTIONS } from "../constants";
import { SentryDataPeriods, TimeRangeInput } from "../type";

const TimeRangeTextField = (i: TimeRangeInput) => {
    const { searchQuery, setSearchQuery } = i;

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: "2rem",
            }}
        >
            <div>
                <TextField
                    id="outlined-select-currency"
                    select
                    label="Select time range"
                    value={searchQuery}
                    style={{ minWidth: "14rem" }}
                    onChange={(e) =>
                        setSearchQuery(
                            e.target.value as SentryDataPeriods
                        )
                    }
                >
                    {METRICES_TIME_RANGE_OPTIONS.map((option) => (
                        <MenuItem
                            key={option.value}
                            value={option.value}
                        >
                            {option.label}
                        </MenuItem>
                    ))}
                </TextField>
            </div>
        </div>
    );
};

export default TimeRangeTextField;
