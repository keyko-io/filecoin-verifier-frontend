import { Octokit } from "@octokit/rest";
import axios from "axios";
import React from "react";
import toast from "react-hot-toast";
import { config } from "../../config";
import * as Logger from "../../logger";
import { Github } from "./Index";

interface WalletProviderStates {
  githubLogged: boolean;
  githubOcto: any;
  loginGithub: any;
  initGithubOcto: any;
  logoutGithub: any;
  githubOctoGenericLogin: any;
  githubOctoGeneric: any;
  loggedUser: any;
  avatarUrl: any;
  fetchGithubIssues: any;
  fetchGithubComments: any;
}

export default class WalletProvider extends React.Component<
  {},
  WalletProviderStates
> {
  setStateAsync(state: any) {
    return new Promise((resolve: any) => {
      this.setState(state, resolve);
    });
  }

  initNetworkIndex = () => {
    const activeIndex = config.lotusNodes
      .map((node: any, index: number) => {
        return { name: node.name, index: index };
      })
      .filter((node: any, index: number) =>
        config.networks.includes(node.name)
      );

    return activeIndex[0].index;
  };

  async componentDidMount() {
    const tokenIs = await this.state.checkToken();

    if (tokenIs === "not expired") {
      this.loadGithub();
    }

    if (tokenIs === "expired") {
      this.state.logoutGithub();
    }
  }

  state = {
    loggedUser: "",
    avatarUrl: "",
    githubLogged: false,
    githubOcto: {} as any,
    githubOctoGeneric: { logged: false } as any,
    loginGithub: async (code: string, onboarding?: boolean) => {
      let authjson;
      let githubHandle;
      try {
        const authrequest = await fetch(config.apiUri + "/api/v1/github", {
          method: "POST",
          mode: "cors",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
          }),
        });

        authjson = await authrequest.json();

        const expiration =
          new Date().getTime() + Number(authjson.data.expires_in) * 1000;

        localStorage.setItem("tokenExpiration", expiration.toString());
        localStorage.setItem("githubToken", authjson.data.access_token);

        await this.state.initGithubOcto(authjson.data.access_token);

        const { login, avatar_url } = (
          await this.state.githubOcto.users.getAuthenticated()
        ).data;

        githubHandle = login;
        localStorage.setItem("avatar", avatar_url);
        localStorage.setItem("loggedUser", login);

        this.setState({
          loggedUser: login,
          avatarUrl: avatar_url,
        });
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${authjson.data.access_token}`;

        await Logger.configureScope({
          githubUsername: githubHandle,
        });
        await Logger.BasicLogger({
          message: "Github Login Success",
        });
      } catch (e: any) {
        this.state.logoutGithub();
        await Logger.configureScope({
          githubUsername: githubHandle,
        });
        await Logger.BasicLogger({
          message: "Github Login Failed",
        });
        toast.error("Failed to login. Try again later.");
        console.log(e, "error occurred while login github");
      }
    },

    initGithubOcto: async (token: string) => {
      try {
        const octokit = new Octokit({
          auth: token,
        });
        await this.setStateAsync({
          githubLogged: true,
          githubOcto: octokit,
        });
        return octokit;
      } catch (error) {
        console.log(error);
        return null;
      }
    },

    logoutGithub: async () => {
      localStorage.removeItem("githubToken");
      localStorage.removeItem("loggedUser");
      localStorage.removeItem("avatar");
      localStorage.removeItem("tokenExpiration");
      await this.setStateAsync({
        githubLogged: false,
        githubOcto: undefined,
        loggedUser: null,
      });
      await Logger.configureScope({ githubUsername: "" });
      await Logger.BasicLogger({
        message: "User Logged Out Github",
      });
    },

    checkToken: async () => {
      const githubToken = localStorage.getItem("githubToken")!;
      if (githubToken) {
        const actualTimestamp = new Date().getTime();
        const expiration = localStorage.getItem("tokenExpiration")! || 0;
        if (Number(expiration) <= actualTimestamp || expiration === 0) {
          this.state.logoutGithub();
          return "expired";
        }

        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${githubToken}`; //test -using axios to fetch comments

        return "not expired";
      }
    },
    githubOctoGenericLogin: async () => {
      if (this.state.githubOctoGeneric.logged === false) {
        const octokit = new Octokit({
          auth: config.githubGenericToken,
        });
        this.setState({
          githubOctoGeneric: { logged: true, octokit },
        });
      }
    },
    fetchGithubIssues: async (
      owner: any,
      repo: any,
      state: any,
      labels: any
    ) => {
      if (!this?.state || !Object.keys(this?.state?.githubOcto).length) return;
      const rawIssues = await this?.state?.githubOcto?.paginate(
        this?.state?.githubOcto?.issues?.listForRepo,
        {
          owner,
          repo,
          state,
          labels,
          per_page: 100
        }
      );
      return rawIssues;
    },
    fetchGithubComments: async (
      owner: any,
      repo: any,
      issueNumber: any,
      issue?: any
    ) => {
      try {
        if (!issue) {
          const rawComments =
            await this?.state?.githubOctoGeneric?.octokit?.paginate(
              this?.state?.githubOctoGeneric?.octokit?.issues?.listComments,
              {
                owner,
                repo,
                issue_number: issueNumber,
              }
            );
          return rawComments;
        }

        const axiosComms = await axios.get(issue.comments_url);
        return axiosComms.data;
      } catch (error) {
        console.log(error);
      }
    },
  };

  async loadGithub() {
    try {
      const githubToken = localStorage.getItem("githubToken")!;
      const loggedUser = localStorage.getItem("loggedUser")!;
      if (githubToken) {
        const response = await this.state.initGithubOcto(githubToken);
        await response?.auth();
      }
      if (!githubToken) {
        this.setState({ githubLogged: false });
      }
      if (loggedUser) {
        this.setState({ loggedUser });
      }

      await Logger.configureScope({
        githubUsername: loggedUser,
      });
      await Logger.BasicLogger({
        message: "Loaded Github Token Successfully",
      });

      this.state.githubOctoGenericLogin();
    } catch (error) {
      await Logger.configureScope({
        githubUsername: "",
      });
      this.setState({ githubLogged: false });
      this.setState({ loggedUser: "" });
      await Logger.BasicLogger({
        message: "Error: loadGithub token",
      });
      console.log(error);
    }
  }

  render() {
    return (
      <Github.Provider value={this.state}>
        {this.props.children}
      </Github.Provider>
    );
  }
}
