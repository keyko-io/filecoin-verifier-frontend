import React from "react";
import { Verifier } from "../VerifiersData/index";

export const columns: any = [
  {
    name: "Notary Name",
    selector: (row: Verifier) => row.name,
    sortable: true,
  },
  {
    name: "Use Case",
    selector: (row: Verifier) => row.use_case,
    sortable: true,
    cell: (row: Verifier) => <span>{row.use_case.join(", ")}</span>,
  },
  {
    name: "Location",
    selector: (row: Verifier) => row.location,
    sortable: true,
  },
  {
    name: "Contacts",
    selector: (row: Verifier) => [row.fil_slack_id, row.github_user],
    sortable: false,
    cell: (row: Verifier) => (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span>Slack : {row.fil_slack_id}</span>
        <span>Github : {row.github_user}</span>
      </div>
    ),
  },
];
