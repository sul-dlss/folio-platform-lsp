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

### Publishing changes to the fork

**Push to `scriptshifter-10.0.4` and the next image build picks it up. There is
no pin to bump.**

The dependency is a git *branch* reference, and Yarn 1 re-resolves branch
references to their current HEAD on any full install. The image build is always
a full install: `.dockerignore` excludes the committed `yarn.lock`, so the
container resolves dependencies from scratch and writes its own lockfile. That
generated lockfile is published to `/usr/share/nginx/html/yarn.lock` and is the
authoritative record of what a given image contains.

The trade-off is that image builds are not byte-reproducible: rebuilding the
same commit later can pick up newer fork commits and newer transitive versions.
If you need to reproduce an image exactly, read the `yarn.lock` published inside
it.

### The committed `yarn.lock`

Used for local development only; the image ignores it. It pins the fork to
whichever commit was current when it was last written, so a local `yarn install`
will *not* pick up new fork commits on its own.

To refresh it locally, delete the `@folio/quick-marc` block — the one beginning:

```
"@folio/quick-marc@^10.0.0", "@folio/quick-marc@jgreben/ui-quick-marc.git#scriptshifter-10.0.4":
```

then re-resolve just that entry:

```sh
yarn install
```

Avoid `yarn upgrade @folio/quick-marc`: it re-resolves far more than the named
package. In testing it also bumped `@folio/plugin-find-authority`,
`@folio/stripes-types`, `core-js`, `lodash` and `dayjs`. Deleting the single
block touches nothing else.

If you change the branch name or tag, update the reference in **both**
`dependencies` and `resolutions`.

### Running `yarn install` locally

The `@folio` scope is only configured inside the Docker build, so a local install
needs it set once:

```sh
yarn config set @folio:registry https://repository.folio.org/repository/npm-folio/
```

This repository uses Yarn 1.x, matching upstream and the wider FOLIO community.
