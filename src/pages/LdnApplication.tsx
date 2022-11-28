import React, { Component } from 'react';
import 'react-dropdown/style.css';
import { TextField, Select, MenuItem, InputLabel, Button, Breadcrumbs, Link, FormControl } from '@material-ui/core';

// @ts-ignore
import LoginGithub from 'react-login-github';
import { Data } from '../context/Data/Index';
import { config } from '../config';
import { createParentComment, updateTemplate } from './issueUtils/templates';
import { coreInfo, otherInfo, guidelines, regionOptions, labelsIssueCreation, steps, URL_README } from './issueUtils/constants';


const utils = require('@keyko-io/filecoin-verifier-tools/utils/large-issue-parser')

//view 0: log in with github 
//view 1: choose between create a new issue or continue a previous
//view 3: core info of the issue
//view 4: other info of the issue (3 sub-view 'stepViewFour')
//view 2: (not implemented) reconnect a previous issue to keep the allocation flow going

type LdnApplicationProps = {
  location?: {
    state: any
  }
};


class LdnApplication extends Component<LdnApplicationProps> {
  public static contextType : typeof Data = Data


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
    addressList: [] as string[],
    isIssueComplete: false
  }




  async componentDidMount() {
    await this.context.github.checkToken()
    if (!this.context.github.githubLogged) {
      this.setState({ view: 0 })
      return
    }

    await this.fetchIssuesAndSelectView()

    if (this.props.location?.state) {
      const { organization, website, address, region } = this.props.location.state
      const newCoreInfo = [...coreInfo]
      newCoreInfo[1].value = organization
      newCoreInfo[2].value = region
      newCoreInfo[3].value = website
      newCoreInfo[6].value = address
      this.setState({ coreInfo: [...newCoreInfo] })
    }
  }


  async fetchIssuesAndSelectView() {
    // fetch issues to get addresses

    const issues = (await this.context.github.githubOcto.issues.list(
      {
        filter: 'created',
        labels: [labelsIssueCreation.WIP_ISSUE]
      }
    )).data


    let addressList = []
    for (let issue of issues) {
      const psiAddress = utils.parseIssue(issue.body).address
      addressList.push(psiAddress)
    }
    this.setState({
      addressList,
      issueList: issues,
      view: issues.length ? 1 : 3
    })
  }

  continueEditingPreviousIssue(issue: any) {

    const parsedIssue = utils.parseIssue(issue.body)
    //console.log(parsedIssue)
    this.setState({ view: 3, issue: issue, isNewIssue: false })
    for (let [k, v] of Object.entries(parsedIssue)) {
      const value = v as string
      if (k === 'datacapRequested' || k === 'dataCapWeeklyAllocation') {
        const rgNmbers = /[0-9]/g
        const rgLetters = /[A-Za-z]/g
        const amount = value.match(rgNmbers)?.join('')
        const measure = value.match(rgLetters)?.join('')
        this.updateCoreInfoContent(k, amount as string)
        this.setDatacapMeasure(null, k, measure)
      }
      else if (k !== 'correct' && k && v) {
        //console.log(k, v)
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

  setDatacapMeasure(e?: any, name?: any, value?: any) {
    if (e) {
      this.updateCoreInfoContent(e.target.name, e.target.value, true)
    } else {
      this.updateCoreInfoContent(name, value, true)

    }
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


  validateDatacapAndAddress(coreInfo: any, name: any, value: any, elementToUpdateIndex: any) {
    let hasError = false

    if (coreInfo[elementToUpdateIndex].value !== "") {
      if (value === 'PiB' && Number(coreInfo[elementToUpdateIndex].value) > 5) {

        hasError = true
        coreInfo[elementToUpdateIndex].errorMessage = 'You can ask max 5 PiB'
      }
      if (value === 'TiB' && coreInfo[elementToUpdateIndex].value.length > 3) {
        hasError = true
        coreInfo[elementToUpdateIndex].errorMessage = 'You can ask max 999 TiB'
      }
      if (coreInfo[elementToUpdateIndex].measure === 'PiB' && Number(value) > 5) {
        hasError = true
        coreInfo[elementToUpdateIndex].errorMessage = 'You can ask max 5 PiB '
      }
      if (coreInfo[elementToUpdateIndex].measure === 'TiB' && value.length > 3) {
        hasError = true
        coreInfo[elementToUpdateIndex].errorMessage = 'You can ask max 999 TiB'
      }

      if (coreInfo[elementToUpdateIndex].name === "address" && (coreInfo[elementToUpdateIndex].value.substring(0, 2) !== "f1" && coreInfo[elementToUpdateIndex].value.substring(0, 2) !== "f3")) {
        hasError = true
        coreInfo[elementToUpdateIndex].errorMessage = 'address has to start with f1 or f3'
      }

    }
    return hasError
  }

  updateCoreInfoContent(name: any, value: string, isMeasure?: boolean) {
    let coreInfo = this.state.coreInfo
    let hasError = false
    const elementToUpdateIndex: any = coreInfo.findIndex((info: any) => info.name === name)
    if (coreInfo[elementToUpdateIndex]) {
      if (isMeasure || coreInfo[elementToUpdateIndex].type === 'number' || coreInfo[elementToUpdateIndex].name === "address")
        hasError = this.validateDatacapAndAddress(coreInfo, name, value, elementToUpdateIndex)
      if (isMeasure) {
        coreInfo[elementToUpdateIndex].measure = value
        coreInfo[elementToUpdateIndex].error = hasError
      } else {
        coreInfo[elementToUpdateIndex].value = value
        coreInfo[elementToUpdateIndex].error = hasError
      }
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
      this.setState({ isNewIssue: false })

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
      labels: [labelsIssueCreation.WIP_ISSUE]
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

  isIssueCompleted() {
    let isComplete = true
    for (let [key, entry] of Object.entries(this.createObjectForOtherInfoTemplate())) {
      if (entry === "Please answer here." || entry === "") {
        isComplete = false
      }
    }
    this.setState({ isComplete })
    return isComplete
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
        labels: this.isIssueCompleted() ? [labelsIssueCreation.ISSUE_COMPLETED] : [labelsIssueCreation.WIP_ISSUE]
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

    this.nextStep()
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


  render() {
    return (
      <div className={this.state.view === 4 ? "viewFourContainer" : "formContainer"} >
        {/* <div className="guideline-container"> */}
        <div style={{ maxWidth: this.state.view === 5 ? "30%" : "" }} className={guidelines[this.state.view].className}>
          <div className="guideText">{guidelines[this.state.view].title}</div>
          <span style={{ paddingTop: '10px' }}></span>
          <div className="guideText">{guidelines[this.state.view].description}</div>
          <span style={{ paddingTop: '10px' }}></span>
          {
            this.state.view === 5 &&
            <div className="guideText">
              <a target='_blank' rel="noopener noreferrer" href={guidelines[this.state.view].link + "/" + this.state.issueNumber}> repo</a>
            </div>
          }
          {
            (this.state.view === 5 && !this.state.isIssueComplete) &&
            <div className="guideText">
              The issue is still incomplete, you can complete it later.
            </div>
          }
          <span style={{ paddingTop: '10px' }}></span>
          <div className="guideText">Find more details <a target='_blank' rel="noopener noreferrer" href={URL_README} >here</a></div>
          {this.state.view === 4 && <div className="guideText">
            <small>Step {this.state.stepViewFour + 2} of 4</small><br></br>
            <small>These questions can be answered here or by editing the GitHub Issue for your application.</small>
          </div>}
        </div>
        {
          (this.state.view !== 3 && this.state.view !== 1 && this.state.view !== 0) &&
          <>
            <Breadcrumbs aria-label="breadcrumb" style={{ cursor: 'pointer', paddingTop: '2%' }}>
              {steps.map((item: any, index: any) =>
                <Link key={index} color="inherit" onClick={() => this.setState({ view: item === 'Main Info' ? 3 : 4, stepViewFour: item === 'Main Info' ? 0 : index - 1 })}>
                  {item}
                </Link>
              )}
            </Breadcrumbs>
          </>
        }
        {/* login */}
        {!this.state.view ?
          <div className="content">
            <div id="githublogin" className="githubrequest">
              <LoginGithub
                redirectUri={config.oauthUri}
                clientId={config.githubApp}
                scope="repo"
                onSuccess={async (response: any) => {
                  try {
                    await this.context.github.loginGithub(response.code, true)
                    this.setState({ loggedUser: this.context.github.loggedUser })
                    this.fetchIssuesAndSelectView()
                  } catch (error) {
                    console.log("this is ", error)
                  }
                }}
                onFailure={(response: any) => {
                  console.log('login failure', response)
                }}
              />
            </div>
          </div>
          : null
        }
        {/* select issue */}
        {
          this.state.view === 1 &&
          <div className="content">
            <div className='titleIssueBox'>
              Select an issue to continue editing or <a style={{ cursor: 'pointer', color: '#0091ff' }} onClick={() => this.setState({ view: 3, isNewIssue: true })}>create a new issue</a>
            </div>
            <div className='issueBoxContainer'>
              {
                this.state.issueList.map((issue: any, index: any) =>
                  <div
                    key={index}
                    className={'issueBox'}
                    onClick={() => this.continueEditingPreviousIssue(issue)}
                  >
                    <p>#{issue.number}</p>
                    <p>{issue.title}</p>
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
                <div key={index} style={{ marginBottom: "12px" }} >
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
                          onChange={(e: any) => this.handleChange(e)}
                        />


                        <Select
                          style={{ minWidth: "70px", background: "rgba(0, 0, 0, 0.09)", borderLeft: "1.5px solid black", borderTopRightRadius: "4px" }}
                          labelId={item.name + 'dc-label'}
                          error={this.state.coreInfo[index].error}
                          id={item.name}
                          name={item.name}
                          value={this.state.coreInfo[index].measure}
                          onChange={(e: any) => { this.setDatacapMeasure(e) }}
                        >
                          <MenuItem value={'TiB'}>TiB </MenuItem>
                          <MenuItem value={'PiB'}>PiB </MenuItem>
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
                            {regionOptions.map((item: any, index: any) => <MenuItem key={index} value={item}>{item}</MenuItem>)}
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
              {!this.state.isNewIssue && <Button variant="contained" color="primary" onClick={() => this.prevStep()}>Back</Button>}
              <span style={{ marginRight: '10px' }}></span>
              <Button style={{ float: "right" }} variant="contained" color="primary" onClick={() => this.createUpdateIssue()}>Save Issue and Continue</Button>
            </div>
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
                    <textarea onChange={(e) => this.fillTextAreas(item.name, e.target.value)}>{item.value}</textarea>
                  </div>
                )
              }
              {
                !this.state.stepViewFour ? <div className='otherInfoButtonContainer'>
                  <Button variant="contained" color="primary" onClick={() => this.updateIssueAndContinue()}>Save and Continue</Button>
                </div> :
                  (this.state.stepViewFour && this.state.stepViewFour < 2) ?
                    <div className='otherInfoButtonContainer'>
                      <Button variant="contained" color="primary" onClick={() => this.prevStep()}>Back</Button>
                      <span style={{ marginRight: '10px' }}></span>
                      <Button variant="contained" color="primary" onClick={() => this.updateIssueAndContinue()}>Next</Button>
                    </div> :
                    this.state.stepViewFour === 2 &&
                    <div className='otherInfoButtonContainer'>
                      <Button variant="contained" color="primary" onClick={() => this.prevStep()}>Back</Button>
                      <span style={{ marginRight: '10px' }}></span>
                      <Button variant="contained" color="primary" onClick={() => this.updateIssueAndContinue()}>{otherInfo.some(item => item.value === "") ? "Save Draft" : "Submit Issue"}</Button>

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