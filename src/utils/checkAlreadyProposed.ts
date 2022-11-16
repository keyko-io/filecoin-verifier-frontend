import { config } from "../../src/config"

export const checkAlreadyProposed = async (issueNumber: number, context: any) => {

    const comments = await context.github.githubOcto.paginate(
        context.github.githubOcto.issues.listComments,
        {
            owner: config.onboardingLargeOwner,
            repo: config.onboardingLargeClientRepo,
            issue_number: issueNumber,
        }
    );

    const rgxProposed = /##\s*request\s*proposed/m
    const rgxApproved = /##\s*request\s*approved/m

    const proposed = comments.filter((comment: any) => rgxProposed.test(comment.body))
    const approved = comments.filter((comment: any) => rgxApproved.test(comment.body))

    console.log('proposed', proposed)
    console.log('approved', approved)

    if (proposed[proposed.length - 1].timestamp > approved[approved.length - 1].timestamp) {
        return true
    }
    return false




    // let proposeIndex;
    // let approveIndex;
    // let datacapAllocation;
    // let alreadyProposed = false;

    // for (let i = comments.length - 1; i >= 0; i--) {
    //     const { body } = comments[i]

    //     if (body.includes("## Request Proposed")) {
    //         proposeIndex = i
    //         break
    //     } else {
    //         proposeIndex = -2
    //     }
    // }

    // for (let i = comments.length - 1; i >= 0; i--) {
    //     const { body } = comments[i]

    //     if (body.includes("## Request Approved")) {
    //         approveIndex = i
    //         break
    //     } else {
    //         approveIndex = -1
    //     }
    // }

    // if (proposeIndex && approveIndex) {
    //     if (proposeIndex > approveIndex) {
    //         alreadyProposed = true
    //     }
    // }

    // for (let i = comments.length - 1; i >= 0; i--) {
    //     const { body } = comments[i]

    //     if (body.includes("## DataCap Allocation requested")) {
    //         datacapAllocation = i
    //         break
    //     }
    // }

    // if (datacapAllocation && proposeIndex) {
    //     if (datacapAllocation > proposeIndex) {
    //         alreadyProposed = false
    //     }
    // }

    // return alreadyProposed
}