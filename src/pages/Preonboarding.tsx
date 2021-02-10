import React, { Component } from 'react';
// @ts-ignore
import { dispatchCustomEvent } from "slate-react-system";
import RootKey from '../svg/root-key.svg';
import Verifiers from '../svg/verifier-wallet.svg';
import Welcome from '../components/Welcome'
import { Location } from 'history';
import { Data } from '../context/Data/Index'
import Header from '../components/Header';
import LearnMore from '../components/LearnMore';
import Option from '../components/Option'
import LogInModal from '../modals/LogInModal'


type PreonboardingStates = {
  tabs: string
}

type LocationState = {
  state: { selected: Location };
};

type OptionType = {
  title: string,
  desc: string,
  imgSrc: string
}

type OptionsType = OptionType[]

const options: OptionsType = [
  {
    title: "Log in as a Root Key Holder",
    desc: "Here is where you can action pending Notary allocation decisions.",
    imgSrc: RootKey.toString()
  }, {
    title: "Log in as a Notary",
    desc: "Here is where you can manage pending public requests and action DataCap allocation decisions.",
    imgSrc: Verifiers.toString()
  }]


class Preonboarding extends Component<{}, PreonboardingStates, LocationState> {
  public static contextType = Data

  constructor(props: { location: LocationState }) {
    super(props);
    const index = props.location.state.selected as unknown as Number;
    this.state = {
      tabs: index > 0 ? index.toString() : '0'
    }
  }

  componentDidMount() {
  }


  proposeVerifier = async (e: any) => {
    dispatchCustomEvent({
      name: "create-modal", detail: {
        id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
        modal: <LogInModal type={e.currentTarget.id} />
      }
    })
  }

  render() {
    return (
      <div className="onboarding">
        <Header />
        <div className="container">
          <Welcome
            title="Welcome to the Filecoin Plus Registry"
            description="You may proceed in any of these pathways but you may not have access to both of them. It all depends on whether you’ve been granted access to it by either the network, a rootkey holder, or an approved verifier respectively."
          />
          <div className="options twooptions">
            {options.map((option: OptionType, index: number) => {
              return <Option
                key={index}
                id={index}
                title={option.title}
                desc={option.desc}
                imgSrc={option.imgSrc}
                onClick={this.proposeVerifier.bind(this)}
                buttonName="Select"
              />
            })}
          </div>
          <LearnMore />
        </div>
      </div>
    );
  }
}

export default Preonboarding;
