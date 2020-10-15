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
            </div>
        )
    }
}

export default Welcome;
