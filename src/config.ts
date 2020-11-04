export const config = {
    apiUri: process.env.REACT_APP_API_URI || 'http://localhost:4000',
    apiToken: process.env.REACT_APP_API_TOKEN || '',
    verifiers: process.env.REACT_APP_VERIFIERS || 'DEV',
    onboardingClientRepo: process.env.REACT_ONBOARDING_REPO ||'filecoin-clients-onboarding-test',
    githubApp: process.env.REACT_GITHUB_APP || 'Iv1.10e7aaed4654db3c',
    lotusNodes: [{
        name: 'Mainnet',
        code: 461,
        url: 'https://api.node.glif.io',
        token: process.env.REACT_APP_MAINNET_TOKEN,
        clientRepo: 'filecoin-clients-onboarding',
        notaryRepo: 'filecoin-notaries-onboarding'
    },{
        name: 'Nerpanet',
        code: 1,
        url: 'https://beta-verify.filecoin.io/api/rpc/v0',
        token: process.env.REACT_APP_NERPANET_TOKEN,
        clientRepo: 'filecoin-clients-onboarding-test',
        notaryRepo: 'filecoin-notaries-onboarding'
    }/*,{
        name: 'Localhost',
        code: 1,
        url: 'ws://localhost:1234/rpc/v0',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBbGxvdyI6WyJyZWFkIiwid3JpdGUiLCJzaWduIiwiYWRtaW4iXX0.OJlFIgYG3D23RjWWXfjdTluG6Qx2EOgwMeWQxnUQrMM'
        clientRepo: 'filecoin-clients-onboarding-test',
        notaryRepo: 'filecoin-notaries-onboarding',
    }*/],
    datacapExt: [
        { value: "1", name: "B" },
        { value: "1000", name: "KiB" },
        { value: "1000000", name: "MiB" },
        { value: "1000000000", name: "GiB" },
        { value: "1000000000000", name: "TiB" },
        { value: "1000000000000000", name: "PiB" },
        { value: "1000000000000000000", name: "EiB" },
        { value: "1000000000000000000000", name: "ZiB" },
        { value: "1000000000000000000000000", name: "YiB" }
    ],
    datacapExtName: [
        { value: "1B", name: "B" },
        { value: "KiB", name: "KiB" },
        { value: "MiB", name: "MiB" },
        { value: "GiB", name: "GiB" },
        { value: "TiB", name: "TiB" },
        { value: "PiB", name: "PiB" },
        { value: "EiB", name: "EiB" },
        { value: "ZiB", name: "ZiB" },
        { value: "YiB", name: "YiB" }
    ],
    dataSource: process.env.REACT_APP_VERIFIES_DATA || 'verifiers-dev',
}