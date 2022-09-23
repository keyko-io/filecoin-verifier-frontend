import React, { useEffect, useState } from "react";
import { Data } from "../../context/Data/Index";
import AddClientModal from "../../modals/AddClientModal";
// @ts-ignore
// prettier-ignore
import { ButtonPrimary, dispatchCustomEvent, ButtonSecondary } from "slate-react-system";
import { anyToBytes } from "../../utils/Filters";
// @ts-ignore
import LoginGithub from "react-login-github";
import { config } from "../../config";
import WarnModal from "../../modals/WarnModal";
import WarnModalVerify from "../../modals/WarnModalVerify";
import { BeatLoader } from "react-spinners";
import { useContext } from "react";
import WarnModalNotaryVerified from "../../modals/WarnModalNotaryVeried";
import { CircularProgress } from "@material-ui/core";
import { LargeRequestTable, CancelProposalTable, NotaryTabs, PublicRequestTable, VerifiedClientsTable } from "./Notary/index";
import { checkAlreadyProposed } from "../../utils/checkAlreadyProposed";

type NotaryProps = {
  clients: any[];
  searchString: string;
};

const Notary = (props: { notaryProps: NotaryProps }) => {

  const context = useContext(Data)

  const [selectedClientRequests, setSelectedClientRequests] = useState([] as any)
  const [selectedLargeClientRequests, setSelectedLargeClientRequests] = useState([] as any)
  const [tabs, setTabs] = useState('1')
  const [approveLoading, setApproveLoading] = useState(false)
  const [approvedDcRequests, setApprovedDcRequests] = useState([] as any)
  const [dataForLargeRequestTable, setDataForLargeRequestTable] = useState([])
  const [largeRequestListLoading, setLargeRequestListLoading] = useState(false)
  const [cancelProposalData, setCancelProposalData] = useState<any>(null)
  const [dataCancel, setDataCancel] = useState<any>([])

  const changeStateTabs = (indexTab: string) => {
    setTabs(indexTab)
  }

  const requestDatacap = () => {
    dispatchCustomEvent({
      name: "create-modal",
      detail: {
        id: Math.random()
          .toString(36)
          .replace(/[^a-z]+/g, "")
          .substr(0, 5),
        modal: <AddClientModal />,
      },
    });
  };

  const verifyNewDatacap = () => {
    if (
      selectedClientRequests.length === 0 ||
      selectedClientRequests.length > 1
    ) {
      dispatchCustomEvent({
        name: "create-modal",
        detail: {
          id: Math.random()
            .toString(36)
            .replace(/[^a-z]+/g, "")
            .substr(0, 5),
          modal: <WarnModal message={"Please select only one address"} />,
        },
      });
    } else {
      const selected = selectedClientRequests[0];
      setSelectedClientRequests([])
      dispatchCustomEvent({
        name: "create-modal",
        detail: {
          id: Math.random()
            .toString(36)
            .replace(/[^a-z]+/g, "")
            .substr(0, 5),
          modal: (
            <AddClientModal
              newDatacap={true}
              clientRequest={context.clientRequests}
              selected={selected}
            />
          ),
        },
      });
    }
  };

  const showWarnVerify = async (origin: string) => {
    dispatchCustomEvent({
      name: "create-modal",
      detail: {
        id: Math.random()
          .toString(36)
          .replace(/[^a-z]+/g, "")
          .substr(0, 5),
        modal: (
          <WarnModalVerify
            clientRequests={
              origin === "Notary"
                ? context.clientRequests
                : origin === "Large"
                  ? context.largeClientRequests
                  : []
            }
            selectedClientRequests={
              origin === "Notary"
                ? selectedClientRequests
                : origin === "Large"
                  ? selectedLargeClientRequests
                  : []
            }
            onClick={() => {
              origin === "Notary"
                ? verifyClients()
                : origin === "newDatacap"
                  ? verifyNewDatacap()
                  : origin === "Large"
                    ? verifyLargeClients()
                    : requestDatacap()
            }
            }
            largeAddress={origin == "Large" ? true : false}
            origin={
              origin === "Notary" || "Large" ? "Notary" : "single-message"
            }
          />
        ),
      },
    });
  };

  // if(config.lotusNodes[this.context.wallet.networkIndex].name !== "Localhost") 

  const checkNotaryIsVerifiedAndShowWarnVerify = async (e: any, origin: string) => {

    if (config.lotusNodes[context.wallet.networkIndex].name !== "Localhost") {
      const isVerified: any = await context.checkVerifyWallet()
      if (!isVerified) {

        await e.preventDefault();
        dispatchCustomEvent({
          name: "create-modal",
          detail: {
            id: Math.random()
              .toString(36)
              .replace(/[^a-z]+/g, "")
              .substr(0, 5),
            modal: (
              <WarnModalNotaryVerified
                onClick={async () => await context.verifyWalletAddress()
                }
              />
            ),
          },
        });
        return
      }
    }
    showWarnVerify(origin)
  }


  const cancelDuplicateRequest = async () => {
    // const res = await context.github.githubOcto.rest.issues.deleteComment({
    //   owner: config.onboardingLargeOwner,
    //   repo: config.onboardingLargeClientRepo,
    //   comment_id: cancelProposalData.comment[0].id
    // });

    console.log("11")

    //Ask fabrizio about parameters!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    //await context.wallet.api.cancelPending()
  }


  useEffect(() => {
    if (context.github.githubLogged) {
      getPending()
    }
  }, [])

  const getPending = async () => {
    const LDNIssuesAndTransactions: any = await context.getLDNIssuesAndTransactions()

    const transactionsData = LDNIssuesAndTransactions.transactionAndIssue

    const id = await context.wallet.api.actorAddress(context.wallet.activeAccount)

    const dataByActiveAccount: any = []

    for (let transaction of transactionsData) {
      if (Array.isArray(transaction.tx)) {
        for (let txId of transaction.tx) {
          if (txId.signers.includes(id)) {
            dataByActiveAccount.push(transaction)
          }
        }
      }
    }

    const DataCancel = dataByActiveAccount.map((item: any) => {

      console.log(item, "ix")

      const comment = item.issue[0].issueInfo.comments.filter((c: any) => c.body.includes(context.wallet.activeAccount))

      return {
        clientAddress: item.clientAddress,
        issueNumber: item.issue[0].issueInfo.issue_number,
        datacap: item.issue[0].datacap,
        tx: item.tx[0],
        comment,
      }
    })

    setDataCancel(DataCancel)
  }

  useEffect(() => {
    const selectedTab = tabs === '1' ? 'Notary' : 'Large'

    if (context.isAddressVerified) {
      showWarnVerify(selectedTab)
    }
  }, [context.isAddressVerified])

  const verifyClients = async () => {
    dispatchCustomEvent({ name: "delete-modal", detail: {} });
    setApproveLoading(true)
    for (const request of context.clientRequests) {
      if (selectedClientRequests.includes(request.issue_number)) {
        let messageID = "";
        let address = "";
        let dc = request.data.datacap;
        let sentryData: any = {};
        let errorMessage = "";
        try {
          sentryData.request = { ...request };
          const datacap: number = anyToBytes(request.data.datacap);
          console.log("datacap", datacap);
          address = request.data.address;
          if (address.length < 12) {
            address = await context.wallet.api.actorKey(address);
          }
          if (context.wallet.multisig) {
            messageID = await context.wallet.api.multisigVerifyClient(
              context.wallet.multisigID,
              address,
              BigInt(datacap),
              context.wallet.walletIndex
            );
          } else {
            messageID = await context.wallet.api.verifyClient(
              address,
              BigInt(datacap.toFixed()),
              context.wallet.walletIndex
            );
          }

          const signer = context.wallet.activeAccount
            ? context.wallet.activeAccount
            : "";

          const txReceipt = await context.wallet.api.getReceipt(messageID);
          if (txReceipt.ExitCode !== 0) {
            errorMessage += `#### There was an error processing the message \n>${messageID}, retry later.`;
            context.updateGithubVerified(
              request.issue_number,
              messageID,
              address,
              datacap,
              signer,
              errorMessage
            );
            context.wallet.dispatchNotification(
              "Error processing the message: " + messageID
            );
            throw Error(errorMessage);
          }
          setApproveLoading(false)
          // github update
          context.updateGithubVerified(
            request.issue_number,
            messageID,
            address,
            datacap,
            signer,
            ""
          );

          // send notifications
          context.wallet.dispatchNotification(
            "Verify Client Message sent with ID: " + messageID
          );
          context.loadClientRequests();
          sentryData = {
            requestNumber: request.issue_number,
            messageID: messageID,
            address: address,
            dataCap: dc,
            multisigId: context.wallet.multisigID,
            activeAccount: context.wallet.activeAccount,
            accounts: context.wallet.accounts,
            walletIndex: context.wallet.walletIndex,
          };
        } catch (e) {
          setApproveLoading(false)
          sentryData = {
            ...sentryData,
            error: e,
          };

          context.logToSentry(
            `verifyClients issue n. ${request.issue_number}`,
            `verifyClients error - issue n. ${request.issue_number}: ${e.message}`,
            "error",
            sentryData
          );
          context.wallet.dispatchNotification(
            "Verification failed: " + e.message
          );
        } finally {
          context.logToSentry(
            `verifyClients issue n. ${request.issue_number}`,
            `verifyClients info: verifyClients issue n. ${request.issue_number}`,
            "info",
            sentryData
          );
        }
      }
    }
  };

  const verifyLargeClients = async () => {
    setApproveLoading(true)
    dispatchCustomEvent({ name: "delete-modal", detail: {} });
    let thisStateLargeRequestList = context.largeClientRequests;
    for (const request of thisStateLargeRequestList) {
      if (selectedLargeClientRequests.includes(request.issue_number)) {
        let sentryData: any = {};
        sentryData.request = { ...request };
        sentryData.requestNumber = request.issue_number;
        let errorMessage = "";
        const PHASE = "DATACAP-SIGN";
        try {
          const datacap = anyToBytes(request.datacap);
          let address = request.address;

          sentryData.datacap = request.datacap;
          sentryData.address = address;
          sentryData.approvals = request.approvals;

          context.wallet.dispatchNotification(
            `datacap being approved: ${request.datacap} \nclient address: ${address}`
          );

          if (address.length < 12) {
            address = await context.wallet.api.actorKey(address);
            sentryData.actorKey = address;
          }

          let messageID;
          const signer = context.wallet.activeAccount
            ? context.wallet.activeAccount
            : "";
          await context.postLogs(
            `starting to sign datacap request. approvals: ${request.approvals} -signer: ${signer}`,
            "DEBUG",
            "",
            request.issue_number,
            PHASE
          );
          let action = "";
          if (request.approvals) {
            messageID = await context.wallet.api.approvePending(
              request.multisig,
              request.tx,
              context.wallet.walletIndex
            );
            setApprovedDcRequests([
              ...approvedDcRequests,
              request.issue_number,
            ])
            await context.postLogs(
              `Datacap GRANTED: ${messageID} - signer: ${signer}`,
              "INFO",
              "datacap_granted",
              request.issue_number,
              PHASE
            );
            action = "Approved";
          } else {
            const isProposed = await checkAlreadyProposed(request.issue_number, context)

            if (isProposed) {
              alert("Something is wrong. There is already one pending proposal for this issue. Please, contact the governance team.")
              return
            }

            messageID = await context.wallet.api.multisigVerifyClient(
              request.multisig,
              address,
              BigInt(Math.floor(datacap)),
              context.wallet.walletIndex
            );
            console.log(request);
            request.approvals = true;
            await context.postLogs(
              `Datacap PROPOSED: ${messageID} - signer: ${signer}`,
              "INFO",
              "datacap_proposed",
              request.issue_number,
              PHASE
            );
            action = "Proposed";
          }


          if (!messageID) {
            errorMessage += `#### the transaction was unsuccessful - retry later.`;
            await context.updateGithubVerifiedLarge(
              request.issue_number,
              null,
              address,
              datacap,
              request.approvals,
              signer,
              context.wallet.multisigID,
              request.data.name,
              errorMessage,
              []
            );
            context.wallet.dispatchNotification(errorMessage);
            throw Error(errorMessage);
          }

          sentryData.messageID = messageID;
          sentryData.signer = signer;

          await context.updateGithubVerifiedLarge(
            request.issue_number,
            messageID,
            address,
            datacap,
            request.approvals,
            signer,
            context.wallet.multisigID,
            request.data.name,
            "",
            request.labels,
            action
          );
          context.wallet.dispatchNotification(
            "Transaction successful! Verify Client Message sent with ID: " +
            messageID
          );
          await context.postLogs(
            `Transaction successful! Verify Client Message sent with ID: ${messageID}`,
            "DEBUG",
            "",
            request.issue_number,
            PHASE
          );
          setApproveLoading(false)
          //UPDATE THE CONTEXT
          context.updateContextState(
            thisStateLargeRequestList,
            "largeClientRequests"
          );
        } catch (e) {
          context.wallet.dispatchNotification(
            "Verification failed: " + e.message
          );
          await context.postLogs(
            `The transaction to sign the datacap failed: ${e.message}`,
            "ERROR",
            "",
            request.issue_number,
            PHASE
          );
          // console.log(e.stack)
          setApproveLoading(false)
          sentryData = {
            ...sentryData,
            error: e,
          };
          context.logToSentry(
            `verifyLargeClients issue n. ${request.issue_number}`,
            `verifyLargeClients error - issue n. ${request.issue_number}, error:${e.message}`,
            "error",
            sentryData
          );
        }
      }
    }
    setLargeRequestListLoading(true)
    await context.loadClientRequests()
    setLargeRequestListLoading(false)
  };

  const activeTable = (tabs: any) => {
    const tables: any = {
      "1": <div style={{ minHeight: "500px" }}>
        <PublicRequestTable selectedClientRequests={selectedClientRequests} searchString={props.notaryProps.searchString} setSelectedClientRequests={setSelectedClientRequests} />
      </div>,
      "2": <div style={{ minHeight: "500px" }}>
        <VerifiedClientsTable verifiedClients={props.notaryProps.clients} />
      </div>,
      "3": <div className="large-request-table" style={{ minHeight: "500px" }}>
        {largeRequestListLoading ? <CircularProgress
          style={{ margin: "100px 50%", color: "rgb(0, 144, 255)" }}
        /> :
          < LargeRequestTable setSelectedLargeClientRequests={setSelectedLargeClientRequests} searchInput={props.notaryProps.searchString} dataForLargeRequestTable={dataForLargeRequestTable} />
        }
      </div>,
      "4": <div style={{ minHeight: "500px" }}>
        <CancelProposalTable dataCancel={dataCancel} setCancelProposalData={setCancelProposalData} />
      </div>
    }

    return tables[tabs]
  }

  useEffect(() => {
    const data = context.largeClientRequests
      .map((item: any) => ({ ...item, data: item.data.name }))
      .map((item: any) => item.tx !== null ? item : { ...item, tx: "", })
    setDataForLargeRequestTable(data)
  }, [context.largeClientRequests])

  return (
    <div className="main">
      <div className="tabsholder">
        <NotaryTabs tabs={tabs} changeStateTabs={changeStateTabs} ctx={context} verifiedClientsLength={props.notaryProps.clients.length} dataCancelLength={dataCancel.length} />
        <div className="tabssadd">
          {tabs === "4" && <ButtonPrimary
            onClick={cancelDuplicateRequest}
          >
            Cancel Proposal
          </ButtonPrimary>}
          {tabs !== "4" && tabs !== "3" ? (
            <ButtonPrimary onClick={() => requestDatacap()}>
              Approve Private Request
            </ButtonPrimary>
          ) : null}
          {tabs === "1" ||
            tabs === "2" ||
            tabs === "3" ? (
            <>
              {approveLoading ? (
                <BeatLoader size={15} color={"rgb(24,160,237)"} />
              ) : (
                <ButtonPrimary
                  onClick={(e: any) =>
                    checkNotaryIsVerifiedAndShowWarnVerify(
                      e,
                      tabs === "3" ? "Large" : "Notary"
                    )
                  }
                >
                  {tabs === "3"
                    ? "Approve Request"
                    : "Verify client"}
                </ButtonPrimary>
              )}
              {tabs !== "3" ? (
                <ButtonPrimary onClick={() => verifyNewDatacap()}>
                  Verify new datacap
                </ButtonPrimary>
              ) : null}
            </>
          ) : null}
        </div>
      </div>

      {context.github.githubLogged && activeTable(tabs)}

      {!context.github.githubLogged ?
        <div style={{ marginTop: "50px" }}>
          <div id="githublogin">
            <LoginGithub
              redirectUri={config.oauthUri}
              clientId={config.githubApp}
              scope="repo"
              onSuccess={async (response: any) => {
                await context.github.loginGithub(response.code);
                await context.refreshGithubData();
              }}
              onFailure={(response: any) => {
                console.log("failure", response);
              }}
            />
          </div>
        </div> : <div className="alignright" style={{ marginBottom: "40px" }}>
          <ButtonSecondary
            className="buttonsecondary"
            onClick={async () => {
              await context.github.logoutGithub();
              await context.refreshGithubData();
            }}
          >
            Logout GitHub
          </ButtonSecondary>
        </div>
      }
    </div >
  );
}

export default Notary 