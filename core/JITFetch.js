const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Just-In-Time (JIT) Repository Fetcher
 * Ensures that if an agent squad needs a repository from the Monolith that isn't
 * physically on the device, it dynamically pulls it down, executes the task, 
 * and maps it into the local mesh.
 */
class JITFetch {
  static ensureRepo(repoUrl, repoName, executionTrace) {
    const targetDir = path.join(__dirname, '..', '..', repoName);
    
    if (fs.existsSync(targetDir)) {
      executionTrace.push(`[JIT-FETCH] ${repoName} is already present on the local mesh.`);
      return targetDir;
    }

    executionTrace.push(`[JIT-FETCH] ${repoName} missing locally. Initiating deep space clone from Monolith map...`);
    try {
      // Use shallow clone to save disk space and time
      execSync(`git clone --depth 1 ${repoUrl} ${targetDir}`, { stdio: 'ignore' });
      executionTrace.push(`[JIT-FETCH] SUCCESS: ${repoName} successfully materialized to ${targetDir}.`);
      return targetDir;
    } catch (e) {
      executionTrace.push(`[JIT-FETCH] ERROR: Failed to clone ${repoName}. Access denied or network failure.`);
      return null;
    }
  }
}

module.exports = JITFetch;
