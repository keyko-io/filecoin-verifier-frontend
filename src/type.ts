// we use this data for the accepted notaries table in RKH view
export type ApprovedVerifiers = {
    datacap: string,
    verifier: string,
}

export type VerifiedData = ApprovedVerifiers & { verifierAccount: string }

export type VerifiedCachedData = {
    [key: number]: VerifiedData[]
}