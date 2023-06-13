export type ApprovedVerifiers = {
    datacap: string;
    verifier: string;
};

export type VerifiedData = ApprovedVerifiers & {
    verifierAccount: string;
};

export type VerifiedCachedData = {
    [key: number]: VerifiedData[];
};

export interface LargeRequestData {
    address: string;
    approvals: number | boolean | null;
    data: any;
    datacap: string;
    issue_number: number;
    labels: { name: string }[];
    multisig: string;
    proposer: any;
    signable: boolean;
    tx: any;
    url: string;
    comments: {
        user: { login: string };
        body: string;
        created_at: string;
        updated_at: string;
    }[];
    approvalInfoFromLabels?: number;
    user: string; //github handle
    events: GithubIssueEvent[];
    name: string;
    uuid: string;
}

export interface GithubIssueEvent {
    id: number;
    node_id: string;
    url: string;
    created_at: string;
    label: {
        name: string;
        color: string;
    };
    actor: {
        login: string;
        id: number;
    };
    event: string; // "labeled" || "assigned" || "commented" || "closed" || "reopened" || "unassigned"
}
export interface DirectIssue {
    number: number;
    url: string;
    owner: string;
    data: any;
}

export interface TransactionAndIssue {
    clientAddress: string;
    multisigAddress: any;
    multisigInfo: any;
    tx: any;
    issue: any[];
}

export type NotaryActionStatus =
    | "Decline"
    | "Request More Information";

export interface StatsInfo {
    dateCreated: string; // Date Object(?)
    title: string;
}

export interface BlockchainDataInfo {
    requestProposed: any;
    requestApproved: any;
    approvalFailed: any;
    proposalFailed: any;
}

export interface UserDataInfo {
    ghLogins: any;
    ledgerLogins: any;
    ledgerLoginsFail: any;
    ghTokenLoading: any;
}

export enum SentryDataPeriods {
    OneDay = "24h",
    SevenDays = "7d",
    TwoWeeks = "14d",
}

export enum SentryDataTypes {
    LoginStats = "login",
    SigningStats = "tx",
}

export interface TimeRangeInput {
    searchQuery: SentryDataPeriods;
    setSearchQuery: React.Dispatch<
        React.SetStateAction<SentryDataPeriods>
    >;
}

export interface TabsInput {
    searchQuery: SentryDataPeriods;
    setSearchQuery: any;
}

export interface BlockchainsTabProps {
    searchQuery: SentryDataPeriods;
}

export interface ChartsViewProps {
    searchQuery: SentryDataPeriods;
    infoData: any;
}

export interface UserTabProps {
    searchQuery: SentryDataPeriods;
}

export interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

