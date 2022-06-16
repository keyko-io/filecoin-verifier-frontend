import React from "react";


export const columns: any = [
  {
    name: "Notary Name",
    selector: (row: any) => row.name,
    sortable: true,
  },
  {
    name: "Use Case",
    selector: (row: any) => row.use_case,
    sortable: true,
    cell: (row: any) => <span>{row.use_case.join(", ")}</span>,
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
];
