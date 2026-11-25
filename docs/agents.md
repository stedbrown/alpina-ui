# Use Alpina with a coding agent

A skill gives an agent reusable instructions for composing Alpina interfaces. The Model Context Protocol (MCP) server gives it tools to look up the exact component API, source, and guides installed in your project. You can use either independently.

## Install the skill

From your application directory, run the following command and choose your agent in the installer. The default installation is local to that project.

```sh
npx skills add stedbrown/alpina-ui --skill alpina-ui
```

For an unattended project-local Codex installation, append `--agent codex --yes`. Check that the installer lists `alpina-ui`; its `SKILL.md` contains the Swiss layout guidance and React examples. [Skills CLI installation reference](https://github.com/vercel-labs/skills#install-a-skill)

For a project-local installation from the package, copy `node_modules/alpina-ui/skills/alpina-ui/` into your agent’s project skills directory. For example, an agent that uses `.agents/skills/` should find `.agents/skills/alpina-ui/SKILL.md`. The skill includes its MIT license. [Read the skill on main](https://github.com/stedbrown/alpina-ui/blob/main/skills/alpina-ui/SKILL.md) · [Agent Skills specification](https://agentskills.io/specification)

## Compose a Swiss interface

Start from the installed declarations or MCP before choosing props. Import `alpina-ui/styles.css` at the application entry and set the locale with `AlpinaProvider`. In a form, pass the control object from `Field` to the input so labels, hints and errors stay associated.

Align headings and reading text to the left edge of the grid. Use the type scale and whitespace to distinguish sections. Keep one red accent on paper and ink. Compose with `Grid` and `Stack`. Avoid gradients, nested cards and Tailwind utility overrides.

For a workspace, compose `AppShell` with `SideNav`. For brief confirmations, call `toast` with a `Toaster` mounted at the application boundary. For charts with multiple series, supply direct labels and a table description. For grouped invoice identifiers, check the `stripSeparators` option on the reference builder.

## Connect the local MCP server

Install the package from npm in your application using Node.js 20 or later. The package includes the reference data used by the server. To pin the exact release instead, install the portal archive: `npm install https://alpinaui.com/alpina-ui-1.0.0-rc.6.tgz`.

```sh
npm install alpina-ui@next
```

Configure a local **stdio** server in your MCP client. Start `node` with the absolute path to the installed CLI and the argument `mcp`. For clients that use the `mcpServers` JSON format, replace the example path below with your own. On Windows, paths such as `C:/projects/store/node_modules/alpina-ui/cli/alpina.mjs` work in JSON.

```json
{
  "mcpServers": {
    "alpina-ui": {
      "command": "node",
      "args": ["/absolute/path/to/project/node_modules/alpina-ui/cli/alpina.mjs", "mcp"]
    }
  }
}
```

Restart or reconnect the client and open its tool list. It should show the three tools below. The process reads the package’s installed reference files and works offline. It runs locally even when the application lives on Vercel.

| Tool | Example arguments | Result |
| --- | --- | --- |
| `search_components` | `{"query":"tabella contabile"}` | Ranked identifiers, groups and one-line descriptions. Search component names and tasks in English, German, French, Italian and Romansh. The offline index accepts partial words, omitted accents and misspellings such as `dropdwon`. Use `{}` for the full registry. |
| `get_component` | `{"name":"dropdown-menu"}` | The import path, public documentation URL, installed usage notes, TypeScript declaration and source paths. Add `"file":"interactive/action-list.tsx"` to read one listed file. |
| `get_guide` | `{"slug":"build"}` | The installed Markdown guide. Use `{}` to discover guide identifiers. |

Try asking, “Which Alpina component lets someone filter by canton? Check the installed API and show how to clear the filter.” The agent can look up both canton controls and inspect their props before choosing one. Your editor handles any changes to the application. [MCP tools](https://modelcontextprotocol.io/specification/2025-11-25/server/tools)

## Read without an integration

Open the public text index for links to machine-readable documentation. For version-sensitive work, the same package used by the application contains its own Markdown under `docs/` and TypeScript declarations under `dist/`. [Documentation index for agents](https://alpinaui.com/llms.txt)
