import { ldnParser } from "@keyko-io/filecoin-verifier-tools"
import { config } from "../config"

export const preventDoublePropose = async (
  context: any,
  issueNumber: number
) => {
  const comments = await context.github.githubOcto.paginate(
    context.github.githubOcto.issues.listComments,
    {
      owner: config.onboardingLargeOwner,
      repo: config.onboardingLargeClientRepo,
      issue_number: issueNumber,
    }
  )

  const lastDcRequest = comments.filter((c: any) => ldnParser.parseReleaseRequest(c.body).correct)?.reverse()[0]
  const lastProposal = comments.filter((c: any) => ldnParser.parseApprovedRequestWithSignerAddress(c.body).correct && c.body.startsWith("## Request Proposed")
  )?.reverse()[0]

  // compare date of last dc req with date of last proposal
  // if last dc request is more recent than last proposal return false
  if (!lastProposal || !lastDcRequest) return false

  if (new Date(lastDcRequest.created_at).getTime() > new Date(lastProposal.created_at).getTime()) {
    return false
  }

  return true
}
