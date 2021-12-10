import React, { Component, useState } from 'react';
// @ts-ignore
import { ButtonPrimary, Input, select } from "slate-react-system";
import Welcome from '../components/Welcome'
import Header from '../components/Header';
import testLogs from '../data/test-logs.json'
import { Select, MenuItem, TextField } from '@material-ui/core';
import { Data } from '../context/Data/Index'


class LogExplorer extends Component<{}> {
  public static contextType = Data

  state = {
    issue_number: 94,
    maxLogsNumber: 5,
    searchText: "",
    date: ""
  }

  columns = [
    { key: "date", name: "Date", width: "98px" },
    { key: "message", name: "message" },
    { key: "type", name: "Type" },
    { key: "issue_number", name: "Issue Number" },
  ]


  async componentDidMount(){
    console.log("loggggggg", await this.fetchLogs())
  }

  fetchLogs = async () => {
    return await fetch("https://cbqluey8wa.execute-api.us-east-1.amazonaws.com/dev",
    {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify({
        "type": "GET_LOGS",
        "searchType": "issue_number",
        "operation": "=",
        "search": "359"
      }) // body data type must match "Content-Type" header
    })
      
  };


  resetState(){
    this.setState({
      issue_number: 94,
      maxLogsNumber: 5,
      searchText: "",
      date: ""
    })
  }

  selectIssueNumber(e: any) {
    this.resetState()
    this.setState({ 
      issue_number: e.target.value,
     })
  }

  loadMoreLogs() {
    this.setState({ maxLogsNumber: this.state.maxLogsNumber + 5 })
  }

  searchText(e: any) {
    this.setState({
      searchText: e.target.value
    })
  }

  setDate(e: any) {
    console.log(e.target.value)
    this.setState({ date: e.target.value })
    console.log(this.state.date)
  }

  render() {
    return (
      <div className="landing">
        <Header />
        <div className="container">
          <Welcome
            title="Welcome to the Filecoin Log Explorer"
            description="Select issue number to see the logs"
          />
          <div className="wrapperverifiers">
            <div className="tableselects">
              <div className="tabletitle">
                <div className="title">Select issue number to show corresponding logs</div>
                <div className="searchMakeReuestForm doublebutton"></div>
                <Select
                  labelId="demo-simple-select-label"
                  autoWidth
                  value={this.state.issue_number}
                  onClick={(e) => {
                    this.selectIssueNumber(e)
                  }}
                >
                  {
                    testLogs.map((item) => item.issue_number)
                      .filter((item, i, arr) => arr.indexOf(item) === i)
                      .map((numb: any, i: any) => <MenuItem key={i} value={numb}>Issue #{numb}</MenuItem>)
                  }
                </Select>
                <TextField id="filled-basic" 
                label="search" 
                variant="filled" 
                size="small" 
                value={this.state.searchText}
                onChange={(e) => this.searchText(e)} />
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
            </div>

            <div className="verifiers verifierview">
              <div className="tableverifiers verifierview">
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
                      testLogs
                        .filter((item: any, i: any) => item.issue_number === this.state.issue_number)
                        .filter((item: any, i: any) => item.message.includes(this.state.searchText))
                        .filter((item: any, i: any) => this.state.date ? item.dateTimestamp == this.state.date : true)
                        .slice(0, this.state.maxLogsNumber)
                        .map((item: any, i: any) =>
                          <tr key={i} style={{ textAlign: "center" }}>
                            <td >{item.dateTimestamp} </td>
                            <td >{item.message} </td>
                            <td >{item.type} </td>
                            <td >{item.issue_number} </td>
                          </tr>
                        )}
                    <tr style={{ textAlign: "center" }}>
                      <td colSpan={4}>
                        <ButtonPrimary onClick={() => this.loadMoreLogs()}>Load More logs</ButtonPrimary>
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