import React from "react"

export const largeReqColumns: any = [
    {
        name: "Client",
        selector: (row: any) => row.data,
        sortable: true,
    },
    {
        name: "Address",
        selector: (row: any) => row.address,
        sortable: true,
    },
    {
        name: "multisig",
        selector: (row: any) => row.multisig,
        sortable: true,
        grow: 0.6
    },
    {
        name: "Datacap",
        selector: (row: any) => row.datacap,
        sortable: true,
        grow: 0.6
    },
    {
        name: "Audit Trail",
        selector: (row: any) => row.issue_number,
        sortable: true,
        grow: 0.6,
        cell: (row: any) => <a
            target="_blank"
            rel="noopener noreferrer"
            href={row.url}>#{row.issue_number}</a>,
    },
    {
        name: "Proposer",
        selector: (row: any) => row.proposer.signerGitHandle,
        sortable: true,
        cell: (row: any) => <span >{row.proposer.signerGitHandle || "-"}</span>,
        grow: 0.5,
    },
    {
        name: "TxId",
        selector: (row: any) => row.tx.id,
        grow: 0.5,
    },
    {
        name: "Approvals",
        selector: (row: any) => row.approvals,
        sortable: true,
        grow: 0.5,
    },
]