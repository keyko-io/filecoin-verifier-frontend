import React, { Component } from 'react';

type OptionProps = {
    head?: string
    title: string,
    subtitle?: string,
    desc: string,
    imgSrc: string,
    active?: boolean,
    id: number,
    onClick: (target: any) => void;
}


class Option extends Component<OptionProps> {

    render() {
        return (
            <div id={this.props.id.toString()} className="option" onClick={(e) => this.props.onClick(e)}
                style={{ background: this.props.active ? '#EEF3FF' : 'inherit' }}>
                <div><img src={this.props.imgSrc} alt={this.props.title} /></div>
                {this.props.head ?
                    <div className="optionhead">{this.props.head}</div>
                    : null}
                <div className="optiontitle" style={{ marginTop: this.props.head ? '20px' : 'inherit' }}
                >{this.props.title}</div>
                {this.props.subtitle ?
                    <div className="optionsubtitle">{this.props.subtitle}</div>
                    : null}
                <div className="optiondesc">{this.props.desc}</div>
            </div>
        )
    }
}

export default Option;
