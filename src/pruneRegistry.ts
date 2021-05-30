import * as core from '@actions/core'
import {
  compareDesc,
  isBefore,
  isEqual,
  isSameDay,
  isSameMonth,
  isSameWeek,
  max,
  subDays
} from 'date-fns'
import fetch from 'node-fetch'
import {
  ListOfTagsResponseData,
  ListRepositoryResponseData,
  RegistryResponseData
} from './types'

export default async function proneRegistry(): Promise<void> {
  const quiet = core.getInput('quiet')

  const twoMonthsAgo = subDays(new Date(), 90)
  const yearAgo = subDays(new Date(), 365)

  const apiToken = core.getInput('token')

  if (!apiToken) {
    console.warn('no token given')
  }

  const registryResult = await fetch(
    `https://api.digitalocean.com/v2/registry`,
    {
      headers: {
        Authorization: `Bearer ${apiToken}`
      }
    }
  )

  const registryBody: RegistryResponseData = await registryResult.json()

  const listOfRepositoriesResult = await fetch(
    `https://api.digitalocean.com/v2/registry/${registryBody.registry.name}/repositories`,
    {
      headers: {
        Authorization: `Bearer ${apiToken}`
      }
    }
  )

  const listOfRepositoriesBody: ListRepositoryResponseData =
    await listOfRepositoriesResult.json()

  const listOfRepositories = listOfRepositoriesBody.repositories

  for (let repository of listOfRepositories) {
    const listOfTagsResult = await fetch(
      `https://api.digitalocean.com/v2/registry/${repository.registry_name}/repositories/${repository.name}/tags?per_page=200`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`
        }
      }
    )
    const listOfTagsBody: ListOfTagsResponseData = await listOfTagsResult.json()

    // A list of tags that *might* be pruned because they are not one of the 4 most recent.
    const elegiblesTags = listOfTagsBody.tags
      .map(tag => ({...tag, updated_at: new Date(tag.updated_at)}))
      .sort((a, b) => compareDesc(a.updated_at, b.updated_at))
      .slice(4)

    // Prune any tag that has a more recent version on the same day
    const prunableSameDay = elegiblesTags.filter(({updated_at}) => {
      const tagOnSameDay = elegiblesTags.filter(tag =>
        isSameDay(tag.updated_at, updated_at)
      )
      return (
        tagOnSameDay.length > 1 &&
        !isEqual(max(tagOnSameDay.map(v => v.updated_at)), updated_at)
      )
    })

    // Prune any tag that's not the most recent in a given week
    const prunableByWeek = elegiblesTags.filter(({updated_at}) => {
      const tagsOnSameWeeek = elegiblesTags.filter(tag =>
        isSameWeek(tag.updated_at, updated_at)
      )

      return !isEqual(
        updated_at,
        max(tagsOnSameWeeek.map(tags => tags.updated_at))
      )
    })

    // If a tag is at least two months old, prune any tag that's not the most recent tag in that month
    const prunableByMonth = elegiblesTags.filter(({updated_at}) => {
      const tagsOnSameMonth = elegiblesTags.filter(version =>
        isSameMonth(version.updated_at, updated_at)
      )

      return (
        isBefore(updated_at, twoMonthsAgo) &&
        !isEqual(updated_at, max(tagsOnSameMonth.map(tags => tags.updated_at)))
      )
    })

    // Prune anything older than a year. That's old, man!
    const prunableByYear = elegiblesTags.filter(({updated_at}) =>
      isBefore(updated_at, yearAgo)
    )

    const prunableTags = Array.from(
      new Set(
        [
          prunableSameDay,
          prunableByWeek,
          prunableByMonth,
          prunableByYear
        ].reduce(
          (collector, prunables) =>
            collector.concat(prunables.map(({tag}) => tag)),
          [] as string[]
        )
      )
    )

    if (quiet !== 'true') {
      //eslint-disable-next-line no-console
      core.info(`Prune Report for service "${repository.name}"`)
      //eslint-disable-next-line no-console
      console.table(
        listOfTagsBody.tags.reduce(
          (collector, {tag, updated_at}) =>
            Object.assign(collector, {
              [tag]: {
                date: updated_at,
                pruned: prunableTags.includes(tag) ? 'YES' : 'no'
              }
            }),
          {}
        )
      )
    }

    for (const tag of prunableTags) {
      await fetch(
        `https://api.digitalocean.com/v2/registry/${repository.registry_name}/repositories/${repository.name}/tags/${tag}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${apiToken}`
          }
        }
      )
      if (!quiet) {
        core.info(
          `pruned tag ${tag} of repository ${repository.name} from registry ${repository.registry_name}`
        )
      }
    }
  }

  const disableGc = core.getInput('disableGc')

  if (disableGc !== 'true') {
    // Start GC to free memory
    await fetch(
      `https://api.digitalocean.com/v2/registry/${registryBody.registry.name}/garbage-collection`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`
        }
      }
    )
    core.info(`gc started on ${registryBody.registry.name}`)
  } else {
    core.info(`gc skipped`)
  }
}
