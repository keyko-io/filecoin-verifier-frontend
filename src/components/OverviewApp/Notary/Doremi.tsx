import React, { useContext } from "react"
import DataTable from "react-data-table-component"
import { Data } from "../../../context/Data/Index"

const publicRequestColumns: any = [
    {
        name: "Name",
        selector: (row: any) => row.data.name,
        sortable: true,
    },
    {
        name: "Address",
        selector: (row: any) => row.data.address,
        sortable: true,
    },
    {
        name: "Datacap",
        selector: (row: any) => row.data.datacap,
        sortable: true,
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
    },
]

const PublicRequestTable2 = () => {
    const context = useContext(Data)

    return (
        <div style={{ minHeight: "500px" }}>
            <DataTable
                selectableRows
                selectableRowsHighlight={true}
                selectableRowsSingle={true}
                columns={publicRequestColumns}
                data={context.clientRequests}
                pagination
                paginationRowsPerPageOptions={[10, 20, 30]}
                paginationPerPage={10}
            />
        </div>
    )
}

export default PublicRequestTable2