import { useEffect } from 'react'
import { TextLink } from 'alpina-ui'
import { directorySources } from 'alpina:content'
import { AtelierDirectory } from 'alpina:atelier'

const style = directorySources.find((file) => file.path === 'src/rubrica.css')!.content

export function DirectoryLive() {
  useEffect(() => {
    window.scrollTo(0, 0)
    return () => {
      document.documentElement.lang = 'it-CH'
    }
  }, [])
  return (
    <>
      <style>{style}</style>
      <nav aria-label="Alpina UI" className="directory-return">
        <TextLink href="#guide/directory">
          <span aria-hidden="true">← </span>Alpina UI
        </TextLink>
      </nav>
      <AtelierDirectory />
    </>
  )
}
