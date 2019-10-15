# jsJira #

**jsJira** is a Javascript module for working with the [Jira REST API v3](https://developer.atlassian.com/cloud/jira/platform/rest/v3/).

## Requirements
* Tested against Jira REST API v3
* For Node.js you will need the [xmlhttprequest](https://www.npmjs.com/package/xmlhttprequest) library.

## Documentation ##
### Getting Started

If you are using Node.js, install jsJira using npm:

```bash
$ npm install @sighmir/jsjira
```

You can now require and use jsjira like so:

```js
let JiraAPI = require('@sighmir/jsjira')

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
```

Refer to the [Jira API Documentation](https://developer.atlassian.com/cloud/jira/platform/rest/v3/) and the [jsJira Example](https://github.com/Sighmir/jsJira/tree/master/example) for more information.  

### Browser

You can also load this script on your browser like so:

```html
<script src='https://cdn.jsdelivr.net/npm/@sighmir/jsjira/jsJira.js'></script>
```

You can now use the class JiraAPI normally on the page, like you would on Node.js.

## License ##
```
jsJira - Jira API Javascript Library.
Copyright (C) 2019  Guilherme Caulada (Sighmir)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
```
