// @ts-ignore
import { ButtonPrimary } from 'slate-react-system'
import './Option.scss'

type OptionProps = {
    head?: string
    title: string
    subtitle?: string
    desc: string
    imgSrc: string
    available?: string
    buttonName?: string
    id: number
    onClick: (target: number) => void
}

const Option = (props: OptionProps) => {
    return (
        <div id={props.id.toString()} className='option'>
            <div>
                <img src={props.imgSrc} alt={props.title} />
            </div>
            {props.head ? <div className='optionhead'>{props.head}</div> : null}
            <div className='optiontitle' style={{ marginTop: props.head ? '20px' : 'inherit' }}>
                {props.title}
            </div>
            {props.subtitle ? <div className='optionsubtitle'>{props.subtitle}</div> : null}
            <div className='optiondesc'>{props.desc}</div>
            {props.available ? <div className='optionavailable'>{props.available}</div> : null}
            <div className='buttonoption'>
                <ButtonPrimary id={props.id.toString()} onClick={props.onClick}>
                    {props.buttonName}
                </ButtonPrimary>
            </div>
        </div>
    )
}

export default Option
