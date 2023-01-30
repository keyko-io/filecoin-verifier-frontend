// we use this data for the accepted notaries table in RKH view
export type ApprovedVerifiers = {
    datacap: string,
    verifier: string,
}

export type VerifiedData = ApprovedVerifiers & { verifierAccount: string }

export type VerifiedCachedData = {
    [key: number]: VerifiedData[]
}

export interface LargeRequestData {
    address: string;
    approvals: number;
    data: any;
    datacap: string;
    issue_number: number;
    labels: any;
    multisig: string;
    proposer: any;
    signable: boolean;
    tx: any;
    url: string;
}


export interface DirectIssue {
    number: number,
    url: string,
    owner: string,
    data: any
}

export interface TransactionAndIssue {
    clientAddress: string;
    multisigAddress: any;
    multisigInfo: any;
    tx: any;
    issue: any[];
}