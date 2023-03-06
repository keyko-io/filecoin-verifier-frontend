import { Data } from "../../../context/Data/Index";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import React, { useContext, useEffect, useState } from "react";
import Fuse from "fuse.js";
import { useLargeRequestsContext } from "../../../context/LargeRequests";

function SearchInput(props: any) {
    const { updateData, fetchTableData } = props;
    const istate = useLargeRequestsContext();
    console.log("istate", istate);
    const context = useContext(Data);
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const loading = istate.count < 1;

    useEffect(() => {
        let active = true;
        if (!open) {
            return undefined;
        }
        if (loading) {
            return undefined;
        }
        (async () => {
            if (!searchTerm && open) {
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
                // location: 0.4,
                threshold: 0.5,
            };

            const fuse = new Fuse(istate.data, searchConfig);
            let searchResult = fuse
                .search(searchTerm)
            console.log("searchResult", searchResult);
            let result = searchResult
                .map((i) => i.item)
                .slice(0, 10);
            console.log("result", result);
            if (active) {
                updateData(result);
                // setOptions(result)
            }
        })();

        return () => {
            active = false;
        };
    }, [loading, context, istate, searchTerm]);

    // React.useEffect(() => {
    //     const handler = async () => {
    //         const data =
    //             await context.getLargeRequestSearchInputData();
    //         setOptions(data)
    //     };
    //     handler();
    // }, [istate]);

    // React.useEffect(() => {
    //     if (!open) {
    //         setOptions([]);
    //     }
    // }, [open]);

    return (
        <Autocomplete
            id="asynchronous-demo"
            sx={{ width: 300 }}
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
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                />
            )}
        />
    );
}

export default SearchInput;
