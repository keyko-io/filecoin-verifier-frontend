import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import { LargeRequestData } from "../type";
import { anyToBytes } from "../utils/Filters";
import { Data } from "./Data/Index";
import { useNodeDataContext } from "./NodeData";
import * as Logger from "../logger";
import {
    constructNewStatusComment,
    STATUS_LABELS,
} from "../constants";
import { config } from "../config";
import { ISSUE_LABELS } from "filecoin-verfier-common";

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

    const isNotaryUser = (): boolean => {
        const activeAccount: string =
            context.wallet.accountsActive[
                context.wallet.activeAccount
            ];

        const allowedNotaryAddresses: string[] = []; // :FIXME

        return allowedNotaryAddresses.includes(activeAccount);
    };

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
        const repliesByAuthor = row?.comments?.filter((comment) => {
            return comment?.user?.login === issueAuthor;
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
