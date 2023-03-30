export enum LARGE_REQUEST_STATUS {
    WAITING_FOR_CLIENT_REPLY = "WAITING_FOR_CLIENT_REPLY",
    NEEDS_NOTARY_REVIEW = "NEEDS_NOTARY_REVIEW",
    ONE_NOTARY_REVIEWED = "ONE_NOTARY_REVIEWED",
    ONE_NOTARY_APPROVED = "ONE_NOTARY_APPROVED",
    ONE_NOTARY_DECLINED = "ONE_NOTARY_DECLINED",
}

export const STATUS_LABELS: any = {
    WAITING_FOR_CLIENT_REPLY: ["Waiting for client reply"],
};

export const constructNewStatusComment = (status: string): string => {
    return `Status: ${STATUS_LABELS[status]}`;
};

export const ISSUE_LABELS = {
    BOT_REVIEW_NEEDED: "bot:reviewNeeded",
    BOT_READY_TO_SIGN: "bot:readyToSign",
    BOT_RECONNECTED_ISSUE: "bot:reconnectedIssue",
    BOT_LOOKING_GOOD: "bot:lookingGood",
    STATUS_VERIFYING: "status:Verifying",
    STATUS_ADDED_ON_CHAIN: "status:AddedOnchain",
    STATUS_APPROVED: "status:Approved",
    STATUS_START_SIGN_DATACAP: "status:StartSignDatacap",
    STATUS_ERROR: "status:Error",
    STATUS_VALIDATED: "status:Validated",
    STATUS_GRANTED: "status:Granted",
    STATUS_DATA_CAP_ALLOCATED: "status:DataCapAllocated",
    STATUS_PREVIOUSLY_APPROVED: "state:previouslyApproved",
    STATUS_NEED_DILIGENCE: "status:needDiligence",
    STATUS_FURTHER_INFO_NEEDED: "status:Further info needed",
    WARN_CHECK_TRANSACTION: "warn:checkTransaction",
    APPLICATION_ADDRESS_NOT_VALID: "Application:AddressNotValid",
    APPLICATION_WIP_ISSUE: "Application:WIPissue",
    NOTARY_APPLICATION: "Notary Application",
    EFIL_PLUS: "Efil+",
}
