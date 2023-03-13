import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import { LargeRequestData } from "../type";
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
                        if (!activeAccount) resolve(false);
                        const multisigInfo = await getMultisigInfo(request.multisig);
                        console.log("multisigInfo", multisigInfo);
                        console.log("activeAccount", activeAccount);

                        const isMultisigIncludesCurrentSigner =
                            multisigInfo.signers.includes(activeAccount);

                        const pendingTxs =
                            await context.wallet.api.pendingTransactions(
                                String(request.multisig)
                            );
                        const pendingForClient = pendingTxs?.filter((tx: any) => tx?.parsed?.params?.address == request.address);
                        const signaturesNumber = pendingForClient.length


                        if (signaturesNumber === 0) resolve(true); // Request Didnt start
                        // if (approvals >=    1)  //TODO manage the case when there is more than 1 request
                        if (signaturesNumber >= 1) {
                            // Request was proposed by one notary and needs approval of second notary

                            const proposer = pendingForClient[0]?.signers[0];
                            console.log("proposer", proposer);
                            const signerAddress =
                                await context.wallet.api.actorKey(proposer);
                            const approverIsNotProposer = signerAddress
                                ? signerAddress !== context.wallet.accountsActive[activeAccount] //context.wallet.accountsActive[activeAccount]  returns the short address 
                                : false;
                            resolve(
                                isMultisigIncludesCurrentSigner &&
                                approverIsNotProposer
                            );
                        }

                        resolve(false);
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
