import {
  Box,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  IconButton,
} from "@mui/material"
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight"
import WestIcon from "@mui/icons-material/West"
import { SidebarOperationKey } from "../pages/Admin"

type AdminSidebarProps = {
  setIsDrawerOpen: (isDrawerOpen: boolean) => void
  setOperation : (operation : SidebarOperationKey) => void
}

const AdminSidebar = ({ setIsDrawerOpen, setOperation }: AdminSidebarProps) => {
  return (
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
          borderBottom : "1px solid white"
        }}
        onClick={() => setOperation(SidebarOperationKey.MANUAL_DATACAP)}
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
      <ListItem
        disablePadding
        sx={{
          background: "linear-gradient(to right, #0091FF, #1F77D0)",
          color: "white",
        }}
        onClick={() => setOperation(SidebarOperationKey.ISSUE_HISTORY)}
      >
        <ListItemButton>
          <ListItemIcon sx={{ minWidth: "40px" }}>
            <KeyboardArrowRightIcon sx={{ color: "white" }} />
          </ListItemIcon>
          <ListItemText
            primary="Issue History Summary"
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
  )
}

export default AdminSidebar
