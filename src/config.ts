
const datacapExt = [
    { value: "1", name: "B" },
    { value: "1024", name: "KiB" },
    { value: "1048576", name: "MiB" },
    { value: "1073741824", name: "GiB" },
    { value: "1099511627776", name: "TiB" },
    { value: "1125899906842624", name: "PiB" },
    { value: "1152921504606847000", name: "EiB" },
    { value: "1180591620717411303424", name: "ZiB" },
    { value: "1208925819614629174706151275", name: "YiB" }
]
const datacapExtName = [
    { value: "1B", name: "B" },
    { value: "KiB", name: "KiB" },
    { value: "MiB", name: "MiB" },
    { value: "GiB", name: "GiB" },
    { value: "TiB", name: "TiB" },
    { value: "PiB", name: "PiB" },
    { value: "EiB", name: "EiB" },
    { value: "ZiB", name: "ZiB" },
    { value: "YiB", name: "YiB" }
]
const datacapExtOptions = [
    { value: "B", name: "B" },
    { value: "KiB", name: "KiB" },
    { value: "MiB", name: "MiB" },
    { value: "GiB", name: "GiB" },
    { value: "TiB", name: "TiB" },
    { value: "PiB", name: "PiB" },
    { value: "EiB", name: "EiB" },
    { value: "ZiB", name: "ZiB" },
    { value: "YiB", name: "YiB" }
]
const regions = [
    { value: "Africa", name: "Africa" },
    { value: "Asia excl. Greater China", name: "Asia excl. Greater China" },
    { value: "Europe", name: "Europe" },
    { value: "Greater China", name: "Greater China" },
    { value: "North America", name: "North America" },
    { value: "Oceania", name: "Oceania" },
    { value: "South America", name: "South America" }

]

const localConfig = {
    apiUri: process.env.REACT_APP_API_URI || 'http://localhost:4000',
    apiToken: process.env.REACT_APP_API_TOKEN || '',
    onboardingClientRepo: 'filecoin-clients-onboarding',
    onboardingOwner: 'keyko-io',
    onboardingLargeClientRepo: 'filecoin-large-clients-onboarding',
    onboardingLargeOwner: 'keyko-io',
    onboardingNotaryOwner: 'filecoin-notaries-onboarding',
    githubApp: process.env.REACT_APP_GITHUB_APP || 'Iv1.10e7aaed4654db3c',
    oauthUri: process.env.REACT_APP_OAUTH_URI || 'http://localhost:3000/oauth/',
    networks: 'Localhost',
    domain: process.env.REACT_APP_DOMAIN || "https://plus.fil.org/",
    githubGenericToken: process.env.REACT_APP_GITHUB_GENERIC_TOKEN,
    minersUrl: 'https://raw.githubusercontent.com/filecoin-project/filecoin-plus-client-onboarding/main/miners.md',
    defaultAssign: ['fabriziogianni7', 'huseyincansoylu'],
    willRedirect: false,
    validateAddress: process.env.REACT_APP_VALIDATE_ADDRESS || true,
    approvalsThreshold: process.env.REACT_APP_APPROVALS_THRESHOLD || '1',
    largeClientRequest: 5497558000000000000000000,
    metrics_api_environment: process.env.REACT_APP_METRICS_API_ENVIRONMENT || "test",
    loggerApiKey: process.env.REACT_APP_X_API_KEY || '',
    secretRecieverAddress: 't0100',
    lotusNodes: [{
        name: 'Localhost',
        code: 1,
        url: 'wss://lotus.filecoin.nevermined.rocks/rpc/v0',
        token: process.env.REACT_APP_LOCAL_NODE_TOKEN,
        notaryRepo: 'filecoin-notaries-onboarding',
        notaryOwner: 'keyko-io',
        rkhMultisig: 't080',
        rkhtreshold: 1,
        largeClientRequestAssign: ['fabriziogianni7', 'huseyincansoylu'],
    }],
    datacapExt,
    datacapExtName,
    datacapExtOptions,
    regions,
    dev_mode: process.env.REACT_APP_MODE,
    status_issue_number: 1419,
    status_issue_url: "https://github.com/keyko-io/filecoin-large-clients-onboarding/issues/1419",
    verifiers_registry_url: "https://raw.githubusercontent.com/keyko-io/filecoin-content/main/json/test/verifiers-registry_test.json",
    numberOfWalletAccounts : 20
}

const prodConfig = {
    apiUri: process.env.REACT_APP_API_URI || 'http://localhost:4000',
    apiToken: process.env.REACT_APP_API_TOKEN || '',
    onboardingClientRepo: 'filecoin-plus-client-onboarding',
    onboardingOwner: 'filecoin-project',
    onboardingLargeClientRepo: 'filecoin-plus-large-datasets',
    onboardingLargeOwner: 'filecoin-project',
    onboardingNotaryOwner: 'notary-governance',
    githubApp: process.env.REACT_APP_GITHUB_APP || 'Iv1.1490209508f9ed93',
    oauthUri: process.env.REACT_APP_OAUTH_URI || 'http://localhost:3000/oauth/',
    networks: 'Mainnet',
    domain: process.env.REACT_APP_DOMAIN || "https://plus.fil.org/",
    githubGenericToken: process.env.REACT_APP_GITHUB_GENERIC_TOKEN,
    minersUrl: 'https://raw.githubusercontent.com/filecoin-project/filecoin-plus-client-onboarding/main/miners.md',
    defaultAssign: ["galen-mcandrew"],
    willRedirect: false,
    validateAddress: process.env.REACT_APP_VALIDATE_ADDRESS || true,
    approvalsThreshold: process.env.REACT_APP_APPROVALS_THRESHOLD || '1',
    largeClientRequest: 5497558000000000000000000,
    metrics_api_environment: process.env.REACT_APP_METRICS_API_ENVIRONMENT || "test",
    loggerApiKey: process.env.REACT_APP_X_API_KEY || '',
    secretRecieverAddress: process.env.REACT_APP_SECRET_RECIEVER_ADDRESS,
    lotusNodes: [{
        name: 'Mainnet',
        code: 461,
        url: 'https://node.glif.io/space06/lotus/rpc/v1',
        token: process.env.REACT_APP_MAINNET_TOKEN,
        notaryRepo: 'notary-governance',
        notaryOwner: 'filecoin-project',
        rkhMultisig: 'f080',
        rkhtreshold: 2,
        largeClientRequestAssign: ['galen-mcandrew'],
    }],
    datacapExt,
    datacapExtName,
    datacapExtOptions,
    regions,
    dev_mode: process.env.REACT_APP_MODE,
    status_issue_number: 1427,
    status_issue_url: "https://github.com/filecoin-project/filecoin-plus-large-datasets/issues/1427",
    verifiers_registry_url : "https://raw.githubusercontent.com/keyko-io/filecoin-content/main/json/prod/verifiers-registry.json",
    numberOfWalletAccounts : 20
}

export const config =
    process.env.REACT_APP_NETWORKS !== 'Mainnet' ? localConfig : prodConfig


