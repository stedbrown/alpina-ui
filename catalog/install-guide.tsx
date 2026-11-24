import { Prose, TextLink, Typography } from 'alpina-ui'
import { release, version } from 'alpina:content'

export function InstallGuide({ html }: { html: string }) {
  const [intro, steps] = html.split('<!-- alpina-download -->')
  return (
    <Prose className="guide-content">
      <div dangerouslySetInnerHTML={{ __html: intro }} />
      <div className="package-download">
        <TextLink href={release.data} download={release.name}>
          Download Alpina UI {version}
          <span aria-hidden="true"> ↓</span>
        </TextLink>
        <Typography variant="caption">
          {release.name} · {Math.ceil(release.bytes / 1024)} KiB
        </Typography>
      </div>
      <div dangerouslySetInnerHTML={{ __html: steps }} />
    </Prose>
  )
}
