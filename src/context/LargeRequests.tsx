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

interface LargeRequestsState {
    areRequestsSignable: any;
    count: number;
    data: LargeRequestData[];
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

    const areRequestsSignable = async (

        requests: LargeRequestData[]
    ): Promise<boolean> => {

        const areSignable = await Promise.allSettled(
            requests.map(
                (request: LargeRequestData) => new Promise<boolean>(async (resolve, reject) => {
                    try {

                        if (!request.multisig) resolve(false);
                        const activeAccount =
                            context.wallet.accountsActive[
                            context.wallet.activeAccount
                            ];

                        if (!activeAccount) {
                            console.log("we could not load active accounts") 
                            resolve(false);
                        } 

                        const multisigInfo = await getMultisigInfo(request.multisig);

                        const isMultisigIncludesCurrentSigner =
                            multisigInfo.signers.includes(activeAccount);

                        const pendingTxs =
                            await context.wallet.api.pendingTransactions(
                                String(request.multisig)
                            );
                        // we get most recent txn with same address and and datacap requested of the request
                        const pendingForClient = pendingTxs?.filter((tx: any) => tx?.parsed?.params?.address == request.address && tx?.parsed?.params?.cap == anyToBytes(request.datacap))
                        const mostRecentTx = pendingForClient[pendingForClient.length - 1]

                        if (!mostRecentTx) {
                            resolve(true); // Request Didnt start
                        }
                        // if (approvals >=    1)  //TODO manage the case when there is more than 1 request
                        else if (mostRecentTx) {
                            // Request was proposed by one notary and needs approval of second notary
                            const proposer = mostRecentTx.signers[0];
                            const approverIsNotProposer = proposer !== activeAccount


                            resolve(
                                isMultisigIncludesCurrentSigner &&
                                approverIsNotProposer
                            );
                        }
                        else {
                            resolve(false);
                        }
                    } catch (error) {
                        reject(error)
                    }
                })
            )
        )
        return !areSignable.map((a: any) => a.value).includes(false)


    };

    const IState: LargeRequestsState = {
        count: data.length,
        data: data,
        areRequestsSignable
    };

    return (
        <section className="section">
            <LargeRequestsContext.Provider value={IState}>
                {children}
            </LargeRequestsContext.Provider>
        </section>
    );
}
