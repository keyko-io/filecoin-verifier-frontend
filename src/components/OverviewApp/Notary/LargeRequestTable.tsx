import { CircularProgress } from "@material-ui/core"
import React, { useContext } from "react"
import DataTable from "react-data-table-component"
import { Data } from "../../../context/Data/Index"
import { searchAllColumnsFromTable } from "../../../pages/tableUtils/searchAllColumnsFromTable"

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

type LargeRequestTableProps = {
    setSelectedLargeClientRequests: any
    dataForLargeRequestTable: any
    searchInput: any
    largeRequestListLoading: boolean
}

const LargeRequestTable = ({ setSelectedLargeClientRequests, largeRequestListLoading, dataForLargeRequestTable, searchInput }: LargeRequestTableProps) => {

    const context = useContext(Data)

    const CANT_SIGN_MESSAGE = "You can currently only approve the allocation requests associated with the multisig organization you signed in with. Signing proposals for additional DataCap allocations will require you to sign in again";

    return (
        <DataTable
            columns={largeReqColumns}
            selectableRowDisabled={(row) => !row.signable}
            selectableRowsHighlight
            selectableRows
            selectableRowsNoSelectAll={true}
            pagination
            paginationRowsPerPageOptions={[10, 20, 30]}
            paginationPerPage={10}
            defaultSortFieldId={1}
            noDataComponent="No large client requests yet"
            onSelectedRowsChange={({ selectedRows }) => {
                const rowNumbers = selectedRows.map((row: any) => row.issue_number)
                setSelectedLargeClientRequests(rowNumbers)
            }}
            onRowClicked={(row: any) => {
                if (!row.signable) {
                    context.wallet.dispatchNotification(CANT_SIGN_MESSAGE)
                }
            }}
            noContextMenu={true}
            data={searchAllColumnsFromTable({ rows: dataForLargeRequestTable, query: searchInput })}
            progressPending={largeRequestListLoading}
            progressComponent={<CircularProgress style={{ marginTop: "100px", color: "#0090ff" }} />}
        />
    )
}

export default LargeRequestTable