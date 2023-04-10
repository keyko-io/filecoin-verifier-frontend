
export const constructNewStatusComment = (
    status: string,
    reason: string,
    freeText: string
): string => {
    return `Status: ${STATUS_LABELS[status]} 
    Reason: ${reason}
    ${freeText}
    `;
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
    NOTARY_APPLICATION: "Notary: Application",
    WAITING_FOR_ClIENT: "Waiting For Client Reply",
    APPLICATION_WIP_ISSUE: "Application: WIP Issue",
};

export const NOTARY_DECLINE_REASONS = [
    "Conflict of interest",
    "Not in my expertise or domain",
    "Outside my regional jurisdiction",
    "Requested amount does not match dataset",
    "Client deal-making behavior does not match stated allocation strategy",
    "Client did not provide information about the Storage Providers they are working with",
    "Fil+ data distribution noncompliance (Incorrect SPs that client stated that they would work with in their application)",
    "False information that was provided from application",
    "Other reason",
];

export const NOTARY_LDN_STATE_CONTROL = [
    "Accept",
    "Decline",
    "Request More Information",
];

export const STATUS_LABELS: any = {
    "Accept": ["One Notary Approved"],
    "Decline": ["Notary Declined"],
    "Request More Information": [ISSUE_LABELS.WAITING_FOR_ClIENT],
};

