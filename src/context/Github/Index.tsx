import React from 'react'

export const Github = React.createContext({
    githubLogged: false,
    githubOcto: {},
    loginGithub: async (code: string, onboarding?: boolean) => { },
    initGithubOcto: async (token: string, onboarding?: boolean) => { },
    logoutGithub: async () => { },
    githubOctoGenericLogin: async () => { },
    githubOctoGeneric: {},
    loggedUser:'',
    fetchGithubIssues: async (owner?:any,repo?:any, state?:any, labels?:any)=> {},
    fetchGithubComments: async (owner?:any,repo?:any, issueNumber?:any, issue?:any)=> {}
})