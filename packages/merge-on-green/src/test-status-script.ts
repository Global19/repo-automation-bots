/**
 * Copyright 2020 Google LLC. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const { App } = require("@octokit/app");
const Octokit = require("@octokit/rest");
const dotenv = require("dotenv")
// contains the installation id necessary to authenticate as an installation



const oktokit = Octokit({
    auth: process.env.SECRET_TOKEN,
    userAgent: 'sofisl',
    log: {
        debug: () => {},
        info: () => {},
        warn: console.warn,
        error: console.error
      },
    
      request: {
        agent: undefined,
        fetch: undefined,
        timeout: 0
      }
    })

// type Element = {
//     conclusion: string; 
//     name: string; 
//     status: string;
// }

async function getLatestCommit() {
    const data = await oktokit.checks.get({
        owner: 'sofisl', //this will be filled in by context of payload, i.e., context.payload.repository.owner.login
        repo: 'mergeOnGreenTest', //this will be filled in by context of payload, i.e., context.payload.repository.name
        check_run_id: '396210100' //what we're listening for
    })

    //console.log(data);

    // console.log("commit num: "+data.data.head_sha);
            return data.data.head_sha;
}

async function getPR() {
    const data = await oktokit.checks.get({
        owner: 'sofisl', //this will be filled in by context of payload, i.e., context.payload.repository.owner.login
        repo: 'mergeOnGreenTest', //this will be filled in by context of payload, i.e., context.payload.repository.name
        check_run_id: '396210100' //what we're listening for
    })

            return data.data.pull_requests[0].number;
}



async function checkRuns() {
          const head_sha = await getLatestCommit();
          const data = await oktokit.checks.listForRef({
              owner: 'sofisl',
              repo: 'mergeOnGreenTest',
              ref: head_sha
            });
           const check_runs = data.data.check_runs;
           //console.log(check_runs);
           return check_runs;
        }

async function checkStatusOfCheckRuns() {    
        const check_runs_array = await checkRuns();
        //create a branch that checks back if any status is not completed
        if (check_runs_array) {
            check_runs_array.forEach(element => {
                //console.log(element)
                if(element.conclusion != 'success') {
                    console.log(element.name+' failed their test');
                }
                if(element.status != 'completed') {
                    console.log(element.name+' has not completed');
                    //check back in some way
                 }   
            })
        }

    }   


    async function getMOGLabel() {    
        let isMOG = false;
        const pr = await getPR();
        const labels = await oktokit.issues.listLabelsOnIssue({
            owner: 'sofisl',
            repo: 'mergeOnGreenTest',
            issue_number: pr
        })
        const labelArray = labels.data;
        if (labelArray) {
        labelArray.forEach(element => {
            if(element.name === 'merge-on-green ready') {
                isMOG = true;
            } else {
                isMOG = false;
            }
        })
        }
        console.log(isMOG);
        return isMOG;
    }  

    getMOGLabel();

    //checkStatusOfCheckRuns();

//TODO: make sure we check for merge-on-green label before passing the test
//TODO: Write logic to check back if tests are not completed
//TODO: Check for required code reviews
//DECIDE: do we want to listen to PRs or check runs?
//TODO: console log 'would have merged' based on pass of status check