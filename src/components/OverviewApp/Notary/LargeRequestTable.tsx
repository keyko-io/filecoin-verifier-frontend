import { ldnParser } from "@keyko-io/filecoin-verifier-tools";
import { CircularProgress } from "@material-ui/core";
import { useContext, useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { config } from "../../../config";
import { Data } from "../../../context/Data/Index";
import { LargeRequestData } from "../../../type";
import verifierRegistry from "../../../data/verifiers-registry.json";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import NodeDataModal from "./NodeDataModal";
import SearchInput from "./SearchInput";

const CANT_SIGN_MESSAGE =
    "You can currently only approve the allocation requests associated with the multisig organization you signed in with. Signing proposals for additional DataCap allocations will require you to sign in again";

const mapNotaryAddressToGithubHandle = (address: string) => {
    const githubHandle =
        verifierRegistry.notaries.find(
            (notary: any) =>
                notary.ldn_config.signing_address === address
        )?.github_user[0] || "";
    return githubHandle;
};

const formatIssues = async (
    data: { body: string }[],
    githubOcto: any
): Promise<any[]> => {
    const parsedIssueData: any = [];
    await Promise.all(
        data?.map(async (issue: any) => {
            if (!issue.body) return;
            const parsed = ldnParser.parseIssue(issue.body);
            const comments = await githubOcto.paginate(
                githubOcto.issues.listComments,
                {
                    owner: config.onboardingLargeOwner,
                    repo: config.onboardingLargeClientRepo,
                    issue_number: issue.number,
                }
            );
            const comment = comments
                .reverse()
                .find((comment: any) =>
                    comment.body.includes(
                        "## DataCap Allocation requested"
                    )
                );
            if (!comment?.body) return;
            const commentParsed = ldnParser.parseReleaseRequest(
                comment.body
            );
            parsedIssueData.push({
                ...parsed,
                issue_number: issue.number,
                url: issue.html_url,
                comments,
                multisig: commentParsed.notaryAddress,
                datacap: commentParsed.allocationDatacap,
            });
        })
    );
    return parsedIssueData;
};

const LargeRequestTable = () => {
    const context = useContext(Data);

    const [isLoadingGithubData, setIsLoadingGithubData] =
        useState<boolean>(false);
    const [isLoadingNodeData, setLoadingNodeData] =
        useState<boolean>(false);
    const [data, setData] = useState<any>([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [open, setOpen] = useState(false);
    const [proposer, setProposer] = useState("");
    const [txId, setTxId] = useState("");

    const handleOpen = async (
        multisig: string,
        clientAddress: string
    ) => {
        setLoadingNodeData(true);
        setOpen(true);
        const nodeData = await context.getNodeData(
            multisig,
            clientAddress
        );
        if (nodeData?.signerAddress) {
            const notaryGithubHandle = mapNotaryAddressToGithubHandle(
                nodeData.signerAddress
            );
            setProposer(notaryGithubHandle);
            setTxId(nodeData?.txId);
            setLoadingNodeData(false);
        }
        setLoadingNodeData(false);
    };

    const handleClose = () => {
        setOpen(false);
        setProposer("");
        setTxId("");
    };

    const changePage = async () => {
        try {
            setIsLoadingGithubData(true);
            const formattedIssues = await formatIssues(
                [], // FIXME
                context.github.githubOcto
            );
            setData(formattedIssues);
            setIsLoadingGithubData(false);
        } catch (error) {
            console.log(error);
            setIsLoadingGithubData(false);
        }
    };

    useEffect(() => {
        currentPage >= 1 && data?.length &&  fetchTableData(currentPage); // NOT GREAT SOLUTION 
    }, [currentPage]);

    const fetchTableData = async (page: number) => {
        try {
            setIsLoadingGithubData(true);
            const allReadyToSignIssues =
                await context.github.githubOcto.issues.listForRepo(
                    "GET /repos/{owner}/{repo}/issues",
                    {
                        owner: config.onboardingLargeOwner,
                        repo: config.onboardingLargeClientRepo,
                        state: "open",
                        labels: "bot:readyToSign",
                        page,
                        per_page: 10,
                    }
                );
            if (allReadyToSignIssues.data) {
                const formattedIssues = await formatIssues(
                    allReadyToSignIssues.data,
                    context.github.githubOcto
                );
                setData(formattedIssues);
                setIsLoadingGithubData(false);
            }
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
            grow: 1.2,
            wrap: true,
        },
        {
            name: "Address",
            selector: (row: LargeRequestData) => row?.address,
            sortable: true,
            cell: (row: LargeRequestData) => (
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
            name: "Multisig",
            selector: (row: LargeRequestData) => row?.multisig,
            sortable: true,
            grow: 0.5,
            center: true,
        },
        {
            name: "Datacap",
            selector: (row: LargeRequestData) => row?.datacap,
            sortable: true,
            grow: 0.5,
            center: true,
        },
        {
            name: "Audit Trail",
            selector: (row: LargeRequestData) => row?.issue_number,
            sortable: true,
            grow: 0.5,
            cell: (row: LargeRequestData) => (
                <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={row?.url}
                >
                    #{row?.issue_number}
                </a>
            ),
            center: true,
        },
        {
            name: "Node Data",
            selector: (row: LargeRequestData) => row?.tx?.id,
            grow: 0.5,
            cell: (row: LargeRequestData) => (
                <div
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                        handleOpen(row.multisig, row.address)
                    }
                >
                    <MoreHorizIcon />
                </div>
            ),
            center: true,
        },
    ];

    return (
        <div
            className="large-request-table"
            style={{ minHeight: "500px" }}
        >
            <NodeDataModal
                isLoadingNodeData={isLoadingNodeData}
                open={open}
                handleClose={handleClose}
                nodeInfo={{
                    proposer,
                    txId,
                    approvals: proposer && txId ? 1 : 0,
                }}
            />
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
                    <div style={{ display: "grid" }}>
                        <SearchInput updateData={setData} fetchTableData={fetchTableData} />
                    </div>
                    <DataTable
                        columns={largeReqColumns}
                        selectableRowDisabled={(row) => !row.signable}
                        selectableRowsHighlight
                        selectableRows
                        progressPending={isLoadingGithubData}
                        onChangePage={(
                            page: number,
                            totalRows: number
                        ) => {
                            setCurrentPage(page);
                        }}
                        selectableRowsNoSelectAll={true}
                        pagination
                        paginationServer
                        paginationTotalRows={500}
                        paginationRowsPerPageOptions={[10]}
                        paginationPerPage={10}
                        defaultSortFieldId={1}
                        onRowClicked={(row) => {
                            if (!row.signable) {
                                context.wallet.dispatchNotification(
                                    CANT_SIGN_MESSAGE
                                );
                            }
                        }}
                        noContextMenu={true}
                        data={data}
                        progressComponent={
                            <div
                                style={{
                                    width: "100%",
                                    textAlign: "center",
                                }}
                            >
                                <CircularProgress
                                    style={{
                                        margin: "8rem auto",
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

export default LargeRequestTable;
//
// let pendingTxs;
// // @ts-ignore
// if (!cachedAddress.notaryAddress) {
//   pendingTxs = await context.wallet.api.pendingTransactions(
//     commentParsed.notaryAddress
//   );

//   cachedAddress.notaryAddress = pendingTxs;
// } else {
//   pendingTxs = cachedAddress.notaryAddress;
//   console.log("hey hey");
// }
//
//
//
// // Proposer(first notary create and sign transaction):
// //  propser is the person who creates the first transaction to tell
// the node about the request
// the proposer also sign the transaction
// an approval is needed(multisig 2/n) which is then done by another
// notary
//
// // TxId: ransaction created by the first notary to
// sign(proposer)
// // Approvals: 0/1
