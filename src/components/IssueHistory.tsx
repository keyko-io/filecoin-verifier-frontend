import { Box, Stack, Typography } from "@mui/material"
import { useContext, useState } from "react"
import { Data } from "../context/Data/Index"
import { config } from "../config"
import { TextField } from "@material-ui/core"
import { toast } from "react-hot-toast"

const IssueHistory = () => {
  const context = useContext(Data)
  const [historyData, setHistoryData] = useState<any>(null)
  const [issueNumber, setIssueNumber] = useState<any>("")
  const [loading, setIsLoading] = useState(false)

  const handleForm = (e: any) => {
    e.preventDefault()
    getData(issueNumber)
  }

  const getData = async (issueNumber: string) => {
    setIsLoading(true)
    const comments = await context.github.fetchGithubComments(
      config.onboardingLargeOwner,
      config.onboardingLargeClientRepo,
      Number(issueNumber)
    )

    if (!comments) {
      toast.error("no comments with this issue number")
      setIsLoading(false)
      return
    }

    const issueHistory = []

    for (let i = 0; i < comments.length; i++) {
      if (comments[i].body.includes("Request Proposed")) {
        issueHistory.push({
          comment: comments[i],
          commentType: "proposal",
          color: "#1E90FF",
        })
      }
      if (comments[i].body.includes("Request Approved")) {
        issueHistory.push({
          comment: comments[i],
          commentType: "approval",
          color: "#32CD32",
        })
      }
      if (comments[i].body.includes("DataCap Allocation requested")) {
        issueHistory.push({
          comment: comments[i],
          commentType: "request",
          color: "#FFA500",
        })
      }
    }
    
    setIsLoading(false)
    setHistoryData(issueHistory)
  }

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
      }}
    >
      <Box sx={{ width: "100%", padding: "4rem" }}>
        <Typography variant="h5" mb="2rem">
          History Summary
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
              <a href={data.comment.html_url} target="_blank" rel="noreferrer" style={{textDecoration : "none"}}>
                <div style={{ paddingBottom: "10px" }}>
                  <span style={{ color: data.color }}>{data.commentType}</span>
                  <span style={{ paddingLeft: "10px", paddingRight: "10px", color : "black" }}>
                    &gt;
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </Box>
    </Box>
  )
}

export default IssueHistory
