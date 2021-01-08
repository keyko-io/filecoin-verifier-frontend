import React, { Component } from 'react';

type WelcomeProps = {
    title: string,
    description: string,
}

class Welcome extends Component<WelcomeProps> {

    render() {
        return (
            <div className="welcome">
                <div className="title">{this.props.title}</div>
                <div className="description">Filecoin Plus is a layer of social trust on top of the Filecoin Network to help incentivize the storage of real data.</div>
            </div>
        )
    }
}

export default Welcome;
