import { useContext, useEffect, useState } from "react"
import { Data } from "../../context/Data/Index"
import { config } from "../../config"
import { Typography } from "@mui/material"
import DataTable from "react-data-table-component"
import { ldnParser } from "@keyko-io/filecoin-verifier-tools"

export const ReviewNeeded = () => {
  const context = useContext(Data)

  const [tableData, SetTableData] = useState<any>([])
  const [pending, setPending] = useState(true)

  const getReviewNeeded = async () => {
    const reviewNeededIssues =
      await context.github.githubOctoGeneric.octokit.paginate(
        context.github.githubOctoGeneric.octokit.issues.listForRepo,
        {
          owner: config.onboardingLargeOwner,
          repo: config.onboardingLargeClientRepo,
          state: "open",
          labels: "bot:reviewNeeded",
          sort: "updated",
        }
      )

    const data = []

    for (let issue of reviewNeededIssues) {
      const parsed = ldnParser.parseIssue(issue.body)
      data.push({ ...issue, parsedData: parsed })
    }

    setPending(false)
    SetTableData(data)
  }

  useEffect(() => {
    getReviewNeeded()
  }, [])

  return (
    <div style={{ width: "90%" }}>
      <Typography variant="h5" textAlign="center" my="4rem">
        Review Needed
      </Typography>
      <div
        style={{
          border: "1px solid rgba(0, 0, 0, 0.1)",
          borderRadius: "10px",
          padding: "10px",
          boxShadow: "rgba(0, 0, 0, 0.1) 0px 1px 3px 0px",
        }}
      >
        <DataTable
          columns={[
            {
              name: "Client",
              selector: (row: any) => row.parsedData.name,
            },
            {
              name: "Address",
              selector: (row: any) => row.parsedData.address,
              cell: (row: any) => (
                <div>{`${row.parsedData.address.substring(
                  0,
                  9
                )}...${row.parsedData.address.substring(
                  row.parsedData.address.length - 9,
                  row.parsedData.address.length
                )}`}</div>
              ),
            },
            {
              name: "Datacap",
              selector: (row: any) => row.parsedData.datacapRequested,
            },
            {
              name: "Issue",
              selector: (row: any) => row.number,
              cell: (row: any) => (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={row.html_url}
                >
                  #{row.number}
                </a>
              ),
            },
          ]}
          data={tableData}
          pagination
          paginationPerPage={10}
          progressPending={pending}
        />
      </div>
    </div>
  )
}
