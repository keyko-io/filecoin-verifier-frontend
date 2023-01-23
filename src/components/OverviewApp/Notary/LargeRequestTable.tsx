import { CircularProgress } from "@material-ui/core"
import { useContext, useEffect, useState } from "react"
import DataTable from "react-data-table-component"
import { Data } from "../../../context/Data/Index"
import Tooltip from '@mui/material/Tooltip';

export const largeReqColumns: any = [
    {
        name: "Client",
        selector: (row: any) => row.data,
        sortable: true,
        grow: 1.2,
        wrap: true
    },
    {
        name: "Address",
        selector: (row: any) => row.address,
        sortable: true,
        cell: (row: any) => <div>{`${row.address.substring(0, 9)}...${row.address.substring(row.address.length - 9, row.address.length)}`}</div>
    },
    {
        name: "Multisig",
        selector: (row: any) => row.multisig,
        sortable: true,
        grow: 0.5
    },
    {
        name: "Datacap",
        selector: (row: any) => row.datacap,
        sortable: true,
        grow: 0.5
    },
    {
        name: "Audit Trail",
        selector: (row: any) => row.issue_number,
        sortable: true,
        grow: 0.5,
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
    largeRequestListLoading: boolean
    setDataForLargeRequestTable: any
}

const LargeRequestTable = ({ setSelectedLargeClientRequests, largeRequestListLoading, dataForLargeRequestTable, setDataForLargeRequestTable }: LargeRequestTableProps) => {

    const context = useContext(Data)

    const CANT_SIGN_MESSAGE = "You can currently only approve the allocation requests associated with the multisig organization you signed in with. Signing proposals for additional DataCap allocations will require you to sign in again";

    const [searched, setSearched] = useState(false)

    useEffect(() => {
        if (context.searchString) {
            setDataForLargeRequestTable((prev: any) => prev.filter((item: any) => item.searchBy.toLowerCase().includes(context.searchString.toLowerCase())))
            setSearched(true)
        }
        if (context.searchString === "" && context.largeClientRequests) {
            const data = context.largeClientRequests
                .map((item: any) => ({ ...item, data: item.data.name, searchBy: `${item.data.name} ${item.issue_number} ${item.address}` }))
                .map((item: any) => item.tx !== null ? item : { ...item, tx: "", })
            setDataForLargeRequestTable(data)
        }
    }, [context.searchString, context.largeClientRequests])


    return (
        <div className="large-request-table" style={{ minHeight: "500px" }}>
            {!context.ldnRequestsLoading && <p style={{ margin: "1rem 2rem" }}>
                * <i>You can look for specific deals querying by "Client", "Address" and "Audit Trail" fields using the search box.</i>
            </p>}
            {context.ldnRequestsLoading ?
                <div style={{ width: "100%" }} >
                    <CircularProgress style={{ margin: "8rem auto", color: "#0090ff" }} />
                </div>
                :
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
                    noDataComponent={searched ? "We could not find the data you are looking for" : "No large client requests yet"}
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
                    data={dataForLargeRequestTable}
                    progressPending={largeRequestListLoading || context.ldnRequestsLoading}
                    progressComponent={<CircularProgress style={{ margin: "4rem auto", color: "#0090ff" }} />}
                />}
        </div>

    )
}

export default LargeRequestTable