import * as React from 'react'

import { Body, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'

export interface WeeklyReportProps {
  periodLabel: string
  visitors: number
  signups: number
  chatMessages: number
  activityBookings: number
  averageMinutes: number
  totalHours: number
}

const rows = (p: WeeklyReportProps) => [
  ['Bezoekers', String(p.visitors)],
  ['Nieuwe registraties', String(p.signups)],
  ['Chatberichten', String(p.chatMessages)],
  ['Aanmeldingen activiteiten', String(p.activityBookings)],
  ['Gemiddelde tijd per bezoeker', `${p.averageMinutes} minuten`],
  ['Totale tijd op de site', `${p.totalHours} uur`],
]

export const WeeklyReportEmail = (props: WeeklyReportProps) => (
  <Html lang="nl" dir="ltr">
    <Head />
    <Preview>Weekrapport Dare2Meet — {props.periodLabel}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Weekrapport Dare2Meet</Heading>
        <Text style={text}>Periode: {props.periodLabel}</Text>
        <table style={table} cellPadding={0} cellSpacing={0}>
          <tbody>
            {rows(props).map(([label, value]) => (
              <tr key={label}>
                <td style={cellLabel}>{label}</td>
                <td style={cellValue}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Text style={footer}>
          Dit rapport wordt elke maandagochtend automatisch verstuurd. Bezoekers worden anoniem geteld.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default WeeklyReportEmail

export const template = {
  component: WeeklyReportEmail,
  subject: (data: Record<string, any>) => `Weekrapport Dare2Meet — ${data['periodLabel'] ?? ''}`,
  displayName: 'Weekrapport',
  to: 'dare2meet@proton.me',
  previewData: {
    periodLabel: '8 t/m 14 september 2026',
    visitors: 128,
    signups: 9,
    chatMessages: 54,
    activityBookings: 12,
    averageMinutes: 6,
    totalHours: 13,
  },
}

const main = { backgroundColor: '#ffffff', fontFamily: "'Plus Jakarta Sans', Helvetica, Arial, sans-serif" }
const container = {
  padding: '32px 28px',
  maxWidth: '560px',
  border: '1px solid #E7E5E4',
  borderRadius: '16px',
  backgroundColor: '#FAFAF9',
}
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#1C1917', margin: '0 0 12px' }
const text = { fontSize: '14px', color: '#57534E', lineHeight: '1.5', margin: '0 0 20px' }
const table = { width: '100%', borderCollapse: 'collapse' as const }
const cellLabel = {
  fontSize: '14px',
  color: '#57534E',
  padding: '10px 0',
  borderBottom: '1px solid #E7E5E4',
}
const cellValue = {
  fontSize: '14px',
  color: '#1C1917',
  fontWeight: 'bold' as const,
  textAlign: 'right' as const,
  padding: '10px 0',
  borderBottom: '1px solid #E7E5E4',
}
const footer = { fontSize: '12px', color: '#A8A29E', margin: '24px 0 0' }
