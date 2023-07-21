import { useEffect, useState } from "react"
import { Data } from "../../context/Data/Index"
import AddClientModal from "../../modals/AddClientModal"
// @ts-ignore
// prettier-ignore
import { ButtonPrimary, dispatchCustomEvent, ButtonSecondary } from "slate-react-system";
import { anyToBytes } from "../../utils/Filters"
// @ts-ignore
import LoginGithub from "react-login-github"
import { config } from "../../config"
import WarnModalVerify from "../../modals/WarnModalVerify"
import { BeatLoader } from "react-spinners"
import { useContext } from "react"
import WarnModalNotaryVerified from "../../modals/WarnModalNotaryVeried"
import {
  LargeRequestTable,
  CancelProposalTable,
  NotaryTabs,
  PublicRequestTable,
  VerifiedClientsTable,
} from "./Notary/index"
import toast from "react-hot-toast"
import { ldnParser } from "@keyko-io/filecoin-verifier-tools"
import * as Logger from "../../logger"
import LargeRequestsProvider from "../../context/LargeRequests"
import ApproveLargeRequestModal from "./Notary/ApproveLargeRequestModal"
import NodeDataProvider from "../../context/NodeData"
import { DataCapRemovalRequest, LargeRequestData } from "../../type"
import { EVENT_TYPE, MetricsApiParams } from "../../utils/Metrics"
import { callMetricsApi } from "@keyko-io/filecoin-verifier-tools/lib/metrics/metrics"
import RemoveDataCapTable from "./Notary/RemoveDataCapTable"
import { encode } from "cbor-x"
import { ISSUE_LABELS } from "filecoin-verifier-common"

type NotaryProps = {
  clients: any[]
}

enum NotaryActions {
  Proposed = "Proposed",
  Approved = "Approved",
}

type CancelProposalDataType = {
  clientName: string
  clientAddress: string
  issueNumber: number
  datacap: string
  tx: any
  comment: any
  msig: string
}

interface ProposedRequestBody {
  approvedMessage: boolean
  correct: boolean
  address: string
  datacap: string
  signerAddress: string
  message: string
}

const Notary = (props: { notaryProps: NotaryProps }) => {
  const context = useContext(Data)

  const [selectedClientRequests, setSelectedClientRequests] = useState(
    [] as any
  )
  const [selectedLargeClientRequests, setSelectedLargeClientRequests] =
    useState([] as any)
  const [tabs, setTabs] = useState("3")
  const [approveLoading, setApproveLoading] = useState(false)
  const [approvedDcRequests, setApprovedDcRequests] = useState([] as any)
  const [cancelProposalData, setCancelProposalData] =
    useState<CancelProposalDataType | null>(null)
  const [removeDataCapIssue, setRemoveDataCapIssue] =
    useState<DataCapRemovalRequest>()
  const [dataCancel, setDataCancel] = useState<CancelProposalDataType[]>([])
  const [dataCancelLoading, setDataCancelLoading] = useState(false)
  const [removalLoading, setRemovalLoading] = useState(false)
  const [isApproveLargeRequestModalOpen, setIsApproveLargeRequestModalOpen] =
    useState(false)

  const openApproveLargeRequestModal = () =>
    setIsApproveLargeRequestModalOpen(true)
  const closeApproveLargeRequestModal = () =>
    setIsApproveLargeRequestModalOpen(false)
  const changeStateTabs = (indexTab: string) => {
    setTabs(indexTab)
  }

  const [directReqTableData, setDirectReqTableData] = useState<any>([])

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
    })
  }

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
      })
    }
  }

  const showWarnVerify = async (origin: string) => {
    console.log("working....", origin)
    console.log(directReqTableData, "xx")
    dispatchCustomEvent({
      name: "create-modal",
      detail: {
        id: Math.random()
          .toString(36)
          .replace(/[^a-z]+/g, "")
          .substr(0, 5),
        modal: (
          <WarnModalVerify
            clientRequests={origin === "Notary" ? directReqTableData : []}
            selectedClientRequests={
              origin === "Notary" ? selectedClientRequests : []
            }
            onClick={() => {
              origin === "Notary"
                ? verifyClients()
                : origin === "newDatacap"
                ? verifyNewDatacap()
                : requestDatacap()
            }}
            largeAddress={origin === "Large" ? true : false}
            origin={
              origin === "Notary" || "Large" ? "Notary" : "single-message"
            }
          />
        ),
      },
    })
  }

  // if(config.lotusNodes[this.context.wallet.networkIndex].name !== "Localhost")

  const checkNotaryIsVerifiedAndShowWarnVerify = async (
    e: any,
    origin: string
  ) => {
    if (config.lotusNodes[context.wallet.networkIndex].name !== "Localhost") {
      try {
        //feat temporary disabled
        const isVerified: any = true
        // const isVerified: any = await context.checkVerifyWallet();
        if (!isVerified) {
          await e.preventDefault()
          dispatchCustomEvent({
            name: "create-modal",
            detail: {
              id: Math.random()
                .toString(36)
                .replace(/[^a-z]+/g, "")
                .substr(0, 5),
              modal: (
                <WarnModalNotaryVerified
                  onClick={async () => await context.verifyWalletAddress()}
                />
              ),
            },
          })
          return
        }
      } catch (error) {
        console.log(error)
      }
    }
    if (origin === "Large") {
      openApproveLargeRequestModal()
      // show new Large
    } else {
      showWarnVerify(origin)
    }
  }

  const cancelDuplicateRequest = async () => {
    if (!cancelProposalData) {
      toast.error("You should select one pending request!")
      return
    }

    try {
      setDataCancelLoading(true)

      const res = await context.wallet.api.cancelPending(
        cancelProposalData.msig,
        cancelProposalData.tx,
        context.wallet.walletIndex,
        context.wallet
      )

      if (!res) {
        setDataCancelLoading(false)
        toast.error("Something went wrong, please try again!")
        return
      }

      const parsedBody: ProposedRequestBody =
        ldnParser.parseApprovedRequestWithSignerAddress(
          cancelProposalData.comment.body
        )

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
      )

      const updateComment = context.github.githubOcto.rest.issues.updateComment(
        {
          owner: config.onboardingLargeOwner,
          repo: config.onboardingLargeClientRepo,
          comment_id: cancelProposalData.comment.id,
          body: cancelRequestBody(parsedBody),
        }
      )

      await Promise.all([updateComment, postLogs])

      toast.success("Your pending request has been successfully canceled.")

      await Logger.BasicLogger({ message: Logger.PROPOSE_CANCELLED })

      const updateCancelData = (item: any) =>
        item.clientAddress !== cancelProposalData.clientAddress

      setDataCancel((dataCancel: any) => dataCancel.filter(updateCancelData))

      setDataCancelLoading(false)
      setCancelProposalData(null)
    } catch (error) {
      await context.postLogs(
        `Error canceling pending request txID:${cancelProposalData.tx.id}, Signer Address:${context.wallet.activeAccount}`,
        "ERROR",
        "cancel_request",
        cancelProposalData.issueNumber,
        "CANCEL_REQUEST"
      )
      toast.error("Something went wrong, please try again!")
      setDataCancelLoading(false)
    }
  }

  const user = context.github.loggedUser

  useEffect(() => {
    if (user) {
      // context.loadClientRequests();
    }
  }, [user])

  useEffect(() => {
    const selectedTab = tabs === "1" ? "Notary" : "Large"

    if (context.isAddressVerified) {
      showWarnVerify(selectedTab)
    }
  }, [context.isAddressVerified])

  const verifyClients = async () => {
    dispatchCustomEvent({ name: "delete-modal", detail: {} })
    setApproveLoading(true)

    for (const request of directReqTableData) {
      console.log(request, "10 10 10")
      if (selectedClientRequests.includes(request.number)) {
        let messageID = ""
        let address = ""
        let errorMessage = ""
        try {
          const datacap: number = anyToBytes(request.datacap)
          address = request.address
          if (address.length < 12) {
            address = await context.wallet.api.actorKey(address)
          }
          if (context.wallet.multisig) {
            messageID = await context.wallet.api.multisigVerifyClient(
              context.wallet.multisigID,
              address,
              BigInt(datacap),
              context.wallet.walletIndex
            )
          } else {
            messageID = await context.wallet.api.verifyClient(
              address,
              BigInt(datacap.toFixed()),
              context.wallet.walletIndex
            )
          }

          const signer = context.wallet.activeAccount ?? ""

          const txReceipt = await context.wallet.api.getReceipt(messageID)
          if (txReceipt.ExitCode !== 0) {
            errorMessage += `#### There was an error processing the message \n>${messageID}, retry later.`
            context.updateGithubVerified(
              request.number,
              messageID,
              address,
              datacap,
              signer,
              errorMessage
            )
            context.wallet.dispatchNotification(
              "Error processing the message: " + messageID
            )
            throw Error(errorMessage)
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
          )

          // send notifications
          context.wallet.dispatchNotification(
            "Verify Client Message sent with ID: " + messageID
          )

          // context.loadClientRequests();
        } catch (e: any) {
          setApproveLoading(false)

          context.wallet.dispatchNotification(
            "Verification failed: " + e.message
          )
        } finally {
          await Logger.BasicLogger({
            message: Logger.CLIENT_ALLOCATION_REQUEST,
          })
        }
      }
    }
  }

  const verifyLargeClients = async (i?: LargeRequestData[]) => {
    setApproveLoading(true)
    let thisStateLargeRequestList = Array.isArray(i)
      ? i
      : context.largeClientRequests
    for (const request of thisStateLargeRequestList) {
      let action = NotaryActions.Proposed
      try {
        const pendingTxs = await context.wallet.api.pendingTransactions(
          String(request.multisig)
        )
        const pendingForClient = pendingTxs?.filter(
          (tx: any) =>
            tx?.parsed?.params?.address == request.address &&
            tx?.parsed?.params?.cap == anyToBytes(request.datacap)
        )
        const mostRecentTx = pendingForClient[pendingForClient.length - 1]

        let errorMessage = ""
        const PHASE = "DATACAP-SIGN"
        const datacap = anyToBytes(request.datacap)
        let address = request.address

        if (address.length < 12) {
          address = await context.wallet.api.actorKey(address)
        }

        let messageID
        const signer = context.wallet.activeAccount
          ? context.wallet.activeAccount
          : ""
        await context.postLogs(
          `starting to sign datacap request. approvals: ${
            request.approvals
          } -signer: ${signer}, uuid: ${
            request.uuid ? request.uuid : "not found"
          }`,
          "DEBUG",
          "",
          request.issue_number,
          PHASE
        )
        if (mostRecentTx) {
          action = NotaryActions.Approved

          messageID = await context.wallet.api.approvePending(
            request.multisig,
            mostRecentTx,
            context.wallet.walletIndex
          )

          //EVENTS TO DMOB
          const params: MetricsApiParams = {
            name: request.name,
            clientAddress: request.address,
            msigAddress: request.multisig,
            amount: request.datacap,
            messageCid: messageID,
            uuid: request.uuid ? request.uuid : "not found",
          }
          await callMetricsApi(
            request.issue_number,
            EVENT_TYPE.DC_ALLOCATION,
            params,
            config.metrics_api_environment
          )

          setApprovedDcRequests([...approvedDcRequests, request.issue_number])
          await context.postLogs(
            `Datacap GRANTED: ${messageID} - signer: ${signer}`,
            "INFO",
            "datacap_granted",
            request.issue_number,
            PHASE
          )

          context.wallet.dispatchNotification(
            `datacap being approved: ${request.datacap} \nclient address: ${address}`
          )
        } else {
          messageID = await context.wallet.api.multisigVerifyClient(
            request.multisig,
            address,
            BigInt(Math.floor(datacap)),
            context.wallet.walletIndex
          )

          request.approvals = true
          await context.postLogs(
            `Datacap PROPOSED: ${messageID} - signer: ${signer}`,
            "INFO",
            "datacap_proposed",
            request.issue_number,
            PHASE
          )
        }

        if (!messageID) {
          errorMessage += `#### the transaction was unsuccessful - retry later.`
          await context.updateGithubVerifiedLarge(
            request.issue_number,
            "",
            address,
            datacap,
            signer,
            errorMessage,
            request.uuid
          )

          context.wallet.dispatchNotification(errorMessage)
          await Logger.BasicLogger({
            message: `Message ID not found ${request.issue_number}`,
          })
          throw Error(errorMessage)
        }

        await context.updateGithubVerifiedLarge(
          request.issue_number,
          messageID,
          address,
          datacap,
          signer,
          "",
          request.uuid,
          action
        )

        if (action === "Proposed") {
          await Logger.BasicLogger({ message: Logger.REQUEST_PROPOSED })
        } else {
          await Logger.BasicLogger({ message: Logger.REQUEST_APPROVED })
        }

        context.wallet.dispatchNotification(
          "Transaction successful! Verify Client Message sent with ID: " +
            messageID
        )
        await context.postLogs(
          `Transaction successful! Verify Client Message sent with ID: ${messageID}`,
          "DEBUG",
          "",
          request.issue_number,
          PHASE
        )
        setApproveLoading(false)
        //UPDATE THE CONTEXT
        context.updateContextState(
          thisStateLargeRequestList,
          "largeClientRequests"
        )
      } catch (e: any) {
        console.log(e.message)
        context.wallet.dispatchNotification("Verification failed: " + e.message)

        if (action === NotaryActions.Proposed) {
          await Logger.BasicLogger({ message: "Proposal Failed" })
        } else if (action === NotaryActions.Approved) {
          await Logger.BasicLogger({ message: "Approval Failed" })
        }

        await context.postLogs(
          `The transaction to sign the datacap failed: ${e.message}`,
          "ERROR",
          "",
          request.issue_number,
          "DATACAP-SIGN"
        )

        setApproveLoading(false)
      }
    }
  }

  const signRemovalRequest = async () => {
    try {
      setRemovalLoading(true)
      const dataCapBytes: number = anyToBytes(
        removeDataCapIssue?.datacapToRemove as string
      )
      console.log("sign removal request")
      const idAddress = await context.wallet.api.actorAddress(
        removeDataCapIssue?.address
      )
      const message = {
        VerifiedClient: idAddress,
        DataCapAmount: dataCapBytes,
        RemovalProposalID: 0, //hardcoding it to 0 for now
      }

      const encodedMessage = context.wallet.api.encodeRemoveDataCapParameters({
        verifiedClient: message.VerifiedClient,
        dataCapAmount: message.DataCapAmount,
        removalProposalID: [message.RemovalProposalID],
      })
      const signature = await context.wallet.signRemoveDataCap(
        encodedMessage,
        0
      )
      let labelsToAdd = removeDataCapIssue?.labels.find(
        (l: string) => l === ISSUE_LABELS.DC_REMOVE_NOTARY_PROPOSED
      )
        ? ISSUE_LABELS.DC_REMOVE_NOTARY_APPROVED
        : ISSUE_LABELS.DC_REMOVE_NOTARY_PROPOSED

      const body = `# notary approved for datacap removal: 
            \n > **Client Address**: ${removeDataCapIssue?.address}
            \n > **Client Id Address**: ${idAddress}
            \n > **Notary Id Address**: ${
              context.wallet.accountsActive[context.wallet.activeAccount]
            }
            \n > **Signature**: ${signature}`
      labelsToAdd = ISSUE_LABELS.DC_REMOVE_NOTARY_APPROVED
      Logger.BasicLogger({
        message: `${Logger.DATACAP_REMOVAL} - signature: ${signature} - notary address: ${idAddress}`,
      })
      if (removeDataCapIssue) {
        await context.github.githubOcto.issues.createComment({
          owner: config.onboardingOwner,
          repo: config.onboardingNotaryOwner,
          issue_number: removeDataCapIssue?.issue_number,
          body: body,
        })
        await context.github.githubOctoGeneric.octokit.issues.addLabels({
          owner: config.onboardingOwner,
          repo: config.onboardingNotaryOwner,
          issue_number: removeDataCapIssue?.issue_number,
          labels: [labelsToAdd],
        })
      }

      setRemovalLoading(false)
      context.wallet.dispatchNotification(
        "The dataCap Removal has been signed and posted to github"
      )
    } catch (error: any) {
      setRemovalLoading(false)
      Logger.BasicLogger({
        message: `${Logger.DATACAP_REMOVAL}. error: ${error.toString()}`,
      })
      console.log(error)
      context.wallet.dispatchNotification("error during signature creation")
    }
  }

  const activeTable = (tabs: any) => {
    const tables: any = {
      "1": (
        <PublicRequestTable
          setSelectedClientRequests={setSelectedClientRequests}
          setDirectReqTableData={setDirectReqTableData}
          directReqTableData={directReqTableData}
        />
      ),
      "2": <VerifiedClientsTable verifiedClients={props.notaryProps.clients} />,
      "3": (
        <LargeRequestTable
          setSelectedLargeClientRequests={setSelectedLargeClientRequests}
        />
      ),
      "4": (
        <CancelProposalTable
          dataCancel={dataCancel}
          setDataCancel={setDataCancel}
          dataCancelLoading={dataCancelLoading}
          setCancelProposalData={setCancelProposalData}
        />
      ),
      "5": (
        <RemoveDataCapTable setRemoveDataCapIssues={setRemoveDataCapIssue} />
      ),
    }

    return tables[tabs]
  }

  return (
    <NodeDataProvider>
      <LargeRequestsProvider>
        <div className="main">
          <div className="tabsholder">
            <NotaryTabs
              tabs={tabs}
              changeStateTabs={changeStateTabs}
              verifiedClientsLength={props.notaryProps.clients.length}
            />
            <ApproveLargeRequestModal
              open={isApproveLargeRequestModalOpen}
              handleClose={closeApproveLargeRequestModal}
              selectedClientRequests={selectedLargeClientRequests}
              onClick={verifyLargeClients}
            />
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
              {tabs === "4" &&
                (dataCancelLoading ? (
                  <BeatLoader size={15} color={"rgb(24,160,237)"} />
                ) : (
                  <ButtonPrimary onClick={cancelDuplicateRequest}>
                    Cancel Proposal
                  </ButtonPrimary>
                ))}
              {tabs === "5" &&
                (removalLoading ? ( //TODO change
                  <BeatLoader size={15} color={"rgb(24,160,237)"} />
                ) : (
                  <ButtonPrimary onClick={signRemovalRequest}>
                    Sign Removal Request
                  </ButtonPrimary>
                ))}

              {tabs === "1" || tabs === "2" || tabs === "3" ? (
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
                      {tabs === "3" ? "Approve Request" : "Verify client"}
                    </ButtonPrimary>
                  )}
                </>
              ) : null}
            </div>
          </div>

          {context.github.githubLogged && activeTable(tabs)}

          {!context.github.githubLogged ? (
            <div style={{ marginTop: "50px" }}>
              <div id="githublogin">
                <LoginGithub
                  redirectUri={config.oauthUri}
                  clientId={config.githubApp}
                  scope="repo"
                  onSuccess={async (response: { code: string }) => {
                    await context.github.loginGithub(response.code)
                  }}
                  onFailure={(response: any) => {
                    console.log("failure", response)
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="alignright" style={{ marginBottom: "40px" }}>
              <ButtonSecondary
                className="buttonsecondary"
                onClick={async () => {
                  await context.github.logoutGithub()
                }}
              >
                Logout GitHub
              </ButtonSecondary>
            </div>
          )}
        </div>
      </LargeRequestsProvider>
    </NodeDataProvider>
  )
}

export default Notary
