import React, { Component } from "react";
import { Data } from "../../context/Data/Index";
import AddVerifierModal from "../../modals/AddVerifierModal";
import RequestVerifierModal from "../../modals/RequestVerifierModal";
// @ts-ignore
import { ButtonPrimary, dispatchCustomEvent } from "slate-react-system";
import { bytesToiB, anyToBytes } from "../../utils/Filters";
import { config } from "../../config";
import WarnModalVerify from "../../modals/WarnModalVerify";
import { BeatLoader } from "react-spinners";
import { EVENT_TYPE, MetricsApiParams } from "../../utils/Metrics";
import DataTable from "react-data-table-component";
import { CircularProgress } from "@material-ui/core";

const {
  callMetricsApi,
} = require("@keyko-io/filecoin-verifier-tools/metrics/metrics");
const parser = require("@keyko-io/filecoin-verifier-tools/utils/notary-issue-parser");
const largeutils = require("@keyko-io/filecoin-verifier-tools/utils/large-issue-parser");

type RootKeyHolderState = {
  tabs: string;
  approveLoading: boolean;
  selectedTransactions: any[];
  refAccepted: any;
  sortOrderAccepted: number;
  orderByAccepted: string;
  refRequests: any;
  sortOrderRequest: number;
  orderByRequest: string;
};

type RootKeyHolderProps = {
  searchString: string;
};

export default class RootKeyHolder extends Component<
  RootKeyHolderProps,
  RootKeyHolderState
> {
  public static contextType = Data;

  state = {
    selectedTransactions: [] as any[],
    approveLoading: false,
    tabs: "0",
    refAccepted: {} as any,
    sortOrderAccepted: -1,
    orderByAccepted: "verifier",
    refRequests: {} as any,
    orderByRequest: "addresses",
    sortOrderRequest: -1,
  };

  componentDidMount() {
    this.context.loadVerifierAndPendingRequests();
  }

  showApproved = async () => {
    this.setState({ tabs: "2" });
  };

  showVerifierRequests = async () => {
    this.setState({ tabs: "0" });
  };

  selectRow = (transactionId: string) => {
    let selectedTxs = this.state.selectedTransactions;
    if (selectedTxs.includes(transactionId)) {
      selectedTxs = selectedTxs.filter((item) => item !== transactionId);
    } else {
      selectedTxs.push(transactionId);
    }
    this.setState({ selectedTransactions: selectedTxs });
  };

  proposeVerifier = async () => {
    dispatchCustomEvent({
      name: "create-modal",
      detail: {
        id: Math.random()
          .toString(36)
          .replace(/[^a-z]+/g, "")
          .substr(0, 5),
        modal: <AddVerifierModal />,
      },
    });
  };

  requestVerifier = async () => {
    dispatchCustomEvent({
      name: "create-modal",
      detail: {
        id: Math.random()
          .toString(36)
          .replace(/[^a-z]+/g, "")
          .substr(0, 5),
        modal: <RequestVerifierModal />,
      },
    });
  };

  showWarnPropose = async (e: any, origin: string, selected: any[]) => {
    await e.preventDefault();
    if (selected.length === 0) {
      this.context.wallet.dispatchNotification(
        "Plese, select at least one client to sign"
      );
      return;
    }
    dispatchCustomEvent({
      name: "create-modal",
      detail: {
        id: Math.random()
          .toString(36)
          .replace(/[^a-z]+/g, "")
          .substr(0, 5),
        modal: (
          <WarnModalVerify
            clientRequests={this.context.verifierAndPendingRequests}
            selectedClientRequests={selected}
            onClick={
              origin === "ProposeSign"
                ? this.handleSubmitApproveSign.bind(this)
                : this.handleSubmitCancel.bind(this)
            }
            origin={origin}
          />
        ),
      },
    });
  };

  handleSubmitCancel = async (id: string) => {
    try {
      for (const request of this.context.verifierAndPendingRequests) {
        if (request.id === id) {
          if (request.proposed === true) {
            if (request.proposedBy != this.context.wallet.activeAccount) {
              alert("You must be the proposer of the request  to cancel it! ");
              continue;
            }
            // for each tx
            for (const tx of request.txs) {
              const messageID = await this.context.wallet.api.cancelVerifier(
                tx.verifier,
                BigInt(tx.datacap),
                tx.signer,
                tx.id,
                this.context.wallet.walletIndex
              );
              console.log("cancel: " + messageID);
              this.context.wallet.dispatchNotification(
                "Cancel Message sent with ID: " + messageID
              );
            }
          }
        }
      }
    } catch (e:any) {
      this.setState({ approveLoading: false });
      this.context.wallet.dispatchNotification("Cancel failed: " + e.message);
      console.log("error", e.stack);
    }
  };

  handleSubmitApproveSign = async () => {
    dispatchCustomEvent({ name: "delete-modal", detail: {} });
    this.setState({ approveLoading: true });
    // loop over selected rows
    await this.context.wallet.api.multisigInfo(
      config.lotusNodes[this.context.wallet.networkIndex].rkhMultisig
    );
    await this.context.github.githubOctoGenericLogin();
    for (const request of this.context.verifierAndPendingRequests) {
      if (this.context.selectedNotaryRequests.includes(request.id)) {
        const messageIds: any[] = [];
        var commentContent = "";
        var label = "";
        let filfox = "";
        let errorMessage = "";
        let warningMessage = "";
        let messageID = "";
        let sentryData: any = {};
        const PHASE = "RKH-SIGN";
        try {
          const assignee = (
            await this.context.github.githubOctoGeneric.octokit.issues.get({
              owner:
                config.lotusNodes[this.context.wallet.networkIndex].notaryOwner,
              repo: config.lotusNodes[this.context.wallet.networkIndex]
                .notaryRepo,
              issue_number: request.issue_number,
            })
          )?.data?.assignee?.login;
          if (!assignee) {
            throw new Error("You should assign the issue to someone");
          }
          await this.context.postLogs(
            `multisig ${request.addresses[0]} - starting to approve it!`,
            "DEBUG",
            "",
            request.issue_number,
            PHASE
          );
          if (request.proposed === true) {
            await this.context.postLogs(
              `multisig ${request.addresses[0]} - the address is proposed. going to confirm!`,
              "DEBUG",
              "",
              request.issue_number,
              PHASE
            );
            // for each tx
            for (const tx of request.txs) {
              messageID =
                tx.datacap === 0
                  ? await this.context.wallet.api.removeVerifier(
                    tx.verifier,
                    tx.signer,
                    tx.id,
                    this.context.wallet.walletIndex
                  )
                  : await this.context.wallet.api.approveVerifier(
                    tx.verifier,
                    BigInt(tx.datacap),
                    tx.signer,
                    tx.id,
                    this.context.wallet.walletIndex
                  );

              const txReceipt = await this.context.wallet.api.getReceipt(
                messageID
              );
              if (!txReceipt)
                warningMessage += `#### @${assignee} The bot couldn't find the Receipt. \nPlease, manually check the message to see that exitcode equals 0.\n>${messageID}`;
              if (txReceipt.ExitCode !== 0)
                errorMessage += `#### @${assignee} There was an error processing the message >${messageID}`;
              messageIds.push(messageID);
              this.context.wallet.dispatchNotification(
                "Accepting Message sent with ID: " + messageID
              );
              filfox += `#### You can check the status of the message here: https://filfox.info/en/message/${messageID}\n`;
            }
            // comment to issue
            commentContent = `## The request has been signed by a new Root Key Holder\n#### Message sent to Filecoin Network\n>${messageIds.join()}\n${errorMessage}\n${filfox}`;
            label =
              errorMessage === "" ? "status:AddedOnchain" : "status:Error";
          } else {
            await this.context.postLogs(
              `multisig ${request.addresses[0]} - going to propose the address.`,
              "DEBUG",
              "",
              request.issue_number,
              PHASE
            );
            let filfox = "";
            let errorMessage = "";
            for (let i = 0; i < request.datacaps.length; i++) {
              if (request.datacaps[i] && request.addresses[i]) {
                const datacap = anyToBytes(request.datacaps[i]);
                let address = request.addresses[i];
                console.log("request address: " + address);
                console.log("request datacap: " + request.datacaps[i]);
                console.log("datacap: " + datacap);

                if (address.startsWith("t1") || address.startsWith("f1")) {
                  address = await this.context.wallet.api.actorAddress(address);
                  console.log(
                    "getting t0/f0 ID. Result of  actorAddress method: " +
                    address
                  );
                }

                console.log("address to propose: " + address);

                messageID =
                  datacap === 0
                    ? await this.context.wallet.api.proposeRemoveVerifier(
                      address,
                      this.context.wallet.walletIndex
                    )
                    : await this.context.wallet.api.proposeVerifier(
                      address,
                      BigInt(datacap),
                      this.context.wallet.walletIndex
                    );
                console.log("messageID: " + messageID);
                const txReceipt = await this.context.wallet.api.getReceipt(
                  messageID
                );
                if (!txReceipt)
                  warningMessage += `#### @${assignee} The bot couldn't find the Receipt. \nPlease, manually check the message to see that exitcode equals 0.\n>${messageID}`;
                if (txReceipt.ExitCode !== 0)
                  errorMessage += `#### @${assignee} There was an error processing the message\n>${messageID}`;
                messageIds.push(messageID);
                this.context.wallet.dispatchNotification(
                  "Accepting Message sent with ID: " + messageID
                );
                filfox += `#### You can check the status of the message here: https://filfox.info/en/message/${messageID}\n`;
              }
            }
            commentContent = `## The request has been signed by a new Root Key Holder\n#### Message sent to Filecoin Network\n>${messageIds.join()}\n ${errorMessage}\n ${filfox}`;
            label =
              errorMessage === ""
                ? config.lotusNodes[this.context.wallet.networkIndex]
                  .rkhtreshold > 1
                  ? "status:StartSignOnchain"
                  : "status:AddedOnchain"
                : "status:Error";
          }

          // Sentry logs
          sentryData = {
            request,
            messageIDs: messageIds.length > 0 ? messageIds : "not found",
            rkhSigner: this.context.wallet.activeAccount,
          };
          if (messageIds.length === 0) {
            await this.context.postLogs(
              `Message ID not returned from node call`,
              "ERROR",
              "",
              request.issue_number,
              PHASE
            );
            this.context.logToSentry(
              "handleSubmitApproveSign",
              `handleSubmitApproveSign missing messageID -issue n ${request.issue_number}`,
              "error",
              sentryData
            );
          }

          if (commentContent != "") {
            await this.context.github.githubOctoGeneric.octokit.issues.createComment(
              {
                owner:
                  config.lotusNodes[this.context.wallet.networkIndex]
                    .notaryOwner,
                repo: config.lotusNodes[this.context.wallet.networkIndex]
                  .notaryRepo,
                issue_number: request.issue_number,
                body: commentContent,
              }
            );
          }
          if (warningMessage != "") {
            await this.context.github.githubOctoGeneric.octokit.issues.createComment(
              {
                owner:
                  config.lotusNodes[this.context.wallet.networkIndex]
                    .notaryOwner,
                repo: config.lotusNodes[this.context.wallet.networkIndex]
                  .notaryRepo,
                issue_number: request.issue_number,
                body: warningMessage,
              }
            );
          }
          if (label != "") {
            await this.context.github.githubOctoGeneric.octokit.issues.removeAllLabels(
              {
                owner:
                  config.lotusNodes[this.context.wallet.networkIndex]
                    .notaryOwner,
                repo: config.lotusNodes[this.context.wallet.networkIndex]
                  .notaryRepo,
                issue_number: request.issue_number,
              }
            );
            await this.timeout(1000);
            await this.context.github.githubOctoGeneric.octokit.issues.addLabels(
              {
                owner:
                  config.lotusNodes[this.context.wallet.networkIndex]
                    .notaryOwner,
                repo: config.lotusNodes[this.context.wallet.networkIndex]
                  .notaryRepo,
                issue_number: request.issue_number,
                labels: [label, "Notary Application"],
              }
            );
          }
          //METRICS
          if (label === "status:AddedOnchain") {
            const notaryGovissue =
              await this.context.github.githubOctoGeneric.octokit.issues.get({
                owner:
                  config.lotusNodes[this.context.wallet.networkIndex]
                    .notaryOwner,
                repo: config.lotusNodes[this.context.wallet.networkIndex]
                  .notaryRepo,
                issue_number: request.issue_number,
              });
            const ldnIssueNameSplitted = parser
              .parseIssue(notaryGovissue.data.body)
              .name.split(" ");
            const ldnIssueNumber =
              ldnIssueNameSplitted[ldnIssueNameSplitted.length - 1];
            const ldnIssue =
              await this.context.github.githubOctoGeneric.octokit.issues.get({
                owner: config.onboardingLargeOwner,
                repo: config.onboardingLargeClientRepo,
                issue_number: ldnIssueNumber,
              });

            const issueParsed = largeutils.parseIssue(ldnIssue.data.body);
            const params: MetricsApiParams = {
              name: issueParsed.name,
              clientAddress: issueParsed.address,
              msigAddress: request.addresses[0] ? request.addresses[0] : "",
              messageCid: messageIds[0] ? messageIds[0] : "",
            };
            callMetricsApi(
              request.issue_number,
              EVENT_TYPE.MULTISIG_APPROVED,
              params,
              config.metrics_api_environment
            );
            await this.context.postLogs(
              `multisig ${request.addresses[0]} approved by RKH ${this.context.wallet.activeAccount}!`,
              "INFO",
              "msig_approved",
              request.issue_number,
              PHASE
            );
          }
        } catch (e:any) {
          this.context.wallet.dispatchNotification("Failed: " + e.message);

          this.setState({ approveLoading: false });
          console.log("failed", e.stack);
          const errData = {
            ...sentryData,
            error: e,
          };
          this.context.logToSentry(
            "handleSubmitApproveSign",
            `handleSubmitApproveSign error -issue n ${request.issue_number}`,
            "error",
            errData
          );
          await this.context.postLogs(
            `Error approving the multisig: ${e.message}`,
            "ERROR",
            "",
            request.issue_number,
            PHASE
          );
        }
      }
    }
    this.setState({ approveLoading: false });
  };

  onRefAccepted = (refAccepted: any) => {
    this.setState({ refAccepted });
  };

  onRefRequests = (refRequests: any) => {
    this.setState({ refRequests });
  };

  timeout(delay: number) {
    return new Promise((res) => setTimeout(res, delay));
  }

  public render() {
    return (
      <div className="main">
        <div className="tabsholder">
          <div className="tabs">
            <div
              className={this.state.tabs === "0" ? "selected" : ""}
              onClick={() => {
                this.showVerifierRequests();
              }}
            >
              Notary Requests ({this.context.verifierAndPendingRequests.length})
            </div>
            <div
              className={this.state.tabs === "2" ? "selected" : ""}
              onClick={() => {
                this.showApproved();
              }}
            >
              Accepted Notaries ({this.context.verified.length})
            </div>
          </div>
          <div className="tabssadd">
            {this.state.approveLoading ? (
              <BeatLoader size={15} color={"rgb(24,160,237)"} />
            ) : this.state.tabs === "0" ? (
              <>
                <ButtonPrimary
                  onClick={(e: any) =>
                    this.showWarnPropose(
                      e,
                      "ProposeSign",
                      this.context.selectedNotaryRequests
                    )
                  }
                >
                  Sign On-chain
                </ButtonPrimary>
              </>
            ) : null}
          </div>
        </div>
        {this.state.tabs === "0" ? (
          !this.context.isPendingRequestLoading ? (

            <div style={{ minHeight: "500px" }}>
              <DataTable
                columns={[
                  {
                    name: "Status",
                    selector: (row: any) => row.proposed,
                    sortable: true,
                    cell: (row: any) => (
                      <span>{row.proposed ? "Proposed" : "Pending"}</span>
                    ),
                  },
                  {
                    name: "Issue",
                    selector: (row: any) => row.issue_number,
                    sortable: true,
                    cell: (row: any) => (
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={row.issue_Url}
                      >
                        #{row.issue_number}
                      </a>
                    ),
                  },
                  {
                    name: "Address",
                    selector: (row: any) => row.addresses,
                    sortable: true,
                  },
                  {
                    name: "Datacap",
                    selector: (row: any) => row.datacaps,
                    sortable: true,
                  },
                  {
                    name: "Transaction ID",
                    selector: (row: any) => row.txs,
                    grow: 2,
                    cell: (row: any) => (
                      <span>{row.txs.length === 0 ? "-" : row.txs[0].id}</span>
                    ),
                  },
                  {
                    name: "Proposed by",
                    selector: (row: any) => row.proposedBy,
                    sortable: true,
                    grow: 2,
                  },
                ]}
                data={this.context.verifierAndPendingRequests}
                pagination
                paginationRowsPerPageOptions={[10, 20, 30]}
                paginationPerPage={10}
                selectableRows
                noDataComponent="No pending requests yet"
                selectableRowsHighlight={true}
                selectableRowsNoSelectAll={true}
                onSelectedRowsChange={({ selectedRows }) => {
                  this.context.selectNotaryRequest(selectedRows);
                }}
              />
            </div>

          ) : (
            <CircularProgress
              style={{ margin: "200px 50%", color: "rgb(0, 144, 255)" }}
            />
          )
        ) : null}

        {this.state.tabs === "2" &&
          (this.context.verified.length > 0 ? (
            <div style={{ minHeight: "500px" }}>
              <DataTable
                columns={[
                  {
                    name: "Notary",
                    selector: (row: any) => row.verifier,
                    sortable: true,
                  },
                  {
                    name: "Address",
                    selector: (row: any) => row.verifierAccount,
                    sortable: true,
                    grow: 2,
                  },
                  {
                    name: "Datacap",
                    selector: (row: any) => row.datacap,
                    sortable: true,
                    cell: (row: any) => <span>{bytesToiB(row.datacap)}</span>,
                  },
                ]}
                data={this.context.verified}
                pagination
                paginationRowsPerPageOptions={[10, 20, 30]}
                paginationPerPage={10}
              />
            </div>
          ) : (
            <CircularProgress
              style={{ margin: "200px 50%", color: "rgb(0, 144, 255)" }}
            />
          ))}
      </div>
    );
  }
}
