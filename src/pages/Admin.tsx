import { Box, IconButton } from "@mui/material"
import { useEffect, useState } from "react"
import ManualDatacapRequest from "../components/ManualDatacapRequest"
import history from "../context/History"
import EastIcon from "@mui/icons-material/East"
import AdminHeader from "../Layout/AdminHeader"
import AdminSidebar from "../Layout/AdminSidebar"
import IssueHistory from "../components/IssueHistory"

type OpenSideBarIconProps = {
  setIsDrawerOpen: (isDrawerOpen: boolean) => void
}

const OpenSideBarIcon = ({ setIsDrawerOpen }: OpenSideBarIconProps) => {
  return (
    <IconButton
      aria-label="back"
      size="large"
      sx={{
        position: "absolute",
        bottom: "20px",
        left: "20px",
      }}
      onClick={() => setIsDrawerOpen(true)}
    >
      <EastIcon />
    </IconButton>
  )
}

export enum SidebarOperationKey {
  MANUAL_DATACAP = "manuel-datacap",
  ISSUE_HISTORY = "issue-history",
}

 const SIDEBAR_OPERATIONS : 
  Record<SidebarOperationKey, JSX.Element>
 = {
  [SidebarOperationKey.MANUAL_DATACAP] : <ManualDatacapRequest />,
  [SidebarOperationKey.ISSUE_HISTORY] : <IssueHistory />
}

const Admin = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true)
  const [operation, setOperation] = useState(SidebarOperationKey.MANUAL_DATACAP)

  useEffect(() => {
    if (!localStorage.getItem("loggedUser")) {
      history.push("/")
    }
  }, [])

  return (
    <div>
      <AdminHeader />

      <Box sx={{ display: "flex", height: "calc(100vh - 5rem)" }}>
        {/* SIDEBAR  */}
        {isDrawerOpen && <AdminSidebar setIsDrawerOpen={setIsDrawerOpen} setOperation={setOperation} />}
        {/* RIGHT SIDE  */}
        <Box sx={{ width: "100%", height: "100%" }}>
          {!isDrawerOpen && (
            <OpenSideBarIcon setIsDrawerOpen={setIsDrawerOpen} />
          )}
           <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        height: "100%",
      }}
    >
      {SIDEBAR_OPERATIONS[operation]}
    </Box>
          
        </Box>
      </Box>
    </div>
  )
}

export default Admin
