const GhostAdminAPI = require('@tryghost/admin-api');

module.exports.configure = configOptions => new GhostAdminAPI({
    url: configOptions.apiUrl,
    key: configOptions.adminApiKey,
    version: 'v2'
});
