import { useEffect, useState } from 'react';
// @ts-ignore
import { ButtonPrimary } from "slate-react-system";
import { anyToBytes } from "../utils/Filters"

type ModalProps = {
    clientRequests: any[],
    selectedClientRequests: any[],
    onClick: (target: any) => void;
    origin: string,
    largeAddress?: boolean
}


const WarnModalVerify = (props: ModalProps) => {
    const [requestToShow, setRequestToShow] = useState<any>([])
    const [message, setMessage] = useState("")

    useEffect(() => {
        let requestToShow = []

        if (props.origin === 'Notary') {
            for (const request of props.clientRequests) {
                if (props.selectedClientRequests.includes(request.issue_number)) {
                    requestToShow.push({
                        address: props.largeAddress ? request.address : request.data.address,
                        datacap: request.data.datacap ? request.data.datacap : request.datacap
                    })
                }
            }

            setMessage("You are about to send a message to assign DataCap to the following addresses:")

        } else if (props.origin === 'ProposeSign' || props.origin === 'Cancel') {
            for (const request of props.clientRequests) {
                if (props.selectedClientRequests.includes(request.id)) {
                    requestToShow.push({
                        address: request.addresses,
                        datacap: request.datacaps.map((datacap: any) => anyToBytes(datacap) === 0 ? 'Notary will be removed' : datacap)
                    })
                }
            }

            setMessage(
                props.origin === 'ProposeSign' ?
                    "You are about to send a message to sign the following Notaries and associated DataCaps:"
                    :
                    "You are about to send a message to cancel the transaction to the following adresses"
            )
        }

        setRequestToShow(requestToShow)
    }, [])


    const renderArray = (arrayValues: any[]) => {
        return (<>
            {arrayValues.map((value: any, i: any) => <div key={i} className="elemvalue">{value}</div >)}
        </>)
    }


    return (
        <div className="warnmodalledger" style={
            { height: 220 + 30 * requestToShow.length }}>
            <div >
                {message}
            </div>
            <table>
                <thead>
                    <tr>
                        <td>Address</td>
                        <td>Datacap</td>
                    </tr>
                </thead>
                <tbody>
                    {requestToShow.map((request: any, index: any) =>
                        <tr key={index}>
                            <td>{typeof (request.address) === 'object' ? renderArray(request.address) : request.address}</td>
                            <td>{typeof (request.datacap) === 'object' ? renderArray(request.datacap) : request.datacap}</td>
                        </tr>
                    )}
                </tbody>
            </table>
            <div className="ledgermessage">Please check your Ledger to sign and send the message.
                <div> <ButtonPrimary onClick={props.onClick}>Accept</ButtonPrimary></div>
            </div>
        </div>
    )

}

export default WarnModalVerify;