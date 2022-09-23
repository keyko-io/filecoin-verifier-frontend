import React from "react"
import DataTable from "react-data-table-component"

export const cancelColumns: any = [
  {
    name: "Client Address",
    selector: (row: any) => row.clientAddress,
  },
  {
    name: "Issue Number",
    selector: (row: any) => row.issueNumber,
    cell: (row: any) => (
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={"/verifiers"}
      >
        #{row.issueNumber}
      </a>
    ),
  },
  {
    name: "TxId",
    selector: (row: any) => row.tx.id,
  },
  {
    name: "Datacap",
    selector: (row: any) => row.datacap,
  },
]

type CancelProposalTableProps = {
  setCancelProposalData: any,
  dataCancel: any
}

const CancelProposalTable = ({ setCancelProposalData, dataCancel }: CancelProposalTableProps) => {
  return (
    <DataTable
      selectableRows
      selectableRowsHighlight={true}
      selectableRowsSingle={true}
      onSelectedRowsChange={({ selectedRows }) => {
        setCancelProposalData(selectedRows[0])
      }}
      data={dataCancel}
      columns={cancelColumns}
    />
  )
}

export default CancelProposalTable