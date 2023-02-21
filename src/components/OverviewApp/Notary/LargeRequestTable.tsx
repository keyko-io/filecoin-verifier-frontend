import { ldnParser } from "@keyko-io/filecoin-verifier-tools";
import { CircularProgress } from "@material-ui/core";
import { useContext, useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { config } from "../../../config";
import { Data } from "../../../context/Data/Index";
import { LargeRequestData } from "../../../type";

export const largeReqColumns = [
  {
    name: "Client",
    selector: (row: any) => row.name,
    sortable: true,
    grow: 1.2,
    wrap: true,
  },
  {
    name: "Address",
    selector: (row: LargeRequestData) => row.address,
    sortable: true,
    cell: (row: LargeRequestData) => (
      <div>{`${row.address.substring(0, 9)}...${row.address.substring(
        row.address.length - 9,
        row.address.length
      )}`}</div>
    ),
  },
  {
    name: "Multisig",
    selector: (row: LargeRequestData) => row.multisig,
    sortable: true,
    grow: 0.5,
  },
  {
    name: "Datacap",
    selector: (row: LargeRequestData) => row.datacap,
    sortable: true,
    grow: 0.5,
  },
  {
    name: "Audit Trail",
    selector: (row: LargeRequestData) => row.issue_number,
    sortable: true,
    grow: 0.5,
    cell: (row: LargeRequestData) => (
      <a target="_blank" rel="noopener noreferrer" href={row.url}>
        #{row.issue_number}
      </a>
    ),
  },
  {
    name: "Proposer",
    selector: (row: LargeRequestData) => row.proposer.signerGitHandle,
    sortable: true,
    cell: (row: LargeRequestData) => (
      <span>{row?.proposer?.signerGitHandle || "-"}</span>
    ),
    grow: 0.5,
  },
  {
    name: "TxId",
    selector: (row: LargeRequestData) => row?.tx?.id,
    grow: 0.5,
  },
  {
    name: "Approvals",
    selector: (row: LargeRequestData) => row.approvals,
    sortable: true,
    grow: 0.5,
  },
];

const LargeRequestTable = () => {
  const context = useContext(Data);

  const [data, setData] = useState<any>([]);

  const deneme = async () => {
    const { data } = await context.github.githubOcto.issues.listForRepo({
      owner: config.onboardingLargeOwner,
      repo: config.onboardingLargeClientRepo,
      state: "open",
      labels: "bot:readyToSign",
      page: 1,
      per_page: 10,
    });

    const parsedIssueData: any = [];

    const cachedAddress: any = {};

    for (let issue of data) {
      const parsed = ldnParser.parseIssue(issue.body);

      const comments = await context.github.githubOcto.paginate(
        context.github.githubOcto.issues.listComments,
        {
          owner: config.onboardingLargeOwner,
          repo: config.onboardingLargeClientRepo,
          issue_number: issue.number,
        }
      );

      const comment = comments
        .reverse()
        .find((comment: any) =>
          comment.body.includes("## DataCap Allocation requested")
        );

      const commentParsed = ldnParser.parseReleaseRequest(comment.body);

      // let pendingTxs;
      // // @ts-ignore
      // if (!cachedAddress.notaryAddress) {
      //   pendingTxs = await context.wallet.api.pendingTransactions(
      //     commentParsed.notaryAddress
      //   );

      //   cachedAddress.notaryAddress = pendingTxs;
      // } else {
      //   pendingTxs = cachedAddress.notaryAddress;
      //   console.log("hey hey");
      // }

      parsedIssueData.push({
        ...parsed,
        issue_number: issue.number,
        url: issue.html_url,
        comments,
        multisig: commentParsed.notaryAddress,
        datacap: commentParsed.allocationDatacap,
        proposer: null,
        tx: null,
        approvals: null,
      });
    }

    setData(parsedIssueData);
  };

  useEffect(() => {
    //deneme();
    context.getLDNIssuesAndTransactions();
  }, []);

  const CANT_SIGN_MESSAGE =
    "You can currently only approve the allocation requests associated with the multisig organization you signed in with. Signing proposals for additional DataCap allocations will require you to sign in again";

  return (
    <div className="large-request-table" style={{ minHeight: "500px" }}>
      {!context.ldnRequestsLoading && (
        <p style={{ margin: "0.8rem  1.2rem", color: "#373D3F" }}>
          *{" "}
          <i
            style={{ textDecoration: "underline", textUnderlineOffset: "4px" }}
          >
            You can use the searchbar to find a datacap request
          </i>
        </p>
      )}
      {context.ldnRequestsLoading ? (
        <div style={{ width: "100%" }}>
          <CircularProgress style={{ margin: "8rem auto", color: "#0090ff" }} />
        </div>
      ) : (
        <DataTable
          columns={largeReqColumns}
          selectableRowDisabled={(row) => !row.signable}
          selectableRowsHighlight
          selectableRows
          selectableRowsNoSelectAll={true}
          pagination
          paginationRowsPerPageOptions={[10, 20, 30]}
          paginationPerPage={10}
          defaultSortFieldId={1}
          onRowClicked={(row) => {
            if (!row.signable) {
              context.wallet.dispatchNotification(CANT_SIGN_MESSAGE);
            }
          }}
          noContextMenu={true}
          data={data}
          progressComponent={
            <CircularProgress
              style={{ margin: "4rem auto", color: "#0090ff" }}
            />
          }
        />
      )}
    </div>
  );
};

export default LargeRequestTable;
