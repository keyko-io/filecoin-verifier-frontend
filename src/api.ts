import { config } from "./config"

const LDNOwnerAndRepo = {
    owner: config.onboardingOwner,
    repo: config.onboardingLargeClientRepo
}

// Return all the comments for one issue
export const getAllComments = async (github: any, issue_number: number) => {
    try {
        return await github.githubOcto.paginate(
            github.githubOcto.issues.listComments,
            {
                ...LDNOwnerAndRepo,
                issue_number
            })

    } catch (error) {
        console.log(error, "coming from api.ts => getAllComments()")
    }
}

// Return one issue data 
export const getIssueByNumber = async (github: any, issue_number: number) => {
    try {
        return await github.githubOcto.issues.get({
            ...LDNOwnerAndRepo,
            issue_number
        })
    } catch (error) {
        console.log(error, "coming from api.ts => getIssueByNumber()")
    }
}