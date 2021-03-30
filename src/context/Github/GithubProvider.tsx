import React from 'react'
import { Github } from './Index'
// @ts-ignore
import { Octokit } from '@octokit/rest'
import { config } from '../../config';

interface WalletProviderStates {
    githubLogged: boolean
    githubOcto: any
    loginGithub: any
    initGithubOcto: any
    logoutGithub: any
    githubOctoGenericLogin: any
    githubOctoGeneric: any
}

export default class WalletProvider extends React.Component<{}, WalletProviderStates> {
    setStateAsync(state: any) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
        });
    }

    initNetworkIndex = () => {

        const activeIndex = config.lotusNodes
            .map((node: any, index: number) => { return { name: node.name, index: index } })
            .filter((node: any, index: number) => config.networks.includes(node.name))

        return activeIndex[0].index
    }

    state = {
        githubLogged: false,
        githubOcto: {} as any,
        githubOctoGeneric: { logged: false } as any,
        loginGithub: async (code: string, onboarding?: boolean) => {
            console.log('code', code)
            try {
                const authrequest = await fetch(config.apiUri + '/api/v1/github', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        code
                    })
                })
                const authjson = await authrequest.json()
                const expiration = new Date().getTime() + (Number(authjson.data.expires_in) * 1000)
                localStorage.setItem('tokenExpiration', expiration.toString())
                localStorage.setItem('githubToken', authjson.data.access_token)
                this.state.initGithubOcto(authjson.data.access_token)
            } catch (e) {
                // this.state.dispatchNotification('Failed to login. Try again later.')
            }
        },
        initGithubOcto: async (token: string) => {
            const octokit = new Octokit({
                auth: token
            })
            await this.setStateAsync({
                githubLogged: true,
                githubOcto: octokit
            })
        },
        logoutGithub: async () => {
            localStorage.removeItem('githubToken')
            await this.setStateAsync({
                githubLogged: false,
                githubOcto: undefined
            })
        },
        checkToken: async () => {
            const githubToken = localStorage.getItem('githubToken')!
            if (githubToken) {
                const actualTimestamp = new Date().getTime()
                const expiration = localStorage.getItem('tokenExpiration')! || 0
                if (Number(expiration) <= actualTimestamp || expiration === 0) {
                    this.state.logoutGithub()
                }
            }
        },
        githubOctoGenericLogin: async () => {
            if (this.state.githubOctoGeneric.logged === false) {
                const octokit = await new Octokit({
                    auth: config.githubGenericToken,
                });
                this.setState({ githubOctoGeneric: { logged: true, octokit } })
            }
        }
    }

    loadGithub() {
        const githubToken = localStorage.getItem('githubToken')!
        if (githubToken) {
            this.state.initGithubOcto(githubToken)
        }
    }

    async componentDidMount() {
        this.loadGithub()
    }



    render() {
        return (
            <Github.Provider value={this.state}>
                {this.props.children}
            </Github.Provider>
        )
    }
}