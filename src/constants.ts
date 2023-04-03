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
    MIGRATION_TASK: "Migration Task",
    MIGRATION_COMPLETED: "Migration Completed",
    BOT_REVIEW_NEEDED: "Bot: Review Needed",
    BOT_READY_TO_SIGN: "Bot: Ready To Sign",
    BOT_RECONNECTED_ISSUE: "Bot: Reconnected Issue",
    BOT_LOOKING_GOOD: "Bot: Looking Good",
    STATUS_VERIFYING: "State: Verifying",
    STATUS_ADDED_ON_CHAIN: "State: Added On Chain",
    STATUS_APPROVED: "State: Approved",
    STATUS_START_SIGN_DATACAP: "State: Start Sign Datacap",
    STATUS_ERROR: "State: Error",
    STATUS_VALIDATED: "State: Validated",
    STATUS_GRANTED: "State: Granted",
    STATUS_DATA_CAP_ALLOCATED: "State: Datacap Allocated",
    STATUS_PREVIOUSLY_APPROVED: "State: Previously Approved",
    STATUS_NEED_DILIGENCE: "State: Need Diligence",
    STATUS_FURTHER_INFO_NEEDED: "State: Further info needed",
    WARN_CHECK_TRANSACTION: "Warn: Check Transaction",
    APPLICATION_ADDRESS_NOT_VALID: "State: Address Not Valid",
    EFIL_PLUS: "Efil+",
    APPLICATION_COMPLETED: "Application: Completed",
}
