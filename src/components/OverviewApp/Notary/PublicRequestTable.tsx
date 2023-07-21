import { useContext, useEffect, useState } from "react"
import DataTable from "react-data-table-component"
import { Data } from "../../../context/Data/Index"
import { config } from "../../../config"
import { simpleClientParser } from "@keyko-io/filecoin-verifier-tools"

const publicRequestColumns: any = [
  {
    name: "Name",
    selector: (row: any) => row.name,
    sortable: true,
    grow: 1,
  },
  {
    name: "Address",
    selector: (row: any) => row.address.slice(0, 15) + "...",
    sortable: true,
    grow: 1.5,
  },
  {
    name: "Datacap",
    selector: (row: any) => row.datacap,
    sortable: true,
    grow: 0.7,
  },
  {
    name: "Audit Trail",
    selector: (row: any) => row.number,
    sortable: true,
    cell: (row: any) => (
      <a target="_blank" rel="noopener noreferrer" href={row.url}>
        #{row.number}
      </a>
    ),
    grow: 0.7,
  },
]

type PublicRequestTable2Props = {
  setSelectedClientRequests: any
  setDirectReqTableData: any
  directReqTableData: any
}

const PublicRequestTable = ({
  setSelectedClientRequests,
  setDirectReqTableData,
  directReqTableData,
}: PublicRequestTable2Props) => {
  const context = useContext(Data)

  const getPublic = async () => {
    // get public request
    const getPublic = await context.github?.fetchGithubIssues(
      config.onboardingLargeOwner,
      config.onboardingClientRepo,
      "open",
      ["kyc verified", "bot:lookingGood"]
    )

    // get current notary handle
    const targetAssignee = context.github.loggedUser

    const notaryDataList = []

    // find assigned notary data
    for (const item of getPublic) {
      const assigneIsFound = item.assignees.find(
        (assignee: any) => assignee.login === targetAssignee
      )
      if (assigneIsFound) {
        notaryDataList.push(item)
      }
    }

    if (!notaryDataList) return

    const publicClientDataForTable = []

    for (let issue of notaryDataList) {
      const parseIsue = simpleClientParser.parseIssue(issue.body)

      publicClientDataForTable.push({
        name: parseIsue.name,
        address: parseIsue.address,
        datacap: parseIsue.datacap,
        number: issue.number,
        url: issue.html_url,
      })
    }

    setDirectReqTableData(publicClientDataForTable)
  }

  useEffect(() => {
    getPublic()
  }, [])

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
        data={directReqTableData}
        pagination
        paginationRowsPerPageOptions={[10, 20, 30]}
        paginationPerPage={10}
        noDataComponent={
          <div style={{ marginTop: "2rem" }}>
            There is not any public request associated with your github handle.
          </div>
        }
      />
    </div>
  )
}

export default PublicRequestTable
