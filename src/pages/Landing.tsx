import React, { Component } from 'react';
import Logo from '../logo.svg';
// @ts-ignore
import { ButtonPrimary } from "slate-react-system";
import TiB from './svg/tib.svg';
import MorePiB from './svg/morepib.svg';
import Option from '../components/Option'
import Welcome from '../components/Welcome'
import history from '../context/History'

type States = {
  optionSelected: boolean[],
  tabs: string,
  url: number
}

type OptionType = {
  title: string,
  head: string,
  subtitle: string,
  desc: string,
  imgSrc: string
}

type OptionsType = OptionType[]

const options: OptionsType = [
  {
    title: "Automatic Verification",
    head: "",
    subtitle: "Get Verified by verify.glif.io",
    desc: "Receive small data allowances (8GB) by connecting to any GitHub account over 180 days old",
    imgSrc: TiB.toString()
  },
  {
    title: "General Verification",
    head: "",
    subtitle: "Find a Notary in your geography or specialized in your use case",
    desc: "Receive a large amount of datacap for general storage requests such as personal, enterprise, institutional, or large scale archival purposes.",
    imgSrc: MorePiB.toString()
  }]

class Landing extends Component<{}, States> {

  child: any

  constructor(props: {}) {
    super(props);
    this.state = {
      optionSelected: [false, false],
      tabs: '0',
      url: 0,
    }
    this.child = React.createRef();
  }

  changeActive = (e: any) => {
    e.currentTarget.id == '0' ?
      window.open('https://verify.glif.io/', '_blank')
      :
      history.push({
        pathname: "/verifiers"
      })
  }


  render() {
    return (
      <div className="landing">
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
                subtitle={option.subtitle}
                imgSrc={option.imgSrc}
                active={this.state.optionSelected[index]}
                onClick={this.changeActive.bind(this)}
              />
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default Landing;
