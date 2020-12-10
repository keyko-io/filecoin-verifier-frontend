import React, { Component } from 'react';
// @ts-ignore
import RootKey from '../svg/rkh-verifiers.svg';
import Cients from '../svg/client-miners.svg';
import Option from '../components/Option'
import history from '../context/History'
import Welcome from '../components/Welcome'
import Header from '../components/Header';
import LearnMore from '../components/LearnMore';
import Footer from '../components/Footer'

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
    title: "For Root Key Holders and Notaries",
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
        <Header/>
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
                onClick={this.changeActive.bind(this)}
                buttonName="Proceed"
              />
            })}
          </div>
          <LearnMore/>
        </div>
        <Footer></Footer>
      </div>
    );
  }
}

export default Onboarding;
