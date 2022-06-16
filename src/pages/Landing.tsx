import React from 'react';
// @ts-ignore
import TiB from '../svg/tib.svg';
import Mining from '../svg/mining.png';
import Option from '../components/Option'
import Welcome from '../components/Welcome'
import history from '../context/History'

// @ts-ignore
import { dispatchCustomEvent } from "slate-react-system";
import VerificationOptionsModal from '../modals/VerificationOptionsModal';
import LearnMore from '../components/LearnMore/LearnMore';


const options = [
  {
    title: "Get Verified",
    subtitle: "Large vs. Small Storage Request",
    desc: "Get a small amount of DataCap (32GB) through an automated Notary to make a few deals to test on the network, or apply to a specific Notary for more DataCap.",
    imgSrc: TiB.toString()
  },
  {
    title: "Find a Storage Provider",
    subtitle: "... to store your data!",
    desc: "Filecoin has a diversity of miners spread out across the globe - find one who can support your use case!",
    imgSrc: Mining.toString()
  }]

const Landing = () => {
  const changeActive = (index: number) => {
    if (index === 0) {
      showModal()
    } else {
      history.push({
        pathname: "/miners"
      })
    }
  }


  const showModal = () => {
    dispatchCustomEvent({
      name: "create-modal", detail: {
        id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
        modal: <VerificationOptionsModal />
      }
    })
  }

  return (
    <div className="landing">
      <div className="container">
        <Welcome
          title="Welcome to the Filecoin Plus Registry"
          description="Filecoin Plus is a layer of social trust on top of the Filecoin Network to help incentivize the storage of real data."
        />
        <div className="options twooptions">
          {options.map((option, index) => {
            return <Option
              key={index}
              id={index}
              title={option.title}
              desc={option.desc}
              imgSrc={option.imgSrc}
              onClick={() => changeActive(index)}
              buttonName={index === 0 ? "Get DataCap" : "Find a Storage Provider"}
            />
          })}
        </div>
        <LearnMore />
      </div>
    </div>
  );
}

export default Landing;
