export const config = {
    apiUri: process.env.REACT_APP_API_URI || 'http://localhost:4000',
    apiToken: process.env.REACT_APP_API_TOKEN || '',
    onboardingClientRepo: process.env.REACT_APP_ONBOARDING_REPO || 'filecoin-clients-onboarding-test',
    onboardingOwner: process.env.REACT_APP_ONBOARDING_REPO_OWNER || 'keyko-io',
    onboardingLargeClientRepo: process.env.REACT_APP_ONBOARDING_LARGE_REPO || 'filecoin-large-clients-onboarding',
    onboardingLargeOwner: process.env.REACT_APP_ONBOARDING_LARGE_REPO_OWNER || 'keyko-io',
    githubApp: process.env.REACT_APP_GITHUB_APP || 'Iv1.10e7aaed4654db3c',
    oauthUri: process.env.REACT_APP_OAUTH_URI || 'https://plus.fil.org/oauth/',
    networks: process.env.REACT_APP_NETWORKS || 'Mainnet,Nerpanet',
    domain: process.env.REACT_APP_DOMAIN || "https://plus.fil.org/",
    githubGenericToken: process.env.REACT_APP_GITHUB_GENERIC_TOKEN,
    minersUrl: 'https://raw.githubusercontent.com/keyko-io/filecoin-large-clients-onboarding/main/miners.md?token=ALGRNDNBIJTYVRMJ4N64ZRDA73SB6',
    defaultAssign: ['philippbanhardt'],
    validateAddress: process.env.REACT_APP_VALIDATE_ADDRESS || true,
    approvalsThreshold: process.env.REACT_APP_APPROVALS_THRESHOLD || 2,
    largeClientRequest: 5497558000000000000000000,
    lotusNodes: [{
        name: 'Mainnet',
        code: 461,
        url: 'https://node.glif.io/space06/lotus/rpc/v0',
        token: process.env.REACT_APP_MAINNET_TOKEN,
        notaryRepo: 'notary-governance',
        notaryOwner: 'filecoin-project',
        rkhMultisig: 'f080',
        rkhtreshold: 2,
        largeClientRequestAssign: ['philippbanhardt'],
    }, {
        name: 'Nerpanet',
        code: 1,
        url: 'https://beta-verify.filecoin.io/api/rpc/v0',
        token: process.env.REACT_APP_NERPANET_TOKEN,
        notaryRepo: 'filecoin-notaries-onboarding',
        notaryOwner: 'keyko-io',
        rkhMultisig: 't080',
        rkhtreshold: 1,
        largeClientRequestAssign: ['jernejpregelj', 'ialberquilla'],
    }, {
        name: 'Localhost',
        code: 1,
        url: 'ws://localhost:1234/rpc/v0',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBbGxvdyI6WyJyZWFkIiwid3JpdGUiLCJzaWduIiwiYWRtaW4iXX0.OJlFIgYG3D23RjWWXfjdTluG6Qx2EOgwMeWQxnUQrMM',
        notaryRepo: 'filecoin-notaries-onboarding',
        notaryOwner: 'keyko-io',
        rkhMultisig: 't080',
        rkhtreshold: 2,
        largeClientRequestAssign: ['jernejpregelj', 'ialberquilla'],
    }],
    datacapExt: [
        { value: "1", name: "B" },
        { value: "1024", name: "KiB" },
        { value: "1048576", name: "MiB" },
        { value: "1073741824", name: "GiB" },
        { value: "1099511627776", name: "TiB" },
        { value: "1125899906842624", name: "PiB" },
        { value: "1152921504606847000", name: "EiB" },
        { value: "1180591620717411303424", name: "ZiB" },
        { value: "1208925819614629174706151275", name: "YiB" }
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
    datacapExtOptions: [
        { value: "B", name: "B" },
        { value: "KiB", name: "KiB" },
        { value: "MiB", name: "MiB" },
        { value: "GiB", name: "GiB" },
        { value: "TiB", name: "TiB" },
        { value: "PiB", name: "PiB" },
        { value: "EiB", name: "EiB" },
        { value: "ZiB", name: "ZiB" },
        { value: "YiB", name: "YiB" }
    ],
    regions: [
        { value: "Africa", name: "Africa" },
        { value: "Asia excl. Greater China", name: "Asia excl. Greater China" },
        { value: "Europe", name: "Europe" },
        { value: "Greater China", name: "Greater China" },
        { value: "North America", name: "North America" },
        { value: "Oceania", name: "Oceania" },
        { value: "South America", name: "South America" }

    ],
    dataSource: process.env.REACT_APP_VERIFIES_DATA || 'verifiers'
}