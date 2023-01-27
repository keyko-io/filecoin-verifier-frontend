import { any } from 'bluebird'
import React from 'react'
import { VerifiedData } from "../../type";

export const Data = React.createContext({
  getLastUniqueId: any,
  txsIssueGitHub: [] as any,
  loadClientRequests: async () => { },
  clientRequests: [] as any,
  largeClientRequests: [] as any,
  loadVerifierAndPendingRequests: any,
  verifierAndPendingRequests: [] as any,
  viewroot: false,
  approvedVerifiersData: any,
  switchview: async () => { },
  verified: [] as VerifiedData[],
  loadVerified: async () => { },
  updateGithubVerified: async (requestNumber: any, messageID: string, address: string, datacap: number, signer: string, errorMessage: string) => { },
  createRequest: async (data: any) => { },
  selectedNotaryRequests: [] as any,
  selectNotaryRequest: any,
  search: any,
  searchUserIssues: any,
  logToSentry: (category: string, message: string, level: "info" | "error", data: Map<string, any>) => { },
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
  updateGithubVerifiedLarge: async (
    requestNumber: any,
    messageID: any,
    address: string,
    datacap: any,
    approvals: boolean,
    signer: string,
    msigAddress: string,
    name: string,
    errorMessage: string,
    labels: string[],
    action?: string
  ) => { },
  selectedLargeClientRequests: [],
  setSelectedLargeClientRequests: (rowNumbers: any[]) => { },
  searchString: '',
  // passed by props
  github: {} as any,
  wallet: {} as any

})