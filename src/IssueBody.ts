export const IssueBody = function (data:any) {
return `
---

# Client Allocation Questions 
For Clients, please note that your responses (past the Core Information section) are entirely optional. However, without answering in detail your total approved DataCap may be limited. 
## Core Information
- Name: ${data.organization}
- Website / Social Media: ${data.publicprofile}
- DataCap Requested: ${data.datacap}
- Addresses to be Notarized: ${data.address}


-----------------------------
## Reputation
_Please respond to the questions below in paragraph form, replacing the text saying "Please answer here". Include as much detail as you can in your answer!_

**Please describe the nature of your organization, project, or use case. For organizations, please include your relationship with the organization the size of the organization, and time since inception. For projects and other use cases, please link to relevant web pages or Github. Please include as much relevant detail to provide contextual information (with external links).**
\`\`\`
Please answer here.
\`\`\`



**Have you been approved for a DataCap previously? If so, can you share the details of the last allocation decision (who approved your DataCap, what your plan was for spending it, how you executed on that plan)?
\`\`\`
Please answer here.
\`\`\`


## Allocation Strategy
**Do you intend to store your data in a single geography or many?**
\`\`\`
Please answer here.
\`\`\`

**Are you aware of and do you intend to use the features you may specify (e.g. Fast Retrieval) with your storage deals?**
\`\`\`
Please answer here.
\`\`\`
**How do you plan on securing the DataCap to ensure your organization (and its delegated members) are the ones allocating the DataCap?**
\`\`\`
Please answer here.
\`\`\`

**Do you plan on allocating a substantial portion of your DataCap to a single miner, or will you spread it across many miners?**
\`\`\`
Please answer here.
\`\`\`

**For application developers, will you be acting as the client on behalf of your users or you applying as a Notary on behalf of your users? If so, how much DataCap per user are you seeking to have approved?**
\`\`\`
Please answer here.
\`\`\`

**Do you agree to use the DataCap to only store data that abides by local regulations and in compliance with the recipient miner’s terms of service?**
\`\`\`
Please answer here.
\`\`\`


## Track Record
**Have you previously received DataCap to allocate before? If so, please link to any previous decisions that have been made.**
\`\`\`
Please answer here.
\`\`\`

**Are there any disputes open against you from your previous DataCap allocations?**
\`\`\`
Please answer here.
\`\`\`

**Have you ever previously violated:**
- **Your own attested allocation / audit plan?**
- **Been found to be in violation of the Principles of Filecoin Plus?**
\`\`\`
Please answer here.
\`\`\`

`
}

export const IssueVerifierBody = function (data:any) {
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