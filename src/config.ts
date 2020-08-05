export const config = {
    apiUri: process.env.REACT_APP_API_URI || 'http://localhost:4000',
    lotusUri: process.env.REACT_APP_LOTUS_URI || 'ws://localhost:1234/rpc/v0',
    lotusToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBbGxvdyI6WyJyZWFkIiwid3JpdGUiLCJzaWduIiwiYWRtaW4iXX0.0VuB8dEF2Z_oZcyrsohYFFJjPthJrN4eG_LpS8IkDBA%',
    keyPath: "m/44'/1'/1/0/",
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