import React, { useContext, useState } from "react"
import Pagination from "../../Pagination";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// @ts-ignore
// prettier-ignore
import { ButtonSecondary } from "slate-react-system";
import { Data } from "../../../context/Data/Index";
import history from "../../../context/History";
import { tableElementFilter } from "../../../utils/SortFilter";

const publicRequestColums = [
    { id: "name", value: "Client" },
    { id: "address", value: "Address" },
    { id: "datacap", value: "Datacap" },
    { id: "number", value: "Audit Trail" },
];

type PublicRequestTableProps = {
    searchString: any
    selectedClientRequests: any
    setSelectedClientRequests: any
}

const PublicRequestTable = ({ searchString, selectedClientRequests, setSelectedClientRequests }: PublicRequestTableProps) => {
    const context = useContext(Data)

    const [refPublic, setRefPublic] = useState({} as any)
    const [sortOrderPublic, setSortOrderPublic] = useState(-1)
    const [orderByPublic, setOrderByPublic] = useState('name')

    const orderPublic = async (e: any) => {
        const { orderBy, sortOrder }: any = await context.sortPublicRequests(
            e,
            orderByPublic,
            sortOrderPublic,
        );
        setOrderByPublic(orderBy)
        setSortOrderPublic(sortOrder)
    };

    const onRefPublicChange = (refPublic: any) => {
        setRefPublic(refPublic)
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

    const showClientDetail = (e: any) => {
        const listRequestFiltered = context.clientRequests
            .filter(
                (element: any) =>
                    tableElementFilter(searchString, element.data) === true
            )
            .filter((_: any, i: any) => refPublic?.checkIndex(i));

        const client = listRequestFiltered[e.currentTarget.id].data.name;
        const user = listRequestFiltered[e.currentTarget.id].owner;
        const address = listRequestFiltered[e.currentTarget.id].data.address;
        const datacap = listRequestFiltered[e.currentTarget.id].data.datacap;

        history.push("/client", { client, user, address, datacap });
    }

    return (<div style={{ minHeight: "500px" }}>
        <table>
            <thead>
                <tr>
                    <td></td>
                    {publicRequestColums.map((column: any) => (
                        <td id={column.id} key={column.id} onClick={orderPublic}>
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
                                    searchString,
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
            search={searchString}
        />
        {!context.clientRequests.length && <div className="nodata">No client requests yet</div>}
    </div>
    )
}

export default PublicRequestTable