import {rest} from 'msw'
import {
  ListOfTagsResponseData,
  ListRepositoryResponseData,
  RegistryResponseData
} from '../types'
export const handlers = [
  rest.get<{}, RegistryResponseData>(
    'https://api.digitalocean.com/v2/registry',
    (_, res, ctx) => {
      return res(
        // Respond with a 200 status code
        ctx.status(200),
        ctx.json({
          registry: {
            name: 'test-registry-name'
          }
        })
      )
    }
  ),
  rest.get<{}, ListRepositoryResponseData>(
    'https://api.digitalocean.com/v2/registry/:registryName/repositories',
    (req, res, ctx) => {
      const registryName = req.params.registryName

      if (registryName !== 'test-registry-name') {
        return res(ctx.status(400))
      }

      return res(
        // Respond with a 200 status code
        ctx.status(200),
        ctx.json({
          repositories: [
            {
              registry_name: registryName,
              name: 'test-repo-name',
              tag_count: 8
            }
          ],
          meta: {
            total: 1
          }
        })
      )
    }
  ),

  rest.get<{}, ListOfTagsResponseData>(
    'https://api.digitalocean.com/v2/registry/:registryName/repositories/:repositoryName/tags',
    (req, res, ctx) => {
      const registryName = req.params.registryName
      const repositoryName = req.params.repositoryName

      if (
        registryName !== 'test-registry-name' ||
        repositoryName !== 'test-repo-name'
      ) {
        return res(ctx.status(400))
      }

      return res(
        // Respond with a 200 status code
        ctx.status(200),
        ctx.json({
          meta: {
            total: 8
          },
          tags: [
            // we won't prune the most recent 4 tags so let's put 4 unprunable ones
            {tag: 'recent1', updated_at: new Date(2019, 0, 9, 2)},
            {tag: 'recent2', updated_at: new Date(2019, 0, 9, 2)},
            {tag: 'recent3', updated_at: new Date(2019, 0, 9, 3)},
            {tag: 'recent4', updated_at: new Date(2019, 0, 9, 4)},
            // The next three are in the same day, so multiday2 and multiday3 should be pruned
            {tag: 'multiday1', updated_at: new Date(2018, 11, 25, 10)},
            {tag: 'multiday2', updated_at: new Date(2018, 11, 25, 9)}, // pruned
            {tag: 'multiday3', updated_at: new Date(2018, 11, 25, 8)}, // pruned
            // within our "one month window" so it shouldn't be pruned
            {tag: 'unique1', updated_at: new Date(2018, 11, 20)},
            // barely within our "one month window" so it shouldn't be pruned
            {tag: 'unique2', updated_at: new Date(2018, 11, 1, 1)},
            // The next three are in the same week and older than a month, so week2 and week3 should be pruned
            {tag: 'week1', updated_at: new Date(2018, 10, 21)},
            {tag: 'week2', updated_at: new Date(2018, 10, 20)}, // pruned
            {tag: 'week3', updated_at: new Date(2018, 10, 19)}, // pruned
            // In a different week than the previous three so it shouldn't be pruned
            {tag: 'unique3', updated_at: new Date(2018, 10, 5)},
            // These four are in the same month and older than three months, so
            // month3 and month4 should be pruned. month2 is not actually within
            // the three month window.
            {tag: 'month1', updated_at: new Date(2018, 9, 29)},
            {tag: 'month2', updated_at: new Date(2018, 9, 20)},
            {tag: 'month3', updated_at: new Date(2018, 9, 9)}, // pruned
            {tag: 'month4', updated_at: new Date(2018, 9, 2)}, // pruned
            // Over a year old, so should be pruned
            {tag: 'year', updated_at: new Date(2018, 0, 8)} // pruned
          ].map(t => ({
            ...t,
            updated_at: t.updated_at.toISOString(),
            repository: 'test-repo-name',
            registry_name: 'test-registry-name'
          }))
        })
      )
    }
  ),

  rest.delete(
    'https://api.digitalocean.com/v2/registry/:registryName/repositories/:repositoryName/tags/:tag',
    (req, res, ctx) => {
      return res(ctx.status(201))
    }
  ),
  rest.post(
    'https://api.digitalocean.com/v2/registry/:registrName/garbage-collection',
    (_, res, ctx) => {
      return res(ctx.status(200))
    }
  )
]
