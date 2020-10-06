import React, { Component } from 'react';
import Logo from '../logo.svg';
// @ts-ignore
import { ButtonPrimary } from "slate-react-system";
import TiB from './svg/tib.svg';
import LessPiB from './svg/lesspib.svg';
import MorePiB from './svg/morepib.svg';
import Option from '../components/Option'

type States = {
  optionSelected: boolean[]
}

type OptionType = {
  title: string,
  desc: string,
  imgSrc: string
}

type OptionsType = OptionType[]

const options: OptionsType = [
  {
    title: "Automatic Verification",
    desc: "Get a small amount of data cap automatically for development! Users will be required to have a github account older than 1 year to receive data cap.",
    imgSrc: TiB.toString()
  },
  {
    title: "Application Verification",
    desc: "Receive datacap to allocate to your users! Application developers will have to get verified and ensure that users will not abuse their data cap.",
    imgSrc: LessPiB.toString()
  }, {
    title: "General Verification",
    desc: "Receive a large amount of datacap for general storage requests such as personal, enterprise, institutional, or large scale archival purposes.",
    imgSrc: MorePiB.toString()
  }]

class Landing extends Component<{}, States> {

  constructor(props: {}) {
    super(props);
    this.state = {
      optionSelected: [false, false, false],
    }
  }

  changeActive = (e: any) => {
    const newState = [false, false]
    this.state.optionSelected.forEach((_, index) => {
      index === Number(e.currentTarget.id) ?
        newState[index] = true :
        newState[index] = false
    })
    this.setState({ optionSelected: newState })
  }


  render() {
    return (
      <div className="landing">
        <div className="header">
          <div><img src={Logo} alt="Filecoin" /></div>
        </div>
        <div className="container">
          <div className="welcome">
            <div className="title">Welcome to the Filecoin Pro Registry</div>
            <div className="description">You may proceed in any of these pathways but you may not have access to all three. It all depends on whether you’ve been granted access to it by either the network, a rootkey holder, or an approved verifier respectively.</div>
          </div>
          <div className="options">
            {options.map((option: OptionType, index: number) => {
              return <Option
                key={index}
                id={index}
                title={option.title}
                desc={option.desc}
                imgSrc={option.imgSrc}
                active={this.state.optionSelected[index]}
                onClick={this.changeActive.bind(this)}
              />
            })}
            </div>
            <div className="started">
              <div className="doublebutton">
                <ButtonPrimary>Get started</ButtonPrimary>
                <ButtonPrimary>Learn More</ButtonPrimary>
              </div>
            </div>
          </div>
        </div>
    );
  }
}

export default Landing;
