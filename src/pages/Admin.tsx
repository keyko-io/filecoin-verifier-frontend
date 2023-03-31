import { Box, IconButton } from "@mui/material"
import { useEffect, useState } from "react"
import ManualDatacapRequest from "../components/ManualDatacapRequest"
import history from "../context/History"
import EastIcon from "@mui/icons-material/East"
import AdminHeader from "../Layout/AdminHeader"
import AdminSidebar from "../Layout/AdminSidebar"

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

const Admin = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true)

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
        {isDrawerOpen && <AdminSidebar setIsDrawerOpen={setIsDrawerOpen} />}
        {/* RIGHT SIDE  */}
        <Box sx={{ width: "100%", height: "100%" }}>
          {!isDrawerOpen && (
            <OpenSideBarIcon setIsDrawerOpen={setIsDrawerOpen} />
          )}
          <ManualDatacapRequest />
        </Box>
      </Box>
    </div>
  )
}

export default Admin
