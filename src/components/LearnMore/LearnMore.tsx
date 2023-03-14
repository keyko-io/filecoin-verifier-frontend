import { useLocation } from 'react-router-dom';
// @ts-ignore
import { ButtonPrimary } from 'slate-react-system';
import './LearnMore.scss'
import history from '../../context/History';

const LearnMore = () => {
    const { pathname } = useLocation();

    const checkDatacap = () => {
        window.open('https://verify.glif.io/', '_blank')
    }

    const goTo = (params: string) => {
        history.push({
            pathname: `/${params}`
        })
    }

    const navigate = () => {
        window.open('https://docs.filecoin.io/store/filecoin-plus/', '_blank')
    }

    return (
        <div className="learnmore">
            {pathname !== '/' ?
                <ButtonPrimary onClick={checkDatacap}>Check Remaining DataCap</ButtonPrimary>
                : <ButtonPrimary style={{ marginRight: '30px' }} onClick={() => goTo('logs')}>See the logs</ButtonPrimary>}
            <ButtonPrimary style={{ margin: '0px 30px', }} onClick={navigate}>Learn More</ButtonPrimary>
            <ButtonPrimary onClick={() => goTo('status')}>Status Page</ButtonPrimary>
        </div >
    )

}

export default LearnMore;
