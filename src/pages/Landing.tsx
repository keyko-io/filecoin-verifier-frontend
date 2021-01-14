import React, { Component } from 'react';
// @ts-ignore
import TiB from '../svg/tib.svg';
import MorePiB from '../svg/morepib.svg';
import Option from '../components/Option'
import Welcome from '../components/Welcome'
import history from '../context/History'
import Header from '../components/Header';
import LearnMore from '../components/LearnMore';

type States = {
  optionSelected: boolean[],
  tabs: string,
  url: number
}

type OptionType = {
  title: string,
  subtitle: string,
  desc: string,
  available?: string,
  imgSrc: string
}

type OptionsType = OptionType[]

const options: OptionsType = [
  {
    title: "Automatic Verification",
    subtitle: "Get Verified by verify.glif.io",
    desc: "Receive small data allowances (8GB) by connecting to any GitHub account over 180 days old",
    imgSrc: TiB.toString()
  },
  {
    title: "General Verification",
    subtitle: "Find a Notary in your geography or specialized in your use case",
    desc: "Request a DataCap allowance for general storage requests - such as personal, enterprise, or archival purposes.",
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
        <Header/>
        <div className="container">
          <Welcome
            title="Welcome to the Filecoin Plus Registry"
            description="A public request is all about Dash launched a hot deterministic wallet! Stellar is a burned exchange during lots of wash trade, so someone slept on the trusted fish. It proves many difficulty behind some cold wallet! Since IOTA counted few hot gas..."
          />
          <div className="options twooptions">
            {options.map((option: OptionType, index: number) => {
              return <Option
                key={index}
                id={index}
                title={option.title}
                desc={option.desc}
                subtitle={option.subtitle}
                available={option.available}
                imgSrc={option.imgSrc}
                active={this.state.optionSelected[index]}
                onClick={this.changeActive.bind(this)}
                buttonName="Get Verified"
              />
            })}
          </div>
          <LearnMore />
        </div>
      </div>
    );
  }
}

export default Landing;
