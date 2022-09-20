import React from "react"

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
    name: "Tx Id",
    selector: (row: any) => row.txId,
  },
  {
    name: "Datacap",
    selector: (row: any) => row.datacap,
  },
]