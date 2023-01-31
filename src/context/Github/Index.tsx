import React from 'react'

export const Github = React.createContext({
    loginGithub: async (code: string) => { },
    initGithubOcto: async (token: string) => { },
    logoutGithub: async () => { },
    githubOctoGenericLogin: async () => { },
    fetchGithubIssues: async (owner: string, repo: string, state: any, labels: any) => { },
    fetchGithubComments: async (owner: string, repo: string, issueNumber: number, issue?: any) => { },
    githubLogged: false,
    loggedUser: '',
    avatarUrl: '',
    githubOctoGeneric: {},
    githubOcto: {},
})