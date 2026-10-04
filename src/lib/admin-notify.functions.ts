import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const inputSchema = z.object({
  kind: z.enum(['report', 'block', 'idea', 'abuse']),
  message: z.string().min(3).max(2500),
  extra: z.string().max(500).optional(),
})

const KIND_LABELS: Record<string, string> = {
  report: 'Melding over een lid',
  block: 'Blokkering (reden)',
  idea: 'Idee of advies',
  abuse: 'Meld ongewenst gedrag',
}

/**
 * Stuurt een e-mail naar de beheerder bij elke nieuwe melding, blokkering,
 * idee of misbruikmelding. Mislukt de e-mail, dan blijft de melding zelf
 * gewoon bewaard — de fout wordt alleen gelogd.
 */
export const notifyAdmin = createServerFn({ method: 'POST' })
  .inputValidator((data) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const { sendTemplateEmail } = await import('@/lib/email-templates/send-email')
      await sendTemplateEmail('admin-notification', 'dare2meet@proton.me', {
        templateData: {
          kindLabel: KIND_LABELS[data.kind] ?? data.kind,
          message: data.message,
          extra: data.extra,
          submittedAt: new Date().toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' }),
        },
      })
    } catch (error) {
      console.error('Beheerdersmelding per e-mail mislukt:', error)
    }
    return { ok: true }
  })
