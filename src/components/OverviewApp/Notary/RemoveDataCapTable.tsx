import { ldnParser } from "@keyko-io/filecoin-verifier-tools";
import { CircularProgress } from "@material-ui/core";
import { useContext, useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { config } from "../../../config";
import { Data } from "../../../context/Data/Index";
import { useLargeRequestsContext } from "../../../context/LargeRequests";
import { RemoveDatacapRequestData, NotaryActionStatus } from "../../../type";
import SearchInput from "./SearchInput";
import { ISSUE_LABELS } from "filecoin-verifier-common";

const CANT_SIGN_MESSAGE =
    "You can currently only approve the allocation requests associated with the multisig organization you signed in with. Signing proposals for additional DataCap allocations will require you to sign in again";


export const isSignable = (
    approvals: number,
    approverSignerAddress: string,
    activeAccountAddress: string
) => {
    const approverIsNotProposer = approverSignerAddress
        ? approverSignerAddress !== activeAccountAddress
        : false;
    const msigIncludeSigner = false;
    const signable = approvals
        ? msigIncludeSigner && approverIsNotProposer
        : msigIncludeSigner;

    return signable;
};


/**
 * 
 * @param data @TODO use the correct parser here
 * @param githubOcto 
 * @returns 
 */
const formatIssues = (
    issues: any[]
): any[] => {
    const parsedIssueData = []
    for (let issue of issues) {
        const parsed = ldnParser.parseDataCapRemoval(issue.body)
        console.log(parsed)
        parsedIssueData.push({
            name: parsed.name,
            address: parsed.address,
            issue_number: issue.number,
            url: issue.html_url,
            labels: issue.labels.map((l: any) => l.name),
            datacapToRemove: parsed.datacapToRemove,
            approvalInfoFromLabels: 0,
            uuid: parsed.uuid,
        });
    }
    console.log("parsedIssueData", parsedIssueData)
    return parsedIssueData;
};

type LargeRequestTableProps = {
    setRemoveDataCapIssues: any;
};

const RemoveDataCapTable = (props: LargeRequestTableProps) => {
    const { setRemoveDataCapIssues } = props;
    const {
        count,
    } = useLargeRequestsContext();
    const context = useContext(Data);

    const [isLoadingGithubData, setIsLoadingGithubData] =
        useState<boolean>(false);
    const [isLoadingNodeData, setLoadingNodeData] =
        useState<boolean>(false);
    const [data, updateData] = useState<RemoveDatacapRequestData[]>([]);

    const setData = (data: RemoveDatacapRequestData[]) => {
        updateData(data);
    };

    const [currentPage, setCurrentPage] = useState(1);



    useEffect(() => {
        currentPage >= 1 &&
            data?.length &&
            fetchTableData(currentPage); // NOT GREAT SOLUTION
    }, [currentPage]);

    const fetchTableData = async (page: number) => {
        try {
            setIsLoadingGithubData(true)
            const reqs : any= await context.loadDataCapRemovalRequests(false)
            const formattedIssues = formatIssues(reqs)
            setData(formattedIssues);
            setIsLoadingGithubData(false);

        } catch (error) {
            console.log(error);
            setIsLoadingGithubData(false);
        }
    };

    useEffect(() => {
        fetchTableData(1);
    }, [context.github]);

    const largeReqColumns = [
        {
            name: "Client",
            selector: (row: any) => row?.name,
            sortable: true,
            grow: 1,
            wrap: true,
        },
        {
            name: "Address",
            selector: (row: RemoveDatacapRequestData) => row?.address,
            sortable: true,
            cell: (row: RemoveDatacapRequestData) => (
                
                <div>{`${row?.address?.substring(
                    0,
                    9
                )}...${row?.address.substring(
                    row?.address.length - 9,
                    row?.address.length
                )}`}</div>
            ),
        },
        {
            name: "Datacap",
            selector: (row: RemoveDatacapRequestData) => row?.datacapToRemove,
            sortable: true,
            grow: 0.5,
            center: true,
        },
        {
            id: "auditTrail",
            name: "Audit Trail",
            selector: (row: RemoveDatacapRequestData) => row?.issue_number,
            sortable: true,
            grow: 0.5,
            cell: (row: RemoveDatacapRequestData) => (
                <a  
                    target="_blank"
                    rel="noopener noreferrer"
                    href={row?.url}
                >
                    {row?.issue_number}
                </a>
            ),
            center: true,
        },
        {
            name: "Approvals",
            selector: (row: RemoveDatacapRequestData) =>
                row?.approvalInfoFromLabels,
            grow: 0.5,
            center: true,
            cell: (row: RemoveDatacapRequestData) => (
                <div>{row?.approvalInfoFromLabels}</div>
            ),
        },
    ];

    return (
        <div
            className="large-request-table"
            style={{ minHeight: "500px" }}
        >
            {context.ldnRequestsLoading ? (
                <div style={{ width: "100%", textAlign: "center" }}>
                    <CircularProgress
                        style={{
                            margin: "8rem auto",
                            color: "#0090ff",
                        }}
                    />
                </div>
            ) : (
                <>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "2rem" }}>
                        <SearchInput
                            updateData={setData}
                            fetchTableData={fetchTableData}
                        />

                    </div>
                    <DataTable
                        selectableRowsSingle
                        defaultSortAsc={false}
                        defaultSortFieldId="auditTrail"
                        columns={largeReqColumns}
                        selectableRowsHighlight
                        onSelectedRowsChange={({ selectedRows }) => {
                            setRemoveDataCapIssues(
                                selectedRows[0]
                            );
                        }}
                        onRowClicked={(row) => {
                            if (!row.signable) {
                                context.wallet.dispatchNotification(
                                    CANT_SIGN_MESSAGE
                                );
                            }
                        }}
                        selectableRows
                        selectableRowsNoSelectAll={true}
                        progressPending={isLoadingGithubData}
                        onChangePage={(
                            page: number,
                            totalRows: number
                        ) => {
                            setCurrentPage(page);
                        }}
                        pagination
                        paginationServer
                        paginationTotalRows={count > 0 ? count : 500}
                        paginationRowsPerPageOptions={[10]}
                        paginationPerPage={10}
                        noContextMenu={true}
                        data={data}
                        progressComponent={
                            <div
                                style={{
                                    width: "1280px",
                                }}
                            >
                                <CircularProgress
                                    style={{
                                        margin: "10rem auto",
                                        color: "#0090ff",
                                    }}
                                />
                            </div>
                        }
                    />
                </>
            )}
        </div>
    );
};

export default RemoveDataCapTable;
