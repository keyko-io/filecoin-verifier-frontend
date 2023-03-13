import { Notary } from "../Verifiers";

export const columns : any = [
  {
    name: "Organization / Notary Name",
    selector: (row: Notary) => row.name ? row.organization + " - " + row.name : row.organization,
    sortable: true,
  },
  {
    name: "Location",
    selector: (row: Notary) => row.location,
    sortable: true,
  },
  {
    name: "Contacts",
    selector: (row: Notary) => [row.fil_slack_id, row.github_user],
    sortable: false,
    cell: (row: Notary) => (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span>Slack : {row.fil_slack_id}</span>
        {row.github_user.map((item) => (
          item && <span key={item} style={{ marginRight: "10px" }}> Github : {item}</span>
        ))
        }
      </div >
    ),
  },
  {
    name: "Use Case",
    selector: (row: Notary) => row.use_case,
    sortable: true,
    grow: 2,
    wrap: true
  }
];
