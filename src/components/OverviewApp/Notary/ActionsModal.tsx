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
import {
    NOTARY_DECLINE_REASONS,
    NOTARY_LDN_STATE_CONTROL,
} from "../../../constants";
import { useLargeRequestsContext } from "../../../context/LargeRequests";
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
    selectedRequest: LargeRequestData;
};

const ActionsModal = ({
    selectedRequest,
    open,
    handleChangeStatus,
    handleClose,
}: ActionsModalProps) => {
    const { extractRepliesByClient } = useLargeRequestsContext();
    const [freeTextValue, setFreeTextValue] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [statusReason, setSelectedReason] = useState("");
    const [textareaInputValue, setTextareaInputValue] = useState("");
    const clientReplies = extractRepliesByClient(selectedRequest);
    console.log("selectedRequest", selectedRequest);

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
                <div style={{ paddingBottom: "1rem" }}>
                    Replies({clientReplies?.length}):{" "}
                </div>
                <div style={{ height: "10rem", overflowY: "scroll" }}>
                    {clientReplies &&
                        clientReplies?.map(
                            (r: {
                                created_at: string;
                                html_url: string;
                            }) => {
                                return (
                                    <div
                                        style={{
                                            paddingBottom: "0.5rem",
                                            marginBottom: "0.5rem",
                                            borderBottom:
                                                "1px solid black",
                                            display: "grid",
                                            gridTemplateColumns:
                                                "1fr 1fr",
                                        }}
                                    >
                                        <div>
                                            {new Date(
                                                r.created_at
                                            ).toUTCString()}
                                        </div>
                                        <a
                                            href={r.html_url}
                                            target="_blank"
                                        >
                                            Link
                                        </a>
                                    </div>
                                );
                            }
                        )}
                </div>
                <Typography variant="h6" mb={1.5} textAlign="center">
                    Update Request Status
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
                            {NOTARY_LDN_STATE_CONTROL.map(
                                (r: string) => {
                                    return (
                                        <MenuItem value={r}>
                                            {r}
                                        </MenuItem>
                                    );
                                }
                            )}
                        </Select>
                    </FormControl>
                    <Divider />
                    <FormControl fullWidth>
                        {selectedStatus !== "Accept" && (
                            <>
                                <InputLabel id="demo-simple-select-label">
                                    Reason
                                </InputLabel>
                                <Select
                                    label="Reason"
                                    value={statusReason}
                                    onChange={(e) => {
                                        setSelectedReason(
                                            //@ts-ignore
                                            e.target.value
                                        );
                                    }}
                                >
                                    {NOTARY_DECLINE_REASONS.map(
                                        (r: string) => {
                                            return (
                                                <MenuItem value={r}>
                                                    {r}
                                                </MenuItem>
                                            );
                                        }
                                    )}
                                </Select>
                            </>
                        )}
                        <textarea
                            value={freeTextValue}
                            onChange={(e: any) =>
                                setFreeTextValue(e.target.value)
                            }
                        />
                        <Button
                            onClick={() =>
                                handleChangeStatus({
                                    selectedStatus,
                                    statusReason,
                                    freeTextValue,
                                })
                            }
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
