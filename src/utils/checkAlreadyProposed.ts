import { config } from "../../src/config"
import moment from 'moment'

export const checkAlreadyProposed = async (issueNumber: number, context: any) => {

    const comments = await context.github.githubOcto.paginate(
        context.github.githubOcto.issues.listComments,
        {
            owner: config.onboardingLargeOwner,
            repo: config.onboardingLargeClientRepo,
            issue_number: issueNumber,
        }
    );

    const rgxProposed = /##\s*request\s*proposed/mi
    const rgxApproved = /##\s*request\s*approved/mi
    const regexRequest = /##\s*DataCap\s*Allocation\s*requested/m

    const proposedComms = comments.filter((comment: any) => rgxProposed.test(comment.body))
    const approvedComms = comments.filter((comment: any) => rgxApproved.test(comment.body))
    const requestComms = comments.filter((comment: any) => regexRequest.test(comment.body))
    debugger
    //if there are any poposal --> return false
    if (!proposedComms.length) return false

    const lastProposedDate = proposedComms[proposedComms.length - 1].created_at
    const lastProposedTimestamp = parseInt(moment(lastProposedDate).format("X"))
    const lastRequestedDate = requestComms[requestComms.length - 1].created_at
    const lastRequestedTimestamp = parseInt(moment(lastRequestedDate).format("X"))

    if (lastRequestedTimestamp > lastProposedTimestamp) {
        return false
    }

    let lastApprovedDate
    let lastApprovedTimestamp
    if (!approvedComms.length) {
        lastApprovedTimestamp = 0
    } else {
        lastApprovedDate = approvedComms[approvedComms.length - 1].created_at
        lastApprovedTimestamp = parseInt(moment(lastApprovedDate).format("X"))
    }


    //if proposed comment is more recent than approved comment
    // and proposed comment is more recent than the request comment
    //it means that the last comment is the proposed comment --> return true
    if (lastProposedTimestamp > lastApprovedTimestamp && lastProposedTimestamp > lastRequestedTimestamp) {
        return true
    }

    return false

}