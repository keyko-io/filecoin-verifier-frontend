import { Grid, MenuItem, TextField } from "@mui/material"
import InfoCard from "../components/InfoCard"
import { useEffect, useState } from "react"

const neededTitles = [
  "Request Proposed",
  "Request Approved",
  "Github Login Success",
  "Ledger Login Successful",
  "Loaded Github Token Successfully",
  "User Logged Out Github",
]

const range = [
  {
    value: '14d',
    label : "last 14 days"
  },
  {
    value: '24h',
    label : "last 24 hours"
  },
];

const Sentry = () => {
  const [infoData, setInfoData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("14d")

  useEffect(() => {
    fetch(` https://test.verification.rocks/api/v1/sentry?statsPeriod=${searchQuery}`)
      .then((res) => res.json())
      .then((data) => {
        const filteredData = data.filter((item: any) => 
           neededTitles.includes(item.title)
        )

        for(let metrics of filteredData){
          let sum = metrics.stats[searchQuery].reduce((total : any, current : any) => total + current[1], 0);
          metrics.stats = sum
        }

        setIsLoading(false)
        setInfoData(filteredData)
      })
      .catch((error) => console.log(error))
  }, [searchQuery])

  return (
    <div
      style={{
        width: "1400px",
        padding: "0 20px",
        margin: "10rem auto",
      }}
    >
      <h4
        style={{ textAlign: "center", marginBottom: "6rem", fontSize: "36px" }}
      >
        FILECOIN PLUS DATA METRICS
      </h4>
      <TextField
          id="outlined-select-currency"
          select
          label="Select time range"
          value={searchQuery}
          sx={{mb : "2rem", minWidth : "14rem"}}
          onChange={e => setSearchQuery(e.target.value)}
        >
          {range.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      {isLoading ? (
        <div style={{ textAlign: "center", minHeight: "30rem", width: "100%" }}>
          Loading metrics...{" "}
        </div>
      ) : (
        <Grid container spacing={2}>
          {infoData.map((infoItem: any) => (
            <InfoCard info={infoItem} />
          ))}
        </Grid>
      )}
    </div>
  )
}

export default Sentry
