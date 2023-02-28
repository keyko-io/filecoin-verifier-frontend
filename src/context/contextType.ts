import { ApprovedVerifiers, DirectIssue, LargeRequestData, TransactionAndIssue, VerifiedCachedData, VerifiedData } from "../type";

import { Cookies } from 'react-cookie'

// DATA PROVIDER CONTEXT TYPE => STATE AND PROPS
export interface DataProviderStates {
    getNodeData: (address: any) => Promise<any>;
    loadClientRequests: () => Promise<void>;
    loadVerifierAndPendingRequests: () => Promise<void>;
    switchview: () => void;
    loadVerified: (page: number) => Promise<void>;
    updateGithubVerified: (requestNumber: number, messageID: string, address: string, datacap: number, signer: string, errorMessage: string) => Promise<void>;
    updateGithubVerifiedLarge: (requestNumber: number, messageID: string, address: string, datacap: any, signer: string, errorMessage: string, action?: string) => Promise<void>;
    createRequest: (data: any) => Promise<any>;
    selectNotaryRequest: (selectedNotaryItems: any) => void;
    loadClients: () => Promise<void>;
    assignToIssue: (issue_number: number, assignees: string[]) => Promise<void>;
    search: (query: string) => void;
    searchUserIssues: (user: string) => Promise<any[]>;
    logToSentry: (category: string, message: string, level: "info" | "error", data: any) => void;
    postLogs: (message: string, type: string, actionKeyword: string, issueNumber: number, repo: string) => Promise<any>;
    updateContextState: (elementToUpdate: any, type: string) => void;
    updateIsVerifiedAddress: (val: boolean) => void;
    verifyWalletAddress: () => Promise<boolean | undefined>
    checkVerifyWallet: () => Promise<boolean>;
    setSelectedLargeClientRequests: (rowNumbers: any[]) => void;
    setIsVerifyWalletLoading: (value: boolean) => void;
    getLDNIssuesAndTransactions: () => Promise<{ transactionAndIssue: TransactionAndIssue[], filteredTxsIssue: TransactionAndIssue[] }>;
    getLastUniqueId: (issueNumber: number) => Promise<string>;
    clientRequests: DirectIssue[];
    largeClientRequests: LargeRequestData[];
    verifierAndPendingRequests: any[];
    viewroot: boolean;
    verified: VerifiedData[];
    verifiedCachedData: VerifiedCachedData;
    acceptedNotariesLoading: boolean;
    selectedNotaryRequests: any[];
    clients: any[];
    clientsAmount: string;
    searchString: string;
    approvedNotariesLoading: boolean;
    ldnRequestsLoading: boolean;
    isAddressVerified: boolean;
    isVerifyWalletLoading: boolean;
    isPendingRequestLoading: boolean;
    selectedLargeClientRequests: any;
    approvedVerifiersData: ApprovedVerifiers[] | null,
    txsIssueGitHub: TransactionAndIssue[] | null;
}

export interface DataProviderProps {
    github: GithubProviderStates;
    wallet: WalletProviderStates;
    children: React.ReactNode;
}
// DATA PROVIDER CONTEXT TYPE => STATE AND PROPS

// GITHUB PROVIDER CONTEXT TYPE => STATE AND PROPS

export interface GithubProviderStates {
    loginGithub: (code: string) => Promise<void>
    initGithubOcto: (token: string) => Promise<void>
    logoutGithub: () => Promise<void>
    githubOctoGenericLogin: () => Promise<void>
    fetchGithubIssues: (owner: any, repo: any, state: any, labels: any) => Promise<any>
    fetchGithubComments: (owner: string, repo: string, issueNumber: number, issue?: any) => Promise<any>
    githubLogged: boolean
    loggedUser: string
    avatarUrl: string
    githubOctoGeneric: any
    githubOcto: any
}

// GITHUB PROVIDER CONTEXT TYPE => STATE AND PROPS


// WALLET PROVIDER CONTEXT TYPE => STATE AND PROPS
export type LoadWalletOptionsType = { multisig: boolean, multisigAddress: string }

export interface WalletProviderStates {
    isLogged: boolean
    isLoading: boolean
    wallet: string
    api: any
    walletIndex: number
    networkIndex: number
    accounts: string[]
    accountsActive: any
    activeAccount: string
    balance: number
    message: string
    multisig: boolean
    multisigAddress: string
    multisigID: string
    sign: any
    getAccounts: any
    importSeed: (seedphrase: string) => Promise<void>
    selectNetwork: (networkIndex: number) => Promise<void>
    selectAccount: (index: number) => Promise<void>
    loadWallet: (type: string, options?: LoadWalletOptionsType) => Promise<boolean>
    dispatchNotification: (message: string) => void
}


export type WalletProviderProps = {
    cookies: Cookies
}

// WALLET PROVIDER CONTEXT TYPE => STATE AND PROPS


//CONFIG LOTUS TYPE

export interface ConfigLotusNode {
    name: string;
    code: number;
    url: string;
    token: string | undefined;
    notaryRepo: string;
    notaryOwner: string;
    rkhMultisig: string;
    rkhtreshold: number;
    largeClientRequestAssign: string[];
}
