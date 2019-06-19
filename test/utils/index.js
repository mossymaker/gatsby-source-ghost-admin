/**
 * Test Utilities
 *
 * Shared utils for writing tests
 */

// Require overrides - these add globals for tests
require('./overrides');

// Require assertions - adds custom should assertions
require('./assertions');

// Export a mocked version of the admin API
module.exports.MockAdminAPI = require('./mock-admin-api');
