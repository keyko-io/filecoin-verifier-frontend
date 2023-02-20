import React from "react";
import { Data } from "./Index";
import { config } from "../../config";
// @ts-ignore
import { IssueBody } from "../../utils/IssueBody";
import BigNumber from "bignumber.js";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid";
import { bytesToiB } from "../../utils/Filters";
import * as Sentry from "@sentry/react";
import { notaryLedgerVerifiedComment } from "./comments";
import {
  ldnParser,
  notaryParser,
  commonUtils,
  simpleClientParser,
} from "@keyko-io/filecoin-verifier-tools";
import verifierRegistry from "../../data/verifiers-registry.json";
import {
  ApprovedVerifiers,
  DirectIssue,
  LargeRequestData,
  VerifiedData,
} from "../../type";
import { DataProviderProps, DataProviderStates } from "../contextType";

export default class DataProvider extends React.Component<
  DataProviderProps,
  DataProviderStates
> {
  constructor(props: DataProviderProps) {
    super(props);
    this.state = {
      updateContextState: (elementToUpdate: any, type: string) => {
        switch (type) {
          case "largeClientRequests":
            this.setState({
              largeClientRequests: elementToUpdate,
            });
            break;

          default:
            break;
        }
        this.setState({
          clientRequests: [],
          largeClientRequests: [],
          ldnRequestsLoading: false,
        });
      },
      postLogs: async (
        message: string,
        type: string,
        actionKeyword: string,
        issueNumber: number,
        repo: string
      ) => {
        try {
          if (
            config.lotusNodes[this.props.wallet.networkIndex].name ===
            "Localhost"
          ) {
            return;
          }

          const logArray = [
            {
              message,
              type,
              actionKeyword,
              repo,
              issueNumber: issueNumber.toString(),
            },
          ];
          const res = (
            await fetch(
              "https://cbqluey8wa.execute-api.us-east-1.amazonaws.com/dev",
              {
                headers: {
                  "x-api-key": config.loggerApiKey,
                },
                method: "POST",
                body: JSON.stringify({
                  type: "POST_CUSTOM_LOGS",
                  logArray: logArray,
                }),
              }
            )
          ).json();
          return res;
        } catch (error) {
          console.log(error);
        }
      },
      logToSentry: (
        category: string,
        message: string,
        level: "info" | "error",
        data: any
      ) => {
        let breadCrumb = {
          category,
          message,
          data,
        };
        Sentry.addBreadcrumb(breadCrumb);
        Sentry.captureMessage(breadCrumb.message);
      },
      getLDNIssuesAndTransactions: async () => {
        //GETTING ISSUES

        const rawLargeIssuesAll = await this.props.github.fetchGithubIssues(
          config.onboardingLargeOwner,
          config.onboardingLargeClientRepo,
          "open",
          "bot:readyToSign"
        );
        // const rawLargeIssuesAll = await this.props.github.githubOcto.paginate(
        //   this.props.github.githubOcto.issues.listForRepo,
        //   {
        //     owner: config.onboardingLargeOwner,
        //     repo: config.onboardingLargeClientRepo,
        //     assignee: "*",
        //     state: "open",
        //     labels: "bot:readyToSign",
        //   }
        // );

        const rawLargeIssues = rawLargeIssuesAll.filter(
          (item: any) =>
            !item.labels.find((l: any) => l.name === "status:needsDiligence")
        );

        //GETTING COMMENTS
        const comments: any = await Promise.allSettled(
          rawLargeIssues.map(
            (rawLargeIssue: any) =>
              new Promise<any>(async (resolve, reject) => {
                try {
                  const data = ldnParser.parseIssue(rawLargeIssue.body);
                  if (data) {
                    const rawLargeClientComments =
                      await this.props.github.fetchGithubComments(
                        config.onboardingLargeOwner,
                        config.onboardingLargeClientRepo,
                        rawLargeIssue.number
                      );

                    resolve({
                      issue_number: rawLargeIssue.number,
                      issue: rawLargeIssue,
                      comments: rawLargeClientComments,
                    });
                  } else {
                    resolve({});
                  }
                } catch (err) {
                  reject(err);
                }
              })
          )
        );

        //GROUPING ISSUES BY MSIG
        let issuesByMsig: any[] = [];

        for (let resProm of comments) {
          const comms = resProm?.value?.comments;
          const cmtsLength = resProm?.value?.comments?.length;

          for (let i = cmtsLength - 1; i >= 0; i--) {
            const commentParsed = ldnParser.parseReleaseRequest(comms[i].body);

            if (commentParsed.correct) {
              const issueInMsig = issuesByMsig.find(
                (item: any) =>
                  item.multisigAddress === commentParsed.notaryAddress
              );
              if (issueInMsig) {
                issueInMsig.issues.push({
                  clientAddress: commentParsed.clientAddress,
                  datacap: commentParsed.allocationDatacap,
                  issueInfo: resProm.value,
                });
              } else {
                issuesByMsig.push({
                  multisigAddress: commentParsed.notaryAddress,
                  issues: [
                    {
                      clientAddress: commentParsed.clientAddress,
                      datacap: commentParsed.allocationDatacap,
                      issueInfo: resProm.value,
                    },
                  ],
                });
              }
              break;
            }
          }
        }

        // GETTING PENDING TRANSACTIONS FROM LOTUS
        const txsGroupedByClientAddress: any = (
          await Promise.allSettled(
            issuesByMsig.map(
              (msigGroup: any) =>
                new Promise<any>(async (resolve, reject) => {
                  try {
                    const pendingTxs =
                      await this.props.wallet.api.pendingTransactions(
                        msigGroup.multisigAddress
                      );

                    // we will need msiginfo later
                    const multisigInfo =
                      await this.props.wallet.api.multisigInfo(
                        msigGroup.multisigAddress
                      );
                    // if they don't have method = 4 or they miss the 'parsed' object,
                    // we don't incclude them (for now)

                    const pendingFiltered = pendingTxs.filter(
                      (tx: any) => tx.tx.method === 4 && tx.parsed
                    );

                    const txsByClientAddress = _.groupBy(
                      pendingFiltered,
                      "parsed.params.address"
                    );

                    resolve({
                      multisigAddress: msigGroup.multisigAddress,
                      multisigInfo,
                      txsByClientAddress,
                    });
                  } catch (error) {
                    reject(error);
                  }
                })
            )
          )
        ).map((i: any) => i.value);

        // MATCH TRANSACTION WITH ISSUE
        const issuesByClientAddress = issuesByMsig.map((iss: any) => {
          return {
            multisigAddress: iss.multisigAddress,
            byClients: _.groupBy(iss.issues, "clientAddress"),
          };
        });

        let transactionAndIssue = [];
        for (let msigGroup of issuesByClientAddress) {
          const txsByCientList = txsGroupedByClientAddress
            .filter((i: any) => i)
            .filter(
              (i: any) => i.multisigAddress === msigGroup.multisigAddress
            );
          if (!txsByCientList.length) continue;
          for (let [k, v] of Object.entries(
            txsByCientList[0].txsByClientAddress
          )) {
            // pairs transaction and github issue
            transactionAndIssue.push({
              clientAddress: k,
              multisigAddress: msigGroup.multisigAddress,
              multisigInfo: txsByCientList[0].multisigInfo,
              tx: v as any,
              issue: msigGroup.byClients[k],
            });
          }
          // TODO make a list of issues without transactions
          for (let [k, v] of Object.entries(msigGroup.byClients)) {
            if (!transactionAndIssue.find((i: any) => i.clientAddress === k)) {
              transactionAndIssue.push({
                clientAddress: k,
                multisigAddress: msigGroup.multisigAddress,
                multisigInfo: txsByCientList[0].multisigInfo,
                tx: null,
                issue: v,
              });
            }
          }
        }

        // getLDNIssuesAndTransactions
        // return value:
        // both fields contain tx and associated issue
        // some of them can have tx but no issue
        // some of them can have issue but no tx
        // transactionAndIssue is all the array no matter if issue is null
        // filteredTxsIssue is the slice of transactionAndIssue where issues != null
        // this function is useful bc return transactions associated to issue

        // it looks like the there are many pending transactions which are not in github
        // removing the elements where issue is undefined to have the array containing pending and
        // non-pending requests

        return {
          transactionAndIssue,
          filteredTxsIssue: transactionAndIssue.filter((i: any) => i.issue),
        };
      },
      //@ts-ignore
      testGetLDNIssuesAndTransactions: async (rawLargeIssuesAll: any[]) => {
        //GETTING ISSUES

        //GETTING COMMENTS
        const comments: any = await Promise.allSettled(
          rawLargeIssuesAll.map(
            (rawLargeIssue: any) =>
              new Promise<any>(async (resolve, reject) => {
                try {
                  const data = ldnParser.parseIssue(rawLargeIssue.body);
                  if (data) {
                    const rawLargeClientComments =
                      await this.props.github.fetchGithubComments(
                        config.onboardingLargeOwner,
                        config.onboardingLargeClientRepo,
                        rawLargeIssue.number
                      );

                    resolve({
                      issue_number: rawLargeIssue.number,
                      issue: rawLargeIssue,
                      comments: rawLargeClientComments,
                    });
                  } else {
                    resolve({});
                  }
                } catch (err) {
                  reject(err);
                }
              })
          )
        );

        //GROUPING ISSUES BY MSIG
        let issuesByMsig: any[] = [];

        for (let resProm of comments) {
          const comms = resProm?.value?.comments;
          const cmtsLength = resProm?.value?.comments?.length;

          for (let i = cmtsLength - 1; i >= 0; i--) {
            const commentParsed = ldnParser.parseReleaseRequest(comms[i].body);

            if (commentParsed.correct) {
              const issueInMsig = issuesByMsig.find(
                (item: any) =>
                  item.multisigAddress === commentParsed.notaryAddress
              );
              if (issueInMsig) {
                issueInMsig.issues.push({
                  clientAddress: commentParsed.clientAddress,
                  datacap: commentParsed.allocationDatacap,
                  issueInfo: resProm.value,
                });
              } else {
                issuesByMsig.push({
                  multisigAddress: commentParsed.notaryAddress,
                  issues: [
                    {
                      clientAddress: commentParsed.clientAddress,
                      datacap: commentParsed.allocationDatacap,
                      issueInfo: resProm.value,
                    },
                  ],
                });
              }
              break;
            }
          }
        }

        // GETTING PENDING TRANSACTIONS FROM LOTUS
        const txsGroupedByClientAddress: any = (
          await Promise.allSettled(
            issuesByMsig.map(
              (msigGroup: any) =>
                new Promise<any>(async (resolve, reject) => {
                  try {
                    const pendingTxs =
                      await this.props.wallet.api.pendingTransactions(
                        msigGroup.multisigAddress
                      );

                    // we will need msiginfo later
                    const multisigInfo =
                      await this.props.wallet.api.multisigInfo(
                        msigGroup.multisigAddress
                      );
                    // if they don't have method = 4 or they miss the 'parsed' object,
                    // we don't incclude them (for now)

                    const pendingFiltered = pendingTxs.filter(
                      (tx: any) => tx.tx.method === 4 && tx.parsed
                    );

                    const txsByClientAddress = _.groupBy(
                      pendingFiltered,
                      "parsed.params.address"
                    );

                    resolve({
                      multisigAddress: msigGroup.multisigAddress,
                      multisigInfo,
                      txsByClientAddress,
                    });
                  } catch (error) {
                    reject(error);
                  }
                })
            )
          )
        ).map((i: any) => i.value);

        // MATCH TRANSACTION WITH ISSUE
        const issuesByClientAddress = issuesByMsig.map((iss: any) => {
          return {
            multisigAddress: iss.multisigAddress,
            byClients: _.groupBy(iss.issues, "clientAddress"),
          };
        });

        let transactionAndIssue = [];
        for (let msigGroup of issuesByClientAddress) {
          const txsByCientList = txsGroupedByClientAddress
            .filter((i: any) => i)
            .filter(
              (i: any) => i.multisigAddress === msigGroup.multisigAddress
            );
          if (!txsByCientList.length) continue;
          for (let [k, v] of Object.entries(
            txsByCientList[0].txsByClientAddress
          )) {
            // pairs transaction and github issue
            transactionAndIssue.push({
              clientAddress: k,
              multisigAddress: msigGroup.multisigAddress,
              multisigInfo: txsByCientList[0].multisigInfo,
              tx: v as any,
              issue: msigGroup.byClients[k],
            });
          }
          // TODO make a list of issues without transactions
          for (let [k, v] of Object.entries(msigGroup.byClients)) {
            if (!transactionAndIssue.find((i: any) => i.clientAddress === k)) {
              transactionAndIssue.push({
                clientAddress: k,
                multisigAddress: msigGroup.multisigAddress,
                multisigInfo: txsByCientList[0].multisigInfo,
                tx: null,
                issue: v,
              });
            }
          }
        }

        // getLDNIssuesAndTransactions
        // return value:
        // both fields contain tx and associated issue
        // some of them can have tx but no issue
        // some of them can have issue but no tx
        // transactionAndIssue is all the array no matter if issue is null
        // filteredTxsIssue is the slice of transactionAndIssue where issues != null
        // this function is useful bc return transactions associated to issue

        // it looks like the there are many pending transactions which are not in github
        // removing the elements where issue is undefined to have the array containing pending and
        // non-pending requests

        return {
          transactionAndIssue,
          filteredTxsIssue: transactionAndIssue.filter((i: any) => i.issue),
        };
      },
      loadClientRequests: async () => {
        try {
          this.setState({ ldnRequestsLoading: true });

          // DIRECT ISSUES /////////////////////
          // 'filecoin-plus-client-onboarding

          const rawDirectIssues = await this.props.github.fetchGithubIssues(
            config.onboardingOwner,
            config.onboardingClientRepo,
            "open",
            "state:Verifying"
          );

          // const rawDirectIssues = await this.props.github.githubOcto.paginate(
          //   this.props.github.githubOcto.issues.listForRepo,
          //   {
          //     owner: config.onboardingOwner,
          //     repo: config.onboardingClientRepo,
          //     assignee: "*",
          //     state: "open",
          //     labels: "state:Verifying",
          //   }
          // );

          const issues: DirectIssue[] = [];

          for (const rawIssue of rawDirectIssues) {
            const data = simpleClientParser.parseIssue(rawIssue.body);
            if (
              data.correct &&
              rawIssue.assignees.find(
                (a: any) => a.login === this.props.github.loggedUser
              ) !== undefined
            ) {
              issues.push({
                number: rawIssue.number,
                url: rawIssue.html_url,
                owner: rawIssue.user.login,
                data,
              });
            }
          }
          // DIRECT ISSUES END /////////////////////

          // LARGE ISSUES: filecoin-plus-large-datasets /////////////////////
          const ldnIssueTxs = await this.state.getLDNIssuesAndTransactions();
          const txsIssueGitHub = ldnIssueTxs.filteredTxsIssue;

          this.setState({ txsIssueGitHub });

          const largeissues: any = await Promise.allSettled(
            txsIssueGitHub.map(
              (elem: any) =>
                new Promise<any>(async (resolve, reject) => {
                  try {
                    const approvals = elem.tx ? 1 : 0;

                    const account =
                      this.props.wallet.accountsActive[
                        this.props.wallet.activeAccount
                      ];
                    const msigIncludeSigner =
                      elem.multisigInfo.signers.includes(account);

                    let signerAddress: any;
                    let signerGitHandle;
                    if (elem.tx) {
                      signerAddress = await this.props.wallet.api.actorKey(
                        elem.tx[0].signers[0]
                      );
                      signerGitHandle =
                        verifierRegistry.notaries.find(
                          (notary: any) =>
                            notary.ldn_config.signing_address === signerAddress
                        )?.github_user[0] || "none";
                    }

                    const approverIsNotProposer = signerAddress
                      ? signerAddress !== this.props.wallet.activeAccount
                      : false;

                    let signable = approvals
                      ? msigIncludeSigner && approverIsNotProposer
                      : msigIncludeSigner;
                    if (config.networks.includes("Localhost")) signable = true;
                    const datacap = elem.tx
                      ? bytesToiB(parseInt(elem.tx[0].parsed.params.cap))
                      : elem.issue[0].datacap;

                    const obj: LargeRequestData = {
                      issue_number: elem.issue[0].issueInfo.issue_number,
                      url: elem.issue[0].issueInfo.issue.html_url,
                      address: elem.clientAddress,
                      multisig: elem.multisigAddress,
                      datacap,
                      approvals,
                      tx: elem.tx ? elem.tx[0] : null,
                      proposer: {
                        signeraddress: signerAddress,
                        signerGitHandle: signerGitHandle as string,
                      },
                      labels: elem.issue[0].issueInfo.issue.labels.map(
                        (i: any) => i.name
                      ),
                      data: ldnParser.parseIssue(
                        elem.issue[0].issueInfo.issue.body
                      ),
                      signable: signable,
                    };
                    resolve(obj);
                  } catch (error) {
                    reject(error);
                  }
                })
            )
          );
          const largeClientRequests: LargeRequestData[] = largeissues.map(
            (i: any) => i.value
          );

          // LARGE ISSUES: filecoin-plus-large-datasets  END /////////////////////

          this.setState({
            clientRequests: issues,
            largeClientRequests,
            ldnRequestsLoading: false,
          });
        } catch (error) {
          console.error(error);
          this.setState({ ldnRequestsLoading: false });
          this.props.wallet.dispatchNotification(
            "While loading data error happened, please try again"
          );
        }
      },
      //@ts-ignore
      getReadyToSignIssues: async () => {
        try {
          const rawLargeIssuesAll = await this.props.github.fetchGithubIssues(
            config.onboardingLargeOwner,
            config.onboardingLargeClientRepo,
            "open",
            "bot:readyToSign"
          );

          return rawLargeIssuesAll.filter(
            (item: any) =>
              !item.labels.find((l: any) => l.name === "status:needsDiligence")
          );
        } catch (error) {
          console.log(error);
        }
      },
      // @ts-ignore
      testLoadLarge: async (page: number) => {
        try {
          this.setState({ ldnRequestsLoading: true });
          //@ts-ignore

          let rawLargeIssuesAllData: any[] = [];

          const localStorageLargeData = localStorage.getItem("largeIssuesData");

          if (localStorageLargeData) {
            const parsedData = JSON.parse(localStorageLargeData);
            this.setState({ rawLargeIssuesAll: parsedData });

            rawLargeIssuesAllData = parsedData;
          } else if (this.state.rawLargeIssuesAll.length === 0) {
            //@ts-ignore
            rawLargeIssuesAllData = await this.state.getReadyToSignIssues();
            this.setState({ rawLargeIssuesAll: rawLargeIssuesAllData });
            localStorage.setItem(
              "largeIssuesData",
              JSON.stringify(rawLargeIssuesAllData)
            );
          } else {
            rawLargeIssuesAllData = this.state.rawLargeIssuesAll;
          }

          const paginate = rawLargeIssuesAllData.slice(
            (page - 1) * 10,
            page * 10
          );
          console.log("paginate", paginate);
          //@ts-ignore
          const ldnIssueTxs = await this.state.testGetLDNIssuesAndTransactions(
            paginate
          );
          const txsIssueGitHub = ldnIssueTxs.filteredTxsIssue;

          // this data is current page data for large req dashboard
          this.setState({ txsIssueGitHub });

          const largeissues: any = await Promise.allSettled(
            txsIssueGitHub.map(
              (elem: any) =>
                new Promise<any>(async (resolve, reject) => {
                  try {
                    const approvals = elem.tx ? 1 : 0;

                    const account =
                      this.props.wallet.accountsActive[
                        this.props.wallet.activeAccount
                      ];
                    const msigIncludeSigner =
                      elem.multisigInfo.signers.includes(account);

                    let signerAddress: any;
                    let signerGitHandle;
                    if (elem.tx) {
                      signerAddress = await this.props.wallet.api.actorKey(
                        elem.tx[0].signers[0]
                      );
                      signerGitHandle =
                        verifierRegistry.notaries.find(
                          (notary: any) =>
                            notary.ldn_config.signing_address === signerAddress
                        )?.github_user[0] || "none";
                    }

                    const approverIsNotProposer = signerAddress
                      ? signerAddress !== this.props.wallet.activeAccount
                      : false;

                    let signable = approvals
                      ? msigIncludeSigner && approverIsNotProposer
                      : msigIncludeSigner;
                    if (config.networks.includes("Localhost")) signable = true;
                    const datacap = elem.tx
                      ? bytesToiB(parseInt(elem.tx[0].parsed.params.cap))
                      : elem.issue[0].datacap;

                    const obj: LargeRequestData = {
                      issue_number: elem.issue[0].issueInfo.issue_number,
                      url: elem.issue[0].issueInfo.issue.html_url,
                      address: elem.clientAddress,
                      multisig: elem.multisigAddress,
                      datacap,
                      approvals,
                      tx: elem.tx ? elem.tx[0] : null,
                      proposer: {
                        signeraddress: signerAddress,
                        signerGitHandle: signerGitHandle as string,
                      },
                      labels: elem.issue[0].issueInfo.issue.labels.map(
                        (i: any) => i.name
                      ),
                      data: ldnParser.parseIssue(
                        elem.issue[0].issueInfo.issue.body
                      ),
                      signable: signable,
                    };
                    resolve(obj);
                  } catch (error) {
                    reject(error);
                  }
                })
            )
          );
          this.setState({
            largeClientRequests: largeissues.map((i: any) => i.value),
            ldnRequestsLoading: false,
          });
        } catch (error) {
          console.error(error);
          this.setState({ ldnRequestsLoading: false });
          this.props.wallet.dispatchNotification(
            "While loading data error happened, please try again"
          );
        }
      },
      searchUserIssues: async (user: string) => {
        await this.props.github.githubOctoGenericLogin();
        const rawIssues =
          await this.props.github.githubOcto.search.issuesAndPullRequests({
            q: `type:issue+user:${user}+repo:${config.onboardingOwner}/${config.onboardingClientRepo}`,
          });
        const issues: any[] = [];
        for (const rawIssue of rawIssues.data.items) {
          const data = simpleClientParser.parseIssue(rawIssue.body);
          if (data.correct) {
            issues.push({
              number: rawIssue.number,
              url: rawIssue.html_url,
              owner: rawIssue.user.login,
              created_at: rawIssue.created_at,
              state: rawIssue.state,
              labels: rawIssue.labels,
              data,
            });
          }
        }
        return issues;
      },
      clientRequests: [],
      largeClientRequests: [],
      approvedNotariesLoading: true,
      ldnRequestsLoading: false,
      loadVerifierAndPendingRequests: async () => {
        this.setState({ isPendingRequestLoading: true });
        try {
          if (this.props.github.githubOctoGeneric.logged === false) {
            await this.props.github.githubOctoGenericLogin();
          }

          const allIssues = await this.props.github.fetchGithubIssues(
            config.lotusNodes[this.props.wallet.networkIndex].notaryOwner,
            config.lotusNodes[this.props.wallet.networkIndex].notaryRepo,
            "open",
            "Notary Application"
          );

          const msigRequests = allIssues
            .filter(
              (issue: any) =>
                !issue.labels.find((l: any) => l.name === "status:AddedOnchain")
            )
            .filter((issue: any) =>
              issue.labels.find(
                (l: any) =>
                  l.name === "status:Approved" ||
                  l.name === "status:StartSignOnchain"
              )
            );

          const pendingTxs = (
            await this.props.wallet.api.pendingRootTransactions()
          ).filter(
            (ptx: any) =>
              ptx.parsed.name === "addVerifier" ||
              ptx.parsed.name === "removeVerifier"
          );

          const requestsAndCommentsProm: any = await Promise.allSettled(
            msigRequests.map(
              (issue: any) =>
                new Promise<any>(async (resolve, reject) => {
                  const comments = await this.props.github.fetchGithubComments(
                    config.lotusNodes[this.props.wallet.networkIndex]
                      .notaryOwner,
                    config.lotusNodes[this.props.wallet.networkIndex]
                      .notaryRepo,
                    issue.number
                  );

                  const parseCommentBody = comments.map((c: any) =>
                    notaryParser.parseApproveComment(c.body)
                  );

                  const filteredCorrectRequests = parseCommentBody.filter(
                    (o: any) => o.correct
                  );

                  const lastRequest = filteredCorrectRequests.reverse()[0];

                  const msigAddress = lastRequest?.address || null;

                  const tx = pendingTxs.find(
                    (ptx: any) => ptx.parsed.params.verifier === msigAddress
                  );
                  resolve({
                    issue,
                    comments,
                    lastRequest,
                    msigAddress,
                    tx,
                  });
                })
            )
          );

          const requestsAndComments = requestsAndCommentsProm
            .filter((r: any) => r.status === "fulfilled")
            .map((r: any) => r.value);

          const verifierAndPendingRequests = requestsAndComments.map(
            (r: any) => {
              const datacap = r.tx
                ? bytesToiB(Number(r.tx?.parsed?.params?.cap))
                : r?.lastRequest?.datacap;
              const proposedBy = r.tx ? r?.tx?.signers[0] : "";
              const txs = r.tx ? [r.tx] : [];

              return {
                id: uuidv4(),
                issue_number: r.issue.number,
                issue_Url: r.issue.html_url,
                addresses: [r.msigAddress],
                datacaps: [datacap],
                txs,
                proposedBy,
                proposed: proposedBy ? true : false,
              };
            }
          );

          this.setState({
            verifierAndPendingRequests,
            approvedNotariesLoading: false,
            isPendingRequestLoading: false,
          });
        } catch (error) {
          this.setState({
            approvedNotariesLoading: false,
            isPendingRequestLoading: false,
          });
          console.error("error in verifierAndPendingRequests", error);
        }
      },
      verifierAndPendingRequests: [],
      viewroot: false,
      switchview: () => {
        if (this.state.viewroot) {
          this.setState({ viewroot: false });
        } else {
          this.setState({ viewroot: true });
        }
      },
      verified: [],
      verifiedCachedData: [],
      acceptedNotariesLoading: false,
      approvedVerifiersData: null,
      txsIssueGitHub: null,
      loadVerified: async (page: number) => {
        try {
          if (
            this.state.verifiedCachedData &&
            this.state.verifiedCachedData[page]
          ) {
            this.setState({
              verified: this.state.verifiedCachedData[page],
            });
            return;
          }

          this.setState({ acceptedNotariesLoading: true });

          let approvedVerifiers: ApprovedVerifiers[];
          if (this.state.approvedVerifiersData === null) {
            approvedVerifiers = await this.props.wallet.api.listVerifiers();
            this.setState({
              approvedVerifiersData: approvedVerifiers,
            });
          } else {
            approvedVerifiers = this.state.approvedVerifiersData;
          }

          const paginate = approvedVerifiers.slice((page - 1) * 10, page * 10);

          let verified: VerifiedData[] = [];
          await Promise.allSettled(
            paginate.map(
              (verifiedAddress: ApprovedVerifiers) =>
                new Promise<string>(async (resolve, reject) => {
                  try {
                    let verifierAccount = await this.props.wallet.api.actorKey(
                      verifiedAddress.verifier
                    );
                    if (verifierAccount === verifiedAddress.verifier) {
                      verifierAccount =
                        await this.props.wallet.api.actorAddress(
                          verifiedAddress.verifier
                        );
                    }

                    verified.push({
                      verifier: verifiedAddress.verifier,
                      verifierAccount,
                      datacap: verifiedAddress.datacap,
                    });
                    resolve("ok");
                  } catch (error) {
                    reject(error);
                  }
                })
            )
          );

          this.setState({
            verifiedCachedData: {
              ...this.state.verifiedCachedData,
              [page]: verified,
            },
          });

          this.setState({ acceptedNotariesLoading: false });
          this.setState({ verified });
        } catch (error) {
          console.error("error in resolving promises", error);
        }
      },
      loadClients: async () => {
        try {
          const clients = await this.props.wallet.api.listVerifiedClients();

          let clientsAmount = clients
            .reduce(
              (tot: any, el: any) =>
                new BigNumber(tot).plus(new BigNumber(el.datacap)),
              0
            )
            .toString();

          this.setState({ clients, clientsAmount });
        } catch (error) {
          console.error("error in resolving promises", error);
        }
      },
      getLastUniqueId: async (issueNumber: number) => {
        try {
          const comments = await this.props.github.fetchGithubComments(
            config.onboardingLargeOwner,
            config.onboardingLargeClientRepo,
            issueNumber
          );
          const idPattern = /####\s*Id\s*\n>\s*(.*)/g;
          const comment = comments
            .filter((item: any) =>
              item.body.includes("## DataCap Allocation requested")
            )
            .reverse();
          const Id = commonUtils.matchGroupLargeNotary(
            idPattern,
            comment[0].body
          );
          return Id;
        } catch (error) {
          console.log(error);
        }
      },
      updateGithubVerified: async (
        requestNumber: number,
        messageID: string,
        address: string,
        datacap: number,
        signer: string,
        errorMessage: string
      ) => {
        const formattedDc = bytesToiB(datacap);
        let commentContent =
          errorMessage !== ""
            ? errorMessage
            : `## Request Approved\nYour Datacap Allocation Request has been approved by the Notary\n#### Message sent to Filecoin Network\n>${messageID} \n#### Address \n> ${address}\n#### Datacap Allocated\n> ${formattedDc}\n#### Signer Address\n> ${signer}\n#### You can check the status of the message here: https://filfox.info/en/message/${messageID}`;

        //if error, post error comment and error label
        if (errorMessage !== "") {
          await this.props.github.githubOcto.issues.removeAllLabels({
            owner: config.onboardingOwner,
            repo: config.onboardingClientRepo,
            issue_number: requestNumber,
          });
          await this.props.github.githubOcto.issues.addLabels({
            owner: config.onboardingOwner,
            repo: config.onboardingClientRepo,
            issue_number: requestNumber,
            labels: ["status:Error"],
          });
          await this.props.github.githubOcto.issues.createComment({
            owner: config.onboardingOwner,
            repo: config.onboardingClientRepo,
            issue_number: requestNumber,
            body: commentContent,
          });
          return;
        }

        // add granted label comment and close issue
        await this.props.github.githubOcto.issues.removeAllLabels({
          owner: config.onboardingOwner,
          repo: config.onboardingClientRepo,
          issue_number: requestNumber,
        });
        await this.props.github.githubOcto.issues.addLabels({
          owner: config.onboardingOwner,
          repo: config.onboardingClientRepo,
          issue_number: requestNumber,
          labels: ["state:Granted"],
        });
        await this.props.github.githubOcto.issues.createComment({
          owner: config.onboardingOwner,
          repo: config.onboardingClientRepo,
          issue_number: requestNumber,
          body: commentContent,
        });
        await this.props.github.githubOcto.issues.update({
          owner: config.onboardingOwner,
          repo: config.onboardingClientRepo,
          issue_number: requestNumber,
          state: "closed",
        });
      },
      updateGithubVerifiedLarge: async (
        requestNumber: any,
        messageID: string,
        address: string,
        datacap: any,
        signer: string,
        errorMessage: string,
        action?: string
      ) => {
        const formattedDc = bytesToiB(datacap);
        const uniqueLastId =
          (await this.state.getLastUniqueId(requestNumber)) || "";

        let commentContent =
          errorMessage !== ""
            ? errorMessage
            : `## Request ${action}\nYour Datacap Allocation Request has been ${action?.toLowerCase()} by the Notary\n#### Message sent to Filecoin Network\n>${messageID} \n#### Address \n> ${address}\n#### Datacap Allocated\n> ${formattedDc}\n#### Signer Address\n> ${signer}\n#### Id\n> ${uniqueLastId}\n#### You can check the status of the message here: https://filfox.info/en/message/${messageID}`;

        //if error, post error comment and error label
        if (errorMessage !== "") {
          await this.props.github.githubOcto.issues.removeAllLabels({
            owner: config.onboardingLargeOwner,
            repo: config.onboardingLargeClientRepo,
            issue_number: requestNumber,
          });
          await this.props.github.githubOcto.issues.addLabels({
            owner: config.onboardingLargeOwner,
            repo: config.onboardingLargeClientRepo,
            issue_number: requestNumber,
            labels: ["status:Error"],
          });
          await this.props.github.githubOcto.issues.createComment({
            owner: config.onboardingLargeOwner,
            repo: config.onboardingLargeClientRepo,
            issue_number: requestNumber,
            body: commentContent,
          });
          return;
        }

        //create approval comment
        await this.props.github.githubOcto.issues.createComment({
          owner: config.onboardingLargeOwner,
          repo: config.onboardingLargeClientRepo,
          issue_number: requestNumber,
          body: commentContent,
        });
      },
      assignToIssue: async (issue_number: number, assignees: string[]) => {
        let isAssigned = false;
        for (const assigne of assignees) {
          try {
            const assigned =
              await this.props.github.githubOcto.issues.addAssignees({
                owner: config.onboardingOwner,
                repo: config.onboardingClientRepo,
                issue_number,
                assignees: [assigne],
              });
            if (assigned.data.assignees.length > 0) isAssigned = true;
          } catch (error) {
            console.log(error);
          }
        }

        if (!isAssigned) {
          await this.props.github.githubOcto.issues.addAssignees({
            owner: config.onboardingOwner,
            repo: config.onboardingClientRepo,
            issue_number,
            assignees: config.defaultAssign,
          });
        }
      },
      createRequest: async (data: any) => {
        try {
          const user = (
            await this.props.github.githubOcto.users.getAuthenticated()
          ).data.login;
          const issue = await this.props.github.githubOcto.issues.create({
            owner: config.onboardingOwner,
            repo: config.onboardingClientRepo,
            title: "Client Allocation Request for: " + data.organization,
            body: IssueBody(data, user),
          });
          if (issue.status === 201) {
            // this.state.dispatchNotification('Request submited as #' + issue.data.number)
            this.state.loadClientRequests();
            await this.state.assignToIssue(issue.data.number, data.assignees);
            return issue.data.html_url;
          } else {
            // this.state.dispatchNotification('Something went wrong.')
          }
        } catch (error) {
          console.log(error);
        }
      },
      selectedNotaryRequests: [] as any[],
      selectNotaryRequest: (selectedNotaryItems: any) => {
        const selectedNotaries = selectedNotaryItems.map(
          (item: any) => item.id
        );

        this.setState({
          selectedNotaryRequests: selectedNotaries,
        });
      },
      clients: [],
      clientsAmount: "",
      searchString: "",
      rawLargeIssuesAll: [],
      search: (query: string) => {
        this.setState({ searchString: query });
      },
      isAddressVerified: false,
      isPendingRequestLoading: false,
      isVerifyWalletLoading: false,
      updateIsVerifiedAddress: (val: boolean) => {
        this.setState({ isAddressVerified: val });
      },
      verifyWalletAddress: async () => {
        try {
          this.state.setIsVerifyWalletLoading(true);

          //send message
          // const msgCid = 'bafy2bzacedeu7ymgdg3gwy522gtoy4a6j6v433cur4wjlv2xjeqtvm4bkymoi'
          const msgCid = await this.props.wallet.api.methods.sendTx(
            this.props.wallet.api.client,
            this.props.wallet.walletIndex,
            this.props.wallet,
            this.props.wallet.api.methods.encodeSend(
              config.secretRecieverAddress
            )
          );
          // if (msgCid) {
          if (msgCid["/"]) {
            // alert('Ledger wallet successfully verified with message: ' + msgCid)
            this.state.setIsVerifyWalletLoading(false);
            alert(
              "Ledger wallet successfully verified with message: " + msgCid["/"]
            );
            // update state

            this.state.updateIsVerifiedAddress(true);

            // get issue with that address
            const rawIssues = await this.props.github.fetchGithubIssues(
              config.onboardingOwner,
              config.onboardingNotaryOwner,
              "all",
              "Notary Application"
            );

            let issueNumber = "";
            for (let issue of rawIssues) {
              //parse each issue
              let parsedNotaryAddress = notaryParser.parseNotaryAddress(
                issue.body
              );
              let address = parsedNotaryAddress
                ? parsedNotaryAddress.split(" ")[0]
                : "";

              // if the address is the one selected by user, set issue number
              if (address && address === this.props.wallet.activeAccount) {
                issueNumber = issue.number;
                break;
              }
            }
            // if iussue number is not there, return false (it should never happen)
            if (!issueNumber) {
              console.log(
                "Looks like there is any notary with this address..."
              );
              return false;
            }
            // comment github with comment
            // const body = notaryLedgerVerifiedComment(msgCid)
            const body = notaryLedgerVerifiedComment(msgCid["/"]);
            await this.props.github.githubOcto.issues.createComment({
              // owner: 'keyko-io',
              owner: config.onboardingOwner,
              // repo: 'filecoin-notaries-onboarding',
              repo: config.onboardingNotaryOwner,
              issue_number: issueNumber,
              body,
            });
          }
        } catch (error) {
          this.setState({ isVerifyWalletLoading: false });
          console.log(error);
        }
      },
      checkVerifyWallet: async () => {
        try {
          //check all issue with notary application label
          // const rawIssues = await this.props.github.fetchGithubIssues('keyko-io', 'filecoin-notaries-onboarding', 'all', "Notary Application")
          const rawIssues = await this.props.github.fetchGithubIssues(
            config.onboardingOwner,
            config.onboardingNotaryOwner,
            "all",
            "Notary Application"
          );

          let issueNumber = "";
          for (let issue of rawIssues) {
            // parse each issue
            let parsedNotaryAddress = notaryParser.parseNotaryAddress(
              issue.body
            );
            let address = parsedNotaryAddress
              ? parsedNotaryAddress.split(" ")[0]
              : "";

            // if the address is the one selected by user, set issue number
            if (address && address === this.props.wallet.activeAccount) {
              issueNumber = issue.number;
              break;
            }
          }
          // if there is no issue number, rteturn false, it should never Happen
          if (!issueNumber) {
            return false;
          }

          // retrieve issue and check comments
          // const rawComments = await this.props.github.fetchGithubComments('keyko-io', 'filecoin-notaries-onboarding', issueNumber)
          const rawComments = await this.props.github.fetchGithubComments(
            config.onboardingOwner,
            config.onboardingNotaryOwner,
            Number(issueNumber)
          );
          for (let comment of rawComments) {
            // return true if the verified notary comment is present
            // return false if not
            const parsedComment = notaryParser.parseNotaryLedgerVerifiedComment(
              comment.body
            );
            if (parsedComment.correct) {
              return true;
            }
          }
          return false;
        } catch (error) {
          console.log("error in checkverifyWallet", error);
          return false;
        }
      },
      selectedLargeClientRequests: [],
      setSelectedLargeClientRequests: (rowNumbers: any[]) => {
        this.setState({
          selectedLargeClientRequests: rowNumbers,
        });
      },
      setIsVerifyWalletLoading: (value: boolean) => {
        this.setState({ isVerifyWalletLoading: value });
      },
    };
  }

  render() {
    return (
      <Data.Provider
        value={{
          ...this.state,
          github: this.props.github,
          wallet: this.props.wallet,
        }}
      >
        {this.props.children}
      </Data.Provider>
    );
  }
}
