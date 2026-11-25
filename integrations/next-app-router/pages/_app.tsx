import type { AppProps } from 'next/app'
import 'alpina-ui/styles.css'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
