export enum EVENT_TYPE {
    CREATE_APPLICATION = "create_application",
    MULTISIG_CREATION = "multisig_creation",
    MULTISIG_APPROVED= "multisig_approved",
    FIRST_DC_REQUEST = "first_datacap_request",
    DC_ALLOCATION = "datacap_allocation",
    SUBSEQUENT_DC_REQUEST = "subsequent_datacap_request",
}

/**
 * @amount amount of dc requested / allocated
 * @requestNumber number of request for ssa allocation
 * @approvers who approved the last request
 */
export type MetricsApiParams = {
    name: string,
    clientAddress: string,
    msigAddress?: string,
    amount?: string,
    requestNumber?: string | number
    messageCid?: string
}