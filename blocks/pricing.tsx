'use client'

import { useState } from 'react'
import {
  Card, CardContent, CardFooter, CardHeader, CardTitle, CurrencyCHF, Grid, GridItem, Icon,
  Separator, Stack, TextLink, ToggleGroup, Typography, formatCHF,
} from 'alpina-ui'

export type BillingInterval = 'monthly' | 'annual'
export interface PricingPlan {
  id: string
  name: string
  description: string
  monthlyChf: number
  annualChf: number
  features: readonly string[]
}
export interface PricingBlockProps {
  plans?: readonly PricingPlan[]
  /** Return your checkout URL for the plan and interval, or use the built-in text quote. */
  checkoutHref?: (id: string, interval: BillingInterval) => string
}

const standardPlans: readonly PricingPlan[] = [
  { id: 'individual', name: 'Individual', description: 'For an independent designer running one studio.',
    monthlyChf: 19, annualChf: 190, features: ['1 workspace member', '10 active projects', 'PDF proof archive'] },
  { id: 'studio', name: 'Studio', description: 'For teams managing print jobs and proof approvals.',
    monthlyChf: 49, annualChf: 490, features: ['5 workspace members', '50 active projects', 'Client proof approvals'] },
  { id: 'production', name: 'Production', description: 'For a production desk handling multiple editions.',
    monthlyChf: 99, annualChf: 990, features: ['15 workspace members', 'Unlimited active projects', 'Project export and proof approvals'] },
]

function quoteHref(plan: PricingPlan, interval: BillingInterval): string {
  const total = interval === 'annual' ? plan.annualChf : plan.monthlyChf
  const lines = ['Studio workspace quote', plan.name, plan.description, '', ...plan.features,
    '', 'Billing interval: ' + interval, 'Total per ' + (interval === 'annual' ? 'year' : 'month') + ': ' + formatCHF(total)]
  return 'data:text/plain;charset=utf-8,' + encodeURIComponent(lines.join('\n'))
}

export function PricingBlock({ plans = standardPlans, checkoutHref }: PricingBlockProps = {}) {
  const [interval, setInterval] = useState<BillingInterval>('monthly')
  const annual = interval === 'annual'
  return (
    <Grid as="main" width="site" space="section">
      <GridItem medium={5} large={7}>
        <Stack gap={3}>
          <Typography as="h1" variant="title">Studio pricing</Typography>
          <Typography measure="narrow">Choose a workspace for your design practice. Prices are per workspace, in Swiss francs.</Typography>
        </Stack>
      </GridItem>
      <GridItem medium={3} large={4} start={{large: 9}}>
        <Stack gap={2} align="start">
          <Typography variant="label">Billing interval</Typography>
          <ToggleGroup label="Billing interval" value={[interval]}
            options={[{ value: 'monthly', label: 'Monthly' }, { value: 'annual', label: 'Annual' }]}
            onValueChange={([value]) => { if (value === 'monthly' || value === 'annual') setInterval(value) }} />
        </Stack>
      </GridItem>
      <GridItem><Separator weight="section" /></GridItem>
      {plans.map(plan => (
        <GridItem key={plan.id} medium={4} large={4}>
          <Card as="article" aria-label={plan.name}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <Typography>{plan.description}</Typography>
            </CardHeader>
            <CardContent>
              <Stack gap={4}>
                <Stack gap={1}>
                  <Typography variant="display" numeric><CurrencyCHF amount={annual ? plan.annualChf : plan.monthlyChf} /></Typography>
                  <Typography variant="caption">{annual ? 'Billed once per year' : 'Billed once per month'}</Typography>
                </Stack>
                <Separator />
                <Stack gap={2} role="list" aria-label={plan.name + ' features'}>
                  {plan.features.map(feature => <Stack key={feature} direction="row" gap={2} align="baseline" wrap={false} role="listitem">
                    <Icon name="check" size={16} /><Typography>{feature}</Typography>
                  </Stack>)}
                </Stack>
              </Stack>
            </CardContent>
            <CardFooter>
              {checkoutHref
                ? <TextLink variant="action" href={checkoutHref(plan.id, interval)}>Choose {plan.name}</TextLink>
                : <TextLink variant="action" href={quoteHref(plan, interval)} download={plan.id + '-' + interval + '-quote.txt'}>
                    Download {plan.name} quote
                  </TextLink>}
            </CardFooter>
          </Card>
        </GridItem>
      ))}
    </Grid>
  )
}
