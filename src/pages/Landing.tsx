import React, { Component } from 'react';
// @ts-ignore
import TiB from '../svg/tib.svg';
import Mining from '../svg/mining.png';
import Option from '../components/Option'
import Welcome from '../components/Welcome'
import history from '../context/History'
import Header from '../components/Header';
import LearnMoreOptions from '../components/LearnMoreOptions';
// @ts-ignore
import { dispatchCustomEvent } from "slate-react-system";
import VerificationOptionsModal from '../modals/VerificationOptionsModal';


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
    title: "Get Verified",
    subtitle: "Large vs. Small Storage Request",
    desc: "Get a small vs. large amount of data cap automatically or for general storage requests! You’ll be asked to select an option upon clicking below",
    imgSrc: TiB.toString()
  },
  {
    title: "Find a Miner",
    subtitle: "Mine $FIL Today!",
    desc: "This is what mining is all about and blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah",
    imgSrc: Mining.toString()
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
    if (e.currentTarget.id === '0') {
      this.showModal(e)
    } else if (e.currentTarget.id === '1') {
      history.push({
        pathname: "/miners"
      })
    }
  }


  showModal = (e: any) => {
    e.preventDefault()
    dispatchCustomEvent({
      name: "create-modal", detail: {
        id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
        modal: <VerificationOptionsModal />
      }
    })
  }

  render() {
    return (
      <div className="landing">
        <Header />
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
                buttonName={index === 0 ? "Get Verified" : "Start Mining"}
              />
            })}
          </div>
          <LearnMoreOptions />
        </div>
      </div>
    );
  }
}

export default Landing;
