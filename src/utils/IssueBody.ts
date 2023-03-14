export const IssueBody = function (data: any, user: string) {
    return `
---

# Client Allocation Questions 

## Core Information
- Name: ${data.organization}
- Website / Social Media: ${data.publicprofile}
- Region: ${data.region}
- DataCap Requested: ${data.datacap}
- Addresses to be Notarized: ${data.address}
- Notary Requested: ${data.assignees}

${data.docs_url ? `Please make sure to check out the guidelines and criteria to accept Datacap request for [${data.notary_name}](${data.docs_url})` : ''}

@${user} Please subscribe to notifications for this Issue to be aware of updates. Notaries may request additional information on the Issue.
`
}

export const IssueVerifierBody = function (data: any) {
    return `
##  Notary Request Information

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

>${data.publicprofile}

### Contact Information

How can we contact with you?

>${data.contact}

### Comments

Do you have any additional comment?

>${data.comments}

## Disclaimer

Be aware that the information you are submitting will be publicly available for all Filecoin community and it could be used to oversight and trace the verify flows.

###### _Note: If you are not familiar with markdown language, use the Preview tab to make sure the form is properly filled._
`
}