# Compare copied source files

`alpina add` copies editable source and the MIT notice, `ALPINA-LICENSE.txt`, to your component directory. After installing another package version, run `alpina diff` to compare the files in your project with the sources shipped in that version. The comparison reads local files and preserves your edits.

## Find differences

Run the command from your project directory. If you originally used `--dir`, pass the same directory to the comparison.

```sh
npx --no-install alpina diff
npx --no-install alpina diff swiss-address-form --dir src/components/alpina
```

With no names, the CLI identifies installed registry entries by their entry files. It includes the theme, MIT notice, and dependencies of those entries. Shared paths appear once. After `init`, it checks the theme and MIT notice. To check a component whose entry file is missing, name it explicitly. Use `diff --all` to compare every registry entry with the project.

| Status | Meaning |
| --- | --- |
| `aligned` | The local file and the package source match byte for byte. |
| `modified` | The contents differ. Common causes include local edits, an updated package, or different line endings. |
| `missing` | The selected component uses this file, and the destination path is available. |

The first line identifies the installed version. The last line gives the count for each status. The CLI compares files known to the registry and can inspect copies installed with Alpina 0.3. It uses the current package as the reference, so it needs no installation history.

## Inspect changes line by line

```sh
npx --no-install alpina diff button --patch
```

For each changed file, `--patch` runs the local Git executable to compare the two copies. Lines beginning with `-` come from your project. Lines beginning with `+` come from the package. The directory can be outside a Git repository. The standard report requires only Node.js.

## Apply an update

1. Install the version of `alpina-ui` you want to use.
2. Run `diff` with the component name. For missing dependencies, run `add` with the same name and destination directory.
3. Review the patch for modified files and apply the changes you need in your editor. Running `add` again preserves existing customizations.
4. Try the component in your application, then repeat `diff` to see which local changes you retained.

A completed comparison exits with code 0 even when it finds differences. An unknown argument, invalid path, or read error produces exit code 1.
