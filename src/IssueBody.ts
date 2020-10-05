export const IssueBody = function (data:any) {
return `
##  Datacap Request Information

Please complete the following information:

### Organization Name

>${data.organization}

Please replace \`Protocol Labs\` with your Organization or personal name

### Address

>${data.address}

Please replace \`t0231874218\` with your Filecoin address

### Datacap Requested

>${data.datacap}

Please, use the (GB, TB, HB, ..) format.

## Additional Information

Is there any other information you can provide?

### Public Profile of Organization

Some description or link to the public profile of the organization

### Intended Use Case / Allocation Plan

Please, include some information about the main usage you want to make of the datacap.

### Contact Information

How can we contact with you?

### Comments

Do you have any additional comment?


## Disclaimer

Be aware that the information you are submitting will be publicly available for all Filecoin community and it could be used to oversight and trace the verify flows.

###### _Note: If you are not familiar with markdown language, use the Preview tab to make sure the form is properly filled._
`
}