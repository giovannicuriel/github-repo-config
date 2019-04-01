import { default as axios, AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { queries } from "./GithubQueries";
import { Operation } from "./github/BranchProtectionRule";
import * as util from "util";

interface IGraphQLNode<T> {
    node: T;
}

interface IGraphQLList<T> {
    totalCount: number;
    edges: IGraphQLNode<T>[];
}

interface IBranchProtectionRule {
    id: string;
    pattern: string;
    requiresApprovingReviews: boolean;
    dismissesStaleReviews: boolean;
    requiresStatusChecks: boolean;
    isAdminEnforced: boolean;
    requiredStatusCheckContexts: string[];
    requiresStrictStatusChecks: boolean;
    requiredApprovingReviewCount: number;
    restrictsReviewDismissals: boolean;
}
interface IRepository {
    name: string;
    id: string;
    branchProtectionRules: IGraphQLList<IBranchProtectionRule>;
}

const BRANCHES = JSON.parse(process.argv[2]);
console.log(`BRANCHES: ${BRANCHES}`);
console.log(`arguments: ${process.argv}`);

const config: AxiosRequestConfig = {
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`
    }
}

async function removeBranchProtectionRules(protectionRules: string[]) {
    const promises: Promise<AxiosResponse>[] = [];
    for (const protectionRule of protectionRules) {
    const mutationQuery = { "query" : `mutation DeleteBranchProt {
        deleteBranchProtectionRule(input:{
          branchProtectionRuleId: "${protectionRule}"
        }) {
          clientMutationId
        }
      }`};
      promises.push(axios.post("https://api.github.com/graphql", mutationQuery, config));
    }
    return Promise.all(promises);
}


function createBranchProtectionRule(repositoryId: string, branch: string): Promise<AxiosResponse> {

    if (queries.branchProtectionRules.hasOwnProperty(branch)) {
        (queries.branchProtectionRules as any)[branch].repositoryId = repositoryId;
        const protectionQuery = queries.branchProtectionRules.master.render(Operation.CREATE, `${branch}Protection`);
        // if (BRANCHES.includes(branch)) {
            console.log(`Adding '${branch}' branch protection rule`);
            console.log(`Protection rule: ${util.inspect(protectionQuery)}`);
            return axios.post("https://api.github.com/graphql", protectionQuery, config);
        // }
    }
    return Promise.reject(`branch ${branch} is not registered`);
}


function createDefaultBranchProtectionRules(repositoryId: string) : Promise<AxiosResponse>[] {
    return [
        createBranchProtectionRule(repositoryId, "master"),
        createBranchProtectionRule(repositoryId, "release"),
        createBranchProtectionRule(repositoryId, "development"),
        createBranchProtectionRule(repositoryId, "feature"),
        createBranchProtectionRule(repositoryId, "bugfix"),
    ];
}


async function readBranchProtectionRules() {
    const data = {
        "query": `query
        {
            viewer {
                name
                organization(login: "dojot") {
                    repositories(first: 70) {
                        totalCount
                        edges {
                            cursor
                            node {
                                name
                                id
                                branchProtectionRules(first: 10) {
                                    totalCount
                                    edges {
                                        node {
                                            id
                                            pattern
                                            requiresApprovingReviews
                                            dismissesStaleReviews
                                            requiresStatusChecks
                                            isAdminEnforced
                                            requiredStatusCheckContexts
                                            requiresStrictStatusChecks
                                            requiredApprovingReviewCount
                                            restrictsReviewDismissals
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }`
    };
    return axios.post("https://api.github.com/graphql", data, config).then((response: AxiosResponse) => {
        const branchProtectionRuleIds: string[] = [];
        const repositories: IGraphQLList<IRepository> = response.data.data.viewer.organization.repositories;

        for (const repository of repositories.edges) {
            console.log(`Repository: ${repository.node.name}`);
            console.log(`Patterns:`);
            for (const pattern of repository.node.branchProtectionRules.edges) {
                console.log(`>>>> ${util.inspect(pattern.node.pattern)}`);
                // branchProtectionRuleIds.push(`${repository.node.name}: ${pattern.node.pattern}`);
                branchProtectionRuleIds.push(pattern.node.id);
            }
        }
        return branchProtectionRuleIds;
    });
}


async function readRepositories() {
    const data = {
        "query": `query
        {
            viewer {
                name
                organization(login: "dojot") {
                    repositories(first: 70) {
                        totalCount
                        edges {
                            cursor
                            node {
                                name
                                id
                            }
                        }
                    }
                }
            }
        }`
    };
    return axios.post("https://api.github.com/graphql", data, config).then((response: AxiosResponse) => {
        const repositoryIds: string[] = [];
        const repositories: IGraphQLList<IRepository> = response.data.data.viewer.organization.repositories;

        // I think that this might have some optimizations.
        for (const repository of repositories.edges) {
            repositoryIds.push(repository.node.id);
        }

        return repositoryIds;
    });
}


function main() {
    console.log(`${BRANCHES.length}`);
    if (BRANCHES.length === 0) {
        console.log("Removing all branch protection rules");
        readBranchProtectionRules()
        .then((branchProtectionRules: string[]) => {
            console.log(`Currently configured branch protection rules: ${util.inspect(branchProtectionRules)}`);
            console.log(`Removing all branch protection rules...`);
            return removeBranchProtectionRules(branchProtectionRules);
        }).then(() => {
            console.log("All branch protection rules were removed")
        }).catch((error: any) => {
            console.log(`Error while cleaning branch protection rules: ${error}`);
        });
    } else {
        console.log("Creating branch protection rules");
        readRepositories()
        .then((repositoryIds: string[]) => {
            let promises: Promise<AxiosResponse>[] = [];
            for (const repository of repositoryIds) {
                console.log(`Creating branch protection rules for repository ${repository}`);
                promises = promises.concat(createDefaultBranchProtectionRules(repository));
            }
            return Promise.all(promises);
        })
        .then(() => {
            console.log(`All branch protection rules were created.`);
        })
        .catch((error: AxiosError) => {
            console.log(`Could not perform request: ${error}`);
        });
    }
};


main();
