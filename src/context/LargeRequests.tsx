import { ISSUE_LABELS } from "filecoin-verfier-common";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState
} from "react";
import { config } from "../config";
import {
    constructNewStatusComment,
    STATUS_LABELS
} from "../constants";
import * as Logger from "../logger";
import { GithubIssueEvent, LargeRequestData } from "../type";
import { anyToBytes } from "../utils/Filters";
import { getFileFromRepo } from "../utils/octokit";
import { Data } from "./Data/Index";
import { useNodeDataContext } from "./NodeData";

const owner = config.onboardingOwner;
const repo = config.onboardingLargeClientRepo;

interface LargeRequestsState {
    areRequestsSignable: any;
    isNotaryUser: () => boolean;
    count: number;
    data: LargeRequestData[];
    extractRepliesByClient: (i: LargeRequestData) => any;
    changeRequestStatus: (
        newStatus: string,
        statusReason: string,
        freeTextValue: string,
        issueNumber: number
    ) => void;
}

export const LargeRequestsContext = createContext(
    {} as LargeRequestsState
);

export const useLargeRequestsContext = () =>
    useContext(LargeRequestsContext);

export default function LargeRequestsProvider({ children }: any) {
    const context = useContext(Data);
    const { getMultisigInfo } = useNodeDataContext();
    const [data, setData] = useState([]);
    const [notariesData, setNotariesData] = useState([]);

    useEffect(() => {
        const handler = async () => {
            const data =
                await context.getLargeRequestSearchInputData();
            setData(data);
        };
        handler();
    }, [context]);

    const changeRequestStatus = async (
        newStatus: string,
        statusReason: string,
        freeTextValue: string,
        issueNumber: number
    ): Promise<boolean> => {
        const newStatusLabels = STATUS_LABELS[newStatus];
        const newStatusComment = constructNewStatusComment(
            newStatus,
            statusReason,
            freeTextValue
        );

        await Logger.BasicLogger({
            message:
                "NOTARY X CHANGED REQUEST Y STATE TO " + newStatus,
        });

        const addLabelsResponse = await context.addLabels(
            owner,
            repo,
            issueNumber,
            newStatusLabels
        );
        if (!addLabelsResponse) return false;

        const createCommentResponse = await context.createComment(
            owner,
            repo,
            issueNumber,
            newStatusComment
        );
        if (!createCommentResponse) return false;
        return createCommentResponse && addLabelsResponse;
    };

    // is logged in user is a notary
    const isNotaryUser = useCallback((): boolean => {
        if (!notariesData || !Array.isArray(notariesData)) {
            return false;
        }
        const activeAccount: string = context?.wallet?.activeAccount;
        const allowedNotaryAddresses: string[] = notariesData?.map(
            (n: { direct_config: { signing_address: string } }) => {
                return n.direct_config.signing_address;
            }
        );
        return allowedNotaryAddresses.includes(activeAccount);
    }, [notariesData, context?.wallet?.activeAccount]);

    // fetch notaries list and save to state
    useEffect(() => {
        const handler = async () => {
            const notariesListPath =
                "json/prod/verifiers-registry.json";
            const notariesList = await getFileFromRepo({
                path: notariesListPath,
                ctx: context,
            });
            setNotariesData(notariesList.notaries);
        };
        handler();
    }, []);

    const areRequestsSignable = async (
        requests: LargeRequestData[]
    ): Promise<boolean> => {
        const areSignable = await Promise.allSettled(
            requests.map(
                (request: LargeRequestData) =>
                    new Promise<boolean>(async (resolve, reject) => {
                        try {
                            if (!request.multisig) resolve(false);
                            const activeAccount =
                                context.wallet.accountsActive[
                                    context.wallet.activeAccount
                                ];

                            if (!activeAccount) {
                                await Logger.BasicLogger({
                                    message:
                                        "could not load active accounts",
                                });
                                resolve(false);
                            }

                            const multisigInfo =
                                await getMultisigInfo(
                                    request.multisig
                                );

                            const isMultisigIncludesCurrentSigner =
                                multisigInfo.signers.includes(
                                    activeAccount
                                );

                            const pendingTxs =
                                await context.wallet.api.pendingTransactions(
                                    String(request.multisig)
                                );
                            // we get most recent txn with same address and and datacap requested of the request
                            const pendingForClient =
                                pendingTxs?.filter(
                                    (tx: any) =>
                                        tx?.parsed?.params?.address ==
                                            request.address &&
                                        tx?.parsed?.params?.cap ==
                                            anyToBytes(
                                                request.datacap
                                            )
                                );
                            const mostRecentTx =
                                pendingForClient[
                                    pendingForClient.length - 1
                                ];

                            if (!mostRecentTx) {
                                resolve(true); // Request Didnt start
                            }
                            // if (approvals >=    1)  //TODO manage the case when there is more than 1 request
                            else if (mostRecentTx) {
                                // Request was proposed by one notary and needs approval of second notary
                                const proposer =
                                    mostRecentTx.signers[0];
                                const approverIsNotProposer =
                                    proposer !== activeAccount;

                                resolve(
                                    isMultisigIncludesCurrentSigner &&
                                        approverIsNotProposer
                                );
                            } else {
                                resolve(false);
                            }
                        } catch (error) {
                            reject(error);
                        }
                    })
            )
        );

        return areSignable.every((a: any) => a.value);
    };

    const extractRepliesByClient = (row: LargeRequestData) => {
        const issueAuthor = row.user;
        if (!row?.events) return [];
        const wfcrLabelEvent = row?.events?.find(
            // assuming the label is added only once
            (e: GithubIssueEvent) => {
                return (
                    e.event === "labeled" &&
                    e.label.name ===
                        ISSUE_LABELS.WAITING_FOR_CLIENT_REPLY
                );
            }
        );
        if (!wfcrLabelEvent) return [];
        const wfcrTimestamp = wfcrLabelEvent?.created_at; // timestamp of "waiting for client reply label"
        const repliesByAuthor = row?.comments?.filter((comment) => {
            // we retrive only comments by author that are after the label was added
            return (
                comment?.user?.login === issueAuthor &&
                new Date(String(comment.updated_at)) >
                    new Date(String(wfcrTimestamp))
            );
        });
        return repliesByAuthor;
    };

    const IState: LargeRequestsState = {
        count: data.length,
        data: data,
        areRequestsSignable,
        changeRequestStatus,
        extractRepliesByClient,
        isNotaryUser,
    };

    return (
        <section className="section">
            <LargeRequestsContext.Provider value={IState}>
                {children}
            </LargeRequestsContext.Provider>
        </section>
    );
}
