import React from "react"
import { historyDataType } from "../types"

type HistoryInfoProps = {
  data: historyDataType
}

const HistoryInfo = ({ data }: HistoryInfoProps) => {
  return (
    <a
      href={data.comment.html_url}
      target="_blank"
      rel="noreferrer"
      style={{ textDecoration: "none" }}
      key={data.comment.id}
    >
      <div style={{ paddingBottom: "10px" }}>
        <span style={{ color: data.color }}>{data.commentType}</span>
        <span
          style={{
            paddingLeft: "10px",
            paddingRight: "10px",
            color: "black",
          }}
        >
          &gt;
        </span>
      </div>
    </a>
  )
}

export default HistoryInfo
