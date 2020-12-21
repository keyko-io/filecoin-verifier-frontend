import { config } from "../config";

export function selectGitubApp() {
    return window.location.host.includes('fleek') ?
        { app: config.githubAppSecondary, uri: config.oauthUriSecondary } :
        { app: config.githubApp, uri: config.oauthUri }
}