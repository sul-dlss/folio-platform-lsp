# Platform-lsp

## TODO purpose of repo
Equivalent of platform complete for the Eureka.
## branching strategy
## taggins strategy
## brief examples

Github repository for storing Eureka files required for installation.

# Repository structure

  - ### install-applications.json
    This file contains specific versions of appications for specific release.

  - ### management-modules.json
    List of eureka management modules, sidecars that are applicable for specific release

  - ### backend-modules.json
    List of backend modules, which are part of applications, but not present in [Platform complete](https://github.com/folio-org/platform-complete) repository. Safe to ignore.

  - ### frontend-modules.json
    List of the eureka specific UI modules and plugins. Safe to ignore.

  - ### package.json
    An NPM [package.json](https://docs.npmjs.com/cli/v10/configuring-npm/package-json) that specifies the version of UI components.

  - ### stripes.config.js
    Template for tenant configuration file. [Info](https://github.com/folio-org/stripes-sample-platform)

  - ### stripes.modules.js
    File which contain modules, which will be included in the UI bundle.

  - ### yarn.lock
    File with UI dependencies. [yarn.lock](https://classic.yarnpkg.com/lang/en/docs/yarn-lock/)


# Tenant customizations

## ScriptShifter (`@folio/quick-marc` fork)

The ScriptShifter transliteration UI is not part of upstream `@folio/quick-marc`.
It ships from a fork, referenced in `package.json` by an **immutable tag**:

```json
"@folio/quick-marc": "sul-dlss/ui-quick-marc.git#v10.0.4-sul.1"
```

The fork is cut from the `v10.0.4` tag so it stays in step with the
`@folio/quick-marc` version the rest of the platform expects.

The same reference is repeated under `resolutions`, and that is required.
Several FOLIO modules (e.g. `@folio/marc-authorities`) declare
`"@folio/quick-marc": "^10.0.0"`, and a git reference does not satisfy a semver
range. Without the resolution, Yarn installs a second, unpatched copy of
quick-marc nested inside those modules.

### Pin a tag, never a branch

**Do not point this dependency at a branch name.** Pushing to a branch does not
reliably ship, and it fails *silently*. Observed on 2026-09-16:

* fork commit `43d8d63` was pushed to `scriptshifter-10.0.4` at 23:24 UTC;
* the image build ran a full, uncached `yarn install` nine minutes later;
* it installed `9dd225a`, the previous commit, and the build went green.

The build log says why:

```
warning Pattern ["@folio/quick-marc@sul-dlss/ui-quick-marc.git#scriptshifter-10.0.4",
"@folio/quick-marc@^10.0.0"] is trying to unpack in the same destination
".../npm-@folio-quick-marc-10.0.4-9dd225a.../node_modules/@folio/quick-marc"
as pattern [...]. This could result in non-deterministic behavior, skipping.
```

Because `@folio/marc-authorities` also requests quick-marc by semver range, Yarn
merges the two requests into a single slot and warns that the result is
non-deterministic. With a branch reference, the commit in that slot can be stale.
With a tag, both requests resolve to the same immutable commit and the collision
is harmless.

### Releasing a change to the fork

1. In the fork, tag the commit and push the tag:

   ```sh
   git tag v10.0.4-sul.2 && git push origin v10.0.4-sul.2
   ```

2. Here, bump the tag in **both** `dependencies` and `resolutions`. Nothing else
   needs editing. Yarn keys lockfile entries on the reference string, so changing
   the tag invalidates that one entry and re-resolves it on the next
   `yarn install`, leaving every other package untouched.

3. Rebuild the image.

4. Verify what shipped rather than assuming it (below).

### Verifying what an image contains

Every image publishes the lockfile generated during its own build at
`/usr/share/nginx/html/yarn.lock`. That file, not `package.json`, is the
authoritative record of what the image contains:

```sh
curl -s https://folio-dev.stanford.edu/yarn.lock | grep -A3 '^"@folio/quick-marc'
```

Confirm the `uid` is the commit you tagged. If it is an older commit, either the
image was not rebuilt, or it was rebuilt but never rolled out: the build pushes to
a *mutable* image tag (`ghcr.io/sul-dlss/folio-platform-lsp:R1-2025-csp-7-eureka-dev`),
and overwriting that tag does not restart running containers.

### Why this differs between environments

This branch's `.dockerignore` excludes the committed `yarn.lock`, so the image
re-resolves every dependency from scratch on each build. The `*-prod` branch does
**not** exclude it, so prod installs exactly what its committed lockfile records.

That difference matters if a branch reference is ever used instead of a tag:

| Build | New commits on the referenced branch |
| --- | --- |
| this branch (lockfile discarded) | picked up, but non-deterministically, per the warning above |
| `*-prod` (lockfile used) | **never** picked up; the lockfile holds the old commit until someone regenerates it |

On prod, then, a branch reference reads as "always current" while shipping
whichever commit the lockfile happens to hold. A tag keeps the shipped version
visible in `package.json` and reviewable in the promotion diff — which is how
every other `@folio/*` dependency in this repo is already pinned, each to an
exact version.

### The committed `yarn.lock`

Used for local development only; this branch's image ignores it. With a tag pin it
stays correct for as long as it matches the tag in `package.json`, and bumping the
tag refreshes just that entry.

Avoid `yarn upgrade @folio/quick-marc`: it re-resolves far more than the named
package. In testing it also bumped `@folio/plugin-find-authority`,
`@folio/stripes-types`, `core-js`, `lodash` and `dayjs`. Bumping the tag is
sufficient.

### Running `yarn install` locally

The `@folio` scope is only configured inside the Docker build, so a local install
needs it set once:

```sh
yarn config set @folio:registry https://repository.folio.org/repository/npm-folio/
```

This repository uses Yarn 1.x, matching upstream and the wider FOLIO community.
