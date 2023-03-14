import React, { useContext } from "react"
import DataTable from "react-data-table-component"
import { Data } from "../../../context/Data/Index"
import InfoIcon from '@mui/icons-material/Info';
import Tooltip from '@mui/material/Tooltip';
import history from "../../../context/History";

const publicRequestColumns: any = [
    {
        name: "Name",
        selector: (row: any) => row.data.name,
        sortable: true,
        grow: 1
    },
    {
        name: "Address",
        selector: (row: any) => row.data.address,
        sortable: true,
        grow: 1.2
    },
    {
        name: "Datacap",
        selector: (row: any) => row.data.datacap,
        sortable: true,
        grow: 0.7
    },
    {
        name: "Audit Trail",
        selector: (row: any) => row.number,
        sortable: true,
        cell: (row: any) => (
            <a
                target="_blank"
                rel="noopener noreferrer"
                href={row.url}
            >
                #{row.number}
            </a>
        ),
        grow: 0.7
    },
    {
        button: true,
        cell: (row: any) => <span onClick={() => clientDetail(row)} style={{ cursor: "pointer" }}>
            <Tooltip title="See Client Detail" placement="left" arrow>
                <InfoIcon />
            </Tooltip>
        </span>,
        grow: 0.5
    }
]

const clientDetail = (row: any) => {
    const client = row.data.name
    const user = row.owner
    const { address, datacap } = row.data

    history.push("/client", { client, user, address, datacap });
}


type PublicRequestTable2Props = {
    setSelectedClientRequests: any
}

const PublicRequestTable = ({ setSelectedClientRequests }: PublicRequestTable2Props) => {
    const context = useContext(Data)

    return (
        <div style={{ minHeight: "500px" }}>
            <DataTable
                selectableRows
                selectableRowsHighlight={true}
                selectableRowsSingle={true}
                onSelectedRowsChange={({ selectedRows }: any) => {
                    const rowNumbers = selectedRows.map((item: any) => item.number)
                    setSelectedClientRequests(rowNumbers)
                }}
                columns={publicRequestColumns}
                data={context.clientRequests}
                pagination
                paginationRowsPerPageOptions={[10, 20, 30]}
                paginationPerPage={10}
                noDataComponent="No client requests yet"
            />
        </div>
    )
}

export default PublicRequestTable
