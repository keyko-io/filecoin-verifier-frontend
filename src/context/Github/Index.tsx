import { any } from 'bluebird'
import React from 'react'

export const Github = React.createContext({
    githubLogged: false,
    githubOcto: {},
    loginGithub: async (code: string, onboarding?: boolean) => {},
    initGithubOcto: async (token: string, onboarding?: boolean) => {},
    logoutGithub: async () =>{},
    githubOctoGeneric: async () => {}
})