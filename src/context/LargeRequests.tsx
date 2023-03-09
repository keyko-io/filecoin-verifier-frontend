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
    isRequestSignable: any;
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

    const isRequestSignable = async (
        request: LargeRequestData
    ): Promise<boolean> => {
        if (!request.multisig) return false;
        const activeAccount =
            context.wallet.accountsActive[
                context.wallet.activeAccount
            ];
        if (!activeAccount) return false;
        const multisigInfo = await getMultisigInfo(request.multisig);
        console.log("multisigInfo", multisigInfo);
        console.log("activeAccount", activeAccount);

        const isMultisigIncludesCurrentSigner =
            multisigInfo.signers.includes(activeAccount);

        const pendingTxs =
            await context.wallet.api.pendingTransactions(
                String(request.multisig)
            );

        const approvals = pendingTxs?.length;
        console.log("approvals", approvals);
        if (approvals === 2) return false; // Request Completed
        if (approvals === 0) return isMultisigIncludesCurrentSigner; // Request Didnt start
        if (approvals === 1) {
            // Request was proposed by one notary and needs approval of second notary
            const pendingFiltered = pendingTxs.filter((tx: any) => {
                return (
                    tx.tx.method === 4 &&
                    tx.parsed &&
                    tx?.parsed?.params?.address === request.address // NOT SURE  ABOUT THIS
                );
            });
            const proposer = pendingFiltered[0]?.signers[0];
            console.log("proposer", proposer);
            const signerAddress =
                context.wallet.api.actorKey(proposer);
            const approverIsNotProposer = signerAddress
                ? signerAddress !== activeAccount
                : false;
            // const txId = String(pendingFiltered[0]?.id);
            return (
                isMultisigIncludesCurrentSigner &&
                approverIsNotProposer
            );
        }

        return false;
    };

    const IState: LargeRequestsState = {
        count: data.length,
        data: data,
        isRequestSignable,
    };

    return (
        <section className="section">
            <LargeRequestsContext.Provider value={IState}>
                {children}
            </LargeRequestsContext.Provider>
        </section>
    );
}
