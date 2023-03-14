import { useContext, useState } from 'react'
// @ts-ignore
import Verifiers from '../svg/verifier-wallet.svg'
// @ts-ignore
import Logo from '../svg/logo-button.svg'
// @ts-ignore
import Ledger from '../svg/ledger-logo.svg'
import history from '../context/History'
import { Data } from '../context/Data/Index'
// @ts-ignore
import { ButtonPrimary, dispatchCustomEvent } from 'slate-react-system'
import { config } from '../config'

type ModalProps = {
    type: string
}

const LogAsNotaryModal = (props: ModalProps) => {
    const context = useContext(Data)

    const [multisig, setMultisig] = useState(false)
    const [address, setAddress] = useState('')

    const loadWallet = async (type: string) => {
        try {
            const logged = await context.wallet.loadWallet(type, {
                multisig: true,
                multisigAddress: address,
            })
            if (logged) {
                if (context.viewroot === false && props.type === '0') {
                    context.switchview()
                }
                dispatchCustomEvent({ name: 'delete-modal', detail: {} })

                history.push({
                    pathname: '/app',
                })
            }
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className='loginmodal'>
            <>
                <div className='imgheader'>
                    <img src={Verifiers} alt={'Verifiers'} />
                </div>
                <div className='info'>
                    <div className='title'>Log in as a Notary</div>
                    <div className='description'>
                        Here is where you can manage pending public requests and action DataCap
                        allocation decisions. To become a rootkey holder, you’ll need to have been
                        preselected.
                    </div>
                </div>
                <div className='tabs'>
                    <div
                        className={multisig ? 'tab selected' : 'tab'}
                        onClick={() => setMultisig(true)}
                    >
                        Organization
                    </div>
                </div>
                <div className='buttons'>
                    {!config.networks.includes('Mainnet') ? (
                        <div className='button left'>
                            <ButtonPrimary onClick={() => loadWallet('Burner')}>
                                <img src={Logo} alt={'Logo'} />
                                Load Browser Wallet
                            </ButtonPrimary>
                            <input
                                className='multisiginput'
                                name='address'
                                placeholder='Multisig address'
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>
                    ) : null}
                    <div
                        className={
                            config.networks.includes('Mainnet') ? 'button center' : 'button right'
                        }
                    >
                        <ButtonPrimary onClick={() => loadWallet('Ledger')}>
                            <img src={Ledger} alt={'Ledger'} />
                            Load Ledger Wallet
                        </ButtonPrimary>

                        <input
                            className='multisiginput'
                            name='address'
                            placeholder='Multisig address'
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />

                        <p>Please ensure you have “expert mode” enabled</p>
                    </div>
                </div>
            </>
        </div>
    )
}

export default LogAsNotaryModal
