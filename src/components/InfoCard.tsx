import { Grid, Tooltip } from "@mui/material"
import plane from "../svg/plane.png"

type InfoType = {
  title: string
  count: string
  usetCount: number
  stats: number
  order: number
  tooltip: string
}

type InfoCardProps = {
  info: InfoType
}

const InfoCard = ({ info }: InfoCardProps) => {
  return (
    <Grid item xs={4}>
      <Tooltip title={info.tooltip}>


        <div
          style={{
            border: "1px solid #E2E8F0",
            borderRadius: "10px",
            boxShadow: "0px 10px 15px -3px rgba(15,23,42,.05)",
            padding: "36px",
          }}
        >
          <img src={plane} alt="" style={{ height: "30px" }} />
          <div
            style={{
              fontSize: "20px",
              marginTop: "10px",
              marginBottom: "10px",
              color: "#707070",
            }}
          >
            {info.title}
          </div>
          <p style={{ fontSize: "36px" }}>{info.stats}</p>
        </div>
      </Tooltip>
    </Grid>
  )
}

export default InfoCard
