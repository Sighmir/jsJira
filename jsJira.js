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
      // getColumns...
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