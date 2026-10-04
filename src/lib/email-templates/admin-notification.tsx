import * as React from 'react'
import { Html, Head, Body, Container, Heading, Text, Hr, Section } from '@react-email/components'

export interface AdminNotificationData {
  kindLabel: string
  message: string
  extra?: string | undefined
  submittedAt: string
}

function AdminNotificationEmail({ kindLabel, message, extra, submittedAt }: AdminNotificationData) {
  return (
    <Html lang="nl">
      <Head />
      <Body style={{ backgroundColor: '#f6f4f1', fontFamily: 'Arial, sans-serif', margin: 0, padding: '24px 0' }}>
        <Container style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 24, maxWidth: 560, margin: '0 auto' }}>
          <Heading as="h1" style={{ fontSize: 20, color: '#1f2a44', margin: '0 0 8px' }}>
            Nieuwe melding op Dare2Meet
          </Heading>
          <Text style={{ fontSize: 14, color: '#555', margin: '0 0 16px' }}>
            Type: <strong>{kindLabel}</strong> · {submittedAt}
          </Text>
          <Section style={{ backgroundColor: '#f6f4f1', borderRadius: 8, padding: 16 }}>
            <Text style={{ fontSize: 14, color: '#222', whiteSpace: 'pre-wrap', margin: 0 }}>{message}</Text>
          </Section>
          {extra ? (
            <Text style={{ fontSize: 13, color: '#555', marginTop: 16 }}>{extra}</Text>
          ) : null}
          <Hr style={{ margin: '20px 0', borderColor: '#e5e0da' }} />
          <Text style={{ fontSize: 12, color: '#888', margin: 0 }}>
            Bekijk en handel deze melding af in het beheerderspaneel van Dare2Meet (/admin).
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: AdminNotificationEmail,
  subject: (d: Record<string, any>) => `Dare2Meet-melding: ${d['kindLabel'] ?? 'nieuw bericht'}`,
  displayName: 'Beheerdersmelding',
  to: 'dare2meet@proton.me',
  previewData: {
    kindLabel: 'Meld ongewenst gedrag',
    message: 'Voorbeeld van een melding.',
    submittedAt: new Date().toLocaleString('nl-NL'),
  },
}
