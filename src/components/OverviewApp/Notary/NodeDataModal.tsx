import { Divider, Box, Typography, Modal } from "@mui/material";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import CloseIcon from "@mui/icons-material/Close";
import { CircularProgress } from "@material-ui/core";

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

type NodeDataModalProps = {
    open: boolean;
    handleClose: () => void;
    nodeInfo: {
        proposer: string;
        txId: string;
        approvals: number;
    };
    isLoadingNodeData: boolean;
};

const NodeDataModal = ({
    open,
    handleClose,
    nodeInfo,
    isLoadingNodeData,
}: NodeDataModalProps) => {
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
                    Transaction Information
                </Typography>
                {isLoadingNodeData ? (
                    <div style={{ textAlign: "center" }}>
                        <CircularProgress
                            style={{
                                margin: "8rem auto",
                                color: "#0090ff",
                            }}
                        />
                    </div>
                ) : (
                    <>
                        <Divider />
                        <Typography
                            sx={{
                                my: 1,
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <KeyboardArrowRightIcon
                                sx={{ color: "rgb(0, 144, 255)" }}
                            />
                            <span style={{ marginLeft: "1rem" }}>
                                Proposer : {nodeInfo.proposer || "-"}
                            </span>
                        </Typography>

                        <Divider />
                        <Typography
                            sx={{
                                my: 1,
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <KeyboardArrowRightIcon
                                sx={{ color: "rgb(0, 144, 255)" }}
                            />
                            <span style={{ marginLeft: "1rem" }}>
                                {" "}
                                TxId : {nodeInfo.txId || "-"}
                            </span>
                        </Typography>

                        <Divider />
                        <Typography
                            sx={{
                                my: 1,
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <KeyboardArrowRightIcon
                                sx={{ color: "rgb(0, 144, 255)" }}
                            />
                            <span style={{ marginLeft: "1rem" }}>
                                Approvals : {nodeInfo.approvals || "0"}
                            </span>
                        </Typography>

                        <Divider />
                    </>
                )}
            </Box>
        </Modal>
    );
};

export default NodeDataModal;
