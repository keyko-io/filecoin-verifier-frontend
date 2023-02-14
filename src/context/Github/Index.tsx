import React from "react";

export const Github = React.createContext({
    loginGithub: async (code: string) => {},
    githubLogged: false,
    githubOcto: {},
    initGithubOcto: {} as any,
    logoutGithub: async () => {},
    githubOctoGenericLogin: async () => {},
    loggedUser: "",
    avatarUrl: "",
    githubOctoGeneric: {},
    fetchGithubIssues: async (
        owner?: any,
        repo?: any,
        state?: any,
        labels?: any
    ) => {},
    fetchGithubComments: async (
        owner?: any,
        repo?: any,
        issueNumber?: any,
        issue?: any
    ) => {},
});
