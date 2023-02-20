import { CircularProgress } from "@material-ui/core";
import { useContext } from "react";
import DataTable from "react-data-table-component";
import { Data } from "./context/Data/Index";
import { useInitialLargeRequest } from "./hooks";
import { LargeRequestData } from "./type";

export const largeReqColumns = [
  {
    name: "Client",
    selector: (row: LargeRequestData) => row.data,
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
      <span>{row.proposer.signerGitHandle || "-"}</span>
    ),
    grow: 0.5,
  },
  {
    name: "TxId",
    selector: (row: LargeRequestData) => row.tx.id,
    grow: 0.5,
  },
  {
    name: "Approvals",
    selector: (row: LargeRequestData) => row.approvals,
    sortable: true,
    grow: 0.5,
  },
];

type LargeRequestTableProps = {
  setSelectedLargeClientRequests: any;
  dataForLargeRequestTable: LargeRequestData[];
  largeRequestListLoading: boolean;
  setDataForLargeRequestTable: any;
};

const LargeRequestTable = ({
  setSelectedLargeClientRequests,
  largeRequestListLoading,
  dataForLargeRequestTable,
  setDataForLargeRequestTable,
}: LargeRequestTableProps) => {
  const context = useContext(Data);

  const data = useInitialLargeRequest(context.largeClientRequests);

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
        <>
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
            noDataComponent={"No large client requests yet"}
            onSelectedRowsChange={({ selectedRows }) => {
              const rowNumbers = selectedRows.map((row) => row.issue_number);
              setSelectedLargeClientRequests(rowNumbers);
            }}
            onRowClicked={(row) => {
              if (!row.signable) {
                context.wallet.dispatchNotification(CANT_SIGN_MESSAGE);
              }
            }}
            noContextMenu={true}
            data={data}
            progressPending={
              largeRequestListLoading || context.ldnRequestsLoading
            }
            progressComponent={
              <CircularProgress
                style={{ margin: "4rem auto", color: "#0090ff" }}
              />
            }
          />
          <DataTable
            columns={largeReqColumns}
            data={this?.context?.verified}
            pagination
            paginationServer
            paginationTotalRows={this?.context?.approvedVerifiersData?.length}
            onChangePage={(page: number) => {
              this?.context?.loadVerified(page);
            }}
            progressPending={this?.context?.acceptedNotariesLoading}
            progressComponent={
              <CircularProgress
                style={{ marginTop: "4rem", color: "rgb(0, 144, 255)" }}
              />
            }
            paginationRowsPerPageOptions={[10]}
          />
        </>
      )}
    </div>
  );
};

export default LargeRequestTable;
