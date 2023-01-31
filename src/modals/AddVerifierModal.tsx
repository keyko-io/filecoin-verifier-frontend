import { useContext, useState } from 'react';
import { Data } from '../context/Data/Index'
import { config } from '../config'
// @ts-ignore
import { dispatchCustomEvent, H3, Input, ButtonPrimary, SelectMenu, LoaderSpinner } from "slate-react-system";


const AddVerifierModal = () => {
    const context = useContext(Data)

    const [proposeLoading, setProposeLoading] = useState(false)
    const [datacap, setDatacap] = useState("1")
    const [datacapExt, setDatacapExt] = useState("1000000000000")
    const [accountID, setAccountID] = useState("")

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        setProposeLoading(false)

        try {
            const dataCap = parseFloat(datacap)
            const fullDatacap = BigInt(dataCap * parseFloat(datacapExt))
            let verifierAccountID = accountID
            if (verifierAccountID.length < 12) {
                verifierAccountID = await context.wallet.api.actorKey(verifierAccountID)
            }

            let messageID = await context.wallet.api.proposeVerifier(verifierAccountID, fullDatacap, context.wallet.walletIndex);

            setProposeLoading(false)
            setDatacap("1")
            setDatacapExt("1000000000000")
            setAccountID("")

            context.wallet.dispatchNotification('Propose Message sent with ID: ' + messageID)
            dispatchCustomEvent({ name: "delete-modal", detail: {} })
        } catch (e: any) {
            setProposeLoading(false)
            context.wallet.dispatchNotification('Proposal failed: ' + e.message)
            dispatchCustomEvent({ name: "delete-modal", detail: {} })
        }
    }



    return (
        <div className="addmodal">
            <H3>Add verifier</H3>
            <form>
                <div className="inputholder">
                    <Input
                        description="Notary Account ID"
                        name="verifierAccountID"
                        value={accountID}
                        placeholder="xxxxxx"
                        onChange={(e: any) => setAccountID(e.target.value)}
                    />
                </div>
                <div className="datacapholder">
                    <div className="datacap">
                        <Input
                            description="Notary datacap"
                            name="datacap"
                            value={datacap}
                            placeholder="1"
                            onChange={(e: any) => setDatacap(e.target.value)}
                        />
                    </div>
                    <div className="datacapext">
                        <SelectMenu
                            name="datacapExt"
                            value={datacapExt}
                            onChange={(e: any) => setDatacapExt(e.target.value)}
                            options={config.datacapExt}
                        />
                    </div>
                </div>
                <ButtonPrimary onClick={handleSubmit}>{proposeLoading ? <LoaderSpinner /> : 'Propose Notary'}</ButtonPrimary>
            </form>
        </div>
    )
}

export default AddVerifierModal;
