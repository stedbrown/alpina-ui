import { CodeBlock } from 'alpina-ui'

export function ComparisonCode({ code, library }: { code: string; library: string }) {
  return <CodeBlock code={code} label={library + ' · EditionLabel.tsx'} />
}
