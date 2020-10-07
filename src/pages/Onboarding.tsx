import React, { Component } from 'react';
import Logo from '../logo.svg';
// @ts-ignore
import { ButtonPrimary } from "slate-react-system";
import RootKey from './svg/rkh-verifiers.svg';
import Cients from './svg/client-miners.svg';
import Option from '../components/Option'
import history from '../context/History'
import Welcome from '../components/Welcome'

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
    title: "For RKH & Verifiers",
    desc: "Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah",
    imgSrc: RootKey.toString()
  }, {
    title: "For Clients & Miners",
    desc: "Here is where you will manage all your deals with miners as you operate as a verified client. To become verified, you’ll need to manage your relationship with approved verifies here.",
    imgSrc: Cients.toString()
  }]

class Onboarding extends Component<{}, States> {

  constructor(props: {}) {
    super(props);
    this.state = {
      optionSelected: [false, false],
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

  getStarted = () => {
    history.push("/preonboarding")
  }

  render() {
    return (
      <div className="onboarding">
        <div className="header">
          <div><img src={Logo} alt="Filecoin" /></div>
        </div>
        <div className="container">
          <Welcome />
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
            <div className="siglebutton">
              <ButtonPrimary onClick={() => this.getStarted()}>Get started</ButtonPrimary>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Onboarding;
