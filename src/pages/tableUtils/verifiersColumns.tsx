import React from "react";

export const columns: any = [
  {
    name: "Organization / Notary Name",
    selector: (row: any) => row.name ? row.organization + " - " + row.name : row.organization,
    sortable: true,
  },
  {
    name: "Location",
    selector: (row: any) => row.location,
    sortable: true,
  },
  {
    name: "Contacts",
    selector: (row: any) => [row.fil_slack_id, row.github_user],
    sortable: false,
    cell: (row: any) => (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span>Slack : {row.fil_slack_id}</span>
        {row.github_user.map((item: any, i: any) => (
          item && <span key={item} style={{ marginRight: "10px" }}> Github : {item}</span>
        ))
        }
      </div >
    ),
  },
  {
    name: "Use Case",
    selector: (row: any) => row.use_case,
    sortable: true,
    grow: 2,
    wrap: true
  }
];
