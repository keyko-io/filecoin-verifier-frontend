import { createContext, useContext, useEffect, useState } from "react";
import { Data } from "./Data/Index";

interface LargeRequestsState {
    count: number;
    data: any[];
}

export const LargeRequestsContext = createContext(
    {} as LargeRequestsState
);

export const useLargeRequestsContext = () =>
    useContext(LargeRequestsContext);

export default function LargeRequestsProvider({ children }: any) {
    const context = useContext(Data);
    const [data, setData] = useState([]);
    
    useEffect(() => {
        const handler = async () => {
            const data =
                await context.getLargeRequestSearchInputData();
            setData(data)
        };
        handler();
    }, [context]);


    const IState: LargeRequestsState = {
        count: data.length,
        data: data,
    };

    return (
        <section className="section">
            <LargeRequestsContext.Provider value={IState}>
                {children}
            </LargeRequestsContext.Provider>
        </section>
    );
}
