import { Box, IconButton } from "@mui/material"
import WestIcon from "@mui/icons-material/West"
import SidebarListItem from "../components/SidebarListItem"
import { SidebarOperationKey } from "../types"

type AdminSidebarProps = {
  setIsDrawerOpen: (isDrawerOpen: boolean) => void
  setOperation: (operation: SidebarOperationKey) => void
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
      <SidebarListItem
        itemText="Create Datacap Request"
        setOperation={() => setOperation(SidebarOperationKey.MANUAL_DATACAP)}
      />
      <SidebarListItem
        itemText="Issue History Summary"
        setOperation={() => setOperation(SidebarOperationKey.ISSUE_HISTORY)}
      />
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
