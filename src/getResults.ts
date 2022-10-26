import * as configFile from "./configFile";
import { countMatches, findMatches, Match } from "./match";
import { flatten } from "lodash";
import { Policy } from "./Policy";
import { CurrentWorkingDirectory } from "./CurrentWorkingDirectory";
import { Config } from "./Config";

export interface SuccessOrBreach {
  name: string;
  policy: Policy;
  result: number;
  duration: number;
  examples: Match[];
}

interface ThingWithTick {
  tick: () => void;
}

// export const getPolicyResults = async (name: string, policy: Policy) => {
//   const breaches: SuccessOrBreach[] = [];
//   const successes: SuccessOrBreach[] = [];
//   const policyStart = new Date();
//   const matches = await policy.findMatches();
//   const count = countMatches(matches);
//   const examples = flatten(Object.values(matches));
//   const duration = Date.now() - policyStart.getTime();
//   if (!policy.isCountAcceptable(count)) {
//     breaches.push({
//       name,
//       policy: policy,
//       result: count,
//       duration: Date.now() - policyStart.getTime(),
//       examples,
//     });
//   } else {
//     successes.push({
//       name,
//       policy: policy,
//       result: count,
//       examples,
//       duration: Date.now() - policyStart.getTime(),
//     });
//   }
//   return {
//     breaches,
//     successes,
//     results: {
//       duration,
//       measurement: count,
//     },
//   };
// };

export type ResultMap = { [key: string]: { duration: number, measurement: number } };

export const getResults = async (currentWorkingDirectory: CurrentWorkingDirectory, conf: Config, ticker: ThingWithTick) => {
  const policies = conf.policyMap;
  const results: ResultMap = {};
  const breaches: Array<SuccessOrBreach[]> = [];
  const successes: Array<SuccessOrBreach[]> = [];

  const patternsToMatch = new Set<string>()
  const policyList = Object.values(policies)
  policyList.forEach(policy => patternsToMatch.add(policy.filePattern))

  const filesMatchingAnyPattern = await currentWorkingDirectory.allNonGitIgnoredFilesMatchingPatterns(Array.from(patternsToMatch))

  console.log(filesMatchingAnyPattern)

  // This is a plain old for loop in order to take advantage of
  // glob caching.  If you change this to a Promise.all() to parallelize,
  // the cache won't work anymore, and it will be much slower.
  // for (const name of Object.keys(policies)) {
  //   ticker.tick();
  //   const policy = policies[name];
  //   const policyResults = await getPolicyResults(name, policy);
  //   breaches.push(policyResults.breaches);
  //   successes.push(policyResults.successes);
  //   results[name] = policyResults.results;
  //   ticker.tick();
  // }
  return {
    results,
    successes: flatten(successes),
    breaches: flatten(breaches)
  };
};
