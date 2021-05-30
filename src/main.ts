import pruneRegistry from './pruneRegistry'
import * as core from '@actions/core'

pruneRegistry()
  .then(() => {
    process.exitCode = 0
    return core.info('Prune task completed! Shutting down ...')
  })
  .catch(err => {
    process.exitCode = 1
    core.setFailed(err)
  })
