import React, { useEffect, useState } from 'react';
// @ts-ignore
import Welcome from '../components/Welcome/Welcome'
import { TextField, Button, CircularProgress } from '@material-ui/core';
import { config } from '../config'
import SearchIcon from '@mui/icons-material/Search';
import history from '../context/History';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

type LogsItem = {
  ID: string,
  actionKeyword: string,
  dateTimestamp: string,
  issue_number: string,
  message: string,
  repo: string
  type: string
}


const NOTARY_PREFIX_URL = `https://github.com/${config.onboardingOwner}/${config.onboardingNotaryOwner}/issues/`
const LDN_PREFIX_URL = `https://github.com/${config.onboardingOwner}/${config.onboardingLargeClientRepo}/issues/`

const LogExplorer = () => {

  const onTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  useEffect(() => {
    onTop()
  }, []);

  const [issueNumber, setIssueNumber] = useState("")
  const [srchButtonDisabled, setSrchButtonDisabled] = useState(false)
  const [maxLogsNumber, setMaxLogsNumber] = useState(10)
  const [searchText, setSearchText] = useState("")
  const [date, setDate] = useState("")
  const [logs, setLogs] = useState<LogsItem[]>([])
  const [sortBy, setSortBy] = useState("dateTimestamp")
  const [isLogsLoading, setIsLogsLoading] = useState(false)
  const [isSearched, setIsSearched] = useState(false)

  const columns = [
    { key: "dateTimestamp", name: "Date", width: "98px" },
    { key: "type", name: "Type" },
    { key: "repo", name: "Phase" },
    { key: "actionKeyword", name: "Action" },
    { key: "message", name: "Message" },
    { key: "issue_number", name: "Issue Number" },
  ]

  useEffect(() => {
    if (history.location.search.split("=")[1]) {
      selectIssueNumber(history.location.search.split("=")[1])
      setIsSearched(true)
    }

    if (!history.location.search) {
      setIsSearched(false)
    }
  }, [])

  const inputIssueNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIssueNumber(e.target.value)
  }

  const fetchLogs = async (issue_number: string) => {
    try {
      const res = (
        await fetch(
          "https://cbqluey8wa.execute-api.us-east-1.amazonaws.com/dev",
          {
            headers: { "x-api-key": config.loggerApiKey },
            method: "POST",
            body: JSON.stringify({
              type: "GET_LOGS",
              searchType: "issue_number",
              operation: "=",
              search: issue_number,
            }),
          }
        )
      ).json();
      return res;
    } catch (error) {
      console.log(error);
    }
  }

  const selectIssueNumber = async (issueNumberId?: string) => {
    setIsLogsLoading(true)
    setLogs([])
    setMaxLogsNumber(10)
    try {
      setSrchButtonDisabled(true)
      const res = issueNumberId ? await fetchLogs(issueNumberId) : await fetchLogs(issueNumber)
      setLogs(formatItems(res.items))
      setSrchButtonDisabled(false)
      setIsLogsLoading(false)
      setIsSearched(true)
      history.push({
        search: `?search=${issueNumberId ? issueNumberId : issueNumber}`
      })
    } catch (error) {
      setIsLogsLoading(false)
      console.log(error)
    }
  }

  const formatItems = (items: LogsItem[]) => {
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
    return newItemsArray.sort((a, b) => new Date(b[sortBy]).valueOf() - new Date(a[sortBy]).valueOf())
  }

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
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)} />
              <div style={{ padding: "0 6px" }}>
                <TextField
                  id="date"
                  label="select date"
                  type="date"
                  value={date}
                  size="medium"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <form style={{ display: "flex" }}>
                <TextField id="issue-number-id"
                  label="Search Issue Number"
                  variant="filled"
                  size="small"
                  onChange={inputIssueNumber}
                  className="inputRounded-2"
                  type="number"
                />

                <Button
                  disabled={issueNumber === "" ? true : srchButtonDisabled}
                  size="small"
                  endIcon={!isLogsLoading && <SearchIcon />}
                  onClick={(e) => {
                    e.preventDefault()
                    selectIssueNumber()
                  }}
                  type="submit"
                  variant="contained"
                  color="primary"
                  style={{
                    backgroundColor: isLogsLoading ? "#3f51b5" : "", borderLeft: issueNumber === "" ? "1px solid #111212" : "", borderTopLeftRadius: "0", borderBottomLeftRadius: "0", height: "45.63px", width: "155px", fontWeight: "bold", boxSizing: "border-box"
                  }}
                > {isLogsLoading ? <CircularProgress style={{ color: "white", height: "18px", width: " 18px" }} /> : "Search Logs"}
                </Button>
              </form>
            </div>
          </div>

          <div className="verifiers">
            <div className="tableverifiers">
              <table>
                <thead style={{ textAlign: "center" }}>
                  <tr>
                    {
                      columns.map((column, i) =>
                        <td key={i}>{column.name} </td>
                      )}
                  </tr>
                </thead>
                <tbody>
                  {
                    logs
                      .filter((item) => item.message.match(new RegExp(searchText, "gi")) || item.repo.match(new RegExp(searchText, "gi")))
                      .filter((item) => date ? new Date(item.dateTimestamp).toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }) === date : true)
                      .slice(0, maxLogsNumber)
                      .map((item, i) =>
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
                    {!isLogsLoading ? <td colSpan={7}>
                      {logs.length ?
                        <Button
                          size="small"
                          onClick={() => setMaxLogsNumber(prev => prev + 5)}
                          variant="outlined"
                          color="primary"
                        >Load more logs
                        </Button> : (isSearched ? <div>No logs found for this issue number</div> : <div>Select issue number and search</div>)
                      }
                    </td> : <td colSpan={7}>
                      {<div>Loading...</div>}
                    </td>}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "30px" }}>
        <div className='gotoTopLogs' onClick={onTop}><KeyboardArrowUpIcon style={{ fontSize: "60px" }} /></div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", margin: "30px", fontSize: "16px" }}>
        Click the arrow to go to the top of the page.
      </div>
    </div >
  );
}

export default LogExplorer;