// @ts-ignore
import { dispatchCustomEvent } from "slate-react-system";

const VerificationOptionsModal = () => {
    const onClick = (option?: string) => {
        if (option === 'automatic') {
            window.open('https://verify.glif.io/', '_blank')
        } else {
            window.open('https://github.com/filecoin-project/filecoin-plus-large-datasets', '_blank')
        }
        dispatchCustomEvent({ name: "delete-modal", detail: {} })
    }

    return (
        <div className="verificationoptions">
            <div className="methods">Select a Verification Method</div>
            <div className="buttoncard" onClick={(e) => onClick("automatic")} >
                <div className="intro">
                    <div className="title">Automatic Verification</div>
                </div>
                <div className="description">Get a small amount of DataCap automatically to start developing!</div>
            </div>
            <div className="buttoncard" onClick={() => onClick()}>
                <div className="intro">
                    <div className="title">General Verification</div>
                </div>
                <div className="description">Request a larger DataCap allocation from a Notary in your region!</div>
            </div>
            <div className="buttoncard" onClick={() => onClick()}>
                <div className="intro">
                    <div className="title">Large Dataset Application</div>
                </div>
                <div className="description">Open an application for datasets greater than 100TiB of DataCap</div>
            </div>
        </div>
    )

}

export default VerificationOptionsModal;