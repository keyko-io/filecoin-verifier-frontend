
import { useEffect, useState } from "react";
import { Data } from "../../context/Data/Index";
import AddClientModal from "../../modals/AddClientModal";
// @ts-ignore
// prettier-ignore
import { ButtonPrimary, dispatchCustomEvent, ButtonSecondary } from "slate-react-system";
import { anyToBytes } from "../../utils/Filters";
// @ts-ignore
import LoginGithub from "react-login-github";
import { config } from "../../config";
import WarnModalVerify from "../../modals/WarnModalVerify";
import { BeatLoader } from "react-spinners";
import { useContext } from "react";
import WarnModalNotaryVerified from "../../modals/WarnModalNotaryVeried";
import { LargeRequestTable, CancelProposalTable, NotaryTabs, PublicRequestTable, VerifiedClientsTable } from "./Notary/index";
import toast from 'react-hot-toast';
import { ldnParser } from "@keyko-io/filecoin-verifier-tools";


type NotaryProps = {
  clients: any[];
};

type CancelProposalDataType = {
  clientName: string,
  clientAddress: string,
  issueNumber: number,
  datacap: string,
  tx: any,
  comment: any
  msig: string
}

interface ProposedRequestBody {
  approvedMessage: boolean;
  correct: boolean;
  address: string;
  datacap: string;
  signerAddress: string;
  message: string;
}

const Notary = (props: { notaryProps: NotaryProps }) => {

  const context = useContext(Data)

  const [selectedClientRequests, setSelectedClientRequests] = useState([] as any)
  const [selectedLargeClientRequests, setSelectedLargeClientRequests] = useState([] as any)
  const [tabs, setTabs] = useState('3')
  const [approveLoading, setApproveLoading] = useState(false)
  const [approvedDcRequests, setApprovedDcRequests] = useState([] as any)
  const [dataForLargeRequestTable, setDataForLargeRequestTable] = useState([])
  const [largeRequestListLoading, setLargeRequestListLoading] = useState(false)
  const [cancelProposalData, setCancelProposalData] = useState<CancelProposalDataType | null>(null)
  const [dataCancel, setDataCancel] = useState<CancelProposalDataType[]>([])
  const [dataCancelLoading, setDataCancelLoading] = useState(false)

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
    if (!selectedClientRequests.length) {
      toast.error("You should select one public request!")
    } else {
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
              selected={selectedClientRequests[0]}
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
            largeAddress={origin === "Large" ? true : false}
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
      try {
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
      } catch (error) {
        console.log(error)
      }

    }
    showWarnVerify(origin)
  }

  const cancelDuplicateRequest = async () => {
    if (!cancelProposalData) {
      toast.error("You should select one pending request!")
      return;
    }

    try {
      setDataCancelLoading(true);

      const res = await context.wallet.api.cancelPending(cancelProposalData.msig, cancelProposalData.tx, context.wallet.walletIndex, context.wallet)

      if (!res) {
        setDataCancelLoading(false);
        toast.error("Something went wrong, please try again!")
        return;
      }

      const parsedBody: ProposedRequestBody = ldnParser.parseApprovedRequestWithSignerAddress(cancelProposalData.comment.body)

      const cancelRequestBody = (proposedCommentBody: ProposedRequestBody) => {

        const { message, address, datacap, signerAddress } = proposedCommentBody

        return `## Canceled Request\nThe following request has been canceled by the notary, thus should not be considered as valid anymore.\n#### Message sent to Filecoin Network\n>${message} \n#### Address \n> ${address}\n#### Datacap Allocated\n> ${datacap}\n#### Signer Address\n> ${signerAddress}\n#### You can check the status of the message here: https://filfox.info/en/message/${message}`
      }

      const postLogs = context.postLogs(
        `Request Canceled with txID:${cancelProposalData.tx.id}, Signer Address: ${context.wallet.activeAccount}`,
        "INFO",
        "cancel_request",
        cancelProposalData.issueNumber,
        "CANCEL_REQUEST"
      );

      const updateComment = context.github.githubOcto.rest.issues.updateComment({
        owner: config.onboardingLargeOwner,
        repo: config.onboardingLargeClientRepo,
        comment_id: cancelProposalData.comment.id,
        body: cancelRequestBody(parsedBody)
      });

      await Promise.all([updateComment, postLogs])

      toast.success("Your pending request has been successfully canceled.")

      const updateCancelData = (item: any) => item.clientAddress !== cancelProposalData.clientAddress

      setDataCancel((dataCancel: any) => dataCancel.filter(updateCancelData))

      setDataCancelLoading(false);
      setCancelProposalData(null);

    } catch (error) {
      await context.postLogs(
        `Error canceling pending request txID:${cancelProposalData.tx.id}, Signer Address:${context.wallet.activeAccount}`,
        "ERROR",
        "cancel_request",
        cancelProposalData.issueNumber,
        "CANCEL_REQUEST"
      );
      toast.error("Something went wrong, please try again!")
      setDataCancelLoading(false)
    }
  }

  const user = context.github.loggedUser

  useEffect(() => {
    if (user) {
      context.loadClientRequests()
    }
  }, [user])

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
      if (selectedClientRequests.includes(request.number)) {
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

          const signer = context.wallet.activeAccount ?? ""

          const txReceipt = await context.wallet.api.getReceipt(messageID);
          if (txReceipt.ExitCode !== 0) {
            errorMessage += `#### There was an error processing the message \n>${messageID}, retry later.`;
            context.updateGithubVerified(
              request.number,
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
            request.number,
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
            requestNumber: request.number,
            messageID: messageID,
            address: address,
            dataCap: dc,
            multisigId: context.wallet.multisigID,
            activeAccount: context.wallet.activeAccount,
            accounts: context.wallet.accounts,
            walletIndex: context.wallet.walletIndex,
          };
        } catch (e: any) {
          setApproveLoading(false)
          sentryData = {
            ...sentryData,
            error: e,
          };

          context.logToSentry(
            `verifyClients issue n. ${request.number}`,
            `verifyClients error - issue n. ${request.number}: ${e.message}`,
            "error",
            sentryData
          );
          context.wallet.dispatchNotification(
            "Verification failed: " + e.message
          );
        } finally {
          context.logToSentry(
            `verifyClients issue n. ${request.number}`,
            `verifyClients info: verifyClients issue n. ${request.number}`,
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
            //it's a doublecheck //TODO redo it better, not really working
            // const isProposed = await checkAlreadyProposed(request.issue_number, context)

            // if (isProposed) {
            //   alert("Something is wrong. There is already one pending proposal for this issue. Please, contact the governance team.")
            //   return
            // }

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
              '',
              address,
              datacap,
              signer,
              errorMessage,
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
            signer,
            "",
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
        } catch (e: any) {
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
    context.loadClientRequests()
    setLargeRequestListLoading(false)
  };

  const activeTable = (tabs: any) => {
    const tables: any = {
      "1": <PublicRequestTable setSelectedClientRequests={setSelectedClientRequests} />,
      "2": <VerifiedClientsTable verifiedClients={props.notaryProps.clients} />,
      "3": < LargeRequestTable largeRequestListLoading={largeRequestListLoading}
        setSelectedLargeClientRequests={setSelectedLargeClientRequests}
        dataForLargeRequestTable={dataForLargeRequestTable}
        setDataForLargeRequestTable={setDataForLargeRequestTable}
      />,
      "4": <CancelProposalTable dataCancel={dataCancel}
        setDataCancel={setDataCancel}
        dataCancelLoading={dataCancelLoading}
        setCancelProposalData={setCancelProposalData} />
    }

    return tables[tabs]
  }

  return (
    <div className="main">
      <div className="tabsholder">
        <NotaryTabs tabs={tabs} changeStateTabs={changeStateTabs} verifiedClientsLength={props.notaryProps.clients.length} />
        <div className="tabssadd">
          {tabs === "1" && (
            <ButtonPrimary onClick={() => requestDatacap()}>
              Approve Private Request
            </ButtonPrimary>
          )}
          {tabs === "1" && (
            <ButtonPrimary onClick={() => verifyNewDatacap()}>
              Verify new datacap
            </ButtonPrimary>
          )}
          {tabs === "4" && (dataCancelLoading ? <BeatLoader size={15} color={"rgb(24,160,237)"} /> : <ButtonPrimary
            onClick={cancelDuplicateRequest}
          >
            Cancel Proposal
          </ButtonPrimary>)}

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