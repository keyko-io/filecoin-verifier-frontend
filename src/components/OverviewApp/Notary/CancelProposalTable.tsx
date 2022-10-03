import { CircularProgress } from "@material-ui/core"
import React from "react"
import DataTable from "react-data-table-component"

export const cancelColumns: any = [
  {
    name: "Client Name",
    selector: (row: any) => row.clientName,
  },
  {
    name: "Client Address",
    selector: (row: any) => row.clientAddress,
    grow: 2,
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
  dataCancel: any,
  dataCancelLoading: boolean
}

const CancelProposalTable = ({ setCancelProposalData, dataCancel, dataCancelLoading }: CancelProposalTableProps) => {
  return (
    <div style={{ minHeight: "500px" }}>
      <DataTable
        selectableRows
        selectableRowsHighlight={true}
        selectableRowsSingle={true}
        onSelectedRowsChange={({ selectedRows }) => {
          setCancelProposalData(selectedRows[0])
        }}
        data={dataCancel}
        columns={cancelColumns}
        noDataComponent="You don't have any pending request yet"
        progressPending={dataCancelLoading}
        progressComponent={<CircularProgress style={{ marginTop: "100px", color: "#0090ff" }} />}
      />
    </div>

  )
}

export default CancelProposalTable