import React from 'react';
// @ts-ignore
import { dispatchCustomEvent } from "slate-react-system";
import RootKey from '../svg/root-key.svg';
import Verifiers from '../svg/verifier-wallet.svg';
import Welcome from '../components/Welcome/Welcome'
import LearnMore from '../components/LearnMore';
import Option from '../components/Option'
import LogInModal from '../modals/LogInModal'


const options = [
  {
    title: "Log in as a Root Key Holder",
    desc: "Here is where you can action pending Notary allocation decisions.",
    imgSrc: RootKey.toString()
  }, {
    title: "Log in as a Notary",
    desc: "Here is where you can manage pending public requests and action DataCap allocation decisions.",
    imgSrc: Verifiers.toString()
  }]


const Preonboarding = () => {

  const proposeVerifier = async (e: any) => {
    dispatchCustomEvent({
      name: "create-modal", detail: {
        id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
        modal: <LogInModal type={e.currentTarget.id} />
      }
    })
  }


  return (
    <div className="onboarding">
      <div className="container">
        <Welcome
          title="Welcome to the Filecoin Plus Registry"
          description="You may proceed in any of these pathways but you may not have access to both of them. It all depends on whether you’ve been granted access to it by either the network, a rootkey holder, or an approved verifier respectively."
        />
        <div className="options twooptions">
          {options.map((option, index) => {
            return <Option
              key={index}
              id={index}
              title={option.title}
              desc={option.desc}
              imgSrc={option.imgSrc}
              onClick={proposeVerifier}
              buttonName="Select"
            />
          })}
        </div>
        <LearnMore />
      </div>
    </div>
  );
}

export default Preonboarding;
