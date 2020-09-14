export const config = {
    apiUri: process.env.REACT_APP_API_URI || 'http://localhost:4000',
    lotusNodes: [{
        name: 'Remote Testnet',
        code: 1,
        url: 'wss://beta-verify.filecoin.io/api/rpc/v0',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBbGxvdyI6WyJyZWFkIiwid3JpdGUiXX0.niP0Kugzl3DJiM2sHY7gDRcWBSmr3B1AyVie2Coc67E'
    },{
        name: 'Remote Net',
        code: 461,
        url: 'wss://beta-verify.filecoin.io/api/rpc/v0',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBbGxvdyI6WyJyZWFkIiwid3JpdGUiXX0.niP0Kugzl3DJiM2sHY7gDRcWBSmr3B1AyVie2Coc67E'
    },{
        name: 'Localhost Testnet',
        code: 1,
        url: 'ws://localhost:1234/rpc/v0',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBbGxvdyI6WyJyZWFkIiwid3JpdGUiLCJzaWduIiwiYWRtaW4iXX0.X7m_35dTJ_jH9xmPXuNfulGsRn69z1tUlCo1-9JnDNU'
    },{
        name: 'Localhost Net',
        code: 461,
        url: 'ws://localhost:1234/rpc/v0',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBbGxvdyI6WyJyZWFkIiwid3JpdGUiLCJzaWduIiwiYWRtaW4iXX0.X7m_35dTJ_jH9xmPXuNfulGsRn69z1tUlCo1-9JnDNU'
    }],
    datacapExt: [
        { value: "1000", name: "KiB" },
        { value: "1000000", name: "MiB" },
        { value: "1000000000", name: "GiB" },
        { value: "1000000000000", name: "TiB" },
        { value: "1000000000000000", name: "PiB" },
        { value: "1000000000000000000", name: "EiB" },
        { value: "1000000000000000000000", name: "ZiB" },
        { value: "1000000000000000000000000", name: "YiB" }
    ]
}