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
}

type OptionType = {
  title: string,
  desc: string,
  imgSrc: string
}

type OptionsType = OptionType[]

const options: OptionsType = [
  {
    title: "For Root Key Holders & Notaries",
    desc: "Manage and process in-bound DataCap allocation requests.",
    imgSrc: RootKey.toString()
  }, {
    title: "For Clients",
    desc: "Find a Notary in your geography or specialized in your use case to get DataCap!",
    imgSrc: Cients.toString()
  }]

class Onboarding extends Component<{}, States> {

  constructor(props: {}) {
    super(props);
    this.state = {
    }
  }

  changeActive = (e: any) => {

    e.currentTarget.id === '0' ?
      history.push({
        pathname: "/wallet",
        state: { selected: 0 }
      })
      :
      history.push({
        pathname: "/landing",
      })

  }

  render() {
    return (
      <div className="onboarding">
        <div className="header">
          <div><img src={Logo} alt="Filecoin" /></div>
        </div>
        <div className="container">
          <Welcome />
          <div className="options twooptions">
            {options.map((option: OptionType, index: number) => {
              return <Option
                key={index}
                id={index}
                title={option.title}
                desc={option.desc}
                imgSrc={option.imgSrc}
                onClick={this.changeActive.bind(this)}
              />
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default Onboarding;
