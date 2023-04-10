import React from "react";
import { Data } from "./Index";
import { config } from "../../config";
// @ts-ignore
import { IssueBody } from "../../utils/IssueBody";
import BigNumber from "bignumber.js";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid";
import { bytesToiB } from "../../utils/Filters";
import { notaryLedgerVerifiedComment } from "./comments";
import { Notary } from "../../pages/Verifiers";
import {
    ldnParser,
    notaryParser,
    commonUtils,
    simpleClientParser,
} from "@keyko-io/filecoin-verifier-tools";
import {
    ApprovedVerifiers,
    DirectIssue,
    LargeRequestData,
    VerifiedData,
} from "../../type";
import {
    DataProviderProps,
    DataProviderStates,
} from "../contextType";
import * as Logger from "../../logger";
import * as Sentry from "@sentry/react";

interface ParseLargeRequestData {
    address: string;
    issue_number: string;
    dataCapWeeklyAllocation: string;
    datacapRequested: string;
    identifier: string;
    name: string;
    region: string;
    website: string;
}
interface LotusTx {
    id: number;
    signers: string[];
    parsed: {
        name: string;
        params: {
            address: string;
            cap: any;
        };
    };
}

interface TxsByClientAddress {
    multisigAddress: string;
    multisigInfo: any;
    txsByClientAddress: {
        [key: string]: LotusTx[];
    };
}
const filterByLabel = (issues: any, shouldInclude: string) => {
    const i = issues.filter((issue: any) =>
        issue.labels.some((l: any) => {
            return l.name.toLowerCase().replace(/ /g, '').includes(shouldInclude)

        })
    )
    return i
}

export default class DataProvider extends React.Component<
    DataProviderProps,
    DataProviderStates
> {
    constructor(props: DataProviderProps) {
        super(props);
        this.state = {
            updateContextState: (
                elementToUpdate: any,
                type: string
            ) => {
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
                        config.lotusNodes[
                            this.props.wallet.networkIndex
                        ].name === "Localhost"
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
            //@ts-ignore
            formatLargeRequestData: async (
                requests: ParseLargeRequestData[]
            ) => {
                if (!requests) return [];
                const parsedIssueData: any = [];
                await Promise.all(
                    requests?.map(
                        async (issue: ParseLargeRequestData) => {
                            const comments =
                                await this.props.github.githubOcto.paginate(
                                    this.props.github.githubOcto
                                        .issues.listComments,
                                    {
                                        owner: config.onboardingLargeOwner,
                                        repo: config.onboardingLargeClientRepo,
                                        issue_number:
                                            issue.issue_number,
                                    }
                                );

                            const comment = comments
                                .reverse()
                                .find((comment: any) =>
                                    comment?.body?.includes(
                                        "## DataCap Allocation requested"
                                    )
                                );

                            if (!comment?.body) return;
                            const commentParsed =
                                ldnParser.parseReleaseRequest(
                                    comment.body
                                );
                            parsedIssueData.push({
                                ...issue,
                                comments,
                                multisig:
                                    commentParsed?.notaryAddress,
                                datacap:
                                    commentParsed?.allocationDatacap,
                                proposer: null,
                                tx: null,
                                approvals: null,
                            });
                        }
                    )
                );
                return parsedIssueData;
            },
            getLargeRequestSearchInputData: async () => {
                if (
                    !this?.props?.github ||
                    !this?.props?.github?.githubLogged
                )
                    return [];
                const allGHIssues =
                    await this?.props?.github?.fetchGithubIssues(
                        config.onboardingLargeOwner,
                        config.onboardingLargeClientRepo,
                        "open",
                        // ["bot:readyToSign","Bot: Ready To Sign"]
                    );
                const filteredByLabel = filterByLabel(allGHIssues, "readytosign")
                debugger

                const response = filteredByLabel.map((issue: any) => {
                    const parsed: ParseLargeRequestData =
                        ldnParser.parseIssue(issue.body);
                    const approvalInfo = issue.labels.some((l: any) => l.name.toLowerCase().replace(/ /g, '').includes("startsigndatacap"))

                    const res = {
                        ...parsed,
                        issue_number: issue?.number,
                        url: issue?.html_url,
                        approvalInfoFromLabels: approvalInfo ? 1 : 0,
                        // comments,
                        // multisig: commentParsed?.notaryAddress,
                        // datacap: commentParsed?.allocationDatacap,
                        // proposer: null,
                        // tx: null,
                        // approvals: null,
                    };
                    return res;
                });
                return response;
            },
            getLDNIssuesAndTransactions: async () => {
                //GETTING ISSUES

                const rawLargeIssuesAll =
                    await this.props.github.fetchGithubIssues(
                        config.onboardingLargeOwner,
                        config.onboardingLargeClientRepo,
                        "open",
                        // "bot:readyToSign"
                    );
                const rawLargeIssuesAllFilteredByLabel = filterByLabel(rawLargeIssuesAll, "readytosign")


                const rawLargeIssues = rawLargeIssuesAllFilteredByLabel
                    .filter(
                        (item: any) =>
                            !item.labels.find(
                                (l: any) =>
                                    l.name.toLowerCase().replace(/ /g, '').includes("needsdiligence")
                            )
                    )
                    .slice(0, 10);

                //GETTING COMMENTS
                const comments: any = await Promise.allSettled(
                    rawLargeIssues.map(
                        (rawLargeIssue: any) =>
                            new Promise<any>(
                                async (resolve, reject) => {
                                    try {
                                        const data =
                                            ldnParser.parseIssue(
                                                rawLargeIssue.body
                                            );
                                        if (data) {
                                            const rawLargeClientComments =
                                                await this.props.github.fetchGithubComments(
                                                    config.onboardingLargeOwner,
                                                    config.onboardingLargeClientRepo,
                                                    rawLargeIssue.number
                                                );

                                            resolve({
                                                issue_number:
                                                    rawLargeIssue.number,
                                                issue: rawLargeIssue,
                                                comments:
                                                    rawLargeClientComments,
                                            });
                                        } else {
                                            resolve({});
                                        }
                                    } catch (err) {
                                        reject(err);
                                    }
                                }
                            )
                    )
                );

                //GROUPING ISSUES BY MSIG
                let issuesByMsig: any[] = [];

                for (let resProm of comments) {
                    const comms = resProm?.value?.comments;
                    const cmtsLength =
                        resProm?.value?.comments?.length;

                    for (let i = cmtsLength - 1; i >= 0; i--) {
                        const commentParsed =
                            ldnParser.parseReleaseRequest(
                                comms[i].body
                            );

                        if (commentParsed.correct) {
                            const issueInMsig = issuesByMsig.find(
                                (item: any) =>
                                    item.multisigAddress ===
                                    commentParsed.notaryAddress
                            );
                            if (issueInMsig) {
                                issueInMsig.issues.push({
                                    clientAddress:
                                        commentParsed.clientAddress,
                                    datacap:
                                        commentParsed.allocationDatacap,
                                    issueInfo: resProm.value,
                                });
                            } else {
                                issuesByMsig.push({
                                    multisigAddress:
                                        commentParsed.notaryAddress,
                                    issues: [
                                        {
                                            clientAddress:
                                                commentParsed.clientAddress,
                                            datacap:
                                                commentParsed.allocationDatacap,
                                            issueInfo: resProm.value,
                                        },
                                    ],
                                });
                            }
                            break;
                        }
                    }
                }

                console.log({ issuesByMsig });

                // GETTING PENDING TRANSACTIONS FROM LOTUS
                const txsGroupedByClientAddress: TxsByClientAddress[] =
                    (
                        await Promise.allSettled(
                            issuesByMsig.map(
                                (msigGroup: any) =>
                                    new Promise<any>(
                                        async (resolve, reject) => {
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

                                                const pendingFiltered =
                                                    pendingTxs.filter(
                                                        (tx: any) =>
                                                            tx.tx
                                                                .method ===
                                                            4 &&
                                                            tx.parsed
                                                    );

                                                //console.log(pendingFiltered, "pending filtered");

                                                const txsByClientAddress =
                                                    _.groupBy(
                                                        pendingFiltered,
                                                        "parsed.params.address"
                                                    );

                                                console.log(
                                                    txsByClientAddress,
                                                    "txsByClientAddress"
                                                );

                                                resolve({
                                                    multisigAddress:
                                                        msigGroup.multisigAddress,
                                                    multisigInfo,
                                                    txsByClientAddress,
                                                });
                                            } catch (error) {
                                                reject(error);
                                            }
                                        }
                                    )
                            )
                        )
                    ).map((i: any) => i.value);

                // MATCH TRANSACTION WITH ISSUE
                const issuesByClientAddress = issuesByMsig.map(
                    (iss: {
                        multisigAddress: string;
                        issues: any[];
                    }) => {
                        return {
                            multisigAddress: iss.multisigAddress,
                            byClients: _.groupBy(
                                iss.issues,
                                "clientAddress"
                            ),
                        };
                    }
                );

                console.log(
                    issuesByClientAddress,
                    "issuesByClientAddress"
                );

                let transactionAndIssue = [];
                for (let msigGroup of issuesByClientAddress) {
                    const txsByCientList: TxsByClientAddress[] =
                        txsGroupedByClientAddress.filter(
                            (tx) =>
                                tx.multisigAddress ===
                                msigGroup.multisigAddress
                        );

                    if (!txsByCientList.length) continue;

                    console.log({ txsByCientList });

                    for (let [k, v] of Object.entries(
                        txsByCientList[0].txsByClientAddress
                    )) {
                        console.log(k, v);
                        // pairs transaction and github issue
                        transactionAndIssue.push({
                            clientAddress: k,
                            multisigAddress:
                                msigGroup.multisigAddress,
                            multisigInfo:
                                txsByCientList[0].multisigInfo,
                            tx: v as any,
                            issue: msigGroup.byClients[k],
                        });
                    }
                    // TODO make a list of issues without transactions
                    for (let [k, v] of Object.entries(
                        msigGroup.byClients
                    )) {
                        if (
                            !transactionAndIssue.find(
                                (i: any) => i.clientAddress === k
                            )
                        ) {
                            transactionAndIssue.push({
                                clientAddress: k,
                                multisigAddress:
                                    msigGroup.multisigAddress,
                                multisigInfo:
                                    txsByCientList[0].multisigInfo,
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
                    filteredTxsIssue: transactionAndIssue.filter(
                        (i: any) => i.issue
                    ),
                };
            },

            getNodeData: async (address, clientAddress) => {
                const pendingTxs =
                    await this.props.wallet.api.pendingTransactions(
                        address
                    );

                const pendingFiltered = pendingTxs.filter(
                    (tx: any) => {
                        return (
                            tx.tx.method === 4 &&
                            tx.parsed &&
                            tx?.parsed?.params?.address ===
                            clientAddress
                        );
                    }
                );

                if (pendingFiltered?.length > 0) {
                    const si = pendingFiltered[0]?.signers[0];
                    const signerAddress =
                        await this.props.wallet.api.actorKey(si);

                    return {
                        signerAddress,
                        txId: String(pendingFiltered[0]?.id),
                    };
                } else {
                    return { signerAddress: "", txId: "" };
                }
            },
            searchUserIssues: async (user: string) => {
                await this.props.github.githubOctoGenericLogin();
                const rawIssues =
                    await this.props.github.githubOcto.search.issuesAndPullRequests(
                        {
                            q: `type:issue+user:${user}+repo:${config.onboardingOwner}/${config.onboardingClientRepo}`,
                        }
                    );
                const issues: any[] = [];
                for (const rawIssue of rawIssues.data.items) {
                    const data = simpleClientParser.parseIssue(
                        rawIssue.body
                    );
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
                    if (
                        this.props.github.githubOctoGeneric.logged ===
                        false
                    ) {
                        await this.props.github.githubOctoGenericLogin();
                    }

                    const allIssues =
                        await this.props.github.githubOctoGeneric.octokit.paginate(
                            this.props.github.githubOctoGeneric
                                .octokit.issues.listForRepo,
                            {
                                owner: config.onboardingOwner,
                                repo: config.onboardingNotaryOwner,
                                state: "open",
                                labels: "Notary Application",
                            }
                        );

                    const msigRequests = allIssues
                        .filter(
                            (issue: any) =>
                                !issue.labels.find(
                                    (l: any) =>
                                        l.name.toLowerCase().replace(/ /g, '').includes("addedonchain")
                                )
                        )
                        .filter((issue: any) =>
                            issue.labels.find(
                                (l: any) =>
                                l.name.toLowerCase().replace(/ /g, '').includes("approved") || l.name.toLowerCase().replace(/ /g, '').includes("startsignonchain")
                            )
                        );

                    const pendingTxs = (
                        await this.props.wallet.api.pendingRootTransactions()
                    ).filter(
                        (ptx: any) =>
                            ptx.parsed.name === "addVerifier" ||
                            ptx.parsed.name === "removeVerifier"
                    );

                    const requestsAndCommentsProm: any =
                        await Promise.allSettled(
                            msigRequests.map(
                                (issue: any) =>
                                    new Promise<any>(
                                        async (resolve, reject) => {
                                            const comments =
                                                await this.props.github.fetchGithubComments(
                                                    config.lotusNodes[
                                                        this.props
                                                            .wallet
                                                            .networkIndex
                                                    ].notaryOwner,
                                                    config.lotusNodes[
                                                        this.props
                                                            .wallet
                                                            .networkIndex
                                                    ].notaryRepo,
                                                    issue.number
                                                );

                                            const parseCommentBody =
                                                comments.map(
                                                    (c: any) =>
                                                        notaryParser.parseApproveComment(
                                                            c.body
                                                        )
                                                );

                                            const filteredCorrectRequests =
                                                parseCommentBody.filter(
                                                    (o: any) =>
                                                        o.correct
                                                );

                                            const lastRequest =
                                                filteredCorrectRequests.reverse()[0];

                                            const msigAddress =
                                                lastRequest?.address ||
                                                null;

                                            const tx =
                                                pendingTxs.find(
                                                    (ptx: any) =>
                                                        ptx.parsed
                                                            .params
                                                            .verifier ===
                                                        msigAddress
                                                );
                                            resolve({
                                                issue,
                                                comments,
                                                lastRequest,
                                                msigAddress,
                                                tx,
                                            });
                                        }
                                    )
                            )
                        );

                    const requestsAndComments =
                        requestsAndCommentsProm
                            .filter(
                                (r: any) => r.status === "fulfilled"
                            )
                            .map((r: any) => r.value);

                    const verifierAndPendingRequests =
                        requestsAndComments.map((r: any) => {
                            const datacap = r.tx
                                ? bytesToiB(
                                    Number(
                                        r.tx?.parsed?.params?.cap
                                    )
                                )
                                : r?.lastRequest?.datacap;
                            const proposedBy = r.tx
                                ? r?.tx?.signers[0]
                                : "";
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
                        });

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
                    console.error(
                        "error in verifierAndPendingRequests",
                        error
                    );
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
                            verified:
                                this.state.verifiedCachedData[page],
                        });
                        return;
                    }

                    this.setState({ acceptedNotariesLoading: true });

                    let approvedVerifiers: ApprovedVerifiers[];
                    if (this.state.approvedVerifiersData === null) {
                        approvedVerifiers =
                            await this.props.wallet.api.listVerifiers();
                        this.setState({
                            approvedVerifiersData: approvedVerifiers,
                        });
                    } else {
                        approvedVerifiers =
                            this.state.approvedVerifiersData;
                    }

                    const paginate = approvedVerifiers.slice(
                        (page - 1) * 10,
                        page * 10
                    );

                    let verified: VerifiedData[] = [];
                    await Promise.allSettled(
                        paginate.map(
                            (verifiedAddress: ApprovedVerifiers) =>
                                new Promise<string>(
                                    async (resolve, reject) => {
                                        try {
                                            let verifierAccount =
                                                await this.props.wallet.api.actorKey(
                                                    verifiedAddress.verifier
                                                );
                                            if (
                                                verifierAccount ===
                                                verifiedAddress.verifier
                                            ) {
                                                verifierAccount =
                                                    await this.props.wallet.api.actorAddress(
                                                        verifiedAddress.verifier
                                                    );
                                            }

                                            verified.push({
                                                verifier:
                                                    verifiedAddress.verifier,
                                                verifierAccount,
                                                datacap:
                                                    verifiedAddress.datacap,
                                            });
                                            resolve("ok");
                                        } catch (error) {
                                            reject(error);
                                        }
                                    }
                                )
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
                    console.error(
                        "error in resolving promises",
                        error
                    );
                }
            },
            loadClients: async () => {
                try {
                    const clients =
                        await this.props.wallet.api.listVerifiedClients();

                    let clientsAmount = clients
                        .reduce(
                            (tot: any, el: any) =>
                                new BigNumber(tot).plus(
                                    new BigNumber(el.datacap)
                                ),
                            0
                        )
                        .toString();

                    this.setState({ clients, clientsAmount });
                } catch (error) {
                    console.error(
                        "error in resolving promises",
                        error
                    );
                }
            },
            getLastUniqueId: async (issueNumber: number) => {
                if (
                    this.props.github.githubOctoGeneric.logged ===
                    false
                ) {
                    await this.props.github.githubOctoGenericLogin();
                }
                try {
                    const comments =
                        await this.props.github.fetchGithubComments(
                            config.onboardingLargeOwner,
                            config.onboardingLargeClientRepo,
                            issueNumber
                        );
                    const idPattern = /####\s*Id\s*\n>\s*(.*)/g;
                    const comment = comments
                        .filter((item: any) =>
                            item.body.includes(
                                "## DataCap Allocation requested"
                            )
                        )
                        .reverse();
                    const Id = commonUtils.matchGroupLargeNotary(
                        idPattern,
                        comment[0].body
                    );

                    if (!Id) {
                        await Logger.BasicLogger({
                            message: `id could not find ${issueNumber}`,
                        });
                    }

                    return Id;
                } catch (error: any) {
                    Sentry.captureMessage('error occured while fetching ID', {
                        extra: {
                            errorMessage: error.message,
                        }
                    })
                }
            },
            createComment: async (
                owner: string,
                repo: string,
                issueNumber: number,
                comment: string
            ) => {
                try {
                    await this.props.github.githubOcto.issues.createComment(
                        {
                            owner: owner,
                            repo: repo,
                            issue_number: issueNumber,
                            body: comment,
                        }
                    );
                } catch (error) {
                    console.log(error);
                }
                return;
                // await this.props.github.githubOcto.issues.removeAllLabels(
                //     {
                //         owner: config.onboardingOwner,
                //         repo: config.onboardingClientRepo,
                //         issue_number: requestNumber,
                //     }
                // );
                // await this.props.github.githubOcto.issues.addLabels({
                //     owner: config.onboardingOwner,
                //     repo: config.onboardingClientRepo,
                //     issue_number: requestNumber,
                //     labels: [ISSUE_LABELS.STATUS_ERROR],
                // });
            },
            removeLabel: async (
                owner: string,
                repo: string,
                issueNumber: number,
                label: string
            ): Promise<boolean> => {
                try {
                    const response = await this.props.github.githubOcto.issues.removeLabel(
                        {
                            owner,
                            repo,
                            issue_number: issueNumber,
                            name: label,
                        }
                    );
                    return response.status === 200
                } catch (error) {
                    console.log(error);
                    return false
                }
            },
            addLabels: async (
                owner: string,
                repo: string,
                issueNumber: number,
                labels: string[]
            ): Promise<boolean> => {
                try {
                    const response = await this.props.github.githubOcto.issues.addLabels(
                        {
                            owner,
                            repo,
                            issue_number: issueNumber,
                            labels,
                        }
                    );
                    return response.status === 200
                } catch (error) {
                    console.log(error);
                    return false
                }
            },
            removeAllLabels: async (
                owner: string,
                repo: string,
                issueNumber: number
            ) => {
                try {
                    await this.props.github.githubOcto.issues.removeAllLabels(
                        {
                            owner,
                            repo,
                            issue_number: issueNumber,
                        }
                    );
                } catch (error) {
                    console.log(error);
                }
                return;
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
                    await this.props.github.githubOcto.issues.removeAllLabels(
                        {
                            owner: config.onboardingOwner,
                            repo: config.onboardingClientRepo,
                            issue_number: requestNumber,
                        }
                    );
                    await this.props.github.githubOcto.issues.addLabels(
                        {
                            owner: config.onboardingOwner,
                            repo: config.onboardingClientRepo,
                            issue_number: requestNumber,
                            labels: ["status:Error"],
                        }
                    );
                    await this.props.github.githubOcto.issues.createComment(
                        {
                            owner: config.onboardingOwner,
                            repo: config.onboardingClientRepo,
                            issue_number: requestNumber,
                            body: commentContent,
                        }
                    );
                    return;
                }

                // add granted label comment and close issue
                await this.props.github.githubOcto.issues.removeAllLabels(
                    {
                        owner: config.onboardingOwner,
                        repo: config.onboardingClientRepo,
                        issue_number: requestNumber,
                    }
                );
                await this.props.github.githubOcto.issues.addLabels({
                    owner: config.onboardingOwner,
                    repo: config.onboardingClientRepo,
                    issue_number: requestNumber,
                    labels: ["state:Granted"],
                });
                await this.props.github.githubOcto.issues.createComment(
                    {
                        owner: config.onboardingOwner,
                        repo: config.onboardingClientRepo,
                        issue_number: requestNumber,
                        body: commentContent,
                    }
                );
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
                    (await this.state.getLastUniqueId(
                        requestNumber
                    )) || "";

                let commentContent =
                    errorMessage !== ""
                        ? errorMessage
                        : `## Request ${action}\nYour Datacap Allocation Request has been ${action?.toLowerCase()} by the Notary\n#### Message sent to Filecoin Network\n>${messageID} \n#### Address \n> ${address}\n#### Datacap Allocated\n> ${formattedDc}\n#### Signer Address\n> ${signer}\n#### Id\n> ${uniqueLastId}\n#### You can check the status of the message here: https://filfox.info/en/message/${messageID}`;

                //if error, post error comment and error label
                if (errorMessage !== "") {
                    await this.props.github.githubOcto.issues.removeAllLabels(
                        {
                            owner: config.onboardingLargeOwner,
                            repo: config.onboardingLargeClientRepo,
                            issue_number: requestNumber,
                        }
                    );
                    await this.props.github.githubOcto.issues.addLabels(
                        {
                            owner: config.onboardingLargeOwner,
                            repo: config.onboardingLargeClientRepo,
                            issue_number: requestNumber,
                            labels: ["status:Error"],
                        }
                    );
                    await this.props.github.githubOcto.issues.createComment(
                        {
                            owner: config.onboardingLargeOwner,
                            repo: config.onboardingLargeClientRepo,
                            issue_number: requestNumber,
                            body: commentContent,
                        }
                    );
                    return;
                }

                //create approval comment
                await this.props.github.githubOcto.issues.createComment(
                    {
                        owner: config.onboardingLargeOwner,
                        repo: config.onboardingLargeClientRepo,
                        issue_number: requestNumber,
                        body: commentContent,
                    }
                );
            },
            assignToIssue: async (
                issue_number: number,
                assignees: string[]
            ) => {
                let isAssigned = false;
                for (const assigne of assignees) {
                    try {
                        const assigned =
                            await this.props.github.githubOcto.issues.addAssignees(
                                {
                                    owner: config.onboardingOwner,
                                    repo: config.onboardingClientRepo,
                                    issue_number,
                                    assignees: [assigne],
                                }
                            );
                        if (assigned.data.assignees.length > 0)
                            isAssigned = true;
                    } catch (error) {
                        console.log(error);
                    }
                }

                if (!isAssigned) {
                    await this.props.github.githubOcto.issues.addAssignees(
                        {
                            owner: config.onboardingOwner,
                            repo: config.onboardingClientRepo,
                            issue_number,
                            assignees: config.defaultAssign,
                        }
                    );
                }
            },
            createRequest: async (data: any) => {
                try {
                    const user = (
                        await this.props.github.githubOcto.users.getAuthenticated()
                    ).data.login;
                    const issue =
                        await this.props.github.githubOcto.issues.create(
                            {
                                owner: config.onboardingOwner,
                                repo: config.onboardingClientRepo,
                                title:
                                    "Client Allocation Request for: " +
                                    data.organization,
                                body: IssueBody(data, user),
                            }
                        );
                    if (issue.status === 201) {
                        // this.state.dispatchNotification('Request submited as #' + issue.data.number)
                        // this.state.loadClientRequests();
                        await this.state.assignToIssue(
                            issue.data.number,
                            data.assignees
                        );
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
                    const msgCid =
                        await this.props.wallet.api.methods.sendTx(
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
                            "Ledger wallet successfully verified with message: " +
                            msgCid["/"]
                        );
                        // update state

                        this.state.updateIsVerifiedAddress(true);

                        // get issue with that address
                        const rawIssues =
                            await this.props.github.fetchGithubIssues(
                                config.onboardingOwner,
                                config.onboardingNotaryOwner,
                                "all",
                                "Notary Application"
                            );

                        let issueNumber = "";
                        for (let issue of rawIssues) {
                            //parse each issue
                            let parsedNotaryAddress =
                                notaryParser.parseNotaryAddress(
                                    issue.body
                                );
                            let address = parsedNotaryAddress
                                ? parsedNotaryAddress.split(" ")[0]
                                : "";

                            // if the address is the one selected by user, set issue number
                            if (
                                address &&
                                address ===
                                this.props.wallet.activeAccount
                            ) {
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
                        const body = notaryLedgerVerifiedComment(
                            msgCid["/"]
                        );
                        await this.props.github.githubOcto.issues.createComment(
                            {
                                // owner: 'keyko-io',
                                owner: config.onboardingOwner,
                                // repo: 'filecoin-notaries-onboarding',
                                repo: config.onboardingNotaryOwner,
                                issue_number: issueNumber,
                                body,
                            }
                        );
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
                    const rawIssues =
                        await this.props.github.fetchGithubIssues(
                            config.onboardingOwner,
                            config.onboardingNotaryOwner,
                            "all",
                            "Notary Application"
                        );

                    let issueNumber = "";
                    for (let issue of rawIssues) {
                        // parse each issue
                        let parsedNotaryAddress =
                            notaryParser.parseNotaryAddress(
                                issue.body
                            );
                        let address = parsedNotaryAddress
                            ? parsedNotaryAddress.split(" ")[0]
                            : "";

                        // if the address is the one selected by user, set issue number
                        if (
                            address &&
                            address ===
                            this.props.wallet.activeAccount
                        ) {
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
                    const rawComments =
                        await this.props.github.fetchGithubComments(
                            config.onboardingOwner,
                            config.onboardingNotaryOwner,
                            Number(issueNumber)
                        );
                    for (let comment of rawComments) {
                        // return true if the verified notary comment is present
                        // return false if not
                        const parsedComment =
                            notaryParser.parseNotaryLedgerVerifiedComment(
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
                //@ts-ignore
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
