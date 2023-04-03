import {
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
} from "@material-ui/core";
import CloseIcon from "@mui/icons-material/Close";
import { Box, Divider, Modal, Typography } from "@mui/material";
import { useState } from "react";
import { LARGE_REQUEST_STATUS } from "../../../constants";
import { LargeRequestData } from "../../../type";

const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    boxShadow: 24,
    borderRadius: "6px",
    px: 8,
    py: 5,
};

const closeIconStyle = {
    position: "absolute",
    top: "12px",
    right: "12px",
    cursor: "pointer",
};

type ActionsModalProps = {
    open: boolean;
    handleChangeStatus: any;
    handleClose: () => void;
};

const ActionsModal = ({
    open,
    handleChangeStatus,
    handleClose,
}: ActionsModalProps) => {
    const [selectedStatus, setSelectedStatus] = useState("");
    const [textareaInputValue, setTextareaInputValue] = useState("");

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <CloseIcon
                    sx={closeIconStyle}
                    onClick={handleClose}
                />
                <Typography variant="h6" mb={1.5} textAlign="center">
                    Change Request Status
                </Typography>
                <>
                    <Divider />
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">
                            New Status
                        </InputLabel>
                        <Select
                            label="Status"
                            value={selectedStatus}
                            onChange={(e) => {
                                //@ts-ignore
                                setSelectedStatus(e.target.value);
                            }}
                        >
                            <MenuItem
                                value={
                                    LARGE_REQUEST_STATUS.NEEDS_NOTARY_REVIEW
                                }
                            >
                                Need Notary Review
                            </MenuItem>
                            <MenuItem
                                value={
                                    LARGE_REQUEST_STATUS.WAITING_FOR_CLIENT_REPLY
                                }
                            >
                                Waiting For Client Reply
                            </MenuItem>
                        </Select>
                        <textarea />
                        <Button
                            onClick={() => handleChangeStatus(selectedStatus)}
                            color="primary"
                        >
                            Send
                        </Button>
                    </FormControl>
                </>
            </Box>
        </Modal>
    );
};

export default ActionsModal;
