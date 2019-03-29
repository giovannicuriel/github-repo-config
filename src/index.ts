import { default as axios, AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
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

// interface IBranchProtectionMapping {
//     [repositoryId: string]: string[];
// };

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


function createDefaultBranchProtectionRules(repositoryId: string): Promise<AxiosResponse>[] {
    const promises: Promise<AxiosResponse>[] = [];
    const masterQuery = { "query" : `mutation CreateBranchProt {
        createBranchProtectionRule(input:{
            repositoryId: "${repositoryId}",
            pattern: "master",
            requiresApprovingReviews: true,
            requiredApprovingReviewCount: 2,
            dismissesStaleReviews: true,
            requiresCodeOwnerReviews: true,
            restrictsReviewDismissals: true
            requiresStatusChecks: true,
            requiredStatusCheckContexts: [ "continuous-integration/travis-ci", "CodeFactor", "DeepScan" ],
            requiresStrictStatusChecks: true,
            isAdminEnforced: true,
        }) {
          clientMutationId
        }
    }`};
    const releaseQuery = { "query" : `mutation CreateBranchProt {
        createBranchProtectionRule(input:{
            repositoryId: "${repositoryId}",
            pattern: "release/*",
            requiresApprovingReviews: true,
            dismissesStaleReviews: true,
            requiresCodeOwnerReviews: true,
            requiresStatusChecks: true,
            requiredStatusCheckContexts: [ "continuous-integration/travis-ci", "CodeFactor", "DeepScan" ],
            requiresStrictStatusChecks: true,
            requiredApprovingReviewCount: 1,
        }) {
            clientMutationId
        }
    }`};
    const developmentQuery = { "query" : `mutation CreateBranchProt {
        createBranchProtectionRule(input:{
            repositoryId: "${repositoryId}",
            pattern: "development",
            requiresApprovingReviews: true,
            dismissesStaleReviews: true,
            requiresCodeOwnerReviews: true,
            requiresStatusChecks: true,
            requiredStatusCheckContexts: [ "continuous-integration/travis-ci", "CodeFactor", "DeepScan" ],
            requiresStrictStatusChecks: true,
            requiredApprovingReviewCount: 1,
        }) {
            clientMutationId
        }
    }`};
    const featureQuery = { "query" : `mutation CreateBranchProt {
        createBranchProtectionRule(input:{
            repositoryId: "${repositoryId}",
            pattern: "feature/*",
            requiresApprovingReviews: true,
            dismissesStaleReviews: true,
            requiresStatusChecks: true,
        }) {
            clientMutationId
        }
    }`};

    const bugfixQuery = { "query" : `mutation CreateBranchProt {
        createBranchProtectionRule(input:{
            repositoryId: "${repositoryId}",
            pattern: "bugfix/*",
            requiresApprovingReviews: true,
            dismissesStaleReviews: true,
            requiresStatusChecks: true,
        }) {
            clientMutationId
        }
    }`};

    console.log(`${1 in BRANCHES}`);
    console.log(`${util.inspect(BRANCHES)}`);

    if (BRANCHES.includes("master")) {
        console.log("Adding 'master' branch protection rule");
        promises.push(axios.post("https://api.github.com/graphql", masterQuery, config));
    }
    if (BRANCHES.includes("feature")) {
        console.log("Adding 'feature' branch protection rule");
        promises.push(axios.post("https://api.github.com/graphql", featureQuery, config));
    }
    if (BRANCHES.includes("development")) {
        console.log("Adding 'development' branch protection rule");
        promises.push(axios.post("https://api.github.com/graphql", developmentQuery, config));
    }
    if (BRANCHES.includes("release")) {
        console.log("Adding 'release' branch protection rule");
        promises.push(axios.post("https://api.github.com/graphql", releaseQuery, config));
    }
    if (BRANCHES.includes("bugfix")) {
        console.log("Adding 'bugfix' branch protection rule");
        promises.push(axios.post("https://api.github.com/graphql", bugfixQuery, config));
    }
    return promises;
}



async function readBranchProtectionRules() {
    const data = {
        "query": `query
        {
            viewer {
                name
                organization(login: "dojot") {
                    repositories(first: 65) {
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
                    repositories(first: 10) {
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
            console.log(`Currently configured branch protection rules: ${branchProtectionRules}`);
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
