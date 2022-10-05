import { config } from "../../src/config"

export const checkAlreadyProposed = async (issueNumber: number, context: any) => {

    const data = await context.github.githubOcto.paginate(
        context.github.githubOcto.issues.listComments,
        {
            owner: config.onboardingLargeOwner,
            repo: config.onboardingLargeClientRepo,
            issue_number: issueNumber,
        }
    );

    let proposeIndex;
    let approveIndex;
    let datacapAllocation;
    let alreadyProposed = false;

    for (let i = data.length - 1; i >= 0; i--) {
        const { body } = data[i]

        if (body.includes("## Request Proposed")) {
            proposeIndex = i
            break
        } else {
            proposeIndex = -2
        }
    }

    for (let i = data.length - 1; i >= 0; i--) {
        const { body } = data[i]

        if (body.includes("## Request Approved")) {
            approveIndex = i
            break
        } else {
            approveIndex = -1
        }
    }

    if (proposeIndex && approveIndex) {
        if (proposeIndex > approveIndex) {
            alreadyProposed = true
        }
    }

    for (let i = data.length - 1; i >= 0; i--) {
        const { body } = data[i]

        if (body.includes("## DataCap Allocation requested")) {
            datacapAllocation = i
            break
        }
    }

    if (datacapAllocation && proposeIndex) {
        if (datacapAllocation > proposeIndex) {
            alreadyProposed = false
        }
    }

    return alreadyProposed
}