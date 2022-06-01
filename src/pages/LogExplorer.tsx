import React, { Component } from 'react';
// @ts-ignore
import Welcome from '../components/Welcome'
import { TextField, Button, CircularProgress } from '@material-ui/core';
import { Data } from '../context/Data/Index'
import { config } from '../config'
import SearchIcon from '@mui/icons-material/Search';



const NOTARY_PREFIX_URL = `https://github.com/${config.onboardingOwner}/${config.onboardingNotaryOwner}/issues/`
const LDN_PREFIX_URL = `https://github.com/${config.onboardingOwner}/${config.onboardingLargeClientRepo}/issues/`

class LogExplorer extends Component<{}> {
  public static contextType = Data

  state = {
    issue_number: "",
    srchButtonDisabled: false,
    maxLogsNumber: 10,
    searchText: "",
    date: "",
    logs: [],
    sortBy: "dateTimestamp",
    isLogsLoading: false,
  }

  columns = [
    { key: "dateTimestamp", name: "Date", width: "98px" },
    { key: "type", name: "Type" },
    { key: "repo", name: "Phase" },
    { key: "actionKeyword", name: "Action" },
    { key: "message", name: "Message" },
    { key: "issue_number", name: "Issue Number" },
  ]




  async componentDidMount() {
  }

  resetState() {
    this.setState({
      issue_number: "",
      maxLogsNumber: 10,
      searchText: "",
      date: "",
    })
  }

  ableDisableSrchButton() {
    if (!this.state.srchButtonDisabled) this.setState({ srchButtonDisabled: true })
    if (this.state.srchButtonDisabled) this.setState({ srchButtonDisabled: false })
  }

  inputIssueNumber(e: any) {
    this.setState({ issue_number: e.target.value })

  }

  async selectIssueNumber() {
    this.setState({ ...this.state, isLogsLoading: true, logs: [], maxLogsNumber: 10 })
    try {
      this.ableDisableSrchButton() // disable
      const res = await this.context.fetchLogs(this.state.issue_number)
      this.setState({ logs: this.formatItems(res.items) })
      this.ableDisableSrchButton() // enable
      this.setState({ isLogsLoading: false })
    } catch (error) {
      this.ableDisableSrchButton()
      this.setState({ isLogsLoading: false })
      console.log(error)
    }
  }

  formatItems(items: any[]) {
    const newItemsArray = []
    for (let item of items) {
      let obj: any = {}
      for (const [key, value] of Object.entries(item)) {
        for (const [keyx, valuex] of Object.entries(value as string)) {
          obj[key] = valuex
        }
      }
      newItemsArray.push(obj)
    }
    return newItemsArray.sort((a: any, b: any) => new Date(b[this.state.sortBy]).valueOf() - new Date(a[this.state.sortBy]).valueOf())
  }

  loadMoreLogs() {
    this.setState({ maxLogsNumber: this.state.maxLogsNumber + 5 })
  }

  searchText(e: any) {
    this.setState({
      searchText: e.target.value
    })
    console.log(this.state.searchText)
  }

  setDate(e: any) {
    console.log("data", e.target.value)
    this.setState({ date: e.target.value }, () => console.log(this.state.date))

  }

  render() {
    return (
      <div className="landing">
        <div className="container">
          <Welcome
            title="Welcome to the Filecoin Log Explorer"
            description="Select issue number to see the logs"
          />
          <div className="wrapperverifiers">
            <div className="tableselects">
              <div className="tabletitle">
                <div className="title">Select issue number to show corresponding logs <br /> <span style={{ fontWeight: "normal", fontSize: "14px" }}> - type 0 to see general logs</span> </div>

                <TextField
                  className="inputRounded-1"
                  id="filled-basic"
                  label="Search Detail"
                  variant="filled"
                  size="small"
                  value={this.state.searchText}
                  onChange={(e) => this.searchText(e)} />
                <div style={{ padding: "0 6px" }}>
                  <TextField
                    id="date"
                    label="select date"
                    type="date"
                    value={this.state.date}
                    size="medium"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    onChange={(e) => this.setDate(e)}
                  />
                </div>
                <TextField id="issue-number-id"
                  label="Search Issue Number"
                  variant="filled"
                  size="small"
                  onChange={(e) => this.inputIssueNumber(e)}
                  className="inputRounded-2"
                />
                <Button
                  disabled={this.state.issue_number === "" ? true : this.state.srchButtonDisabled}
                  size="small"
                  endIcon={!this.state.isLogsLoading && <SearchIcon />}
                  onClick={() => this.selectIssueNumber()}
                  variant="contained"
                  color="primary"
                  style={{
                    backgroundColor: this.state.isLogsLoading ? "#3f51b5" : "", borderLeft: this.state.issue_number === "" ? "1px solid #111212" : "", borderTopLeftRadius: "0", borderBottomLeftRadius: "0", height: "45.63px", width: "155px", fontWeight: "bold", boxSizing: "border-box"
                  }}
                > {this.state.isLogsLoading ? <CircularProgress style={{ color: "white", height: "18px", width: " 18px" }} /> : "Search Logs"}
                </Button>

              </div>
            </div>

            <div className="verifiers">
              <div className="tableverifiers">
                <table>
                  <thead style={{ textAlign: "center" }}>
                    <tr>
                      {
                        this.columns.map((column: any, i: any) =>
                          <td key={i}>{column.name} </td>
                        )}
                    </tr>
                  </thead>
                  <tbody>
                    {
                      this.state.logs
                        .filter((item: any, i: any) => item.message.match(new RegExp(this.state.searchText, "gi")) || item.repo.match(new RegExp(this.state.searchText, "gi")))
                        .filter((item: any, i: any) => this.state.date ? new Date(item.dateTimestamp).toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }) === this.state.date : true)
                        .slice(0, this.state.maxLogsNumber)
                        .map((item: any, i: any) =>
                          <tr key={i} style={{ textAlign: "center" }}>
                            <td >{new Date(item.dateTimestamp).toLocaleDateString()} {new Date(item.dateTimestamp).toLocaleTimeString()} </td>
                            <td >{item.type} </td>
                            <td >{item.repo} </td>
                            <td >{item.actionKeyword} </td>
                            <td >{item.message} </td>
                            {
                              item.repo === "RKH-SIGN" ?
                                <td ><a target="_blank" rel="noopener noreferrer" href={NOTARY_PREFIX_URL.concat(item.issue_number)}>#{item.issue_number}</a> </td> :
                                <td ><a target="_blank" rel="noopener noreferrer" href={LDN_PREFIX_URL.concat(item.issue_number)}>#{item.issue_number}</a> </td>
                            }
                          </tr>
                        )}
                    <tr style={{ textAlign: "center" }}>
                      <td colSpan={7}>
                        {this.state.isLogsLoading ? <div>Loading...</div> :
                          <Button
                            disabled={this.state.srchButtonDisabled}
                            size="small"
                            onClick={() => this.loadMoreLogs()}
                            variant="outlined"
                            color="primary"
                          >Load more logs
                          </Button>
                        }
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default LogExplorer;