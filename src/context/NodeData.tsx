import { createContext, useContext } from 'react'
import { Data } from './Data/Index'

interface NodeDataState {
    getMultisigInfo: (multisigAddress: string) => any
}

export const NodeDataContext = createContext({} as NodeDataState)

export const useNodeDataContext = () => useContext(NodeDataContext)

export default function NodeDataProvider({ children }: any) {
    const context = useContext(Data)

    const getMultisigInfo = async (multisigAddress: string) => {
        const multisigInfo = await context.wallet.api.multisigInfo(multisigAddress)

        return multisigInfo
    }

    const IState: NodeDataState = {
        getMultisigInfo,
    }

    return (
        <section className='section'>
            <NodeDataContext.Provider value={IState}>{children}</NodeDataContext.Provider>
        </section>
    )
}
