import React from "react";
import {
  VerifiedData,
  DirectIssue,
  LargeRequestData,
  VerifiedCachedData,
  ApprovedVerifiers,
  TransactionAndIssue,
} from "../../type";
import { GithubProviderStates, WalletProviderStates } from "../contextType";

export const Data = React.createContext({
  assignToIssue: async (issue_number: number, assignees: string[]) => {},
  search: (query: string) => {},
  searchUserIssues: async (user: string) => [] as any[],
  logToSentry: (
    category: string,
    message: string,
    level: "info" | "error",
    data: any
  ) => {},
  postLogs: async (
    message: string,
    type: string,
    actionKeyword: string,
    issueNumber: number,
    repo: string
  ) => ({} as any),
  updateIsVerifiedAddress: (val: boolean) => {},
  verifyWalletAddress: async () => undefined as boolean | undefined,
  checkVerifyWallet: async () => false,
  updateContextState: (elementToUpdate: any, type: string) => {},
  setSelectedLargeClientRequests: (rowNumbers: any[]) => {},
  setIsVerifyWalletLoading: (value: boolean) => {},
  getLDNIssuesAndTransactions: () => {},
  getLastUniqueId: async (issueNumber: number) => "",
  loadClientRequests: async () => {},
  loadVerifierAndPendingRequests: async () => {},
  switchview: () => {},
  loadVerified: async (page: number) => {},
  updateGithubVerified: async (
    requestNumber: number,
    messageID: string,
    address: string,
    datacap: number,
    signer: string,
    errorMessage: string
  ) => {},
  updateGithubVerifiedLarge: async (
    requestNumber: number,
    messageID: string,
    address: string,
    datacap: any,
    signer: string,
    errorMessage: string,
    action?: string
  ) => {},
  createRequest: async (data: any) => {},
  selectNotaryRequest: (selectedNotaryItems: any) => {},
  loadClients: async () => {},
  clientRequests: [] as DirectIssue[],
  largeClientRequests: [] as LargeRequestData[],
  verifierAndPendingRequests: [] as any,
  viewroot: false,
  verified: [] as VerifiedData[],
  verifiedCachedData: {} as VerifiedCachedData,
  acceptedNotariesLoading: false,
  selectedNotaryRequests: [] as any,
  clients: [] as any,
  clientsAmount: "",
  rawLargeIssuesAll: [] as any,
  searchString: "",
  approvedNotariesLoading: true,
  ldnRequestsLoading: false,
  isAddressVerified: false,
  isVerifyWalletLoading: false,
  isPendingRequestLoading: false,
  selectedLargeClientRequests: [] as any[],
  approvedVerifiersData: [] as ApprovedVerifiers[] | null,
  txsIssueGitHub: [] as TransactionAndIssue[] | null,
  // passed by props
  github: {} as GithubProviderStates,
  wallet: {} as WalletProviderStates,
});
