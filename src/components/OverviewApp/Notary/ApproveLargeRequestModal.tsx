import { Modal } from "@mui/material";
import React from "react";
// @ts-ignore
import { ButtonPrimary } from "slate-react-system";
import { useLargeRequestsContext } from "../../../context/LargeRequests";
import { LargeRequestData } from "../../../type";

type ModalProps = {
    selectedClientRequests: LargeRequestData[];
    onClick: (target: any) => void;
    open: boolean;
    handleClose: () => void;
};

const ApproveLargeRequestModal = (props: ModalProps) => {
    const { areRequestsSignable } = useLargeRequestsContext();
    const {
        selectedClientRequests,
        open,
        onClick: verifyLargeRequest,
        handleClose,
    } = props;
    const message = "this message needs fixing";

    const onClickHandler = async () => {
        let isSignable = await areRequestsSignable(selectedClientRequests)

        if (!isSignable) {
            console.log();
            alert(
                "you are not allowed to sign one or more of the selected transactions"
            );
            return;
        }
        verifyLargeRequest(selectedClientRequests);
    };

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
                    <div>
                        <ButtonPrimary
                            onClick={() => onClickHandler()}
                        >
                            Accept
                        </ButtonPrimary>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ApproveLargeRequestModal;
