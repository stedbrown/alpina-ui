import { Icon, Prose, Separator, Stack, TextLink, Typography } from 'alpina-ui'
import { release, version } from 'alpina:content'

export function InstallGuide({ html }: { html: string }) {
  const [intro, steps] = html.split('<!-- alpina-download -->')
  return <Stack gap={4} data-guide-content="">
    <Prose dangerouslySetInnerHTML={{ __html: intro }} />
    <Separator />
    <Stack direction="row" gap={3} justify="space-between" align="baseline">
      <TextLink href={release.data} download={release.name}>
        Download Alpina UI {version} <Icon name="download" size={16} />
      </TextLink>
      <Typography variant="caption">{release.name} · {Math.ceil(release.bytes / 1024)} KiB</Typography>
    </Stack>
    <Separator />
    <Prose dangerouslySetInnerHTML={{ __html: steps }} />
  </Stack>
}
