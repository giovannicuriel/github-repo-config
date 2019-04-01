import { BranchProtectionRule } from "./github/BranchProtectionRule";
const queries = {
    branchProtectionRules: {
        master: new BranchProtectionRule({
            repositoryId: "",
            pattern: "master",
            requiresApprovingReviews: true,
            requiredApprovingReviewCount: 2,
            dismissesStaleReviews: true,
            requiresCodeOwnerReviews: true,
            restrictsReviewDismissals: true,
            requiresStatusChecks: true,
            requiredStatusCheckContexts: ["continuous-integration/travis-ci", "CodeFactor", "DeepScan"],
            requiresStrictStatusChecks: true,
            isAdminEnforced: true,
        }),
        release: new BranchProtectionRule({
            repositoryId: "",
            pattern: "release/*",
            requiresApprovingReviews: true,
            dismissesStaleReviews: true,
            requiresCodeOwnerReviews: true,
            requiresStatusChecks: true,
            requiredStatusCheckContexts: ["continuous-integration/travis-ci", "CodeFactor", "DeepScan"],
            requiresStrictStatusChecks: true,
            requiredApprovingReviewCount: 1,
        }),
        development: new BranchProtectionRule({
            repositoryId: "",
            pattern: "development",
            requiresApprovingReviews: true,
            dismissesStaleReviews: true,
            requiresCodeOwnerReviews: true,
            requiresStatusChecks: true,
            requiredStatusCheckContexts: ["continuous-integration/travis-ci", "CodeFactor", "DeepScan"],
            requiresStrictStatusChecks: true,
            requiredApprovingReviewCount: 1,
        }),
        feature: new BranchProtectionRule({
            repositoryId: "",
            pattern: "feature/*",
            requiresApprovingReviews: true,
            dismissesStaleReviews: true,
            requiresStatusChecks: true,
        }),
        bugfix: new BranchProtectionRule({
            repositoryId: "",
            pattern: "bugfix/*",
            requiresApprovingReviews: true,
            dismissesStaleReviews: true,
            requiresStatusChecks: true,
        }),
    }
};


export {
    queries,
}