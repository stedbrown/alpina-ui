import type { ReactElement } from 'react'

export const blockDemos: Record<string, () => Promise<ReactElement>> = {
  async login() {
    const { LoginBlock } = await import('../blocks/login.js')
    return <LoginBlock workspaceName="Atelier" initialEmail="demo@example.org" continueHref="/blocks/dashboard/"
      onSignIn={({email, password}) => {
        if (email !== 'demo@example.org' || password !== 'atelier-demo') throw new Error('Invalid sample credentials.')
      }} />
  },
  async 'account-settings'() {
    const { AccountSettingsBlock } = await import('../blocks/account-settings.js')
    return <AccountSettingsBlock workspaceName="Atelier" initial={{fullName: 'Alex Meier', email: 'demo@example.org', locale: 'de-CH', weeklyDigest: false}}
      onSave={() => { /* The block keeps the saved snapshot for this local preview. */ }} />
  },
  async dashboard() {
    const { DashboardBlock } = await import('../blocks/dashboard.js')
    return <DashboardBlock />
  },
  async pricing() {
    const { PricingBlock } = await import('../blocks/pricing.js')
    return <PricingBlock />
  },
}
