// manual ssa request
export const newAllocationRequestComment = (
  address: string,
  amountToRequest: string,
  msigAddress: string,
  requestNumber: string,
  uuid: string
): string => {
  // #### Remaining dataCap\r> ${dataCapRemaining}\r
  return `
  ## DataCap Allocation requested\r\n
  ### Request number ${requestNumber}
  #### Multisig Notary address\r\n> ${msigAddress}\r\n
  #### Client address\r\n> ${address}\r\n
  #### DataCap allocation requested\r\n> ${amountToRequest}\r\n
  #### Id\r\n> ${uuid}`
}
