enum Operation {
    CREATE,
    READ,
    UPDATE,
    DELETE
}
class BranchProtectionRule {
    public repositoryId: string;
    public pattern: string;
    public requiresApprovingReviews?: boolean;
    public requiredApprovingReviewCount?: number;
    public dismissesStaleReviews?: boolean;
    public requiresCodeOwnerReviews?: boolean;
    public restrictsReviewDismissals?: boolean;
    public requiresStatusChecks?: boolean;
    public requiredStatusCheckContexts?: string [];
    public requiresStrictStatusChecks?: boolean;
    public isAdminEnforced?: boolean;

    constructor(orig?: any) {
        // Copy only those explicit defined in this classs

        if (!orig) {
            this.repositoryId = "";
            this.pattern = "";
            this.requiresApprovingReviews = false;
            this.requiredApprovingReviewCount = 0;
            this.dismissesStaleReviews = false;
            this.requiresCodeOwnerReviews = false;
            this.restrictsReviewDismissals = false;
            this.requiresStatusChecks = false;
            this.requiredStatusCheckContexts = [];
            this.requiresStrictStatusChecks = false;
            this.isAdminEnforced = false;
        } else {
            if (orig.hasOwnProperty("repositoryId")) {
                this.repositoryId = orig.repositoryId;
            } else {
                this.repositoryId = "";
            }
            if (orig.hasOwnProperty("pattern")) {
                this.pattern = orig.pattern;
            } else {
                this.pattern = "";
            }
            if (orig.hasOwnProperty("requiresApprovingReviews")) {
                this.requiresApprovingReviews = orig.requiresApprovingReviews;
            }
            if (orig.hasOwnProperty("requiredApprovingReviewCount")) {
                this.requiredApprovingReviewCount = orig.requiredApprovingReviewCount;
            }
            if (orig.hasOwnProperty("dismissesStaleReviews")) {
                this.dismissesStaleReviews = orig.dismissesStaleReviews;
            }
            if (orig.hasOwnProperty("requiresCodeOwnerReviews")) {
                this.requiresCodeOwnerReviews = orig.requiresCodeOwnerReviews;
            }
            if (orig.hasOwnProperty("restrictsReviewDismissals")) {
                this.restrictsReviewDismissals = orig.restrictsReviewDismissals;
            }
            if (orig.hasOwnProperty("requiresStatusChecks")) {
                this.requiresStatusChecks = orig.requiresStatusChecks;
            }
            if (orig.hasOwnProperty("requiredStatusCheckContexts")) {
                this.requiredStatusCheckContexts = orig.requiredStatusCheckContexts;
            }
            if (orig.hasOwnProperty("requiresStrictStatusChecks")) {
                this.requiresStrictStatusChecks = orig.requiresStrictStatusChecks;
            }
            if (orig.hasOwnProperty("isAdminEnforced")) {
                this.isAdminEnforced = orig.isAdminEnforced;
            }
        }
    }

    public render(operation: Operation, fnName: string): any {
        switch (operation) {
            case Operation.CREATE:
                let ret = `mutation ${fnName} { createBranchProtectionRule(input:{`;
                let tempData: any = {};
                for (const attr in this) {
                    if (this.hasOwnProperty(attr) && (this[attr])) {
                        tempData[attr] = this[attr];
                    }
                }
                ret += JSON.stringify(tempData);
                ret = ret.slice(0, -1); // removing last comma.
                ret += `} ) { clientMutationId } }`
                return ret;
                break;
            case Operation.DELETE:
                return "";
                break;
            default:
                console.log(`Unknown operation: ${operation}`);
        }
    }
}

export {
    BranchProtectionRule,
    Operation
}