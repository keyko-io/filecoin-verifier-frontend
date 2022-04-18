import React, { Component } from 'react';
// @ts-ignore
import { ButtonPrimary } from "slate-react-system";


type OptionProps = {
    head?: string
    title: string,
    subtitle?: string,
    desc: string,
    imgSrc: string,
    active?: boolean,
    available?: string,
    buttonName?: string
    id: number,
    onClick: (target: any) => void;
}


class Option extends Component<OptionProps> {

    render() {
        return (
            <div id={this.props.id.toString()} className="option" onClick={(e) => this.props.onClick(e)}
                style={{ background: this.props.active ? '#EEF3FF' : 'inherit', borderRight: this.props.id === 1 ? "none" : "" }}>
                <div><img src={this.props.imgSrc} alt={this.props.title} /></div>
                {this.props.head ?
                    <div className="optionhead">{this.props.head}</div>
                    : null
                }
                <div className="optiontitle" style={{ marginTop: this.props.head ? '20px' : 'inherit' }}
                >{this.props.title}</div>
                {this.props.subtitle ?
                    <div className="optionsubtitle">{this.props.subtitle}</div>
                    : null
                }
                <div className="optiondesc">{this.props.desc}</div>
                {this.props.available ?
                    <div className="optionavailable">{this.props.available}</div>
                    : null
                }
                <div className="buttonoption">
                    {!this.props.available ?
                        <ButtonPrimary id={this.props.id.toString()}
                            onClick={(e: any) => this.props.onClick(e)}>
                            {this.props.buttonName}
                        </ButtonPrimary>
                        : null}
                </div>
            </div>
        )
    }
}

export default Option;
