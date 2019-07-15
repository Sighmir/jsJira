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
      // Jira expressions
      evaluateJiraExpression: [`POST`, `/rest/api/3/expression/eval?${this.serialize(params[0])}`, params[1]],
      // Jira settings
      getApplicationProperty: [`GET`, `/rest/api/3/application-properties?${this.serialize(params[0])}`],
      getAdvancedSettings: [`GET`, `/rest/api/3/application-properties/advanced-settings`],
      setApplicationProperty: [`PUT`, `/rest/api/3/application-properties/${params[0]}`, params[1]],
      getGlobalSettings: [`GET`, `/rest/api/3/configuration`],
      // JQL
      getFieldReferenceData: [`GET`, `/rest/api/3/jql/autocompletedata`],
      getFieldAutoCompleteSuggestions: [`GET`, `/rest/api/3/jql/autocompletedata/suggestions?${this.serialize(params[0])}`],
      convertUserIdentityToAccountId: [`POST`, `/rest/api/3/jql/pdcleaner`, params[0]],
      // Myself
      getPreference: [`GET`, `/rest/api/3/mypreferences?${this.serialize(params[0])}`],
      setPreference: [`PUT`, `/rest/api/3/mypreferences?${this.serialize(params[0])}`, params[1]],
      deletePreference: [`DELETE`, `/rest/api/3/mypreferences?${this.serialize(params[0])}`],
      getLocale: [`GET`, `/rest/api/3/mypreferences/locale`],
      setLocale: [`PUT`, `/rest/api/3/mypreferences/locale`, params[0]],
      deleteLocale: [`DELETE`, `/rest/api/3/mypreferences/locale`],
      getCurrentUser: [`GET`, `/rest/api/3/myself?${this.serialize(params[0])}`],
      // Permissions
      getMyPermissions: [`GET`, `/rest/api/3/mypermissions?${this.serialize(params[0])}`],
      getAllPermissions: [`GET`, `/rest/api/3/permissions`],
      getBulkPermissions: [`POST`, `/rest/api/3/permissions/check`, params[0]],
      getPermittedProjects: [`POST`, `/rest/api/3/permissions/project`, params[0]],
      // Permission schemes
      getAllPermissionSchemes: [`GET`, `/rest/api/3/permissionscheme?${this.serialize(params[0])}`],
      createPermissionScheme: [`POST`, `/rest/api/3/permissionscheme?${this.serialize(params[0])}`, params[1]],
      getPermissionScheme: [`GET`, `/rest/api/3/permissionscheme/${params[0]}?${this.serialize(params[1])}`],
      updatePermissionScheme: [`PUT`, `/rest/api/3/permissionscheme/${params[0]}?${this.serialize(params[1])}`, params[2]],
      deletePermissionScheme: [`DELETE`, `/rest/api/3/permissionscheme/${params[0]}`],
      getPermissionSchemeGrants: [`GET`, `/rest/api/3/permissionscheme/${params[0]}/permission?${this.serialize(params[1])}`],
      createPermissionGrant: [`POST`, `/rest/api/3/permissionscheme/${params[0]}/permission?${this.serialize(params[1])}`, params[2]],
      getPermissionSchemeGrant: [`GET`, `/rest/api/3/permissionscheme/${params[0]}/permission/${params[1]}?${this.serialize(params[2])}`],
      deletePermissionSchemeGrant: [`DELETE`, `/rest/api/3/permissionscheme/${params[0]}/permission/${params[1]}`],
      // Projects
      getAllProjects: [`GET`, `/rest/api/3/project?${this.serialize(params[0])}`],
      createProject: [`POST`, `/rest/api/3/project`, params[0]],
      getProjects: [`GET`, `/rest/api/3/project/search?${this.serialize(params[0])}`],
      getProject: [`GET`, `/rest/api/3/project/${params[0]}?${this.serialize(params[1])}`],
      updateProject: [`PUT`, `/rest/api/3/project/${params[0]}?${this.serialize(params[1])}`, params[2]],
      deleteProject: [`DELETE`, `/rest/api/3/project/${params[0]}`],
      getProjectStatuses: [`GET`, `/rest/api/3/project/${params[0]}/statuses`],
      updateProjectType: [`PUT`, `/rest/api/3/project/${params[0]}/type/${params[1]}`],
      getProjectNotificationScheme: [`GET`, `/rest/api/3/project/${params[0]}/notificationscheme?${this.serialize(params[1])}`],
      // Project avatars
      setProjectAvatar: [`PUT`, `/rest/api/3/project/${params[0]}/avatar`, params[1]],
      deleteProjectAvatar: [`DELETE`, `/rest/api/3/project/${params[0]}/avatar/${params[1]}`],
      loadProjectAvatar: [`POST`, `/rest/api/3/project/${params[0]}/avatar2?${this.serialize(params[1])}`],
      getAllProjectAvatars: [`PUT`, `/rest/api/3/project/${params[0]}/avatars`],
      // Project categories
      getAllProjectCategories: [`GET`, `/rest/api/3/projectCategory?${this.serialize(params[0])}`],
      createProject: [`POST`, `/rest/api/3/projectCategory`, params[0]],
      getProjectCategory: [`GET`, `/rest/api/3/project/${params[0]}?${this.serialize(params[1])}`],
      updateProject: [`PUT`, `/rest/api/3/projectCategory/${params[0]}`, params[1]],
      deleteProject: [`DELETE`, `/rest/api/3/projectCategory/${params[0]}`],
      // Project components
      createComponent: [`POST`, `/rest/api/3/component`, params[0]],
      getComponent: [`GET`, `/rest/api/3/component/${params[0]}`],
      updateComponent: [`PUT`, `/rest/api/3/component/${params[0]}`, params[1]],
      deleteComponent: [`DELETE`, `/rest/api/3/component/${params[0]}?${this.serialize(params[1])}`],
      getComponentIssuesCount: [`GET`, `/rest/api/3/component/${params[0]}/relatedIssueCounts`],
      getProjectComponentsPaginated: [`GET`, `/rest/api/3/project/${params[0]}/component?${this.serialize(params[1])}`],
      getProjectComponents: [`GET`, `/rest/api/3/project/${params[0]}/components?${this.serialize(params[1])}`],
      // Project key and name validation
      validateProjectKey: [`GET`, `/rest/api/3/projectvalidate/key?${this.serialize(params[0])}`],
      getValidProjectKey: [`GET`, `/rest/api/3/projectvalidate/validProjectKey?${this.serialize(params[0])}`],
      getValidProjectName: [`GET`, `/rest/api/3/projectvalidate/validProjectName?${this.serialize(params[0])}`],
      // Project permission schemes
      getProjectIssueSecurityScheme: [`GET`, `/rest/api/3/project/${params[0]}/issuesecuritylevelscheme`],
      getAssignedPermissionScheme: [`GET`, `/rest/api/3/project/${params[0]}/permissionscheme?${this.serialize(params[1])}`],
      assignPermissionScheme: [`PUT`, `/rest/api/3/project/${params[0]}/permissionscheme?${this.serialize(params[1])}`, params[2]],
      getProjectIssueSecurityLevels: [`GET`, `/rest/api/3/project/${params[0]}/securitylevel`],
      // Project properties
      getProjectPropertyKeys: [`GET`, `/rest/api/3/project/${params[0]}/properties`],
      getProjectProperty: [`GET`, `/rest/api/3/project/${params[0]}/properties/${params[1]}`],
      setProjectProperty: [`PUT`, `/rest/api/3/project/${params[0]}/properties/${params[1]}`, params[2]],
      deleteProjectProperty: [`DELETE`, `/rest/api/3/project/${params[0]}/properties/${params[1]}`],
      // Project roles
      getProjectRolesForProject: [`GET`, `/rest/api/3/project/${params[0]}/role`],
      getProjectRoleForProject: [`GET`, `/rest/api/3/project/${params[0]}/role/${params[1]}`],
      getProjectRoleDetails: [`GET`, `/rest/api/3/project/${params[0]}/roledetails?${this.serialize(params[1])}`],
      getAllProjectRoles: [`GET`, `/rest/api/3/role`],
      createProjectRole: [`POST`, `/rest/api/3/role`, params[0]],
      getProjectRole: [`GET`, `/rest/api/3/role/${params[0]}`],
      fullyUpdateProjectRole: [`PUT`, `/rest/api/3/role/${params[0]}`, params[1]],
      partialUpdateProjectRole: [`POST`, `/rest/api/3/role/${params[0]}`, params[1]],
      deleteProjectRole: [`GET`, `/rest/api/3/role/${params[0]}`],
      // Project role actors
      setActorsForProjectRole: [`PUT`, `/rest/api/3/project/${params[0]}/role/${params[1]}`, params[2]],
      addActorsToProjectRole: [`POST`, `/rest/api/3/project/${params[0]}/role/${params[1]}`, params[2]],
      deleteActorsFromProjectRole: [`DELETE`, `/rest/api/3/project/${params[0]}/role/${params[1]}?${this.serialize(params[2])}`],
      getDefaultActorsForProjectRole: [`GET`, `/rest/api/3/role/${params[0]}/actors`],
      addDefaultActorsToProjectRole: [`GET`, `/rest/api/3/role/${params[0]}/actors`, params[1]],
      deleteDefaultActorsFromProjectRole: [`DELETE`, `/rest/api/3/role/${params[0]}/actors?${this.serialize(params[1])}`],
      // Project types
      getAllProjectTypes: [`GET`, `/rest/api/3/project/type`],
      getProjectType: [`GET`, `/rest/api/3/project/type/${params[0]}`],
      getAccessibleProjectType: [`GET`, `/rest/api/3/project/type/${params[0]}/accessible`],
      // Project versions
      getProjectVersionsPaginated: [`GET`, `/rest/api/3/project/${params[0]}/version?${this.serialize(params[1])}`],
      getProjectVersions: [`GET`, `/rest/api/3/project/${params[0]}/versions?${this.serialize(params[1])}`],
      createVersion: [`POST`, `/rest/api/3/version`, params[0]],
      getVersion: [`GET`, `/rest/api/3/version/${params[0]}?${this.serialize(params[1])}`],
      updateVersion: [`PUT`, `/rest/api/3/version/${params[0]}`, params[1]],
      deleteVersion: [`DELETE`, `/rest/api/3/version/${params[0]}?${this.serialize(params[1])}`],
      mergeVersions: [`PUT`, `/rest/api/3/version/${params[0]}/mergeto/${params[1]}`],
      moveVersions: [`POST`, `/rest/api/3/version/${params[0]}/move`, params[1]],
      getVersionRelatedIssuesCount: [`GET`, `/rest/api/3/version/${params[0]}/relatedIssueCounts`],
      deleteAndReplaceVersion: [`POST`, `/rest/api/3/version/${params[0]}/removeAndSwap`, params[1]],
      getVersionUnresolvedIssuesCount: [`GET`, `/rest/api/3/version/${params[0]}/unresolvedIssueCount`],
      // Screens
      getAllScreens: [`GET`, `/rest/api/3/screens?${this.serialize(params[0])}`],
      addFieldToDefaultScreen: [`POST`, `/rest/api/3/screens/addToDefault/${params[0]}`],
      getAvailableScreenFields: [`GET`, `/rest/api/3/screens/${params[0]}/availableFields`],
      getAllScreenTabs: [`GET`, `/rest/api/3/screens/${params[0]}/tabs?${this.serialize(params[1])}`],
      createScreenTab: [`POST`, `/rest/api/3/screens/${params[0]}/tabs`, params[1]],
      updateScreenTab: [`PUT`, `/rest/api/3/screens/${params[0]}/tabs/${params[1]}`, params[2]],
      deleteScreenTab: [`DELETE`, `/rest/api/3/screens/${params[0]}/tabs/${params[1]}`],
      getAllScreenTabFields: [`GET`, `/rest/api/3/screens/${params[0]}/tabs/${params[1]}/fields?${this.serialize(params[2])}`],
      addScreenTabFields: [`POST`, `/rest/api/3/screens/${params[0]}/tabs/${params[1]}/fields`, params[2]],
      removeScreenTabField: [`DELETE`, `/rest/api/3/screens/${params[0]}/tabs/${params[1]}/fields/${params[2]}`],
      moveScreenTabField: [`POST`, `/rest/api/3/screens/${params[0]}/tabs/${params[1]}/fields/${params[2]}/move`, params[3]],
      moveScreenTab: [`POST`, `/rest/api/3/screens/${params[0]}/tabs/${params[1]}/move/${params[2]}`],
      // Server info
      getJiraInstanceInfo: [`GET`, `/rest/api/3/serverInfo`],
      // Tasks
      getTask: [`GET`, `/rest/api/3/task/${params[0]}`],
      cancelTask: [`GET`, `/rest/api/3/task/${params[0]}/cancel`],
      // Time tracking
      getSelectedTimeTrackingProvider: [`GET`, `/rest/api/3/configuration/timetracking`],
      selectTimeTrackingProvider: [`PUT`, `/rest/api/3/configuration/timetracking`, params[0]],
      disableTimeTracking: [`DELETE`, `/rest/api/3/configuration/timetracking`],
      getAllTimeTrackingProviders: [`GET`, `/rest/api/3/configuration/timetracking/list`],
      getTimeTrackingSettings: [`GET`, `/rest/api/3/configuration/timetracking/options`],
      setTimeTrackingSettings: [`PUT`, `/rest/api/3/configuration/timetracking/options`, params[0]],
      // Users
      getUser: [`GET`, `/rest/api/3/user?${this.serialize(params[0])}`],
      createUser: [`POST`, `/rest/api/3/user`, params[0]],
      deleteUser: [`DELETE`, `/rest/api/3/user?${this.serialize(params[0])}`],
      bulkGetUsers: [`GET`, `/rest/api/3/user/bulk?${this.serialize(params[0])}`],
      bulkGetUsersMigration: [`GET`, `/rest/api/3/user/bulk/migration?${this.serialize(params[0])}`],
      getUserDefaultColumns: [`GET`, `/rest/api/3/user/columns?${this.serialize(params[0])}`],
      setUserDefaultColumns: [`PUT`, `/rest/api/3/user/columns?${this.serialize(params[0])}`, params[1]],
      resetUserDefaultColumns: [`DELETE`, `/rest/api/3/user/columns?${this.serialize(params[0])}`, params[1]],
      getUserEmail: [`GET`, `/rest/api/3/user/email?${this.serialize(params[0])}`],
      getUserEmailBulk: [`GET`, `/rest/api/3/user/email/bulk?${this.serialize(params[0])}`],
      getUserGroups: [`GET`, `/rest/api/3/user/groups?${this.serialize(params[0])}`],
      getAllUsers: [`GET`, `/rest/api/3/users/search?${this.serialize(params[0])}`],
      // User properties
      getUserPropertyKeys: [`GET`, `/rest/api/3/user/properties?${this.serialize(params[0])}`],
      getUserProperty: [`GET`, `/rest/api/3/user/properties/${params[0]}?${this.serialize(params[1])}`],
      setUserProperty: [`PUT`, `/rest/api/3/user/properties/${params[0]}?${this.serialize(params[1])}`, params[2]],
      deleteUserProperty: [`DELETE`, `/rest/api/3/user/properties/${params[0]}?${this.serialize(params[1])}`],
      // User search
      findUsersAssignableToProjects: [`GET`, `/rest/api/3/user/assignable/multiProjectSearch?${this.serialize(params[0])}`],
      findUsersAssignableToIssues: [`GET`, `/rest/api/3/user/assignable/search?${this.serialize(params[0])}`],
      findUsersWithPermissions: [`GET`, `/rest/api/3/user/permission/search?${this.serialize(params[0])}`],
      findUsersForPicker: [`GET`, `/rest/api/3/user/picker?${this.serialize(params[0])}`],
      findUsers: [`GET`, `/rest/api/3/user/search?${this.serialize(params[0])}`],
      findUsersByQuery: [`GET`, `/rest/api/3/user/search/query?${this.serialize(params[0])}`],
      findUserKeysByQuery: [`GET`, `/rest/api/3/user/search/query/key?${this.serialize(params[0])}`],
      findUsersWithBrowsePermission: [`GET`, `/rest/api/3/user/viewissue/search?${this.serialize(params[0])}`],
      // Webhooks
      getDynamicWebhooks: [`GET`, `/rest/api/3/webhook?${this.serialize(params[0])}`],
      registerDynamicWebhooks: [`POST`, `/rest/api/3/webhook`, params[0]],
      deleteWebhooks: [`DELETE`, `/rest/api/3/webhook`, params[0]],
      extendWebhookLife: [`PUT`, `/rest/api/3/webhook/refresh`, params[0]],
      // Workflows
      getAllWorkflows: [`GET`, `/rest/api/3/workflow?${this.serialize(params[0])}`],
      getWorkflowsPaginated: [`GET`, `/rest/api/3/workflow/search?${this.serialize(params[0])}`],
      // Workflow transition rules
      getWorkflowTransitionRuleConfigurations: [`GET`, `/rest/api/3/workflow/rule/config?${this.serialize(params[0])}`],
      updateWorkflowTransitionRuleConfigurations: [`PUT`, `/rest/api/3/workflow/rule/config`, params[0]],
      // Workflow schemes
      createWorkflowScheme: [`POST`, `/rest/api/3/workflowscheme`, params[0]],
      getWorkflowScheme: [`GET`, `/rest/api/3/workflowscheme/${params[0]}?${this.serialize(params[1])}`],
      updateWorkflowScheme: [`PUT`, `/rest/api/3/workflowscheme/${params[0]}`, params[1]],
      deleteWorkflowScheme: [`DELETE`, `/rest/api/3/workflowscheme/${params[0]}`],
      getDefaultWorkflow: [`GET`, `/rest/api/3/workflowscheme/${params[0]}/default?${this.serialize(params[1])}`],
      updateDefaultWorkflow: [`PUT`, `/rest/api/3/workflowscheme/${params[0]}/default`, params[1]],
      deleteDefaultWorkflow: [`DELETE`, `/rest/api/3/workflowscheme/${params[0]}/default?${this.serialize(params[1])}`],
      getWorkflowForIssueTypeInWorkflowScheme: [`GET`, `/rest/api/3/workflowscheme/${params[0]}/issuetype/${params[1]}?${this.serialize(params[2])}`],
      setWorkflowForIssueTypeInWorkflowScheme: [`PUT`, `/rest/api/3/workflowscheme/${params[0]}/issuetype/${params[1]}`, params[2]],
      deleteWorkflowForIssueTypeInWorkflowScheme: [`DELETE`, `/rest/api/3/workflowscheme/${params[0]}/issuetype/${params[1]}?${this.serialize(params[2])}`],
      getIssueTypesForWorkflowsInWorkflowScheme: [`GET`, `/rest/api/3/workflowscheme/${params[0]}/workflow?${this.serialize(params[1])}`],
      setIssueTypesForWorkflowsInWorkflowScheme: [`PUT`, `/rest/api/3/workflowscheme/${params[0]}/workflow?${this.serialize(params[1])}`, params[2]],
      deleteIssueTypesForWorkflowsInWorkflowScheme: [`DELETE`, `/rest/api/3/workflowscheme/${params[0]}/workflow?${this.serialize(params[1])}`],
      // Workflow scheme project associations
      getWorkflowSchemeProjectAssociations: [`GET`, `/rest/api/3/workflowscheme/project?${this.serialize(params[0])}`],
      // Workflow scheme drafts
      createDraftWorkflowScheme: [`POST`, `/rest/api/3/workflowscheme/${params[0]}/createdraft`, params[0]],
      getDraftWorkflowScheme: [`GET`, `/rest/api/3/workflowscheme/${params[0]}/draft?${this.serialize(params[1])}`],
      updateDraftWorkflowScheme: [`PUT`, `/rest/api/3/workflowscheme/${params[0]}/draft`, params[1]],
      deleteWorkflowScheme: [`DELETE`, `/rest/api/3/workflowscheme/${params[0]}/draft`],
      getDraftDefaultWorkflow: [`GET`, `/rest/api/3/workflowscheme/${params[0]}/draft/default?${this.serialize(params[1])}`],
      updateDraftDefaultWorkflow: [`PUT`, `/rest/api/3/workflowscheme/${params[0]}/draft/default`, params[1]],
      deleteDraftDefaultWorkflow: [`DELETE`, `/rest/api/3/workflowscheme/${params[0]}/draft/default?${this.serialize(params[1])}`],
      getWorkflowForIssueTypeInDraftWorkflowScheme: [`GET`, `/rest/api/3/workflowscheme/${params[0]}/draft/issuetype/${params[1]}?${this.serialize(params[2])}`],
      setWorkflowForIssueTypeInDraftWorkflowScheme: [`PUT`, `/rest/api/3/workflowscheme/${params[0]}/draft/issuetype/${params[1]}`, params[2]],
      deleteWorkflowForIssueTypeInDraftWorkflowScheme: [`DELETE`, `/rest/api/3/workflowscheme/${params[0]}/draft/issuetype/${params[1]}?${this.serialize(params[2])}`],
      getIssueTypesForWorkflowsInDraftWorkflowScheme: [`GET`, `/rest/api/3/workflowscheme/${params[0]}/draft/workflow?${this.serialize(params[1])}`],
      setIssueTypesForWorkflowsInDraftWorkflowScheme: [`PUT`, `/rest/api/3/workflowscheme/${params[0]}/draft/workflow?${this.serialize(params[1])}`, params[2]],
      deleteIssueTypesForWorkflowsInDraftWorkflowScheme: [`DELETE`, `/rest/api/3/workflowscheme/${params[0]}/draft/workflow?${this.serialize(params[1])}`],
      // Workflow statuses
      getAllStatuses: [`GET`, `/rest/api/3/status`],
      getStatus: [`GET`, `/rest/api/3/status/${params[0]}`],
      // Workflow status categories
      getAllStatusCategories: [`GET`, `/rest/api/3/statuscategory`],
      getStatusCategory: [`GET`, `/rest/api/3/statuscategory/${params[0]}`],
      // Workflow transition properties
      getWorkflowTransitionProperties: [`GET`, `/rest/api/3/workflow/transitions/${params[0]}/properties?${this.serialize(params[1])}`],
      updateWorkflowTransitionProperties: [`PUT`, `/rest/api/3/workflow/transitions/${params[0]}/properties?${this.serialize(params[1])}`, params[2]],
      createWorkflowTransitionProperties: [`POST`, `/rest/api/3/workflow/transitions/${params[0]}/properties?${this.serialize(params[1])}`, params[2]],
      deleteWorkflowTransitionProperties: [`DELETE`, `/rest/api/3/workflow/transitions/${params[0]}/properties?${this.serialize(params[1])}`],
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
    let str = []
    if (obj == null) return ''
    for (var p in obj) {
      if (obj.hasOwnProperty(p)) {
        if (obj[p].constructor.name == 'Array') {
          str.push(encodeURIComponent(p+'[]') + '=' + encodeURIComponent(obj[p]))
        } else {
          str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]))
        }
      }
    }
    return str.join('&')
  }
}

if (isNode()) {
  module.exports = JiraAPI
}