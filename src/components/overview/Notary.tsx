import React, { useEffect, useState } from "react";

import { Data } from "../../context/Data/Index";
import AddClientModal from "../../modals/AddClientModal";
import AddVerifierModal from "../../modals/AddVerifierModal";
// @ts-ignore
// prettier-ignore
import { ButtonPrimary, dispatchCustomEvent, ButtonSecondary } from "slate-react-system";
import { bytesToiB, anyToBytes } from "../../utils/Filters";
import BigNumber from "bignumber.js";
// @ts-ignore
import LoginGithub from "react-login-github";
import { config } from "../../config";
import WarnModal from "../../modals/WarnModal";
import WarnModalVerify from "../../modals/WarnModalVerify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { tableElementFilter } from "../../utils/SortFilter";
import Pagination from "../Pagination";
import history from "../../context/History";
import { BeatLoader } from "react-spinners";
import DataTable from "react-data-table-component";
import { useContext } from "react";
import { searchAllColumnsFromTable } from "../../pages/tableUtils/searchAllColumnsFromTable";
import WarnModalNotaryVerified from "../../modals/WarnModalNotaryVeried";
import { CircularProgress } from "@material-ui/core";




type NotaryProps = {
  clients: any[];
  searchString: string;
};
const CANT_SIGN_MESSAGE = "You can currently only approve the allocation requests associated with the multisig organization you signed in with. Signing proposals for additional DataCap allocations will require you to sign in again";

const Notary = (props: { notaryProps: NotaryProps }) => {

  const context = useContext(Data)

  const verifiedClientsColums = [
    { id: "verified", value: "ID" },
    { id: "key", value: "Address" },
    { id: "datacap", value: "Datacap" },
  ];

  const publicRequestColums = [
    { id: "name", value: "Client" },
    { id: "address", value: "Address" },
    { id: "datacap", value: "Datacap" },
    { id: "number", value: "Audit Trail" },
  ];

  const largeRequestColums = [
    { id: "name", value: "Client" },
    { id: "address", value: "Address" },
    { id: "multisig", value: "multisig" },
    { id: "datacap", value: "Datacap" },
    { id: "approvals", value: "Approvals" },
    { id: "proposer", value: "Proposer" },
    { id: "issue_number", value: "Audit Trail" },
  ];

  const [selectedTransactions, setSelectedTransactions] = useState([])
  const [selectedClientRequests, setSelectedClientRequests] = useState([] as any)
  const [selectedLargeClientRequests, setSelectedLargeClientRequests] = useState([] as any)
  const [tabs, setTabs] = useState('1')
  const [sortOrderVerified, setSortOrderVerified] = useState(-1)
  const [orderByVerified, setOrderByVerified] = useState('name')
  const [refVerified, setRefVerified] = useState({})
  const [sortOrderPublic, setSortOrderPublic] = useState(-1)
  const [orderByPublic, setOrderByPublic] = useState('name')
  const [sortOrderLargePublic, setSortOrderLargePublic] = useState(-1)
  const [orderByLargePublic, setOrderByLargePublic] = useState('name')
  const [refPublic, setRefPublic] = useState({} as any)
  const [regLargePublic, setRegLargePublic] = useState({})
  const [approveLoading, setApproveLoading] = useState(false)
  const [approvedDcRequests, setApprovedDcRequests] = useState([] as any)
  const [largeRequestList, setLargeRequestList] = useState([])
  const [listIsChecked, setListIsChecked] = useState([])
  const [dataForLargeRequestTable, setDataForLargeRequestTable] = useState([])
  const [largeRequestListLoading, setLargeRequestListLoading] = useState(false)


  const showVerifiedClients = async () => {
    setTabs('2')
  };

  const showClientRequests = async () => {
    setTabs('1')
  };

  const showLargeRequests = async () => {
    setTabs('3')
  };

  const onRefVerifiedChange = (refVerified: any) => {
    setRefVerified(refVerified)
  };

  const onRefPublicChange = (refPublic: any) => {
    setRefPublic(refPublic)
  };

  const onRefLargePublicChange = (regLargePublic: any) => {
    setRegLargePublic(regLargePublic)
  };

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

          const signer = context.wallet.activeAccount
            ? context.wallet.activeAccount
            : "";

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
        } catch (e) {
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
      if (selectedLargeClientRequests.includes(request.number)) {
        let sentryData: any = {};
        sentryData.request = { ...request };
        sentryData.requestNumber = request.number;
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
              request.number,
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
              request.number,
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
            request.number,
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
            `verifyLargeClients issue n. ${request.number}`,
            `verifyLargeClients error - issue n. ${request.number}, error:${e.message}`,
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


  const selectClientRow = (number: string) => {

    let selectedTxs = selectedClientRequests;
    if (selectedTxs.includes(number)) {
      selectedTxs = selectedTxs.filter((item: any) => item !== number);
    } else {
      selectedTxs.push(number);
    }
    setSelectedClientRequests(selectedTxs)

  };




  const orderPublic = async (e: any) => {
    const { orderBy, sortOrder }: any = await context.sortPublicRequests(
      e,
      orderByPublic,
      sortOrderPublic,
    );
    setOrderByPublic(orderBy)
    setSortOrderPublic(sortOrder)
  };



  const showClientDetail = (e: any) => {
    const listRequestFiltered = context.clientRequests
      .filter(
        (element: any) =>
          tableElementFilter(props.notaryProps.searchString, element.data) === true
      )
      .filter((_: any, i: any) => refPublic?.checkIndex(i));

    const client = listRequestFiltered[e.currentTarget.id].data.name;
    const user = listRequestFiltered[e.currentTarget.id].owner;
    const address = listRequestFiltered[e.currentTarget.id].data.address;
    const datacap = listRequestFiltered[e.currentTarget.id].data.datacap;

    history.push("/client", { client, user, address, datacap });
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
        {context.ldnRequestsLoading ? (
          <div className="tabs">
            <div
              className={tabs === "1" ? "selected" : ""}
              onClick={() => {
                showClientRequests();
              }}
            >
              <BeatLoader size={15} color={"rgb(24,160,237)"} />
            </div>
            <div
              className={tabs === "3" ? "selected" : ""}
              onClick={() => {
                showLargeRequests();
              }}
            >
              <BeatLoader size={15} color={"rgb(24,160,237)"} />
            </div>
            <div
              className={tabs === "2" ? "selected" : ""}
              onClick={() => {
                showVerifiedClients();
              }}
            >
              Verified clients ({props.notaryProps.clients.length})
            </div>
          </div>
        ) : (
          <div className="tabs">
            <div
              className={tabs === "1" ? "selected" : ""}
              onClick={() => {
                showClientRequests();
              }}
            >
              Public Requests ({context.clientRequests.length})
            </div>
            <div
              className={tabs === "3" ? "selected" : ""}
              onClick={() => {
                showLargeRequests();
              }}
            >
              Large Requests ({context.largeClientRequests.length})
            </div>
            <div
              className={tabs === "2" ? "selected" : ""}
              onClick={() => {
                showVerifiedClients();
              }}
            >
              Verified clients ({props.notaryProps.clients.length})
            </div>
          </div>
        )}
        <div className="tabssadd">
          {tabs !== "3" ? (
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
      {tabs === "1" && context.github.githubLogged ? (
        <div>
          <table>
            <thead>
              <tr>
                <td></td>
                {publicRequestColums.map((column: any) => (
                  <td id={column.id} onClick={orderPublic}>
                    {column.value}
                    <FontAwesomeIcon icon={["fas", "sort"]} />
                  </td>
                ))}
              </tr>
            </thead>
            <tbody>
              {refPublic && refPublic.checkIndex
                ? context.clientRequests
                  .filter(
                    (element: any) =>
                      tableElementFilter(
                        props.notaryProps.searchString,
                        element.data
                      ) === true
                  )
                  .filter((_: any, i: any) =>
                    refPublic?.checkIndex(i)
                  )
                  .map((clientReq: any, index: any) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="checkbox"
                          onChange={() =>
                            selectClientRow(clientReq.number)
                          }
                          checked={selectedClientRequests.includes(
                            clientReq.number
                          )}
                        />
                      </td>
                      <td>
                        <FontAwesomeIcon
                          icon={["fas", "info-circle"]}
                          id={index}
                          onClick={(e) => showClientDetail(e)}
                        />{" "}
                        {clientReq.data.name}{" "}
                      </td>
                      <td>{clientReq.data.address}</td>
                      <td>{clientReq.data.datacap}</td>
                      <td>
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          href={clientReq.url}
                        >
                          #{clientReq.number}
                        </a>
                      </td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
          <Pagination
            elements={context.clientRequests}
            maxElements={10}
            ref={onRefPublicChange}
            refresh={() => { }}
            search={props.notaryProps.searchString}
          />
          {context.clientRequests.length === 0 ? (
            <div className="nodata">No client requests yet</div>
          ) : null}
          <div className="alignright">
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
        </div>
      ) : null}
      {tabs === "3" && context.github.githubLogged ? (
        <div style={{ minHeight: "500px" }}>
          {largeRequestListLoading ? <CircularProgress
            style={{ margin: "100px 50%", color: "rgb(0, 144, 255)" }}
          /> :
            <DataTable
              columns={[
                {
                  name: "Client",
                  selector: (row: any) => row.data,
                  sortable: true,
                },
                {
                  name: "Address",
                  selector: (row: any) => row.address,
                  sortable: true,
                },
                {
                  name: "multisig",
                  selector: (row: any) => row.multisig,
                  sortable: true,
                  grow: 0.6
                },
                {
                  name: "Datacap",
                  selector: (row: any) => row.datacap,
                  sortable: true,
                  grow: 0.6
                },
                {
                  name: "Proposer",
                  selector: (row: any) => row.proposer.signerGitHandle,
                  sortable: true,
                  cell: (row: any) => <span >{row.proposer.signerGitHandle || "-"}</span>,
                  grow: 0.5,
                },
                {
                  name: "Audit Trail",
                  selector: (row: any) => row.issue_number,
                  sortable: true,
                  grow: 0.6,
                  cell: (row: any) => <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={row.url}>#{row.issue_number}</a>,
                },
                {
                  name: "TxId",
                  selector: (row: any) => row.tx.id,
                  grow: 0.5,
                },
                {
                  name: "Approvals",
                  selector: (row: any) => row.approvals,
                  sortable: true,
                  grow: 0.5,
                },
              ]}
              selectableRowDisabled={(row) => !row.signable}
              selectableRowsHighlight
              selectableRows
              selectableRowsNoSelectAll={true}
              pagination
              paginationRowsPerPageOptions={[10, 20, 30]}
              paginationPerPage={10}
              defaultSortFieldId={1}
              noDataComponent="No large client requests yet"
              onSelectedRowsChange={({ selectedRows }) => {
                const rowNumbers = selectedRows.map((row: any) => row.issue_number)
                setSelectedLargeClientRequests(rowNumbers)
              }}
              onRowClicked={(row) => {
                if (!row.signable) {
                  context.wallet.dispatchNotification(CANT_SIGN_MESSAGE)
                }
              }}
              noContextMenu={true}
              data={searchAllColumnsFromTable({ rows: dataForLargeRequestTable, query: props.notaryProps.searchString })}
            />}
          <div className="alignright">
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
        </div>
      ) : null}
      {!context.github.githubLogged ? (
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
        </div>

      ) : null}
      {tabs === "2" && context.github.githubLogged ? (

        <DataTable
          columns={[
            {
              name: "ID",
              selector: (row: any) => row.verified,
              sortable: true,
            },
            {
              name: "Address",
              selector: (row: any) => row.key,
              sortable: true,
              grow: 3,
              cell: (row: any) => (
                <span>
                  {row.key || (
                    <BeatLoader size={5} color={"rgb(24,160,237)"} />
                  )}
                </span>
              ),
            },
            {
              name: "Datacap",
              selector: (row: any) => row.datacap,
              sortable: true,
              cell: (row: any) => <span>{bytesToiB(row.datacap)}</span>,
            },
          ]}
          data={props.notaryProps.clients}
          pagination
          paginationRowsPerPageOptions={[10, 20, 30]}
          paginationPerPage={10}
        />

      ) : null}
    </div>
  );
}
export default Notary