import {
  Box,
  Avatar,
  Typography,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material"
import Logo from ".././svg/logo.svg"
import ManualDatacapRequest from "../components/ManualDatacapRequest"
import history from "../context/History"

const goHomePage = () => history.push({ pathname: "/" })

const Admin = () => {
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
          borderBottom: "1px solid grey",
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
          <div></div>
          <Avatar src={localStorage.getItem("avatar") || ""} />
        </div>
      </Box>
      <Box sx={{ display: "flex", height: "calc(100vh - 5rem)" }}>
        <Box
          sx={{
            width: "340px",
            borderRight: "1px solid grey",
          }}
        >
          <ListItem disablePadding sx={{ backgroundColor: "#0091FF" }}>
            <ListItemButton>
              <ListItemText
                primary="Create Manual Datacap Request"
                sx={{ paddingY: "6px", color: "white" }}
              />
            </ListItemButton>
          </ListItem>
        </Box>
        <Box sx={{ width: "100%", height: "100%" }}>
          <ManualDatacapRequest />
        </Box>
      </Box>
    </div>
  )
}

export default Admin
