let JiraAPI = require('..') //jsjira

const JIRA_URL = process.env.JIRA_URL
const JIRA_LOGIN = process.env.JIRA_LOGIN
const JIRA_TOKEN = process.env.JIRA_TOKEN

let japi1 = new JiraAPI(JIRA_URL, JIRA_LOGIN, JIRA_TOKEN)
let japi2 = new JiraAPI(JIRA_URL, JIRA_TOKEN)

japi1.getApplicationRoles().then((data) => {
  console.log(data)
}).catch(err => console.log(err))

japi2.getDashboards().then((data) => {
  console.log(data)
}).catch(err => console.log(err))