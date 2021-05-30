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
