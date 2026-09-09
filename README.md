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
It ships from a fork, referenced in `package.json`:

```json
"@folio/quick-marc": "jgreben/ui-quick-marc.git#scriptshifter-10.0.4"
```

The branch is cut from the `v10.0.4` tag so it stays in step with the
`@folio/quick-marc` version the rest of the platform expects.

The same reference is repeated under `resolutions`, and that is required.
Several FOLIO modules (e.g. `@folio/marc-authorities`) declare
`"@folio/quick-marc": "^10.0.0"`, and a git reference does not satisfy a semver
range. Without the resolution, Yarn installs a second, unpatched copy of
quick-marc nested inside those modules.

### Updating the pin after pushing to the fork

`yarn.lock` pins the fork to an exact commit, so **pushing new commits to
`scriptshifter-10.0.4` does not change what gets built.** The Docker build runs
`yarn install --frozen-lockfile` and will fail if the lockfile is stale.

To move the pin, delete the `@folio/quick-marc` block from `yarn.lock` — the one
beginning:

```
"@folio/quick-marc@^10.0.0", "@folio/quick-marc@jgreben/ui-quick-marc.git#scriptshifter-10.0.4":
```

then let Yarn re-resolve just that entry:

```sh
yarn install
git add yarn.lock && git commit -m "Bump @folio/quick-marc fork pin"
```

Do **not** use `yarn upgrade @folio/quick-marc`. It re-resolves far more than the
named package; in testing it also bumped `@folio/plugin-find-authority`,
`@folio/stripes-types`, `core-js`, `lodash`, `dayjs` and several others. Deleting
the single block touches nothing else.

If you change the branch name or tag, update the reference in **both**
`dependencies` and `resolutions`.

### Running `yarn install` locally

The `@folio` scope is only configured inside the Docker build, so a local install
needs it set once:

```sh
yarn config set @folio:registry https://repository.folio.org/repository/npm-folio/
```

This repository uses Yarn 1.x, matching upstream and the wider FOLIO community.
