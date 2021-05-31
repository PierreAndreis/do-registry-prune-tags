# DigitalOcean Repository Prune Tags

Walks through all repositories in a digitalocean container registry and

- Prune any tag that has a more recent version on the same day
- Prune any tag that's not the most recent in a given week
- If a tag is at least two months old, prune any tag that's not the most recent tag in that month
- Prune any tag older than a year
- Start [Garbage Collection](https://docs.digitalocean.com/products/container-registry/how-to/clean-up-container-registry/)

## Inputs

### `token`

**Required** [A DigitalOcean API token](https://cloud.digitalocean.com/account/api/tokens) with write permission.

### `quiet`

Disable verbose console log

### `disableGc`

If true, won't invoke [garbage collection](https://docs.digitalocean.com/products/container-registry/how-to/clean-up-container-registry/) after pruning

## Example usage

      - name: DigitalOcean Registry Prune
        uses: PierreAndreis/do-registry-prune-tags@0.0.1
        with:
          token: ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}
## Output
Example output
```
    ┌───────────┬────────────────────────────┬────────┐
    │  (index)  │            date            │ pruned │
    ├───────────┼────────────────────────────┼────────┤
    │  recent1  │ '2019-01-09T02:00:00.000Z' │  'no'  │
    │  recent2  │ '2019-01-09T02:00:00.000Z' │  'no'  │
    │  recent3  │ '2019-01-09T03:00:00.000Z' │  'no'  │
    │  recent4  │ '2019-01-09T04:00:00.000Z' │  'no'  │
    │ multiday1 │ '2018-12-25T10:00:00.000Z' │  'no'  │
    │ multiday2 │ '2018-12-25T09:00:00.000Z' │ 'YES'  │
    │ multiday3 │ '2018-12-25T08:00:00.000Z' │ 'YES'  │
    │  unique1  │ '2018-12-20T00:00:00.000Z' │  'no'  │
    │  unique2  │ '2018-12-01T01:00:00.000Z' │  'no'  │
    │   week1   │ '2018-11-21T00:00:00.000Z' │  'no'  │
    │   week2   │ '2018-11-20T00:00:00.000Z' │ 'YES'  │
    │   week3   │ '2018-11-19T00:00:00.000Z' │ 'YES'  │
    │  unique3  │ '2018-11-05T00:00:00.000Z' │  'no'  │
    │  month1   │ '2018-10-29T00:00:00.000Z' │  'no'  │
    │  month2   │ '2018-10-20T00:00:00.000Z' │  'no'  │
    │  month3   │ '2018-10-09T00:00:00.000Z' │ 'YES'  │
    │  month4   │ '2018-10-02T00:00:00.000Z' │ 'YES'  │
    │   year    │ '2018-01-08T00:00:00.000Z' │ 'YES'  │
    └───────────┴────────────────────────────┴────────┘

```
