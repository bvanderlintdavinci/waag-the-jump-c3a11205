import * as React from 'react'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="nl" dir="ltr">
    <Head />
    <Preview>Je verificatiecode</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Bevestig je identiteit</Heading>
        <Text style={text}>Gebruik de onderstaande code om je identiteit te bevestigen:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          Deze code verloopt binnenkort. Heb je dit niet aangevraagd? Dan kun je deze mail negeren.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Plus Jakarta Sans', Helvetica, Arial, sans-serif" }
const container = { padding: '32px 28px', maxWidth: '560px', border: '1px solid #E7E5E4', borderRadius: '16px', backgroundColor: '#FAFAF9' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#1C1917',
  margin: '0 0 20px',
}
const text = {
  fontSize: '14px',
  color: '#57534E',
  lineHeight: '1.5',
  margin: '0 0 25px',
}
const codeStyle = {
  fontFamily: 'Courier, monospace',
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#1C1917',
  margin: '0 0 30px',
}
const footer = { fontSize: '12px', color: '#A8A29E', margin: '30px 0 0' }
