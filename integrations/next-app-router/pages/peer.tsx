import { useEffect, useState, version as reactVersion } from 'react'
import { version as domVersion } from 'react-dom'
import { Button } from 'alpina-ui/ui/button'
import { CurrencyCHF } from 'alpina-ui/swiss/currency-chf'

export function getServerSideProps() {
  return { props: { serverPeers: reactVersion + '/' + domVersion } }
}

export default function Payment({ serverPeers }: { serverPeers: string }) {
  const [paid, setPaid] = useState(false)
  useEffect(() => {
    document.documentElement.dataset.reactPeers = reactVersion + '/' + domVersion
  }, [])
  return (
    <main data-server-peers={serverPeers}>
      <h1>Payment status</h1>
      <p>Amount due <CurrencyCHF locale="de-CH" amount={43.50} /></p>
      <Button disabled={paid} onClick={() => setPaid(true)}>Record payment</Button>
      {paid && <p role="status">Payment recorded.</p>}
    </main>
  )
}
