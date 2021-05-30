import {advanceTo} from 'jest-date-mock'
import {server} from './mocks'

import pruneRegistry from './pruneRegistry'

it('prunes the expected versions', async () => {
  advanceTo(new Date(2019, 0, 10))

  let prunedVersions: string[] = []
  server.on('request:start', req => {
    if (
      req.method === 'DELETE' &&
      req.url.pathname.includes(
        '/v2/registry/test-registry-name/repositories/test-repo-name/tags/'
      )
    ) {
      prunedVersions.push(
        req.url.pathname.replace(
          '/v2/registry/test-registry-name/repositories/test-repo-name/tags/',
          ''
        )
      )
    }
  })

  await pruneRegistry()

  expect(prunedVersions).toMatchInlineSnapshot(`
      Array [
        "multiday2",
        "multiday3",
        "week2",
        "week3",
        "month3",
        "month4",
        "year",
      ]
    `)
})
