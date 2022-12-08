import { config } from "./config"

const LDNOwnerAndRepo = {
    owner: config.onboardingOwner,
    repo: config.onboardingLargeClientRepo
}

// I think we can use this api calls in the application , 
// we are using this calls many place in the app, we can replace them with this ones. 
// so it can be more clean. 
// Also if we want to change something , we can change it only here one times.
// i think we can improve and extends the parameters and it become more useful.

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