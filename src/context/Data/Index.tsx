import { any } from 'bluebird'
import React from 'react'

export const Data = React.createContext({
    loadClientRequests: async () => {},
    clientRequests: [] as any,
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
    updateGithubVerified: async (requestNumber: any, messageID: string, address: string, datacap: any) => {},
    createRequest: async (data: any) => {},
    selectedNotaryRequests: [] as any,
    selectNotaryRequest: any,
    clientsGithub: any,
    loadClientsGithub: any,
    search: any,
    refreshGithubData: any,
    // passed by props
    github: {} as any,
    wallet: {} as any
})