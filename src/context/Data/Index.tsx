import { any } from 'bluebird'
import React from 'react'
import { VerifiedData, DirectIssue, LargeRequestData, VerifiedCachedData } from "../../type";

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
  updateGithubVerifiedLarge: async (requestNumber: any, messageID: string, address: string, datacap: any, signer: string, errorMessage: string, action?: string) => { },
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


  getLastUniqueId: any,
  txsIssueGitHub: [] as any,
  approvedVerifiersData: any,
  approvedNotariesLoading: true,
  ldnRequestsLoading: false,
  updateContextState: (elementToUpdate: any, type: string) => { },
  isAddressVerified: false,
  isVerifyWalletLoading: false,
  updateIsVerifiedAddress: async (val: boolean) => { },
  verifyWalletAddress: async () => { },
  checkVerifyWallet: async () => { },
  setIsVerifyWalletLoading: () => { },
  getLDNIssuesAndTransactions: () => { },

  postLogs: async (
    message: string,
    type: string,
    actionKeyword: string,
    issueNumber: number,
    repo: string
  ) => { },
  selectedLargeClientRequests: [],
  setSelectedLargeClientRequests: (rowNumbers: any[]) => { },
  // passed by props
  github: {} as any,
  wallet: {} as any

})