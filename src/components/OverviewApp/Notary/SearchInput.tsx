import { Data } from "../../../context/Data/Index";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import React, { useContext, useEffect, useState } from "react";
import Fuse from "fuse.js";

function SearchInput(props: any) {
    const { updateData } = props;
    const context = useContext(Data);
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<any>([]);
    const loading = open && options.length === 0;

    useEffect(() => {
        let active = true;
        if (!loading) {
            return undefined;
        }
        (async () => {
            const data =
                await context.getLargeRequestSearchInputData();
            console.log("data", data);
            const options = {
                keys: ["name"]
            };

            const fuse = new Fuse(data, options);
            let result = fuse.search("esraa").map((i) => i.item);
            console.log("result", result);
            if (active) {
                updateData(result)
                setOptions(result)
            }
        })();

        return () => {
            active = false;
        };
    }, [loading, context]);

    React.useEffect(() => {
        if (!open) {
            setOptions([]);
        }
    }, [open]);

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
