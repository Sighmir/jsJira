function isNode() {
  return typeof module !== 'undefined' && module.exports
}

class ExtendableProxy {
  constructor(getset={}) {
    return new Proxy(this, getset);
  }
}

class JiraAPI extends ExtendableProxy {
  constructor(url, userOrToken, password) {
    super({
      get: function (japi, func) {
        if (japi[func] != null) return japi[func]
        return function (...params) { return japi.perform(func, ...params) }
      }
    })
    this.url = url
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
    if (userOrToken && password) {
      this.auth = Buffer.from(`${userOrToken}:${password}`).toString('base64')
      this.headers['Authorization'] = 'Basic ' + this.auth
    } else {
      this.auth = userOrToken
      this.headers['Authorization'] = 'Bearer ' + this.auth
    }
  }

  send(method, path, params) {
    var self = this
    return new Promise(function (resolve, reject) {
      var request = false
      if (isNode()) {
        request = require('xmlhttprequest').XMLHttpRequest
      } else {
        request = XMLHttpRequest
      }
      if (request) {
        var http_request = new request()
        http_request.open(method, self.url+path, true)
        for (var h in self.headers) {
          http_request.setRequestHeader(h, self.headers[h])
        }
        http_request.send(JSON.stringify(params))
        http_request.onreadystatechange = function () {
          if (http_request.readyState == 4) {
            if (Number(http_request.status.toString()[0]) == 2) {
              try {
                resolve(JSON.parse(http_request.responseText))
              } catch {
                resolve(http_request.responseText)
              }
            } else {
              try {
                reject(JSON.parse(http_request.responseText))
              } catch {
                reject(http_request.responseText)
              }
            }
          }
        }
      } else {
        reject('There was a problem importing the XMLHttpRequest class.')
      }
    })
  }

  perform(action, ...params) {
    const method = {
      // Application roles
      getApplicationRoles: [`GET`, `/rest/api/3/applicationrole`],
      getApplicationRole: [`GET`, `/rest/api/3/applicationrole/${params[0]}`],
      // Audit records
      getAuditRecords: [`GET`, `/rest/api/3/auditing/record?${this.serialize(params[0])}`],
      // Avatar
      getSystemAvatarsByType: [`GET`, `/rest/api/3/avatar/${params[0]}/system`],
      getAvatars: [`GET`, `/rest/api/3/universal_avatar/type/${params[0]}/owner/${params[1]}`],
      loadAvatar: [`POST`, `/rest/api/3/universal_avatar/type/${params[0]}/owner/${params[1]}?${this.serialize(params[2])}`, params[3]],
      deleteAvatar: [`DELETE`, `/rest/api/3/universal_avatar/type/${params[0]}/owner/${params[1]}/avatar/${params[2]}`],
      // Dashboards
      getDashboards: [`GET`, `/rest/api/3/dashboard?${this.serialize(params[0])}`],
      searchDashboards: [`GET`, `/rest/api/3/dashboard/search?${this.serialize(params[0])}`],
      getDashboardItemPropertyKeys: [`GET`, `/rest/api/3/dashboard/${params[0]}/items/${params[1]}/properties`],
      getDashboardItemProperty: [`GET`, `/rest/api/3/dashboard/${params[0]}/items/${params[1]}/properties/${params[2]}`],
      setDashboardItemProperty: [`PUT`, `/rest/api/3/dashboard/${params[0]}/items/${params[1]}/properties/${params[2]}`, params[3]],
      deleteDashboardItemProperty: [`DELETE`, `/rest/api/3/dashboard/${params[0]}/items/${params[1]}/properties/${params[2]}`],
      getDashboard: [`GET`, `/rest/api/3/dashboard/${params[0]}`],
      // Filters
      getFilters: [`GET`, `/rest/api/3/filter?${this.serialize(params[0])}`],
      createFilter: [`POST`, `/rest/api/3/filter?${this.serialize(params[0])}`, params[1]],
      getFavoriteFilters: [`GET`, `/rest/api/3/filter/favourite?${this.serialize(params[0])}`],
      getMyFilters: [`GET`, `/rest/api/3/filter/my?${this.serialize(params[0])}`],
      searchFilters: [`GET`, `/rest/api/3/filter/search?${this.serialize(params[0])}`],
      getFilter: [`GET`, `/rest/api/3/filter/${params[0]}?${this.serialize(params[1])}`],
      updateFilter: [`PUT`, `/rest/api/3/filter/${params[0]}?${this.serialize(params[1])}`, params[2]],
      deleteFilter: [`DELETE`, `/rest/api/3/filter/${params[0]}`],
      getColumns: [`GET`, `/rest/api/3/filter/${params[0]}/columns`],
      setColumns: [`PUT`, `/rest/api/3/filter/${params[0]}/columns`, params[1]],
      resetColumns: [`DELETE`, `/rest/api/3/filter/${params[0]}/columns`],
      addFavoriteFilter: [`PUT`, `/rest/api/3/filter/${params[0]}/favourite?${this.serialize(params[1])}`],
      removeFavoriteFilter: [`DELETE`, `/rest/api/3/filter/${params[0]}/favourite?${this.serialize(params[1])}`],
      // Filter sharing
      getDefaultShareScope: [`GET`, `/rest/api/3/filter/defaultShareScope`],
      setDefaultShareScope: [`PUT`, `/rest/api/3/filter/defaultShareScope`, params[0]],
      getSharePermissions: [`GET`, `/rest/api/3/filter/${params[0]}/permission`],
      addSharePermissions: [`POST`, `/rest/api/3/filter/${params[0]}/permission`, params[1]],
      getSharePermission: [`GET`, `/rest/api/3/filter/${params[0]}/permission/${params[1]}`],
      deleteSharePermission: [`DELETE`, `/rest/api/3/filter/${params[0]}/permission/${params[1]}`],
      // Group and user picker
      findUsersAndGroups: [`GET`, `/rest/api/3/groupuserpicker?${this.serialize(params[0])}`],
      // Group
      getGroup: [`GET`, `/rest/api/3/group?${this.serialize(params[0])}`],
      createGroup: [`POST`, `/rest/api/3/group`, params[0]],
      deleteGroup: [`DELETE`, `/rest/api/3/group?${this.serialize(params[0])}`],
      getGroupUsers: [`GET`, `/rest/api/3/group/member?${this.serialize(params[0])}`],
      addGroupUser: [`POST`, `/rest/api/3/group/user?${this.serialize(params[0])}`, params[1]],
      removeGroupUser: [`DELETE`, `/rest/api/3/group/user?${this.serialize(params[0])}`],
      findGroups: [`GET`, `/rest/api/3/groups/picker?${this.serialize(params[0])}`],
      // Issues
      createIssue: [`POST`, `/rest/api/3/issue?${this.serialize(params[0])}`, params[1]],
      bulkCreateIssue: [`POST`, `/rest/api/3/issue/bulk`, params[0]],
      getCreateIssueMetadata: [`GET`, `/rest/api/3/issue/createmeta?${this.serialize(params[0])}`],
      getIssue: [`GET`, `/rest/api/3/issue/${params[0]}?${this.serialize(params[1])}`],
      editIssue: [`PUT`, `/rest/api/3/issue/${params[0]}?${this.serialize(params[1])}`, params[2]],
      deleteIssue: [`DELETE`, `/rest/api/3/issue/${params[0]}?${this.serialize(params[1])}`],
      assignIssue: [`PUT`, `/rest/api/3/issue/${params[0]}/assignee`, params[1]],
      getIssueChangeLogs: [`GET`, `/rest/api/3/issue/${params[0]}/changelog?${this.serialize(params[1])}`],
      getEditIssueMetadata: [`GET`, `/rest/api/3/issue/${params[0]}/editmeta?${this.serialize(params[1])}`],
      sendIssueNotification: [`POST`, `/rest/api/3/issue/${params[0]}/notify`, params[1]],
      getTransitions: [`GET`, `/rest/api/3/issue/${params[0]}/transitions?${this.serialize(params[1])}`],
      transitionIssue: [`POST`, `/rest/api/3/issue/${params[0]}/transitions`, params[1]],
      // Issue attachments
      getAttachmentSettings: [`GET`, `/rest/api/3/attachment/meta`],
      getAttachmentMetadata: [`GET`, `/rest/api/3/attachment/${params[0]}`],
      deleteAttachmentMetadata: [`DELETE`, `/rest/api/3/attachment/${params[0]}`],
      getAttachmentMetadataHuman: [`GET`, `/rest/api/3/attachment/${params[0]}/expand/human`],
      getAttachmentMetadataRaw: [`GET`, `/rest/api/3/attachment/${params[0]}/expand/raw`],
      addAttachment: [`POST`, `/rest/api/3/issue/${params[0]}/attachments`, params[1]],
      // Issue comments
      getCommentsById: [`POST`, `/rest/api/3/comment/list?${this.serialize(params[0])}`, params[1]],
      getComments: [`GET`, `/rest/api/3/issue/${params[0]}/comment?${this.serialize(params[1])}`],
      addComment: [`POST`, `/rest/api/3/issue/${params[0]}/comment?${this.serialize(params[1])}`, params[2]],
      getComment: [`GET`, `/rest/api/3/issue/${params[0]}/comment/${params[1]}?${this.serialize(params[2])}`],
      updateComment: [`PUT`, `/rest/api/3/issue/${params[0]}/comment/${params[1]}?${this.serialize(params[2])}`, params[3]],
      deleteComment: [`DELETE`, `/rest/api/3/issue/${params[0]}/comment/${params[1]}`],
      // Issue comment properties
      getCommentPropertyKeys: [`GET`, `/rest/api/3/comment/${params[0]}/properties`],
      getCommentProperty: [`GET`, `/rest/api/3/comment/${params[0]}/properties/${params[1]}`],
      setCommentProperty: [`PUT`, `/rest/api/3/comment/${params[0]}/properties/${params[1]}`, params[2]],
      deleteCommentProperty: [`DELETE`, `/rest/api/3/comment/${params[0]}/properties/${params[1]}`],
      // Issue fields
      getCustomFieldOption: [`GET`, `/rest/api/3/customFieldOption/${params[0]}`],
      getFields: [`GET`, `/rest/api/3/field`],
      createCustomField: [`POST`, `/rest/api/3/field`, params[0]],
      // Issue field options
      getIssueFieldOptions: [`GET`, `/rest/api/3/field/${params[0]}/option?${this.serialize(params[1])}`],
      createIssueFieldOption: [`POST`, `/rest/api/3/field/${params[0]}/option`, params[1]],
      getSelectableIssueFieldOptions: [`GET`, `/rest/api/3/field/${params[0]}/option/suggestions/edit?${this.serialize(params[1])}`],
      getVisibleIssueFieldOptions: [`GET`, `/rest/api/3/field/${params[0]}/option/suggestions/search?${this.serialize(params[1])}`],
      getIssueFieldOption: [`GET`, `/rest/api/3/field/${params[0]}/option/${params[1]}`],
      updateIssueFieldOption: [`PUT`, `/rest/api/3/field/${params[0]}/option/${params[1]}`, params[2]],
      deleteIssueFieldOption: [`DELETE`, `/rest/api/3/field/${params[0]}/option/${params[1]}`],
      replaceIssueFieldOption: [`DELETE`, `/rest/api/3/field/${params[0]}/option/${params[1]}/issue?${this.serialize(params[2])}`],
      // Issue links
      createIssueLink: [`POST`, `/rest/api/3/issueLink`, params[0]],
      getIssueLink: [`GET`, `/rest/api/3/issueLink/${params[0]}`],
      deleteIssueLink: [`DELETE`, `/rest/api/3/issueLink/${params[0]}`],
      // Issue link types
      getIssueLinkTypes: [`GET`, `/rest/api/3/issueLinkType`],
      createIssueLink: [`POST`, `/rest/api/3/issueLinkType`, params[0]],
      getIssueLinkType: [`GET`, `/rest/api/3/issueLinkType/${params[0]}`],
      updateIssueLinkType: [`PUT`, `/rest/api/3/issueLinkType/${params[0]}`, params[1]],
      deleteIssueLinkType: [`DELETE`, `/rest/api/3/issueLinkType/${params[0]}`],
      // Issue navigator settings
      getIssueNavigatorDefaultColumns: [`GET`, `/rest/api/3/settings/columns`],
      setIssueNavigatorDefaultColumns: [`PUT`, `/rest/api/3/settings/columns`, params[0]],
      // Get notification schemes
      getNotificatonSchemes: [`GET`, `/rest/api/3/notificationscheme?${this.serialize(params[0])}`],
      getNotificatonScheme: [`GET`, `/rest/api/3/notificationscheme/${params[0]}?${this.serialize(params[1])}`],
      // Issue priorities
      getPriorities: [`GET`, `/rest/api/3/priority`],
      getPriority: [`GET`, `/rest/api/3/priority/${params[0]}`],
      // Issue properties
      bulkSetIssueProperty: [`PUT`, `/rest/api/3/issue/properties/${params[0]}`, params[1]],
      bulkDeleteIssueProperty: [`DELETE`, `/rest/api/3/issue/properties/${params[0]}`, params[1]],
      getIssuePropertyKeys: [`GET`, `/rest/api/3/issue/${params[0]}/properties`],
      getIssueProperty: [`GET`, `/rest/api/3/issue/${params[0]}/properties/${params[1]}`],
      setIssueProperty: [`PUT`, `/rest/api/3/issue/${params[0]}/properties/${params[1]}`, params[2]],
      deleteIssueProperty: [`DELETE`, `/rest/api/3/issue/${params[0]}/properties/${params[1]}`],
      // Issue remote links
      getRemoteIssueLinks: [`GET`, `/rest/api/3/issue/${params[0]}/remotelink?${this.serialize(params[1])}`],
      setRemoteIssueLinks: [`POST`, `/rest/api/3/issue/${params[0]}/remotelink`, params[1]],
      deleteRemoteIssueLinks: [`DELETE`, `/rest/api/3/issue/${params[0]}/remotelink?${this.serialize(params[1])}`],
      getRemoteIssueLink: [`GET`, `/rest/api/3/issue/${params[0]}/remotelink/${params[1]}`],
      updateRemoteIssueLink: [`PUT`, `/rest/api/3/issue/${params[0]}/remotelink/${params[1]}`, params[2]],
      deleteRemoteIssueLink: [`DELETE`, `/rest/api/3/issue/${params[0]}/remotelink/${params[1]}`],
      // Issue resolutions
      getResolutions: [`GET`, `/rest/api/3/resolution`],
      getResolution: [`GET`, `/rest/api/3/resolution/${params[0]}`],
      // Issue search
      getIssuePickerSuggestions: [`GET`, `/rest/api/3/issue/picker?${this.serialize(params[0])}`],
      checkIssuesAgainstJQL: [`POST`, `/rest/api/3/jql/match`, params[0]],
      searchIssuesUsingJQL: [`GET`, `/rest/api/3/search?${this.serialize(params[0])}`],
      searchForIssuesUsingJQL: [`POST`, `/rest/api/3/search`, params[0]],
      // Issue security level
      getIssueSecurityLevel: [`GET`, `/rest/api/3/securitylevel/${params[0]}`],
      // Issue security schemes
      getIssueSecuritySchemes: [`GET`, `/rest/api/3/issuesecurityschemes`],
      getIssueSecurityScheme: [`GET`, `/rest/api/3/issuesecurityschemes/${params[0]}`],
      // Issue types
      getIssueTypes: [`GET`, `/rest/api/3/issuetype`],
      createIssueTypes: [`POST`, `/rest/api/3/issuetype`, params[0]],
      getIssueType: [`GET`, `/rest/api/3/issuetype/${params[0]}`],
      updateIssueType: [`PUT`, `/rest/api/3/issuetype/${params[0]}`, params[1]],
      deleteIssueType: [`DELETE`, `/rest/api/3/issuetype/${params[0]}?${this.serialize(params[1])}`],
      getAlternativeIssueTypes: [`GET`, `/rest/api/3/issuetype/${params[0]}/alternatives`],
      loadIssueTypeAvatar: [`POST`, `/rest/api/3/issuetype/${params[0]}/avatar2?${this.serialize(params[1])}`, params[2]],
      // Issue type properties
      getIssueTypePropertyKeys: [`GET`, `/rest/api/3/issuetype/${params[0]}/properties`],
      getIssueTypeProperty: [`GET`, `/rest/api/3/issuetype/${params[0]}/properties/${params[1]}`],
      setIssueTypeProperty: [`PUT`, `/rest/api/3/issuetype/${params[0]}/properties/${params[1]}`, params[2]],
      deleteIssueTypeProperty: [`DELETE`, `/rest/api/3/issuetype/${params[0]}/properties/${params[1]}`],
      // Issue votes
      getIssueVotes: [`GET`, `/rest/api/3/issue/${params[0]}/votes`],
      addIssueVotes: [`POST`, `/rest/api/3/issue/${params[0]}/votes`],
      deleteIssueVotes: [`DELETE`, `/rest/api/3/issue/${params[0]}/votes`],
      // Issue watchers
      getIssueWatchers: [`GET`, `/rest/api/3/issue/${params[0]}/watchers`],
      addIssueWatcher: [`POST`, `/rest/api/3/issue/${params[0]}/watchers`, params[1]],
      deleteIssueWatcher: [`DELETE`, `/rest/api/3/issue/${params[0]}/watchers?${this.serialize(params[1])}`],
      // Issue worklogs
      getIssueWorklogs: [`GET`, `/rest/api/3/issue/${params[0]}/worklog?${this.serialize(params[1])}`],
      addIssueWorklog: [`POST`, `/rest/api/3/issue/${params[0]}/worklog?${this.serialize(params[1])}`, params[2]],
      getIssueWorklog: [`GET`, `/rest/api/3/issue/${params[0]}/worklog/${params[1]}?${this.serialize(params[2])}`],
      updateIssueWorklog: [`PUT`, `/rest/api/3/issue/${params[0]}/worklog/${params[1]}?${this.serialize(params[2])}`, params[3]],
      deleteIssueWorklog: [`DELETE`, `/rest/api/3/issue/${params[0]}/worklog/${params[1]}?${this.serialize(params[2])}`],
      getDeletedWorklogs: [`GET`, `/rest/api/3/worklog/deleted?${this.serialize(params[0])}`],
      getWorklogs: [`POST`, `/rest/api/3/worklog/list?${this.serialize(params[0])}`, params[1]],
      getUpdatedWorklogs: [`GET`, `/rest/api/3/worklog/updated?${this.serialize(params[0])}`],
      // Issue worklog properties
      getIssueWorklogPropertyKeys: [`GET`, `/rest/api/3/issue/${params[0]}/worklog/${params[1]}/properties`],
      getIssueWorklogProperty: [`GET`, `/rest/api/3/issue/${params[0]}/worklog/${params[1]}/properties/${params[2]}`],
      setIssueWorklogProperty: [`PUT`, `/rest/api/3/issue/${params[0]}/worklog/${params[1]}/properties/${params[2]}`, params[3]],
      deleteIssueWorklogProperty: [`DELETE`, `/rest/api/3/issue/${params[0]}/worklog/${params[1]}/properties/${params[2]}`],
      // Jira expressions...
    }

    if (method[action] == undefined) {
      console.log('Unknown method.')
      return
    }

    return this.send(...method[action])
  }

  setRequestHeader(header, value) {
    self.headers[header] = value
  }

  serialize(obj) {
    var str = []
    for (var p in obj) {
      if (obj.hasOwnProperty(p)) {
        if (obj[p].constructor.name == 'Array') {
          str.push(encodeURIComponent(p+'[]') + '=' + encodeURIComponent(obj[p]))
        } else {
          str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]))
        }
      }
    }
    return str.join("&")
  }
}

if (isNode()) {
  module.exports = JiraAPI
}