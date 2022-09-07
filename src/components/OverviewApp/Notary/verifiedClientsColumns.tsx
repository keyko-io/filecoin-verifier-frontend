import React from "react"
import { BeatLoader } from "react-spinners"
import { bytesToiB } from "../../../utils/Filters"

export const verifiedColumns: any = [
    {
        name: "ID",
        selector: (row: any) => row.verified,
        sortable: true,
    },
    {
        name: "Address",
        selector: (row: any) => row.key,
        sortable: true,
        grow: 3,
        cell: (row: any) => (
            <span>
                {row.key || (
                    <BeatLoader size={5} color={"rgb(24,160,237)"} />
                )}
            </span>
        ),
    },
    {
        name: "Datacap",
        selector: (row: any) => row.datacap,
        sortable: true,
        cell: (row: any) => <span>{bytesToiB(row.datacap)}</span>,
    },
]