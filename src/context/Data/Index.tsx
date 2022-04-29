import { any } from 'bluebird'
import React from 'react'

export const Data = React.createContext({
    loadClientRequests: async () => {},
    clientRequests: [] as any,
    largeClientRequests: [] as any,
    loadNotificationClientRequests: async () => {},
    notificationClientRequests: [] as any,
    loadNotificationVerifierRequests: any,
    loadVerifierAndPendingRequests: any,
    verifierAndPendingRequests: [] as any,
    notificationVerifierRequests: [] as any,
    viewroot: false,
    switchview: async () => {},
    verified: [] as any,
    loadVerified: async () => {},
    updateGithubVerified: async (requestNumber: any, messageID: string, address: string, datacap: number, signer: string, errorMessage: string) => {},
    createRequest: async (data: any) => {},
    selectedNotaryRequests: [] as any,
    selectNotaryRequest: any,
    clientsGithub: any,
    loadClientsGithub: any,
    search: any,
    refreshGithubData: async () => {},
    logToSentry:(category: string, message:string,level:"info"|"error",data: Map<string, any>) => {},
    approvedNotariesLoading: true,
    ldnRequestsLoading: true,
    updateContextState: (elementToUpdate: any, type:string) => {},
    postLogs:  async (
        message: string,
        type: string,
        actionKeyword: string,
        issueNumber: number,
        repo: string
      ) => {},
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
      ) => {},
      sortPublicRequests: async (
        e: any,
        previousOrderBy: string,
        previousOrder: number
      ) => {},
      selectedLargeClientRequests: [],
      setSelectedLargeClientRequests: (rowNumbers: any[]) =>{},
      searchString:'',
    // passed by props
    github: {} as any,
    wallet: {} as any

})