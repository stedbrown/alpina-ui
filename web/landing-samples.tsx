import { CodeBlock } from 'alpina-ui'

export function InstallCommand({ command }: { command: string }) {
  return <CodeBlock label="Terminal" code={command} />
}
