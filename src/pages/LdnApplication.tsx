import React, { Component } from 'react';
// @ts-ignore
import { ButtonPrimary, Input } from "slate-react-system";
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import { TextField, Select, MenuItem, InputLabel } from '@material-ui/core';

// @ts-ignore
import LoginGithub from 'react-login-github';
import { Data } from '../context/Data/Index';
import { config } from '../config';
import Header from '../components/Header';
import { createParentComment, updateTemplate } from './issueUtils/templates';

const utils = require('@keyko-io/filecoin-verifier-tools/utils/large-issue-parser')
const coreInfo = [
  { name: 'title', description: 'Github Issue Title', value: '', error: false, errorMessage: 'Field is Required', type: 'string' },
  { name: 'name', description: 'Organization Name', value: '', error: false, errorMessage: 'Field is Required', type: 'string' },
  { name: 'region', description: 'Region', value: '', error: false, errorMessage: 'Field is Required', type: 'string' },
  { name: 'website', description: 'Website / Social Media', value: '', error: false, errorMessage: 'Field is Required', type: 'string' },
  { name: 'datacapRequested', description: 'Total amount of DataCap being requested (between 500 TiB and 5 PiB)', value: '', measure: '', type: 'number', error: false, errorMessage: 'Field is Required' },
  { name: 'dataCapWeeklyAllocation', description: 'Weekly allocation of DataCap requested (usually between 1-100TiB)', value: '', measure: '', type: 'number', error: false, errorMessage: 'Field is Required' },
  { name: 'address', description: 'On-chain address for first allocation', value: '', error: false, errorMessage: 'Field is Required', type: 'string' },
]

const otherInfo = [
  { name: 'detailsHistory', description: 'Share a brief history of your project and organization.', category: 'project details', value: '', step: 0 },
  { name: 'detailsSrcFunding', description: 'What is the primary source of funding for this project?', category: 'project details', value: '', step: 0 },
  { name: 'detailsSrcOtherProjects', description: 'What other projects/ecosystem stakeholders is this project associated with?', category: 'project details', value: '', step: 0 },

  { name: 'useCaseDescribeData', description: 'Describe the data being stored onto Filecoin', category: 'use-case details', value: '', step: 1 },
  { name: 'useCaseWhereDataIsStored', description: 'Where was the data in this dataset sourced from?', category: 'use-case details', value: '', step: 1 },
  { name: 'useCaseDataSample', description: 'Can you share a sample of the data? A link to a file, an image, a table, etc., are good ways to do this.', category: 'use-case details', value: '', step: 1 },
  { name: 'useCaseIsPublicDataSet', description: 'Confirm that this is a public dataset that can be retrieved by anyone on the Network (i.e., no specific permissions or access rights are required to view the data).', category: 'use-case details', value: '', step: 1 },
  { name: 'useCaseExpectedRetrievalFrequency', description: 'What is the expected retrieval frequency for this data?', category: 'use-case details', value: '', step: 1 },
  { name: 'useCaseHowLongStoredInFilecoin', description: 'For how long do you plan to keep this dataset stored on Filecoin?', category: 'use-case details', value: '', step: 1 },

  { name: 'dataCapAllocationPlanRegion', description: 'In which geographies (countries, regions) do you plan on making storage deals?', category: 'DataCap allocation plan', value: '', step: 2 },
  { name: 'dataCapAllocationPlanDistribute', description: 'How will you be distributing your data to storage providers? Is there an offline data transfer process?', category: 'DataCap allocation plan', value: '', step: 2 },
  { name: 'dataCapAllocationPlanChooseSp', description: 'How do you plan on choosing the storage providers with whom you will be making deals? This should include a plan to ensure the data is retrievable in the future both by you and others.', category: 'DataCap allocation plan', value: '', step: 2 },
  { name: 'dataCapAllocationPlanDeals', description: 'How will you be distributing deals across storage providers?', category: 'DataCap allocation plan', value: '', step: 2 },
  { name: 'dataCapAllocationPlanHasResources', description: 'Do you have the resources/funding to start making deals as soon as you receive DataCap? What support from the community would help you onboard onto Filecoin?', category: 'DataCap allocation plan', value: '', step: 2 },
]

const guidelines = [
  { view: 0, title: 'Apply as a large Client.', description: 'Sign-in With GitHub to Start.', className: 'welcome0' },
  { view: 1, title: 'It looks like you started an application before.', description: 'Select the issue you want to continue editing or create a new issue', className: 'welcome1' },
  { view: 2, title: 'Fill Up The Form', description: 'You will be able to ', className: 'welcome2' },
  { view: 3, title: 'Fill the form.', description: 'This is the step 1 of 4. the first step is mandatory. If you don\'t have time right now, you can submit the issue and finish it later.', className: 'welcome3' },
  { view: 3, title: 'Fill the form.', description: 'You\'re almost there..', className: 'welcome4' },
  { view: 5, title: 'Success!', description: `You Just submitted the issue in this `, className: 'welcome4', link: 'https://github.com/filecoin-project/filecoin-plus-large-datasets/issues' },
]

const regionOptions = [
  'Africa',
  'Asia excl. Japan',
  'Asia excl. GCN',
  'Asia excl. Greater China',
  'Asia, Japan',
  'Europe',
  'Greater China',
  'None',
  'North America',
  'Oceania',
  'South America',
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
    otherInfo: [...otherInfo],
    view: 0,
    stepViewFour: 0,
    loggedUser: '',
    issueList: [],
    issue: '',
    isNewIssue: true,
    issueNumber: 0,
    addressList: [] as string[]

  }
  async componentDidMount() {
    // console.log(this.context.github.githubLogged)
    await this.context.github.checkToken()
    if (!this.context.github.githubLogged) {
      this.setState({ view: 0 })
      return
    }
    await this.fetchIssuesAndSelectView()
  }

  async fetchIssuesAndSelectView() {
    // fetch issues to get addresses
    const issues = (await this.context.github.githubOcto.issues.list(
      {
        filter: 'created',
        labels: ['application:WIPissue']
      }
    )).data
    console.log('issuews', issues)

    let addressList = []
    for (let issue of issues) {
      const psiAddress = utils.parseIssue(issue.body).address
      addressList.push(psiAddress)
      // console.log('psiaddress', psiAddress)
    }
    this.setState({
      addressList,
      issueList: issues,
      view: issues.length ? 1 : 3
    })
  }

  continueEditingPreviousIssue(issue: any) {

    const parsedIssue = utils.parseIssue(issue.body)
    console.log(parsedIssue)
    this.setState({ view: 3, issue: issue, isNewIssue: false })
    for (let [k, v] of Object.entries(parsedIssue)) {
      const value = v as string
      if (k !== 'correct' && k && v) {
        this.updateCoreInfoContent(k, v as string)
      }
    }
    this.updateCoreInfoContent('title', issue.title)
    this.updateOtherInfoContent(issue)
    this.setState({ issueNumber: issue.number })

  }

  updateOtherInfoContent(issue: any) {
    const parsedOtherInfoIssue = utils.parseOtherInfoIssue(issue.body)
    let otherInfo = this.state.otherInfo
    for (let info of otherInfo) {
      const value = parsedOtherInfoIssue[info.name]
      info.value = value
    }
    this.setState({ otherInfo })
  }

  handleChange(event: any) {
    if (event.target.name === 'region') {
      this.updateCoreInfoContent(event.target.name, event.target.value)
      return
    }
    this.updateCoreInfoContent(event.target.id, event.target.value)
  }

  setDatacapMeasure(e: any) {
    this.updateCoreInfoContent(e.target.name, e.target.value, true)
  }


  fillTextAreas(name: any, value: any) {
    let otherInfo = this.state.otherInfo
    const elementToUpdateIndex: any = otherInfo.findIndex((info: any) => info.name === name)
    if (otherInfo[elementToUpdateIndex]) {
      otherInfo[elementToUpdateIndex].value = value
      this.setState({
        otherInfo
      })
    }


  }


  validateDatacap(coreInfo: any, name: any, value: any, elementToUpdateIndex: any) {
    let hasError = false
    if (value === 'PiB' && Number(coreInfo[elementToUpdateIndex].value) > 5) {
      hasError = true
      // coreInfo[elementToUpdateIndex].error = true
      coreInfo[elementToUpdateIndex].errorMessage = 'You can ask max 5 PiB'
    }
    if (value === 'TiB' && coreInfo[elementToUpdateIndex].value.length > 3) {
      hasError = true
      // coreInfo[elementToUpdateIndex].error = true
      coreInfo[elementToUpdateIndex].errorMessage = 'You can ask max 999 TiB'
    }
    if (coreInfo[elementToUpdateIndex].measure === 'PiB' && Number(value) > 5) {
      hasError = true
      // coreInfo[elementToUpdateIndex].error = true
      coreInfo[elementToUpdateIndex].errorMessage = 'You can ask max 5 PiB'
    }
    if (coreInfo[elementToUpdateIndex].measure === 'TiB' && value.length > 3) {
      hasError = true
      // coreInfo[elementToUpdateIndex].error = true
      coreInfo[elementToUpdateIndex].errorMessage = 'You can ask max 999 TiB'
    }

    return hasError
  }

  updateCoreInfoContent(name: any, value: string, isMeasure?: boolean) {
    let coreInfo = this.state.coreInfo
    let hasError = false
    const elementToUpdateIndex: any = coreInfo.findIndex((info: any) => info.name === name)
    if (isMeasure || coreInfo[elementToUpdateIndex].type === 'number')
      hasError = this.validateDatacap(coreInfo, name, value, elementToUpdateIndex)
    if (isMeasure) {
      coreInfo[elementToUpdateIndex].measure = value
      coreInfo[elementToUpdateIndex].error = hasError
    } else {
      coreInfo[elementToUpdateIndex].value = value
      coreInfo[elementToUpdateIndex].error = hasError
    }
    this.setState({
      coreInfo
    })
  }

  addressListIncludesAddressInput(address: any) {
    if (this.state.addressList.includes(address)) {
      alert("error: You did use already this address for another issue. Please, use another one!")
      return true
    }
    return false
  }

  nextStep() {
    const stepViewFour = this.state.stepViewFour + 1
    console.log("stepViewFour:", stepViewFour)
    this.setState({ stepViewFour })
  }
  prevStep() {
    const stepViewFour = this.state.stepViewFour - 1
    this.setState({ stepViewFour })
    if (this.state.view === 3 && this.state.issueList.length) {
      this.setState({ view: 1 })
    }
  }

  validateIssue() {
    let coreInfo = this.state.coreInfo
    let hasError = false
    for (let info of coreInfo) {
      if (!info.value || info.error) {
        info.error = true
        hasError = true
      }
    }
    this.setState({ coreInfo })
    return hasError
  }
  async createUpdateIssue() {
    if (this.validateIssue()) {
      alert('application contain errors...')
      return
    }


    if (this.state.isNewIssue) {
      if (this.addressListIncludesAddressInput(coreInfo[6].value)) return
      await this.createIssueStepOne()

    } else {
      //todo make sure that the relevnt state fields are cleared
      await this.updateIssueAndContinue()
    }
    this.setState({ view: 4, stepViewFour: 0 })

  }

  async createIssueStepOne() {
    const coreInfo = this.createObjectForCoreInfoTemplate()
    const res = await this.context.github.githubOcto.issues.create({
      owner: config.onboardingOwner,
      repo: config.onboardingLargeClientRepo,
      title: '[DataCap Allocation] - ' + coreInfo.title, //todo get title differently
      body: createParentComment(coreInfo),
      labels: ['application:WIPissue']
    })

    alert(`issue created with n ${res.data.number}`)
    this.setState({ issueNumber: res.data.number })
    return res.data.number
  }

  async updateIssueAndContinue() {
    const coreInfo = this.createObjectForCoreInfoTemplate()
    const otherInfo = this.createObjectForOtherInfoTemplate()
    await this.updateExistingIssue(coreInfo, otherInfo)
  }

  async updateExistingIssue(coreInfo: any, otherInfo: any) {
    // retrieve issue
    const issue = await this.context.github.githubOcto.issues.get({
      owner: config.onboardingOwner,
      repo: config.onboardingLargeClientRepo,
      issue_number: this.state.issueNumber
    })

    const temp = updateTemplate(issue.data.body, otherInfo, coreInfo)
    if (this.state.stepViewFour === 2) {
      await this.context.github.githubOcto.issues.update({
        owner: config.onboardingOwner,
        repo: config.onboardingLargeClientRepo,
        issue_number: this.state.issueNumber,
        body: temp,
        labels: ['Application:completed']
      })
      this.setState({ view: 5 })
    }
    else {
      await this.context.github.githubOcto.issues.update({
        owner: config.onboardingOwner,
        repo: config.onboardingLargeClientRepo,
        issue_number: this.state.issueNumber,
        body: temp,
      })
    }

    this.nextStep() // TODO here put the success view at the end of the flow



  }

  createObjectForOtherInfoTemplate() {
    const otherInfo = this.state.otherInfo
    let retObj: any = {}
    for (let info of otherInfo) {
      retObj[info.name] = info.value
    }
    return retObj
  }

  createObjectForCoreInfoTemplate() {
    const coreInfo = this.state.coreInfo
    let retObj: any = {}
    for (let info of coreInfo) {
      if (info.name === 'datacapRequested' || info.name === 'dataCapWeeklyAllocation') {
        retObj[info.name] = info.value + info.measure
      } else {
        retObj[info.name] = info.value
      }
    }
    return retObj
  }

  goToIssue() {
    alert('TODO')
  }






  render() {
    return (
      <div className="formContainer" style={{ minHeight: '100%' }}>
        <Header />
        <div className={guidelines[this.state.view].className}>
          <div className="guideText">{guidelines[this.state.view].title}</div>
          <span style={{ paddingTop: '10px' }}></span>
          <div className="guideText">{guidelines[this.state.view].description}</div>
          <span style={{ paddingTop: '10px' }}></span>
          {this.state.view === 5 && <div className="guideText">
            <a target='_blank' href={guidelines[this.state.view].link}> repo</a>
          </div>}
          <span style={{ paddingTop: '10px' }}></span>
          <div className="guideText">Find more details <a target='_blank' href='https://github.com/filecoin-project/filecoin-plus-large-datasets/blob/main/README.md' >here</a></div>
          {this.state.view === 4 && <div className="guideText">
            <small>Step {this.state.stepViewFour + 2} of 4</small><br></br>
            <small>You can also add those info in the GitHub Issue later</small>
          </div>}

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
                  // await this.checkUserInrepo()
                  this.fetchIssuesAndSelectView()
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
              Select an issue to continue editing or <a style={{ cursor: 'pointer', color: '#0091ff' }} onClick={() => this.setState({ view: 3 })}>create a new issue</a>
            </div>
            <div className='issueBoxContainer'>
              {
                this.state.issueList.map((issue: any, index: any) =>
                  <div
                    key={index}
                    className={'issueBox'}
                    onClick={() => this.continueEditingPreviousIssue(issue)}
                  >
                    {issue.number}  <br />
                    {issue.title}
                  </div>
                )
              }
            </div>
          </div>
        }
        {/* new issue & continue editing */}
        {
          this.state.view === 3 &&
          <div className="content">
            <form >
              {coreInfo.map((item: any, index: any) =>
                <div key={index} >
                  {
                    item.type === 'number' ?
                      <div className='select-slot'>
                        <TextField id={item.name}
                          error={this.state.coreInfo[index].error}
                          required={true}
                          fullWidth={true}
                          label={item.description}
                          name={item.name}
                          variant="filled"
                          size="medium"
                          value={this.state.coreInfo[index].value}
                          type='number'
                          helperText={this.state.coreInfo[index].error ? this.state.coreInfo[index].errorMessage : ''}
                          onChange={(e: any) => this.handleChange(e)} />


                        <Select
                          labelId={item.name + 'dc-label'}
                          error={this.state.coreInfo[index].error}
                          id={item.name}
                          name={item.name}
                          value={this.state.coreInfo[index].measure}
                          onChange={(e: any) => { this.setDatacapMeasure(e) }}
                        >
                          <MenuItem value={'TiB'}>TiB</MenuItem>
                          <MenuItem value={'PiB'}>PiB</MenuItem>
                        </Select>
                      </div> :
                      item.name === 'region' ?
                        <>
                          <InputLabel id="demo-simple-select-label">Select Region</InputLabel>
                          <Select
                            label={item.description}
                            error={this.state.coreInfo[index].error}
                            labelId={item.name + 'dc-label'}
                            fullWidth={true}
                            required={true}
                            id={item.name}
                            name={item.name}
                            value={this.state.coreInfo[index].value || 'Select Region'}
                            onChange={(e: any) => this.handleChange(e)}
                          >
                            {regionOptions.map((item: any) => <MenuItem value={item}>{item}</MenuItem>)}
                          </Select>

                        </>
                        :
                        item.name === 'website' ?
                          <TextField
                            id={item.name}
                            error={this.state.coreInfo[index].error}
                            fullWidth={true}
                            required={true}
                            label={item.description}
                            variant="filled"
                            type='url'
                            size="medium"
                            value={this.state.coreInfo[index].value}
                            onChange={(e: any) => this.handleChange(e)}
                            helperText={this.state.coreInfo[index].error ? this.state.coreInfo[index].errorMessage : ''} />
                          :
                          <TextField
                            id={item.name}
                            error={this.state.coreInfo[index].error}
                            fullWidth={true}
                            required={true}
                            label={item.description}
                            variant="filled"
                            size="medium"
                            value={this.state.coreInfo[index].value}
                            onChange={(e: any) => this.handleChange(e)}
                            helperText={this.state.coreInfo[index].error ? this.state.coreInfo[index].errorMessage : ''} />

                  }

                  <br />
                </div>)}

            </form>
            <div className='otherInfoButtonContainer'>
              <ButtonPrimary onClick={() => this.prevStep()}>Back</ButtonPrimary>
              <span style={{ marginRight: '10px' }}></span>
              <ButtonPrimary onClick={() => this.createUpdateIssue()}>Save Issue and Continue</ButtonPrimary>
            </div>


          </div>
        }
        {/* {
          this.state.view === 5 &&
          <div className="content">
            ciao
          </div>
        } */}
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
                    <textarea onChange={(e) => this.fillTextAreas(item.name, e.target.value)}>{item.value}</textarea>
                  </div>
                )
              }
              {
                !this.state.stepViewFour ? <div className='otherInfoButtonContainer'>
                  {/* {this.state.isNewIssue? */}
                  <ButtonPrimary onClick={() => this.updateIssueAndContinue()}>Save and Continue</ButtonPrimary>
                </div> :
                  (this.state.stepViewFour && this.state.stepViewFour < 2) ?
                    <div className='otherInfoButtonContainer'>
                      <ButtonPrimary onClick={() => this.prevStep()}>Back</ButtonPrimary>
                      <span style={{ marginRight: '10px' }}></span>
                      <ButtonPrimary onClick={() => this.updateIssueAndContinue()}>Next</ButtonPrimary>
                    </div> :
                    this.state.stepViewFour == 2 ?
                      <div className='otherInfoButtonContainer'>
                        <ButtonPrimary onClick={() => this.prevStep()}>Back</ButtonPrimary>
                        <span style={{ marginRight: '10px' }}></span>
                        <ButtonPrimary onClick={() => this.updateIssueAndContinue()}>Submit Issue</ButtonPrimary>
                      </div> :
                      <div className='otherInfoButtonContainer'>
                        <span style={{ marginRight: '10px' }}>The issue is successfully submitted !</span>
                        <ButtonPrimary onClick={() => this.goToIssue()}>Go to issue</ButtonPrimary>
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