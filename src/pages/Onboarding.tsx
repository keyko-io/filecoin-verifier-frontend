// @ts-ignore
import RootKey from '../svg/rkh-verifiers.svg';
import Cients from '../svg/client-miners.svg';
import Option from '../components/Option/Option';
import history from '../context/History';
import Welcome from '../components/Welcome/Welcome';
import LearnMore from '../components/LearnMore/LearnMore';

const options = [
  {
    title: 'For Root Key Holders and Notaries',
    desc: 'Manage and process in-bound DataCap allocation requests.',
    imgSrc: RootKey.toString(),
  },
  {
    title: 'For Clients',
    desc: 'Find a Notary in your geography or specialized in your use case to get DataCap!',
    imgSrc: Cients.toString(),
  },
];

const Onboarding = () => {

  const changeActive = (index: number) => {
    if (index === 0) {
      history.push({
        pathname: '/wallet',
      })
    } else {
      history.push({
        pathname: '/landing',
      });
    }
  };

  return (
    <div className="onboarding">
      <div className="container">
        <Welcome
          title="Welcome to the Filecoin Plus Registry"
          description="You may proceed in any of these pathways but you may not have access to both of them. It all depends on whether you’ve been granted access to it by either the network, a rootkey holder, or an approved verifier respectively."
        />
        <div className="options twooptions">
          {options.map((option, index) => {
            return (
              <Option
                key={index}
                id={index}
                title={option.title}
                desc={option.desc}
                imgSrc={option.imgSrc}
                onClick={() => changeActive(index)}
                buttonName="Proceed"
              />
            );
          })}
        </div>
        <LearnMore />
      </div>
    </div>
  );

}

export default Onboarding;
