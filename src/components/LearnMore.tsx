import React, { Component } from 'react';
// @ts-ignore
import { ButtonPrimary } from "slate-react-system";


class LearnMore extends Component {

    navigate = () => {
          window.open('https://docs.filecoin.io/store/filecoin-plus/', '_blank')
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
