import {ldnParser} from "@keyko-io/filecoin-verifier-tools";


export const createParentComment = (coreInfo: any) => {
    return `---
name: Large Dataset Notary application
about: Clients should use this application form to request a DataCap allocation via a LDN for a dataset
title: "[DataCap Application] - ${coreInfo.title}"
labels: 'application, Phase: Diligence'
assignees: ''

---
# Large Dataset Notary Application

To apply for DataCap to onboard your dataset to Filecoin, please fill out the following.

## Core Information
- Organization Name: ${coreInfo.name}
- Website / Social Media: ${coreInfo.website} 
- Region: ${coreInfo.region}
- Total amount of DataCap being requested (between 500 TiB and 5 PiB): ${coreInfo.datacapRequested}
- Weekly allocation of DataCap requested (usually between 1-100TiB): ${coreInfo.dataCapWeeklyAllocation}
- On-chain address for first allocation: ${coreInfo.address}

_Please respond to the questions below by replacing the text saying "Please answer here". Include as much detail as you can in your answer._

## Project details

Share a brief history of your project and organization.
\`\`\`
Please answer here.
\`\`\`

What is the primary source of funding for this project?
\`\`\`
Please answer here.
\`\`\`

What other projects/ecosystem stakeholders is this project associated with?
\`\`\`
Please answer here.
\`\`\`

## Use-case details

Describe the data being stored onto Filecoin
\`\`\`
Please answer here.
\`\`\`

Where was the data in this dataset sourced from?
\`\`\`
Please answer here.
\`\`\`

Can you share a sample of the data? A link to a file, an image, a table, etc., are good ways to do this. 
\`\`\`
Please answer here.
\`\`\`
        
Confirm that this is a public dataset that can be retrieved by anyone on the Network (i.e., no specific permissions or access rights are required to view the data).
\`\`\`
Please answer here.
\`\`\`

What is the expected retrieval frequency for this data?
\`\`\`
Please answer here.
\`\`\`

For how long do you plan to keep this dataset stored on Filecoin?
\`\`\`
Please answer here.
\`\`\`


## DataCap allocation plan

In which geographies (countries, regions) do you plan on making storage deals?
\`\`\`
Please answer here.
\`\`\`

How will you be distributing your data to storage providers? Is there an offline data transfer process?
\`\`\`
Please answer here.
\`\`\`

How do you plan on choosing the storage providers with whom you will be making deals? This should include a plan to ensure the data is retrievable in the future both by you and others.
\`\`\`
Please answer here.
\`\`\`

How will you be distributing deals across storage providers?
\`\`\`
Please answer here.
\`\`\`

Do you have the resources/funding to start making deals as soon as you receive DataCap? What support from the community would help you onboard onto Filecoin?
\`\`\`
Please answer here.
\`\`\`
`

}

export const updateTemplate = (issueBody: any, otherInfo: any, coreInfo: any) => { //add coreInfo to use only this template

    return `---
name: Large Dataset Notary application
about: Clients should use this application form to request a DataCap allocation via a LDN for a dataset
title: "${coreInfo.title ? coreInfo.title : ldnParser.parseIssue(issueBody).title}"
labels: 'application, Phase: Diligence'
assignees: ''

---
# Large Dataset Notary Application

To apply for DataCap to onboard your dataset to Filecoin, please fill out the following.

## Core Information
- Organization Name: ${coreInfo.name ? coreInfo.name : ldnParser.parseIssue(issueBody).name}
- Website / Social Media: ${coreInfo.website ? coreInfo.website : ldnParser.parseIssue(issueBody).website}
- Total amount of DataCap being requested (between 500 TiB and 5 PiB): ${coreInfo.datacapRequested ? coreInfo.datacapRequested : ldnParser.parseIssue(issueBody).datacapRequested}
- Weekly allocation of DataCap requested (usually between 1-100TiB): ${coreInfo.dataCapWeeklyAllocation ? coreInfo.dataCapWeeklyAllocation : ldnParser.parseIssue(issueBody).dataCapWeeklyAllocation}
- On-chain address for first allocation: ${coreInfo.address ? coreInfo.address : ldnParser.parseIssue(issueBody).address}
- Region: ${coreInfo.region ? coreInfo.region : ldnParser.parseIssue(issueBody).region}

_Please respond to the questions below by replacing the text saying "Please answer here". Include as much detail as you can in your answer._

## Project details

Share a brief history of your project and organization.
\`\`\`
${otherInfo.detailsHistory ? otherInfo.detailsHistory : ldnParser.parseOtherInfoIssue(issueBody).detailsHistory}
\`\`\`

What is the primary source of funding for this project?
\`\`\`
${otherInfo.detailsSrcFunding ? otherInfo.detailsSrcFunding : ldnParser.parseOtherInfoIssue(issueBody).detailsSrcFunding}
\`\`\`

What other projects/ecosystem stakeholders is this project associated with?
\`\`\`
${otherInfo.detailsSrcOtherProjects ? otherInfo.detailsSrcOtherProjects : ldnParser.parseOtherInfoIssue(issueBody).detailsSrcOtherProjects}
\`\`\`

## Use-case details

Describe the data being stored onto Filecoin
\`\`\`
${otherInfo.useCaseDescribeData ? otherInfo.useCaseDescribeData : ldnParser.parseOtherInfoIssue(issueBody).useCaseDescribeData}
\`\`\`

Where was the data in this dataset sourced from?
\`\`\`
${otherInfo.useCaseWhereDataIsStored ? otherInfo.useCaseWhereDataIsStored : ldnParser.parseOtherInfoIssue(issueBody).useCaseWhereDataIsStored}
\`\`\`

Can you share a sample of the data? A link to a file, an image, a table, etc., are good ways to do this. 
\`\`\`
${otherInfo.useCaseDataSample ? otherInfo.useCaseDataSample : ldnParser.parseOtherInfoIssue(issueBody).useCaseDataSample}
\`\`\`
        
Confirm that this is a public dataset that can be retrieved by anyone on the Network (i.e., no specific permissions or access rights are required to view the data).
\`\`\`
${otherInfo.useCaseIsPublicDataSet ? otherInfo.useCaseIsPublicDataSet : ldnParser.parseOtherInfoIssue(issueBody).useCaseIsPublicDataSet}
\`\`\`

What is the expected retrieval frequency for this data?
\`\`\`
${otherInfo.useCaseExpectedRetrievalFrequency ? otherInfo.useCaseExpectedRetrievalFrequency : ldnParser.parseOtherInfoIssue(issueBody).useCaseExpectedRetrievalFrequency}
\`\`\`

For how long do you plan to keep this dataset stored on Filecoin?
\`\`\`
${otherInfo.useCaseHowLongStoredInFilecoin ? otherInfo.useCaseHowLongStoredInFilecoin : ldnParser.parseOtherInfoIssue(issueBody).useCaseHowLongStoredInFilecoin}
\`\`\`


## DataCap allocation plan

In which geographies (countries, regions) do you plan on making storage deals?
\`\`\`
${otherInfo.dataCapAllocationPlanRegion ? otherInfo.dataCapAllocationPlanRegion : ldnParser.parseOtherInfoIssue(issueBody).dataCapAllocationPlanRegion}
\`\`\`

How will you be distributing your data to storage providers? Is there an offline data transfer process?
\`\`\`
${otherInfo.dataCapAllocationPlanDistribute ? otherInfo.dataCapAllocationPlanDistribute : ldnParser.parseOtherInfoIssue(issueBody).dataCapAllocationPlanDistribute}
\`\`\`

How do you plan on choosing the storage providers with whom you will be making deals? This should include a plan to ensure the data is retrievable in the future both by you and others.
\`\`\`
${otherInfo.dataCapAllocationPlanChooseSp ? otherInfo.dataCapAllocationPlanChooseSp : ldnParser.parseOtherInfoIssue(issueBody).dataCapAllocationPlanChooseSp}
\`\`\`

How will you be distributing deals across storage providers?
\`\`\`
${otherInfo.dataCapAllocationPlanDeals ? otherInfo.dataCapAllocationPlanDeals : ldnParser.parseOtherInfoIssue(issueBody).dataCapAllocationPlanDeals}
\`\`\`

Do you have the resources/funding to start making deals as soon as you receive DataCap? What support from the community would help you onboard onto Filecoin?
\`\`\`
${otherInfo.dataCapAllocationPlanHasResources ? otherInfo.dataCapAllocationPlanHasResources : ldnParser.parseOtherInfoIssue(issueBody).dataCapAllocationPlanHasResources}
\`\`\`
`


}