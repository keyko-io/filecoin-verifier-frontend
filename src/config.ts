export const config = {
    apiUri: process.env.REACT_APP_API_URI || 'http://localhost:4000',
    lotusNodes: [{
        name: 'Localhost Testnet',
        code: 1,
        url: 'ws://localhost:1234/rpc/v0',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBbGxvdyI6WyJyZWFkIiwid3JpdGUiLCJzaWduIiwiYWRtaW4iXX0.fK05MnwUrJfB4gdXy49xAPd3BNGVlDL3b1A_LwwtMu8'
    },{
        name: 'Localhost Net',
        code: 461,
        url: 'ws://localhost:1234/rpc/v0',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBbGxvdyI6WyJyZWFkIiwid3JpdGUiLCJzaWduIiwiYWRtaW4iXX0.jfny5mu8ZS3WonSAcqOJBNCDpvOob3Jb-x7yMvPP1T0'
    }],
    datacapExt: [
        { value: "1000", name: "KiloBytes" },
        { value: "1000000", name: "MegaBytes" },
        { value: "1000000000", name: "GigaBytes" },
        { value: "1000000000000", name: "TeraBytes" },
        { value: "1000000000000000", name: "PetaBytes" },
        { value: "1000000000000000000", name: "ExaBytes" },
        { value: "1000000000000000000000", name: "ZettaBytes" },
        { value: "1000000000000000000000000", name: "YottaBytes" }
    ]
}