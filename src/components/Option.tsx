import React, { Component } from 'react';

type OptionProps = {
    title: string,
    desc: string,
    imgSrc: string,
    active: boolean,
    id: number,
    onClick: (target: any) => void;
}


class Option extends Component<OptionProps> {

    render() {
        return (
            <div id={this.props.id.toString()} className="option" onClick={(e) => this.props.onClick(e)}
                style={{ background: this.props.active ? '#EEF3FF' : 'inherit' }}>
                <div><img src={this.props.imgSrc} alt={this.props.title} /></div>
                <div className="optiontitle">{this.props.title}</div>
                <div className="optiondesc">{this.props.desc}</div>
            </div>
        )
    }
}

export default Option;
