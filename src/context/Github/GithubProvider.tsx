import React from 'react'
import { Github } from './Index'
// @ts-ignore
import { Octokit } from '@octokit/rest'
import { config } from '../../config';
import axios from "axios"
import toast from 'react-hot-toast';

interface WalletProviderStates {
    githubLogged: boolean
    githubOcto: any
    loginGithub: any
    initGithubOcto: any
    logoutGithub: any
    githubOctoGenericLogin: any
    githubOctoGeneric: any
    loggedUser: any
    avatarUrl: any
    fetchGithubIssues: any
    fetchGithubComments: any
}

export default class WalletProvider extends React.Component<{}, WalletProviderStates> {
    setStateAsync(state: any) {
        return new Promise((resolve: any) => {
            this.setState(state, resolve)
        });
    }

    initNetworkIndex = () => {
        const activeIndex = config.lotusNodes
            .map((node: any, index: number) => { return { name: node.name, index: index } })
            .filter((node: any, index: number) => config.networks.includes(node.name))

        return activeIndex[0].index
    }

    async componentDidMount() {
        const tokenIs = await this.state.checkToken()

        if (tokenIs === "not expired") {
            this.loadGithub()
        }
    }

    state = {
        loggedUser: '',
        avatarUrl: '',
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

                await this.state.initGithubOcto(authjson.data.access_token)

                const { login, avatar_url } = (await this.state.githubOcto.users.getAuthenticated()).data

                localStorage.setItem("avatar", avatar_url)
                localStorage.setItem("loggedUser", login)

                this.setState({ loggedUser: login, avatarUrl: avatar_url })
                axios.defaults.headers.common['Authorization'] = `Bearer ${authjson.data.access_token}`

            } catch (e: any) {
                this.state.logoutGithub()
                toast.error("Failed to login. Try again later.")
                console.log(e, "error occurred while login github")
            }
        },
        initGithubOcto: async (token: string) => {
            const octokit = new Octokit({
                auth: token
            })
            try {
                await this.setStateAsync({
                    githubLogged: true,
                    githubOcto: octokit
                })
            } catch (error) {
                console.log(error)
            }

        },
        logoutGithub: async () => {
            localStorage.removeItem('githubToken')
            localStorage.removeItem('loggedUser')
            localStorage.removeItem('avatar')
            localStorage.removeItem('tokenExpiration')
            await this.setStateAsync({
                githubLogged: false,
                githubOcto: undefined,
                loggedUser: null
            })
        },
        checkToken: async () => {
            const githubToken = localStorage.getItem('githubToken')!
            if (githubToken) {
                const actualTimestamp = new Date().getTime()
                const expiration = localStorage.getItem('tokenExpiration')! || 0
                if (Number(expiration) <= actualTimestamp || expiration === 0) {
                    this.state.logoutGithub()
                    return "expired"
                }

                axios.defaults.headers.common['Authorization'] = `Bearer ${githubToken}` //test -using axios to fetch comments

                return "not expired"
            }
        },
        githubOctoGenericLogin: async () => {
            if (this.state.githubOctoGeneric.logged === false) {
                const octokit = new Octokit({
                    auth: config.githubGenericToken,
                });
                this.setState(
                    {
                        githubOctoGeneric:
                            { logged: true, octokit }
                    })
            }
        },
        fetchGithubIssues: async (owner: any, repo: any, state: any, labels: any) => {
            const rawIssues = await this.state.githubOcto.paginate(
                this.state.githubOcto.issues.listForRepo,
                {
                    owner,
                    repo,
                    state,
                    labels
                }
            );
            return rawIssues
        },
        fetchGithubComments: async (owner: any, repo: any, issueNumber: any, issue: any) => {
            try {

                // the following is for testing
                if (!issue) {
                    const rawComments = await this.state.githubOctoGeneric.octokit.paginate(
                        this.state.githubOctoGeneric.octokit.issues.listComments,
                        {
                            owner,
                            repo,
                            issue_number: issueNumber
                        }
                    );
                    // console.log("rawComments", rawComments)
                    return rawComments
                }


                const axiosComms = await axios.get(issue.comments_url)
                // console.log("axiosComms", axiosComms.data)
                return axiosComms.data



            } catch (error) {
                console.log(error)
            }
        },
    }

    loadGithub() {
        console.log("running now in load github")
        const githubToken = localStorage.getItem('githubToken')!
        const loggedUser = localStorage.getItem('loggedUser')!
        if (githubToken) {
            this.state.initGithubOcto(githubToken)
        }
        if (!githubToken) {
            this.setState({ githubLogged: false })
        }
        if (loggedUser) {
            this.setState({ loggedUser })
        }
        this.state.githubOctoGenericLogin()
    }


    render() {
        return (
            <Github.Provider value={this.state}>
                {this.props.children}
            </Github.Provider>
        )
    }
}