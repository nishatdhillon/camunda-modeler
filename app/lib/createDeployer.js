'use strict';

/**
 * Create deploy API factory fn.
 */
function createDeployer({ fetch, fs, FormData }) {

  /**
   * Deploy diagram to the given endpoint URL.
   */
  return async function deploy(url, { deploymentName, tenantId, file = {} }, cb) {

    try {
      // callback is optional
      cb = cb || noop;

      if (!deploymentName) {
        throw new Error('Failed to deploy process, deployment name must be provided.');
      }

      if (!file.name || !file.path) {
        throw new Error('Failed to deploy process, file name and path must be provided.');
      }

      if (!url) {
        throw new Error('Failed to deploy process, endpoint url must not be empty.');
      }

      const form = new FormData();

      form.append('deployment-name', deploymentName);

      if (tenantId) {
        form.append('tenant-id', tenantId);
      }

      form.append(file.name, fs.createReadStream(file.path));

      const serverResponse = await fetch(url, { method: 'POST', body: form });

      if (!serverResponse.ok) {
        throw new Error(`[${serverResponse.status}] ${serverResponse.statusText}`);
      }

      let response;

      try {
        response = await serverResponse.json();
      } catch (error) {
        response = serverResponse.statusText;
      }

      return cb(null, response);
    } catch (error) {
      return cb(error);
    }

  };
}

module.exports = createDeployer;


// helpers //////
function noop() { }
