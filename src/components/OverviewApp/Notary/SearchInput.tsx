import { Data } from "../../../context/Data/Index";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import React, { useContext, useEffect, useState } from "react";
import Fuse from "fuse.js";
import { useLargeRequestsContext } from "../../../context/LargeRequests";

function SearchInput(props: any) {
    const { updateData, fetchTableData } = props;
    const { count, data } = useLargeRequestsContext();
    const context = useContext(Data);
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const loading = count < 1;

    useEffect(() => {
        let active = true;
        if (!open) {
            return undefined;
        }
        if (loading) {
            return undefined;
        }
        (async () => {
            if ((!searchTerm || searchTerm.length < 2) && open) {
                await fetchTableData(1);
                return;
            }
            const searchConfig = {
                keys: [
                    "name",
                    "multisig",
                    "datacap",
                    "issue_number",
                    "address",
                ],
                location: 0,
                distance: 90,
                threshold: 0.3,
            };

            console.log("data", data);
            const fuse = new Fuse(data, searchConfig);
            let searchResult = fuse.search(searchTerm);
            let result = searchResult.map((i) => i.item).slice(0, 10);
            console.log("result", result);
            const formattedResult =
                await context.formatLargeRequestData(result);
            console.log("formattedResult", formattedResult);
            if (active) {
                updateData(formattedResult);
                // setOptions(result)
            }
        })();

        return () => {
            active = false;
        };
    }, [loading, context, data, searchTerm]);

    return (
        <Autocomplete
            id="asynchronous-demo"
            sx={{ width: 300, marginLeft: "10px" }}
            open={open}
            onOpen={() => {
                setOpen(true);
            }}
            onClose={() => {
                setOpen(false);
            }}
            isOptionEqualToValue={(option, value) => false}
            getOptionLabel={(option) => ""}
            freeSolo={true}
            options={[]}
            disabled={loading}
            loading={loading}
            renderInput={(params) => (
                //@ts-ignore
                <TextField
                    {...params}
                    variant={"standard"}
                    label="Search"
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {loading ? (
                                    <CircularProgress
                                        color="inherit"
                                        size={20}
                                    />
                                ) : null}
                                {/**params.InputProps.endAdornment**/}
                            </React.Fragment>
                        ),
                    }}
                />
            )}
        />
    );
}

export default SearchInput;
