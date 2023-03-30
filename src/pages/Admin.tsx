import {
  Box,
  Avatar,
  Typography,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  IconButton,
} from "@mui/material"
import { useEffect, useState } from "react"
import Logo from ".././svg/logo.svg"
import ManualDatacapRequest from "../components/ManualDatacapRequest"
import history from "../context/History"
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight"
import EastIcon from "@mui/icons-material/East"
import WestIcon from "@mui/icons-material/West"

const goHomePage = () => history.push({ pathname: "/" })

const Admin = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true)

  useEffect(() => {
    if (!localStorage.getItem("loggedUser")) {
      history.push("/")
    }
  }, [])

  return (
    <div>
      <Box
        sx={{
          height: "5rem",
          backgroundColor: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingX: "2rem",
          boxShadow: "1px 3px 3px rgba(0, 0, 0, 0.2)",
        }}
      >
        <img
          src={Logo}
          alt="Filecoin"
          onClick={goHomePage}
          style={{ cursor: "pointer" }}
        />

        <Typography variant="h5">Admin Panel</Typography>
        <div>
          <Avatar src={localStorage.getItem("avatar") || ""} />
        </div>
      </Box>
      <Box sx={{ display: "flex", height: "calc(100vh - 5rem)" }}>
        {isDrawerOpen && (
          <Box
            sx={{
              width: "340px",
              boxShadow: "4px 0px 10px rgba(0, 0, 0, 0.2)",
              position: "relative",
              transition: "transform 0.4s ease-out",
            }}
          >
            <ListItem
              disablePadding
              sx={{
                background: "linear-gradient(to right, #0091FF, #1F77D0)",
                color: "white",
              }}
            >
              <ListItemButton>
                <ListItemIcon sx={{ minWidth: "40px" }}>
                  <KeyboardArrowRightIcon sx={{ color: "white" }} />
                </ListItemIcon>
                <ListItemText
                  primary="Create Datacap Request"
                  sx={{ paddingY: "10px" }}
                />
              </ListItemButton>
            </ListItem>
            <IconButton
              aria-label="back"
              size="large"
              sx={{ position: "absolute", bottom: "20px", right: "20px" }}
              onClick={() => setIsDrawerOpen(false)}
            >
              <WestIcon />
            </IconButton>
          </Box>
        )}
        <Box sx={{ width: "100%", height: "100%" }}>
          {!isDrawerOpen && (
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
          )}
          <ManualDatacapRequest />
        </Box>
      </Box>
    </div>
  )
}

export default Admin
