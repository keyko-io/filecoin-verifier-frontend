import { Modal} from "@mui/material";
// @ts-ignore
import { useLargeRequestsContext } from "../../../context/LargeRequests";
import { LargeRequestData } from "../../../type";
import CloseIcon from "@mui/icons-material/Close";

type ModalProps = {
    selectedClientRequests: LargeRequestData[];
    onClick: (target: any) => void;
    open: boolean;
    handleClose: () => void;
};

const closeIconStyle = {
    position: "absolute",
    top: "12px",
    right: "12px",
    cursor: "pointer",
};

const ApproveLargeRequestModal = (props: ModalProps) => {
    const { areRequestsSignable } = useLargeRequestsContext();
    
    const {
        selectedClientRequests,
        open,
        onClick: verifyLargeRequest,
        handleClose,
    } = props;

    const message = "You are about to send a message to assign DataCap to the following addresses:";

    const onClickHandler = async () => {
        const isSignable = await areRequestsSignable(selectedClientRequests)
        handleClose();
        if (!isSignable) {
            alert(
                "you are not allowed to sign one or more of the selected transactions"
            );
            return;
        }
        await verifyLargeRequest(selectedClientRequests);
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <div
                className="warnmodalledger"
                style={{
                    backgroundColor: "white",
                    height: 250 + 30 * selectedClientRequests.length,
                    position : "absolute",
                    top : "50%",
                    left: "50%" ,
                    transform : "translate(-50%, -50%)",
                    padding: "1.8rem",
                    borderRadius: "0.4rem",
                    minWidth: "700px"
                }}
            >   
             <CloseIcon
                    sx={closeIconStyle}
                    onClick={handleClose}
                />
                <div>{message}</div>
                <table>
                    <thead>
                        <tr>
                            <td>Address</td>
                            <td>Datacap</td>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedClientRequests.map(
                            (
                                request: LargeRequestData,
                                index: any
                            ) => (
                                <tr key={index}>
                                    <td>{request.address}</td>
                                    <td>{request.datacap}</td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
                <div className="ledgermessage">
                    Please check your Ledger to sign and send the
                    message.            
                        <button
                          style={{
                            border: "none",
                            padding : "8px 24px",
                            borderRadius : "4px",
                            marginTop : "1rem",
                            cursor: "pointer"
                          }}
                            onClick={() => onClickHandler()}
                        >
                            Accept
                        </button>  
                </div>
            </div>
        </Modal>
    );
};

export default ApproveLargeRequestModal;
