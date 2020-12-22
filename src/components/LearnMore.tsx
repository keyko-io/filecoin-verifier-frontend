import React, { Component } from 'react';
// @ts-ignore
import { ButtonPrimary } from "slate-react-system";


class LearnMore extends Component {

    navigate = () => {
          window.open('https://github.com/filecoin-project/filecoin-plus-client-onboarding', '_blank')
      }

    render() {
        return (
            <div className="learnmore">
              <ButtonPrimary onClick={() => this.navigate()}>Learn More</ButtonPrimary>
            </div >
        )
    }
}

export default LearnMore;
