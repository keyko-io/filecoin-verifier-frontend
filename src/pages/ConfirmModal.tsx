// @ts-ignore
import { ButtonPrimary, dispatchCustomEvent } from 'slate-react-system'
import Sent from '../svg/sent.svg'

type ConfirmModalProps = {
    error?: boolean
    url?: string
}

const ConfirmModal = (props: ConfirmModalProps) => {
    const handleSubmit = () => {
        dispatchCustomEvent({ name: 'delete-modal', detail: {} })
    }

    return (
        <>
            {props.error ? (
                <div className='errormodal'>
                    <div className='title'>Error</div>
                    <div className='description'>There was an error on your request</div>
                </div>
            ) : (
                <div className='confirmmodal'>
                    {props.url ? (
                        <>
                            <div className='title'>Request Sent!</div>
                            <div className='description'>
                                Your request has been sent. You can find the github issue
                                <a target='_blank' rel='noopener noreferrer' href={props.url}>
                                    {' '}
                                    here
                                </a>
                            </div>
                            <div className='warn'>
                                Please subscribe to notifications for this Issue to be aware of
                                updates. Notaries may request additional information on the Issue.
                            </div>
                            <div className='img'>
                                <img src={Sent} alt={'sent message'} />
                            </div>
                            <div className='button'>
                                <ButtonPrimary onClick={handleSubmit}>Return</ButtonPrimary>{' '}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className='title'>Request Sent!</div>
                            <div className='description'>
                                Your request has just been sent, you should hear back within a few
                                days or so.
                            </div>
                            <div className='img'>
                                <img src={Sent} alt={'sent message'} />
                            </div>
                            <div className='button'>
                                <ButtonPrimary onClick={handleSubmit}>Return</ButtonPrimary>{' '}
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    )
}

export default ConfirmModal
