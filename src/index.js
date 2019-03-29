"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var util = __importStar(require("util"));
var GITHUB_TOKEN = process.env.GITHUB_TOKEN;
function main() {
    var config = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + GITHUB_TOKEN
        }
    };
    var data = {
        "query": "query \
        { \
            viewer { \
              organization(login: 'dojot') { \
                repositories(first: 61) { \
                  totalCount \
                  edges { \
                    cursor \
                    node { \
                      name \
                      branchProtectionRules(first: 10) { \
                        totalCount \
                        edges{ \
                          node { \
                            pattern \
                          } \
                        } \
                      } \
                    } \
                  } \
                } \
              } \
            } \
          }\
        "
    };
    axios_1.default.post("https://api.github.com/graphql", data, config).then(function (response) {
        console.log("Response: " + util.inspect(response));
    }).catch(function (error) {
        console.log("Error while requesting Github API: " + util.inspect(error));
    });
}
;
main();
