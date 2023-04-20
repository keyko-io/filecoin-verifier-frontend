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
