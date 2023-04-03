import { ldnParser } from "@keyko-io/filecoin-verifier-tools";
import DisplaySettingsIcon from "@mui/icons-material/DisplaySettings";
import { CircularProgress } from "@material-ui/core";
import { useContext, useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { config } from "../../../config";
import { Data } from "../../../context/Data/Index";
import { LargeRequestData } from "../../../type";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import NodeDataModal from "./NodeDataModal";
import SearchInput from "./SearchInput";
import { useLargeRequestsContext } from "../../../context/LargeRequests";
import ActionsModal from "./ActionsModal";
import { ISSUE_LABELS } from "../../../constants";

const CANT_SIGN_MESSAGE =
    "You can currently only approve the allocation requests associated with the multisig organization you signed in with. Signing proposals for additional DataCap allocations will require you to sign in again";

const mapNotaryAddressToGithubHandle = async (address: string) => {
    const verifRegJson: any = await fetch(
        config.verifiers_registry_url
    );
    const json = await verifRegJson.json();
    const githubHandle =
        json.notaries.find(
            (notary: any) =>
                notary.ldn_config.signing_address === address
        )?.github_user[0] || "";
    return githubHandle;
};

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

const formatIssues = async (
    data: { body: string }[],
    githubOcto: any
): Promise<any[]> => {
    const parsedIssueData: any = [];
    await Promise.all(
        data?.map(async (issue: any) => {
            if (!issue.body) return;
            const parsed = ldnParser.parseIssue(issue.body);

            const approvalInfo = issue.labels.some(
                (label: any) =>
                    label.name === ISSUE_LABELS.STATUS_START_SIGN_DATACAP
            );

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
                approvalInfoFromLabels: approvalInfo ? 1 : 0,
            });
        })
    );
    return parsedIssueData;
};

type LargeRequestTableProps = {
    setSelectedLargeClientRequests: any;
};

const LargeRequestTable = (props: LargeRequestTableProps) => {
    const { setSelectedLargeClientRequests } = props;
    const { count, changeRequestStatus } = useLargeRequestsContext();
    const context = useContext(Data);

    const [isLoadingGithubData, setIsLoadingGithubData] =
        useState<boolean>(false);
    const [isLoadingNodeData, setLoadingNodeData] =
        useState<boolean>(false);
    const [isActionsModalOpen, setIsActionsModalOpen] =
        useState<boolean>(false);
    const [data, updateData] = useState<LargeRequestData[]>([]);
    const [selectedRequestForActions, setSelectedRequestForActions] =
        useState<LargeRequestData>({} as LargeRequestData);

    const setData = (data: LargeRequestData[]) => {
        updateData(data);
    };

    const [currentPage, setCurrentPage] = useState(1);
    const [isNodeDataModalOpen, setIsNodeDataModalOpen] =
        useState(false);
    const [proposer, setProposer] = useState("");
    const [txId, setTxId] = useState("");

    const handleNodeDataModalOpen = async (
        multisig: string,
        clientAddress: string
    ) => {
        setLoadingNodeData(true);
        setIsNodeDataModalOpen(true);
        const nodeData = await context.getNodeData(
            multisig,
            clientAddress
        );
        if (nodeData?.signerAddress) {
            const notaryGithubHandle =
                await mapNotaryAddressToGithubHandle(
                    nodeData.signerAddress
                );
            setProposer(notaryGithubHandle);
            setTxId(nodeData?.txId);
            setLoadingNodeData(false);
        }
        setLoadingNodeData(false);
    };

    const handleNodeDataModalClose = () => {
        setIsNodeDataModalOpen(false);
        setProposer("");
        setTxId("");
    };

    useEffect(() => {
        currentPage >= 1 &&
            data?.length &&
            fetchTableData(currentPage); // NOT GREAT SOLUTION
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
                        labels: ISSUE_LABELS.BOT_READY_TO_SIGN,
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
            grow: 1,
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
            id: "multisig",
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
            id: "auditTrail",
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
                    {row?.issue_number}
                </a>
            ),
            center: true,
        },
        {
            name: "Approvals",
            selector: (row: LargeRequestData) =>
                row?.approvalInfoFromLabels,
            grow: 0.5,
            center: true,
            cell: (row: LargeRequestData) => (
                <div>{row?.approvalInfoFromLabels}</div>
            ),
        },
        {
            name: "Node Data",
            selector: (row: LargeRequestData) => row?.tx?.id,
            grow: 0.5,
            cell: (row: LargeRequestData) => (
                <div
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                        handleNodeDataModalOpen(
                            row.multisig,
                            row.address
                        )
                    }
                >
                    <MoreHorizIcon />
                </div>
            ),
            center: true,
        },
        {
            name: "Actions",
            selector: (row: LargeRequestData) => row?.tx?.id,
            grow: 0.5,
            cell: (row: LargeRequestData) => (
                <div
                    style={{ color: "gray" }}
                    onClick={() => {
                        // setSelectedRequestForActions(row);
                        // setIsActionsModalOpen(true);
                    }}
                >
                    <DisplaySettingsIcon />
                </div>
            ),
            center: true,
        },
    ];

    const handleChangeStatus = async (newStatus: string) => {
        console.log("newStatus", newStatus);
        await changeRequestStatus(newStatus, selectedRequestForActions.issue_number);
    };

    return (
        <div
            className="large-request-table"
            style={{ minHeight: "500px" }}
        >
            <ActionsModal
                handleChangeStatus={handleChangeStatus}
                open={isActionsModalOpen}
                handleClose={() => setIsActionsModalOpen(false)}
            />
            <NodeDataModal
                isLoadingNodeData={isLoadingNodeData}
                open={isNodeDataModalOpen}
                handleClose={handleNodeDataModalClose}
                nodeInfo={{
                    proposer,
                    txId,
                    approvals: txId !== "" ? 1 : 0,
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
                        <SearchInput
                            updateData={setData}
                            fetchTableData={fetchTableData}
                        />
                    </div>
                    <DataTable
                        defaultSortAsc={false}
                        defaultSortFieldId="auditTrail"
                        columns={largeReqColumns}
                        selectableRowsHighlight
                        onSelectedRowsChange={({ selectedRows }) => {
                            setSelectedLargeClientRequests(
                                selectedRows
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

export default LargeRequestTable;
