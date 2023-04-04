import { Box, Typography } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import { Data } from '../context/Data/Index'
import { config } from "../config"

const IssueHistory = () => {
  const context = useContext(Data)
  const [historyData, setHistoryData] = useState<any>(null)

  const getData = async () => {
    const comments = await context.github.fetchGithubComments(
      config.onboardingLargeOwner,
      config.onboardingLargeClientRepo,
      1832
    )

    const issueHistory = []

    for (let i = 0; i < comments.length; i++) {
      if (comments[i].body.includes("Request Proposed")) {
        issueHistory.push({
          comment : comments[i],
          commentType : "proposal",
          color : "#1E90FF"

        })
      }
      if (comments[i].body.includes("Request Approved")) {
        issueHistory.push(
          {
            comment : comments[i],
            commentType : "approval",
            color : "#32CD32"
          }
        )
      }
      if (comments[i].body.includes("DataCap Allocation requested")) {
        issueHistory.push(
          {
            comment : comments[i],
            commentType : "request",
            color : "#FFA500"
          }
        )
      }
    }

    setHistoryData(issueHistory)
  }

  useEffect(() => {
    getData().then(data => console.log(data))
  }, [])

  return (
    <Box
      sx={{
        display: "flex",
        width : "100%"
      }}
    >
      <Box sx={{ width : "100%", padding: "4rem" }} >
        <Typography variant="h5" mb="2rem">
           History Summary
        </Typography>
 
       <div style={{display : "flex", flexWrap: "wrap"}}>
        {historyData?.map((data : any) => <div style={{paddingBottom :"10px"}}> <span style={{color : data.color}}>{data.commentType}</span>  <span style={{ paddingLeft : "10px", paddingRight: "10px"}}>&gt;</span> </div>)}
       </div> 
      
      
      </Box>
    </Box>
  )
}

export default IssueHistory