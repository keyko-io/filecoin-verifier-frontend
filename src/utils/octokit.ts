import { config } from "../config";

const owner = config.onboardingOwner;

export async function getFileFromRepo({
    path,
    ctx,
}: {
    path: string;
    ctx: any;
}): Promise<any> {
    try {
        const response = await ctx.github.githubOcto.repos.getContent(
            {
                owner,
                repo: "filecoin-content",
                path,
            }
        );
        const fileContent = Buffer.from(
            response?.data?.content,
            "base64"
        ).toString();
        const jsonFileContent = JSON.parse(fileContent);
        return jsonFileContent;
    } catch (error) {
        console.log("error", error);
        return {};
    }
}
