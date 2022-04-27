import { config } from "../../config"
export const coreInfo = [
  { name: 'title', description: 'Github Issue Title', value: '', error: false, errorMessage: 'Field is Required', type: 'string' },
  { name: 'name', description: 'Organization Name', value: '', error: false, errorMessage: 'Field is Required', type: 'string' },
  { name: 'region', description: 'Region', value: '', error: false, errorMessage: 'Field is Required', type: 'string' },
  { name: 'website', description: 'Website / Social Media', value: '', error: false, errorMessage: 'Field is Required', type: 'string' },
  { name: 'datacapRequested', description: 'Total amount of DataCap being requested (between 500 TiB and 5 PiB)', value: '', measure: '', type: 'number', error: false, errorMessage: 'Needs a numerical value' },
  { name: 'dataCapWeeklyAllocation', description: 'Weekly allocation of DataCap requested (usually between 1-100TiB)', value: '', measure: '', type: 'number', error: false, errorMessage: 'Needs a numerical value' },
  { name: 'address', description: 'On-chain address for first allocation', value: '', error: false, errorMessage: 'Field is Required', type: 'string' },
]

export const otherInfo = [
  { name: 'detailsHistory', description: 'Share a brief history of your project and organization.', category: 'project details', value: '', step: 0 },
  { name: 'detailsSrcFunding', description: 'What is the primary source of funding for this project?', category: 'project details', value: '', step: 0 },
  { name: 'detailsSrcOtherProjects', description: 'What other projects/ecosystem stakeholders is this project associated with?', category: 'project details', value: '', step: 0 },

  { name: 'useCaseDescribeData', description: 'Describe the data being stored onto Filecoin', category: 'use-case details', value: '', step: 1 },
  { name: 'useCaseWhereDataIsStored', description: 'Where was the data in this dataset sourced from?', category: 'use-case details', value: '', step: 1 },
  { name: 'useCaseDataSample', description: 'Can you share a sample of the data? A link to a file, an image, a table, etc., are good ways to do this.', category: 'use-case details', value: '', step: 1 },
  { name: 'useCaseIsPublicDataSet', description: 'Confirm that this is a public dataset that can be retrieved by anyone on the Network (i.e., no specific permissions or access rights are required to view the data).', category: 'use-case details', value: '', step: 1 },
  { name: 'useCaseExpectedRetrievalFrequency', description: 'What is the expected retrieval frequency for this data?', category: 'use-case details', value: '', step: 1 },
  { name: 'useCaseHowLongStoredInFilecoin', description: 'For how long do you plan to keep this dataset stored on Filecoin?', category: 'use-case details', value: '', step: 1 },

  { name: 'dataCapAllocationPlanRegion', description: 'In which geographies (countries, regions) do you plan on making storage deals?', category: 'DataCap allocation plan', value: '', step: 2 },
  { name: 'dataCapAllocationPlanDistribute', description: 'How will you be distributing your data to storage providers? Is there an offline data transfer process?', category: 'DataCap allocation plan', value: '', step: 2 },
  { name: 'dataCapAllocationPlanChooseSp', description: 'How do you plan on choosing the storage providers with whom you will be making deals? This should include a plan to ensure the data is retrievable in the future both by you and others.', category: 'DataCap allocation plan', value: '', step: 2 },
  { name: 'dataCapAllocationPlanDeals', description: 'How will you be distributing deals across storage providers?', category: 'DataCap allocation plan', value: '', step: 2 },
  { name: 'dataCapAllocationPlanHasResources', description: 'Do you have the resources/funding to start making deals as soon as you receive DataCap? What support from the community would help you onboard onto Filecoin?', category: 'DataCap allocation plan', value: '', step: 2 },
]

export const guidelines = [
  { view: 0, title: 'Apply as a large Client.', description: 'Sign-in With GitHub to Start.', className: 'welcome0' },
  { view: 1, title: 'It looks like you started an application before.', description: 'Select the issue you want to continue editing or create a new issue.', className: 'welcome1' },
  { view: 2, title: 'Fill Up The Form', description: 'You will be able to ', className: 'welcome2' },
  { view: 3, title: 'Fill out the following form.', description: 'Step 1 of 4. This part is required for an application to be created on GitHub on your behalf. The rest of the form can be filled out here or directly on the Issue in GitHub.', className: 'welcome3' },
  { view: 3, title: '', description: '', className: 'welcome4' },
  {
    view: 5, title: 'Success!', description: `You have successfully kicked off a large datasets notary DataCap application.
  You can view and edit your application here.`, className: 'welcome4', link: `https://github.com/${config.onboardingOwner}/${config.onboardingLargeClientRepo}/issues`
  },
]

export const regionOptions = [
  'Africa',
  'Asia excl. Japan',
  'Asia excl. GCN',
  'Asia excl. Greater China',
  'Asia, Japan',
  'Europe',
  'Greater China',
  'North America',
  'Oceania',
  'South America',
]

export enum labelsIssueCreation {
  WIP_ISSUE = 'Application:WIPissue',
  ISSUE_COMPLETED = 'Application:completed',
}

export const steps = ['Main Info', 'Project Details', 'Use-Case Details', 'DataCap Allocation Plan']

export const URL_README = `https://github.com/${config.onboardingOwner}/${config.onboardingLargeClientRepo}/blob/main/README.md`