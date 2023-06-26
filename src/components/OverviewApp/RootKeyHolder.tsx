import { Component } from "react";
import { Data } from "../../context/Data/Index";
import AddVerifierModal from "../../modals/AddVerifierModal";
// @ts-ignore
import { ButtonPrimary, dispatchCustomEvent } from "slate-react-system";
import { bytesToiB, anyToBytes } from "../../utils/Filters";
import { config } from "../../config";
import WarnModalVerify from "../../modals/WarnModalVerify";
import { BeatLoader } from "react-spinners";
import { EVENT_TYPE, MetricsApiParams } from "../../utils/Metrics";
import DataTable from "react-data-table-component";
import { CircularProgress } from "@material-ui/core";
import { notaryParser, metrics } from "@keyko-io/filecoin-verifier-tools";
import { DataCapRemovalRequest, VerifiedData } from "../../type";
import * as Logger from "../../logger";
import { methods } from "@keyko-io/filecoin-verifier-tools";
import { ISSUE_LABELS } from "filecoin-verifier-common";
import { ldnParser } from "@keyko-io/filecoin-verifier-tools";
import DataCapRemovalModal from "../../modals/DataCapRemovalModal";

type RootKeyHolderState = {
  tabs: string;
  approveLoading: boolean;
  selectedTransactions: any[];
  refAccepted: any;
  refRequests: any;
  removeDataCapRequests: any;
  removeDataCapIssueParsed: any;
};

export default class RootKeyHolder extends Component<{},
  RootKeyHolderState
> {
  public static contextType = Data;

  state = {
    selectedTransactions: [] as any[],
    approveLoading: false,
    tabs: "0",
    refAccepted: {} as any,
    refRequests: {} as any,
    removeDataCapRequests: {} as any,
    removeDataCapIssueParsed: {} as any

  };

  async componentDidMount() {
    this.context.loadVerifierAndPendingRequests();
    this.context.loadVerified(1)
    const removalRequests = await this.context.loadDataCapRemovalRequests(true)
    this.setState({ removeDataCapRequests: removalRequests })
  }

  showApproved = async () => {
    this.setState({ tabs: "2" });
  };

  showDataCapRemovalRequests = async () => {
    this.setState({ tabs: "3" });
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

  formatIssues = (
    issues: any[]
  ): any[] => {
    const parsedIssueData = []
    for (let issue of issues) {
      const parsed = ldnParser.parseDataCapRemoval(issue.body)
      console.log(parsed)
      parsedIssueData.push({
        name: parsed.name,
        address: parsed.address,
        issue_number: issue.number,
        url: issue.html_url,
        labels: issue.labels.map((l: any) => l.name),
        datacapToRemove: parsed.datacapToRemove,
        approvalInfoFromLabels: 0,
        uuid: parsed.uuid,
      });
    }
    console.log("parsedIssueData", parsedIssueData)
    return parsedIssueData;
  };


  showWarnProposeRemoveDataCap = async (e: any, origin: string, selected: any[]) => {
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
          <DataCapRemovalModal
            removalRequest={this.state.removeDataCapIssueParsed}
            origin={origin}
            onClick={
              this.handleSubmitRemoveDataCap.bind(this)
            }
          />
        ),
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
                ? this.handleSubmitApproveSign.bind(this) :
                this.handleSubmitCancel.bind(this)
            }
            origin={origin}
          />
        ),
      },
    });
  };

  handleSubmitRemoveDataCap = async (isProposal: boolean, removalRequest: DataCapRemovalRequest, notary1?: string, signature1?: string, notary2?: string, signature2?: string) => {
    try {
      dispatchCustomEvent({ name: "delete-modal", detail: {} });
      this.setState({ approveLoading: true });
      const dataCapBytes: number = anyToBytes(removalRequest?.datacapToRemove as string)
      let action = ""
      let messageID = ""
      let labelsToAdd = []
      const walletIndex = this.context.wallet.walletIndex
      if (isProposal) {
        messageID = await this.context.wallet.api.proposeRemoveDataCap(
          this.state.removeDataCapIssueParsed.address,
          dataCapBytes,
          notary1,
          signature1,
          notary2,
          signature2,
          walletIndex
        )
        console.log("removal", messageID)
        action = "proposed"
        labelsToAdd = [ISSUE_LABELS.DC_REMOVE_RKH_PROPOSED]
      } else {
        console.log("removalRequest", removalRequest)
        const rootkey = config.networks == "Mainnet" ? methods.mainnet.rootkey : methods.testnet.rootkey

        messageID = await this.context.wallet.api.send(rootkey.approve(removalRequest.tx?.id, removalRequest.tx?.tx), walletIndex)
        action = "approved"
        labelsToAdd = [ISSUE_LABELS.DC_REMOVE_RKH_APPROVED, ISSUE_LABELS.DC_REMOVE_COMPLETED]
      }

      const body = `# RootKey Holder ${action} the dataCap Removal for client ${removalRequest.address} \n > **message CID**: ${messageID}
      
      `

      await this.context.github.githubOctoGeneric.octokit.issues.createComment(
        {
          owner:
            config.onboardingOwner,
          repo: config.onboardingNotaryOwner,
          issue_number: removalRequest.issue_number,
          body
        }
      );

      await this.context.github.githubOctoGeneric.octokit.issues.addLabels(
        {
          owner:
            config.onboardingOwner,
          repo: config.onboardingNotaryOwner,
          issue_number: removalRequest.issue_number,
          labels: labelsToAdd,
        }
      );

      this.setState({ approveLoading: false });
      this.context.wallet.dispatchNotification(`Removal successfully ${action} with ID: ${messageID}`);
    } catch (e: any) {

      this.setState({ approveLoading: false });
      this.context.wallet.dispatchNotification("Cancel failed: " + e.message);
      console.log("error", e.stack);
    }
  };

  handleSubmitCancel = async (id: string) => {
    try {
      for (const request of this.context.verifierAndPendingRequests) {
        if (request.id === id) {
          if (request.proposed === true) {
            if (request.proposedBy !== this.context.wallet.activeAccount) {
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
    } catch (e: any) {
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
        let commentContent = "";
        let label = "";
        let filfox = "";
        let errorMessage = "";
        let warningMessage = "";
        let messageID = "";
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

            const walletIndex = this.context.wallet.walletIndex
            const rootkey = config.networks == "Mainnet" ? methods.mainnet.rootkey : methods.testnet.rootkey
            for (const tx of request.txs) {

              // this is a workaround because method approveVerifier stopped working - now just approving the TX
              messageID = await this.context.wallet.api.send(rootkey.approve(tx.id, tx.tx), walletIndex)

              // const txReceipt = await this.context.wallet.api.getReceipt(
              //   messageID
              // );
              // if (!txReceipt)
              //   warningMessage += `#### @${assignee} The bot couldn't find the Receipt. \nPlease, manually check the message to see that exitcode equals 0.\n>${messageID}`;
              // if (txReceipt.ExitCode !== 0)
              //   errorMessage += `#### @${assignee} There was an error processing the message >${messageID}`;
              messageIds.push(messageID);
              this.context.wallet.dispatchNotification(
                "Accepting Message sent with ID: " + messageID
              );
              filfox += `#### You can check the status of the message here: https://filfox.info/en/message/${messageID}\n`;
            }
            // comment to issue
            commentContent = `## The request has been signed by a new Root Key Holder\n#### Message sent to Filecoin Network\n>${messageIds.join()}\n${errorMessage}\n${filfox}`;
            label =
              errorMessage === "" ? ISSUE_LABELS.GRANTED : ISSUE_LABELS.ERROR;

            //remove ready to sign and add granted or error
            await this.context.github.githubOctoGeneric.octokit.issues.removeLabel({
              owner:
                config.onboardingOwner,
              repo: config.onboardingNotaryOwner,
              issue_number: request.issue_number,
              label: ISSUE_LABELS.READY_TO_SIGN
            })
            await this.context.github.githubOctoGeneric.octokit.issues.addLabels(
              {
                owner:
                  config.onboardingOwner,
                repo: config.onboardingNotaryOwner,
                issue_number: request.issue_number,
                labels: [label],
              }
            );

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
                  ? ISSUE_LABELS.START_SIGN_DATACAP
                  : ISSUE_LABELS.GRANTED
                : ISSUE_LABELS.ERROR;


            //add START_SIGN_DATACAP or error
            await this.context.github.githubOctoGeneric.octokit.issues.addLabels(
              {
                owner:
                  config.onboardingOwner,
                repo: config.onboardingNotaryOwner,
                issue_number: request.issue_number,
                labels: [label],
              }
            );
          }

          if (messageIds.length === 0) {
            await this.context.postLogs(
              `Message ID not returned from node call`,
              "ERROR",
              "",
              request.issue_number,
              PHASE
            );
          }

          if (commentContent !== "") {
            await this.context.github.githubOctoGeneric.octokit.issues.createComment(
              {
                owner: config.onboardingOwner,
                repo: config.onboardingNotaryOwner,
                issue_number: request.issue_number,
                body: commentContent,
              }
            );
          }
          if (warningMessage !== "") {
            await this.context.github.githubOctoGeneric.octokit.issues.createComment(
              {
                owner: config.onboardingOwner,
                repo: config.onboardingNotaryOwner,
                issue_number: request.issue_number,
                body: warningMessage,
              }
            );
          }
          //metrics
          if (label === ISSUE_LABELS.GRANTED) {
            const notaryGovissue =
              await this.context.github.githubOctoGeneric.octokit.issues.get({
                owner:
                  config.onboardingOwner,
                repo: config.onboardingNotaryOwner,
                issue_number: request.issue_number,
              });
            const notaryData = notaryParser.parseIssue(notaryGovissue.data.body)
            const applicationName = notaryData.name
            const applicationAddress = notaryData.address

            const params: MetricsApiParams = {
              name: applicationName || "not found",
              clientAddress: applicationAddress || "not found",
              msigAddress: request.addresses[0] ? request.addresses[0] : "",
              messageCid: messageIds[0] ? messageIds[0] : "",
            };
            metrics.callMetricsApi(
              request.issue_number,
              EVENT_TYPE.MULTISIG_CREATION,
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

            await Logger.BasicLogger({ message: Logger.RKH_SIGN_ON_CHAIN })
          }
        } catch (e: any) {
          this.context.wallet.dispatchNotification("Failed: " + e.message);

          this.setState({ approveLoading: false });
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
              Accepted Notaries ({this.context?.approvedVerifiersData?.length ? this.context?.approvedVerifiersData?.length : 0})
            </div>
            <div
              className={this.state.tabs === "3" ? "selected" : ""}
              onClick={() => {
                this.showDataCapRemovalRequests();
              }}
            >
              DataCap Removal Requests ({
                this.context?.removalRequests?.length ? this.context?.removalRequests?.length : 0
              })
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
            ) : this.state.tabs === "3" ? (
              <>
                <ButtonPrimary
                  onClick={(e: any) =>
                    this.showWarnProposeRemoveDataCap(
                      e,
                      "ApproveRemoval",
                      this.state.removeDataCapIssueParsed

                    )
                  }
                >
                  Approve DataCap Removal
                </ButtonPrimary>
              </>
            ) : null}
          </div>
        </div>

        {this.state.tabs === "0" &&
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
              progressPending={this.context.isPendingRequestLoading}
              progressComponent={<CircularProgress
                style={{ marginTop: "4rem", color: "rgb(0, 144, 255)" }}
              />}
              onSelectedRowsChange={({ selectedRows }) => {
                console.log("selectedRows", selectedRows)
                this.context.selectNotaryRequest(selectedRows);
              }}
            />
          </div>
        }

        {this.state.tabs === "2" &&
          <div style={{ minHeight: "500px" }}>
            <DataTable
              columns={[
                {
                  name: "Notary",
                  selector: (row) => row.verifier,
                  sortable: true,
                },
                {
                  name: "Address",
                  selector: (row) => row.verifierAccount,
                  sortable: true,
                  grow: 2,
                },
                {
                  name: "Datacap",
                  selector: (row) => row.datacap,
                  sortable: true,
                  cell: (row: any) => <span>{bytesToiB(row.datacap)}</span>,
                },
              ]}
              data={this.context.verified as VerifiedData[]}
              pagination
              paginationServer
              paginationTotalRows={this.context?.approvedVerifiersData?.length}
              onChangePage={(page: number) => {
                this.context.loadVerified(page)
              }}
              progressPending={this.context.acceptedNotariesLoading}
              progressComponent={<CircularProgress
                style={{ marginTop: "4rem", color: "rgb(0, 144, 255)" }}
              />}
              paginationRowsPerPageOptions={[10]}
            />
          </div>
        }
        {this.state.tabs === "3" &&
          <div style={{ minHeight: "500px" }}>
            <DataTable
              columns={[
                {
                  name: "Client",
                  selector: (row: any) => row?.name,
                  sortable: true,
                  grow: 1,
                  wrap: true,
                },
                {
                  name: "Address",
                  selector: (row: DataCapRemovalRequest) => row?.address,
                  sortable: true,
                  cell: (row: DataCapRemovalRequest) => (
                    <div>{`${row?.address?.substring(
                      0,
                      9
                    )}...${row?.address.substring(
                      row?.address.length - 9,
                      row?.address.length
                    )}`}</div>
                  ),
                },
                {
                  name: "Datacap",
                  selector: (row: DataCapRemovalRequest) => row?.datacapToRemove,
                  sortable: true,
                  grow: 0.5,
                  center: true,
                },
                {
                  id: "auditTrail",
                  name: "Audit Trail",
                  selector: (row: DataCapRemovalRequest) => row?.issue_number,
                  sortable: true,
                  grow: 0.5,
                  cell: (row: DataCapRemovalRequest) => (
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={row?.url}
                    >
                      {row?.issue_number}
                    </a>
                  ),
                  center: true,
                },
                {
                  name: "Approvals",
                  selector: (row: DataCapRemovalRequest) =>
                    row?.rkh_approvals,
                  grow: 0.5,
                  center: true,
                  cell: (row: DataCapRemovalRequest) => (
                    <div>{row?.rkh_approvals}</div>
                  ),
                },
              ]}
              data={this.state.removeDataCapRequests as DataCapRemovalRequest[]}
              pagination
              selectableRows
              selectableRowsSingle
              selectableRowsNoSelectAll={true}
              paginationServer
              paginationTotalRows={this.context?.approvedVerifiersData?.length}
              onChangePage={(page: number) => {
                this.context.loadDataCapRemovalRequests(true)
              }}
              onSelectedRowsChange={({ selectedRows }) => {
                this.setState({ removeDataCapIssueParsed: selectedRows[0] });
              }}
              progressPending={this.context.acceptedNotariesLoading}
              progressComponent={<CircularProgress
                style={{ marginTop: "4rem", color: "rgb(0, 144, 255)" }}
              />}
              paginationRowsPerPageOptions={[10]}
            />
          </div>
        }
      </div>
    );
  }
}
