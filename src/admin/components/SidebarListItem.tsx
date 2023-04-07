import {
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
} from "@mui/material"
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight"
import { SidebarOperationKey } from "../types"

type SidebarListItemProps = {
  itemText: string
  setOperation: (operation: SidebarOperationKey) => void
}

const SidebarListItem = ({ itemText, setOperation }: SidebarListItemProps) => {
  return (
    <ListItem
      disablePadding
      sx={{
        background: "linear-gradient(to right, #0091FF, #1F77D0)",
        color: "white",
        borderBottom: "1px solid white",
      }}
      onClick={() => setOperation(SidebarOperationKey.MANUAL_DATACAP)}
    >
      <ListItemButton>
        <ListItemIcon sx={{ minWidth: "40px" }}>
          <KeyboardArrowRightIcon sx={{ color: "white" }} />
        </ListItemIcon>
        <ListItemText primary={itemText} sx={{ paddingY: "10px" }} />
      </ListItemButton>
    </ListItem>
  )
}

export default SidebarListItem
