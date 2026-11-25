# Publish Alpina UI to npm

The **Publish to npm** workflow has one trigger. A maintainer selects a revision and starts the workflow from the Actions tab. Pushes and pull requests run CI. [Publish workflow](https://github.com/stedbrown/alpina-ui/actions/workflows/publish.yml)

## Set up the package for its first release

1. Use the npm account that will maintain `alpina-ui`. Verify the account’s email and enable two-factor authentication. Use Node.js 24 and npm 11.15.0 or newer for the staging commands below. Check the package’s registered owners with `npm owner ls alpina-ui --registry=https://registry.npmjs.org`. If the package exists and your account has access, continue to the trusted publisher setup. If another account owns it, contact that owner about access. [Publishing unscoped public packages](https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages/)
2. If npm reports that the package does not exist, open a new **empty directory outside the repository**. Run these commands there to establish ownership. The separate setup version leaves the intended public release version available for the workflow.

   ```sh
   npm login --registry=https://registry.npmjs.org
   npm init --yes
   npm pkg set name=alpina-ui version=0.0.0-bootstrap.0 license=MIT description="Initial npm trusted publisher setup for Alpina UI"
   npm stage publish --tag setup --access public --registry=https://registry.npmjs.org
   ```

   npm creates a public `0.0.0-stage` placeholder and returns a stage ID for the pending setup version. Keep that ID for cleanup. At this point the package has a settings page where its owner can configure trusted publishing. [Creating a package through staging](https://github.blog/changelog/2026-10-02-npm-staged-publishing-now-supports-creating-new-packages/) · [npm staging commands](https://docs.npmjs.com/cli/v11/commands/npm-stage/)

## Configure the trusted publisher

Open the package on npmjs.com, select **Settings**, then **Trusted Publisher** and **GitHub Actions**. Save these values. The npm account name can differ from the GitHub owner. [npm trusted publisher settings](https://docs.npmjs.com/trusted-publishers/)

| Setting | Value |
| --- | --- |
| GitHub organization or user | `stedbrown` |
| Repository | `alpina-ui` |
| Workflow filename | `publish.yml` |
| Environment name | Leave empty |
| Allowed actions | Enable direct publishing with `npm publish` |

The workflow obtains a short-lived credential from GitHub’s OIDC service. Its publish job runs on a GitHub-hosted runner with `id-token: write`. The public repository URL in the package manifest identifies the source for npm provenance. [npm provenance statements](https://docs.npmjs.com/generating-provenance-statements/)

## Publish a version

1. Commit the release metadata, source, generated registry, recipe lockfile and matching `recipes/rubrica/vendor/alpina-ui-<version>.tgz`. Keep the portal download and package metadata on the same version. The manifest must declare public npm access.
2. Open **Actions → Publish to npm → Run workflow**. Choose the branch containing the prepared release and start the run. The workflow invokes CI at that revision, including the build, TypeScript, Node tests, release catalog and Chromium tests. [Run the workflow](https://github.com/stedbrown/alpina-ui/actions/workflows/publish.yml)
3. CI opens a freshly packed build and the locked download, compares every packaged file, installs the download in an empty React project, server-renders a button and copies a login block with the packaged CLI. Only after these checks pass does the publish job verify the tarball’s SHA-512 digest and publish those bytes with provenance.
4. Check the version and integrity reported by npm with `npm view alpina-ui@<version> version dist.integrity`. Open the version on npmjs.com and follow its provenance entry to the source commit and Actions run. Once the first release is live, use `npm stage reject <stage-id>` in your authenticated local terminal to remove the pending bootstrap version. [Review a package on npm](https://www.npmjs.com/package/alpina-ui) · [Manage staged versions](https://docs.npmjs.com/staged-publishing/)
