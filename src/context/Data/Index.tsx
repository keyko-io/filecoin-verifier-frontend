import React from 'react'
import { VerifiedData, DirectIssue, LargeRequestData, VerifiedCachedData, ApprovedVerifiers, TransactionAndIssue } from "../../type";

export const Data = React.createContext({
  loadClientRequests: async () => { },
  clientRequests: [] as DirectIssue[],
  largeClientRequests: [] as LargeRequestData[],
  loadVerifierAndPendingRequests: async () => { },
  verifierAndPendingRequests: [] as any,
  viewroot: false,
  switchview: () => { },
  verified: [] as VerifiedData[],
  verifiedCachedData: {} as VerifiedCachedData,
  loadVerified: async (page: number) => { },
  acceptedNotariesLoading: false,
  updateGithubVerified: async (requestNumber: number, messageID: string, address: string, datacap: number, signer: string, errorMessage: string) => { },
  updateGithubVerifiedLarge: async (requestNumber: number, messageID: string, address: string, datacap: any, signer: string, errorMessage: string, action?: string) => { },
  createRequest: async (data: any) => { },
  selectedNotaryRequests: [] as any,
  selectNotaryRequest: (selectedNotaryItems: any) => { },
  loadClients: async () => { },
  assignToIssue: async (issue_number: number, assignees: string[]) => { },
  clients: [] as any,
  clientsAmount: '',
  search: (query: string) => { },
  searchString: '',
  searchUserIssues: async (user: string) => [] as any[],
  logToSentry: (category: string, message: string, level: "info" | "error", data: any) => { },
  postLogs: async (message: string, type: string, actionKeyword: string, issueNumber: number, repo: string) => ({}) as any,
  approvedNotariesLoading: true,
  ldnRequestsLoading: false,
  updateContextState: (elementToUpdate: any, type: string) => { },
  isAddressVerified: false,
  isVerifyWalletLoading: false,
  isPendingRequestLoading: false,
  updateIsVerifiedAddress: (val: boolean) => { },
  verifyWalletAddress: async () => undefined as (boolean | undefined),
  checkVerifyWallet: async () => false,
  selectedLargeClientRequests: [] as any[],
  setSelectedLargeClientRequests: (rowNumbers: any[]) => { },
  setIsVerifyWalletLoading: (value: boolean) => { },
  getLDNIssuesAndTransactions: () => { },
  getLastUniqueId: async (issueNumber: number) => '',
  approvedVerifiersData: [] as (ApprovedVerifiers[] | null),
  txsIssueGitHub: [] as (TransactionAndIssue[] | null),

  // passed by props
  github: {} as any,
  wallet: {} as any
})