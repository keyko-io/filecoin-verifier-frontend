import React from "react";

export const columns: any = [
  {
    name: "Notary Name / Organization",
    selector: (row: any) => row.name ? row.name + " - " + row.organization : row.organization,
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
        <span>Github : {row.github_user}</span>
      </div>
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
