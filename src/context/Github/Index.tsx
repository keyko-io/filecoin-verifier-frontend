import React from 'react'

export const Github = React.createContext({
    githubLogged: false,
    loginGithub: async (code: string) => { },
    initGithubOcto: async (token: string) => { },
    logoutGithub: async () => { },
    githubOctoGenericLogin: async () => { },
    loggedUser: '',
    fetchGithubIssues: async (owner: string, repo: string, state: any, labels: any) => { },
    fetchGithubComments: async (owner: string, repo: string, issueNumber: number, issue?: any) => { },
    avatarUrl: '',
    githubOcto: {},
    githubOctoGeneric: {},
})