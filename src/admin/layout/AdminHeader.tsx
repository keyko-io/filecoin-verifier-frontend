import { Box, Avatar, Typography } from "@mui/material"
import history from "../../context/History"
import Logo from "../../svg/logo.svg"

const AdminHeader = () => {
  const goHomePage = () => history.push({ pathname: "/" })

  return (
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
  )
}

export default AdminHeader
