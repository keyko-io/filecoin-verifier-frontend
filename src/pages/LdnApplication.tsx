import React, { Component } from 'react';
// @ts-ignore
import { ButtonPrimary, Input } from "slate-react-system";
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
// @ts-ignore
import LoginGithub from 'react-login-github';
import { Data } from '../context/Data/Index';
import { config } from '../config';
import { nextTick } from 'process';
import Header from '../components/Header';
import Welcome from '../components/Welcome';
const utils = require('@keyko-io/filecoin-verifier-tools/utils/large-issue-parser')
const coreInfo = [
  { name: 'title', description: 'Github Issue Title', value: '' },
  { name: 'name', description: 'Organization Name', value: '' },
  { name: 'website', description: 'Website / Social Media', value: '' },
  { name: 'datacapRequested', description: 'Total amount of DataCap being requested (between 500 TiB and 5 PiB)', value: '', measure: '', type: 'number' },
  { name: 'dataCapWeeklyAllocation', description: 'Weekly allocation of DataCap requested (usually between 1-100TiB)', value: '', measure: '', type: 'number' },
  { name: 'address', description: 'On-chain address for first allocation', value: '' },
]

const otherInfo = [
  { name: 'orgHistory', description: 'Share a brief history of your project and organization.', category: 'project details', value: '', step: 0 },
  { name: 'orgFunding', description: 'What is the primary source of funding for this project?', category: 'project details', value: '', step: 0 },
  { name: 'otherStakeholders', description: 'What other projects/ecosystem stakeholders is this project associated with?', category: 'project details', value: '', step: 0 },

  { name: 'describeData', description: 'Describe the data being stored onto Filecoin', category: 'use-case details', value: '', step: 1 },
  { name: 'dataSource', description: 'Where was the data in this dataset sourced from?', category: 'use-case details', value: '', step: 1 },
  { name: 'dataSample', description: 'Can you share a sample of the data? A link to a file, an image, a table, etc., are good ways to do this.', category: 'use-case details', value: '', step: 1 },
  { name: 'isPublicDataset', description: 'Confirm that this is a public dataset that can be retrieved by anyone on the Network (i.e., no specific permissions or access rights are required to view the data).', category: 'use-case details', value: '', step: 1 },
  { name: 'retrievalFrequency', description: 'What is the expected retrieval frequency for this data?', category: 'use-case details', value: '', step: 1 },
  { name: 'filecoinPermanency', description: 'For how long do you plan to keep this dataset stored on Filecoin?', category: 'use-case details', value: '', step: 1 },

  { name: 'region', description: 'In which geographies (countries, regions) do you plan on making storage deals?', category: 'DataCap allocation plan', value: '', step: 2 },
  { name: 'howDistributeData', description: 'How will you be distributing your data to storage providers? Is there an offline data transfer process?', category: 'DataCap allocation plan', value: '', step: 2 },
  { name: 'howChooseSp', description: 'How do you plan on choosing the storage providers with whom you will be making deals? This should include a plan to ensure the data is retrievable in the future both by you and others.', category: 'DataCap allocation plan', value: '', step: 2 },
  { name: 'howDeals', description: 'How will you be distributing deals across storage providers?', category: 'DataCap allocation plan', value: '', step: 2 },
  { name: 'haveFunds', description: 'Do you have the resources/funding to start making deals as soon as you receive DataCap? What support from the community would help you onboard onto Filecoin?', category: 'DataCap allocation plan', value: '', step: 2 },
]

const welcomeState = [
  { view: 0, title: 'Apply as a large Client.', description: 'Sign-in With GitHub to Start.', className: 'welcome0' },
  { view: 1, title: 'Select an Issue to keep the Iteration of DataCap Allocation.', description: 'If you select \'create a new issue\' make sure to use a new address to get DataCap', className: 'welcome1' },
  { view: 2, title: 'Fill Up The Form', description: 'You will be able to ', className: 'welcome2' },
  { view: 3, title: 'Fill the form.', description: 'This is the step 1 of 4. the first step is mandatory. If you don\'t have time right now, you can submit the issue and finish it later in the repo.', className: 'welcome3' },
  { view: 3, title: 'Fill the form.', description: 'You\'re almost there..', className: 'welcome4' },
]

//view 0: log in with github OK step 0
//view 1: show options: step 1
//     if user has already other issues to his name ---> choose if to continue a previous one (view 3) or open a new one (view 2 - different address)
//     if user has no other issue to his name --> view 2 ---> submit [end here] 1/2 OK
//view 2: fill the form fully step 2
//view 3: auto-fill the form and the user has to review the info step 2 

class LdnApplication extends Component<{}> {
  public static contextType = Data
  constructor(props: any) {
    super(props);
  }

  state = {
    coreInfo: [...coreInfo],
    view: 0,
    stepViewFour: 0,
    loggedUser: '',
    filteredIssues: [],
    issue: '',
    isNewIssue: true

  }
  componentDidMount() {
    console.log(this.context.github.githubLogged)
    // if (!this.context.github.githubLogged) {
    //   this.setState({ view: 0 })
    // }
  }

  handleSelectIssue(issue: any) {
    const parsedIssue = utils.parseIssue(issue.body)
    console.log(parsedIssue)
    this.setState({ view: 2, issue: issue })
    for (let [k, v] of Object.entries(parsedIssue)) {
      const value = v as string
      if (k !== 'correct' && k && v) {
        this.updateFormContent(k, v as string)
      }
    }
    this.updateFormContent('title', issue.title)
  }

  updateFormContent(name: any, value: string) {
    let coreInfo = this.state.coreInfo
    const elementToUpdateIndex: any = coreInfo.findIndex((info: any) => info.name === name)
    if (name === 'datacapRequested' || name === 'dataCapWeeklyAllocation') {
      const splitted = value.split(/[T|P]/)
      const amount: string = splitted[0]
      const measure = value.substring(amount.length)
      coreInfo[elementToUpdateIndex].value = amount
      coreInfo[elementToUpdateIndex].measure = measure
    } else {
      coreInfo[elementToUpdateIndex].value = value
    }
    this.setState({
      coreInfo
    })
  }

  handleChange(event: any) {
    console.log('keyyyyy', event.key)
    this.updateFormContent(event.target.name, event.target.value)
  }

  async handleSubmit(issue: any) {
    // create a github issue
    if (!this.state.isNewIssue) {
      //create issue and link to the previous one
      const res = await this.context.github.githubOcto.issues.create({
        owner: config.onboardingOwner,
        repo: config.onboardingLargeClientRepo,
        title: issue.title,
        body: issue.body
      })
      console.log("res", res)
      const newIssueNumber = res.data.number
      await this.context.github.githubOcto.issues.createComment({
        owner: config.onboardingOwner,
        repo: config.onboardingLargeClientRepo,
        issue_number: newIssueNumber,
        body: `This issue is the continuation of a previous one: #${issue.number}`
      })
      // create comment to flag this aissue s a continuation of a previous one
    } else {
      //create new issue

    }
  }

  async checkUserInrepo() {
    const issues = (await this.context.github.githubOcto.issues.list(
      { filter: 'created' }
    )).data

    // const filteredIssues = issues.filter((issue: any) => issue.repository.full_name == config.onboardingOwner + '/' + config.onboardingLargeClientRepo)
    // console.log(filteredIssues)
    // if (filteredIssues.length) {
    //   this.setState({ filteredIssues, isNewIssue: false, view: 1 }) // just for test, change it
    //   // this.setState({ filteredIssues: filteredIssuesMock, view: 1 }) // just for test, change it
    // } 
    //   this.setState({ filteredIssues, view: 2 })
    // }
    this.setState({ view: 3 })
    // console.log("filteredIssues", filteredIssues)
  }


  fillOtherInfo() {
    // TODO save initial info
    console.log("coreinfo", coreInfo)
    this.setState({ view: 4 })
  }

  nextStep() {
    const stepViewFour = this.state.stepViewFour + 1
    this.setState({ stepViewFour })
  }
  prevStep() {
    const stepViewFour = this.state.stepViewFour - 1
    this.setState({ stepViewFour })
  }



  render() {
    return (
      <div className="formContainer" style={{ minHeight: '100%' }}>
        <Header />
        <div className={welcomeState[this.state.view].className}>
          <div className="guideText">{welcomeState[this.state.view].title}</div>
          <span style={{ paddingTop: '10px' }}></span>
          <div className="guideText">{welcomeState[this.state.view].description}</div>
          {this.state.view === 4 && <div className="guideText"><small>Step {this.state.stepViewFour+1} of 3</small></div>}
        </div>
        {/* login */}
        {!this.state.view ?
          <div className="content">
            <div id="githublogin" className="githubrequest">
              <LoginGithub
                redirectUri={config.oauthUri}
                clientId={config.githubApp}
                scope="repo"
                onSuccess={async (response: any) => {
                  await this.context.github.loginGithub(response.code, true)
                  // console.log("user:", user)
                  console.log("this.context.github.githubLogged:", this.context.github.githubLogged)
                  this.setState({ loggedUser: this.context.github.loggedUser })
                  console.log("loggedUser:", this.state.loggedUser)
                  await this.checkUserInrepo()
                  // this.setState({view:1})
                }}
                onFailure={(response: any) => {
                  console.log('login failure', response)
                }}
              />
            </div>
            {/* <div className="loginwarn">Github sign in required</div> */}
          </div>
          : null
        }
        {/* select issue */}
        {
          this.state.view === 1 &&
          <div className="content">
            {/* // <ButtonPrimary onClick={this.handleSubmit}>Next step</ButtonPrimary> */}
            <div className='titleIssueBox'>
              Select an issue to continue or <a style={{ cursor: 'pointer', color: '#0091ff' }} onClick={() => this.setState({ view: 3 })}>create a new issue</a>
            </div>
            <div className='issueBoxContainer'>
              {
                this.state.filteredIssues.map((issue: any, index: any) =>
                  <div
                    key={index}
                    className={'issueBox'}
                    onClick={() => this.handleSelectIssue(issue)}
                  >
                    {issue.number}  <br />
                    {issue.title}
                  </div>
                )
              }
            </div>
          </div>
        }
        {/* continuation issue */}
        {
          this.state.view === 2 &&
          <div className="content">
            <form >
              {coreInfo.map((item: any, index: any) =>
                <div key={index} >
                  {
                    item.type !== 'number' ?
                      <Input
                        // className="inputholder"
                        description={item.description}
                        name={item.name}
                        value={this.state.coreInfo[index].value}
                        placeholder={item.description}
                        onChange={(e: any) => this.handleChange(e)}
                      /> :
                      <>
                        <Input
                          description={item.description}
                          name={item.name}
                          value={this.state.coreInfo[index].value}
                          placeholder={item.description}
                          onChange={(e: any) => /[0-9]/.test(e.target.value) ? this.handleChange(e) : () => { }}
                        />
                        <Dropdown options={['TiB', 'PiB']} value={this.state.coreInfo[index].measure} placeholder="Select an option" />
                      </>
                  }

                  <br />
                </div>)}

            </form>
            <ButtonPrimary onClick={() => this.handleSubmit(this.state.issue)}>Submit Application</ButtonPrimary>
          </div>
        }
        {/* new issue */}
        {
          this.state.view === 3 &&
          <div className="content">
            <form >
              {coreInfo.map((item: any, index: any) =>
                <div key={index} >
                  {
                    item.type !== 'number' ?
                      <Input
                        // className="inputholder"
                        description={item.description}
                        name={item.name}
                        value={this.state.coreInfo[index].value}
                        placeholder={item.description}
                        onChange={(e: any) => this.handleChange(e)}
                      /> :
                      <>
                        <Input
                          description={item.description}
                          name={item.name}
                          value={this.state.coreInfo[index].value}
                          placeholder={item.description}
                          onChange={(e: any) => /[0-9]/.test(e.target.value) ? this.handleChange(e) : () => { }}
                        />
                        <Dropdown options={['TiB', 'PiB']} value={this.state.coreInfo[index].measure} placeholder="Select an option" />
                      </>
                  }

                  <br />
                </div>)}

            </form>
            <ButtonPrimary onClick={() => this.fillOtherInfo()}>Next</ButtonPrimary>
          </div>
        }
        {
          this.state.view === 4 &&
          <div className="content">
            <div className="otherInfoContainer">

              <div className='otherInfoHeader'>
                
                <h1>{otherInfo.find((item: any) => item.step === this.state.stepViewFour)?.category}</h1>
              </div>


              {
                otherInfo.map((item: any, index: any) =>
                  this.state.stepViewFour === item.step &&
                  <div key={index} className={'otherInfoDiv'}>
                    <label className='otherInfoLabel'>{item.description}</label>
                    <textarea></textarea>
                  </div>
                )
              }
              {
                !this.state.stepViewFour ? <div className='otherInfoButtonContainer'>
                  <ButtonPrimary onClick={() => this.nextStep()}>Next</ButtonPrimary>
                </div> :
                  (this.state.stepViewFour && this.state.stepViewFour < 2) ?
                    <div className='otherInfoButtonContainer'>
                      <ButtonPrimary onClick={() => this.prevStep()}>Back</ButtonPrimary>
                      <span style={{ marginRight: '10px' }}></span>
                      <ButtonPrimary onClick={() => this.nextStep()}>Next</ButtonPrimary>
                    </div> :
                    <div className='otherInfoButtonContainer'>
                      <ButtonPrimary onClick={() => this.prevStep()}>Back</ButtonPrimary>
                      <span style={{ marginRight: '10px' }}></span>
                      <ButtonPrimary onClick={() => alert('todo')}>TODO</ButtonPrimary>
                    </div>
              }
            </div>
          </div>
        }
      </div>
    );
  }
}

export default LdnApplication;