import { Box, IconButton } from "@mui/material"
import { useEffect, useState } from "react"
import ManualDatacapRequest from "../components/ManualDatacapRequest"
import history from "../context/History"
import EastIcon from "@mui/icons-material/East"
import AdminHeader from "../Layout/AdminHeader"
import AdminSidebar from "../Layout/AdminSidebar"
import IssueHistory from "../components/IssueHistory"
import { config } from "../config"

const Metrics = () => {

  useEffect(() => {
    fetch('https://sentry.io/api/0/projects/fil-3h/filecoin-verifier-client/events/', {
  headers: {
    'Authorization': `Bearer ${config.sentry_private_key}`,
  },
})
  .then(response => response.json())
  .then(data => {
    console.log("data:",data)
    // Process the data as needed and display it on your web page
  })
  .catch(error => console.error(error));
  }, [])

  return (
    <div>
    </div>
  )
}

export default Metrics
