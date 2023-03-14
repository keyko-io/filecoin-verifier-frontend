import React from 'react'
import DataTable from 'react-data-table-component'
import { BeatLoader } from 'react-spinners'
import { bytesToiB } from '../../../utils/Filters'

export const verifiedColumns: any = [
    {
        name: 'ID',
        selector: (row: any) => row.verified,
        sortable: true,
    },
    {
        name: 'Address',
        selector: (row: any) => row.key,
        sortable: true,
        grow: 3,
        cell: (row: any) => (
            <span>
                {row.key || (
                    <BeatLoader size={5} color={'rgb(24,160,237)'} />
                )}
            </span>
        ),
    },
    {
        name: 'Datacap',
        selector: (row: any) => row.datacap,
        sortable: true,
        cell: (row: any) => <span>{bytesToiB(row.datacap)}</span>,
    },
]

type VerifiedClientsTableProps = {
    verifiedClients: any;
}

const VerifiedClientsTable = ({ verifiedClients }: VerifiedClientsTableProps) => {
    return (
        <div style={{ minHeight: '500px' }}>
            <DataTable
                columns={verifiedColumns}
                data={verifiedClients}
                pagination
                paginationRowsPerPageOptions={[10, 20, 30]}
                paginationPerPage={10}
            />
        </div>

    )
}

export default VerifiedClientsTable