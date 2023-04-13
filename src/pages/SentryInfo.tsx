import { Grid } from "@mui/material"
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

const Sentry = () => {
  const [infoData, setInfoData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("https://test.verification.rocks/api/v1/sentry")
      .then((res) => res.json())
      .then((data) => {
        const filteredData = data.filter((item: any) =>
          neededTitles.includes(item.title)
        )
        setIsLoading(false)
        setInfoData(filteredData)
      })
      .catch((error) => console.log(error))
  }, [])

  return (
    <div
      style={{
        maxWidth: "1400px",
        padding: "0 20px",
        margin: "12rem auto",
      }}
    >
      <h4
        style={{ textAlign: "center", marginBottom: "6rem", fontSize: "36px" }}
      >
        FILECOIN PLUS DATA METRICS
      </h4>
      {isLoading ? (
        <div style={{ textAlign: "center", minHeight: "30rem" }}>
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
