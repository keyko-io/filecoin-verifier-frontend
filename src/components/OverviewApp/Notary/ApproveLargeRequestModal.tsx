import { Modal } from "@mui/material";
import React from "react";
// @ts-ignore
import { ButtonPrimary } from "slate-react-system";

type ModalProps = {
    selectedClientRequests: any[];
    onClick: (target: any) => void;
    open: boolean;
    handleClose: () => void;
};

const ApproveLargeRequestModal = (props: ModalProps) => {
    const { selectedClientRequests, onClick, open, handleClose } =
        props;
    const message = "this message needs fixing";
    console.log("selectedClientRequests", selectedClientRequests)

    return (
        <Modal open={open} onClose={handleClose}>
            <div
                className="warnmodalledger"
                style={{
                    backgroundColor: "white",
                    height: 220 + 30 * selectedClientRequests.length,
                }}
            >
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
                            (request: any, index: any) => (
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
                    <div>
                        <ButtonPrimary onClick={onClick}>
                            Accept
                        </ButtonPrimary>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ApproveLargeRequestModal;
