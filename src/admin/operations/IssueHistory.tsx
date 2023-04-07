import { Box, Chip, Stack, Typography } from "@mui/material"
import { useContext, useState } from "react"
import { Data } from "../../context/Data/Index"
import { config } from "../../config"
import { TextField } from "@material-ui/core"
import { toast } from "react-hot-toast"
import HistoryInfo from "../components/HistoryInfo"
import { historyDataType } from "../types"

const IssueHistory = () => {
  const context = useContext(Data)
  const [historyData, setHistoryData] = useState<historyDataType[] | null>(null)
  const [issueNumber, setIssueNumber] = useState("")
  const [loading, setIsLoading] = useState(false)
  const [labels, setLabels] = useState<any>(null)

  const handleForm = (e: any) => {
    e.preventDefault()
    getData(issueNumber)
  }

  const getData = async (issueNumber: string) => {
    if (issueNumber === "") {
      toast.error("issue number is required")
      setIsLoading(false)
      return
    }
    try {
      setIsLoading(true)
      const comments = await context.github.fetchGithubComments(
        config.onboardingLargeOwner,
        config.onboardingLargeClientRepo,
        Number(issueNumber)
      )

      const issue = await context.github.githubOcto.issues.get({
        owner: config.onboardingLargeOwner,
        repo: config.onboardingLargeClientRepo,
        issue_number: issueNumber,
      })

      if (!issue) {
        toast.error("no issue with this number")
        setIsLoading(false)
        return
      }

      setLabels(issue?.data?.labels)

      if (!comments) {
        toast.error("no comments with this issue number")
        setIsLoading(false)
        return
      }

      const issueHistory: historyDataType[] = []

      for (let i = 0; i < comments.length; i++) {
        const comment = comments[i]
        const body = comment.body
        let commentType = ""
        let color = ""

        switch (true) {
          case body.indexOf("Request Proposed") !== -1:
            commentType = "proposal"
            color = "#1E90FF"
            break
          case body.indexOf("Request Approved") !== -1:
            commentType = "approval"
            color = "#32CD32"
            break
          case body.indexOf("DataCap Allocation requested") !== -1:
            commentType = "request"
            color = "#FFA500"
            break
          default:
            continue
        }

        issueHistory.push({
          comment,
          commentType,
          color,
        })
      }

      setIsLoading(false)
      setHistoryData(issueHistory)
    } catch (error: any) {
      toast.error(error.message)
      setIsLoading(false)
      setLabels(null)
      setHistoryData(null)
    }
  }

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
      }}
    >
      <Stack sx={{ width: "100%", padding: "4rem" }} direction="row">
        <Stack sx={{ flex: "1" }}>
          <Typography variant="h5" mb="2rem">
            Issue History Summary
          </Typography>

          <Stack direction="row" mb={4}>
            <form onSubmit={handleForm}>
              <TextField
                size="small"
                label="Search by issue number"
                name="issueNumber"
                fullWidth
                onChange={(e) => setIssueNumber(e.target.value)}
                value={issueNumber}
                variant="outlined"
                style={{ width: "250px" }}
              />
            </form>
          </Stack>

          {loading ? (
            "loading..."
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {historyData?.map((data: any) => (
                <HistoryInfo data={data} />
              ))}
              {historyData?.length === 0 && "no request yet"}
            </div>
          )}
        </Stack>
        <Stack sx={{ flex: "1" }}>
          <Typography variant="h5" mb="2rem">
            Labels Check
          </Typography>
          <Stack sx={{ width: "180px" }} spacing={2}>
            {labels?.map((label: any) => (
              <Chip label={label.name} />
            ))}
          </Stack>
        </Stack>
      </Stack>
    </Box>
  )
}

export default IssueHistory
