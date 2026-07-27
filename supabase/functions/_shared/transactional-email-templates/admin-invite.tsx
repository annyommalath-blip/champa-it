/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  inviteEmail?: string
  signupUrl?: string
  invitedBy?: string
}

const SITE_URL = 'https://champaenterprise.com'

const Email = ({
  inviteEmail = '',
  signupUrl = `${SITE_URL}/auth`,
  invitedBy = 'Champa Enterprise',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You've been invited to join the Champa Enterprise admin team</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>CHAMPA ENTERPRISE</Text>
        <Heading style={h1}>You're invited to be an admin</Heading>
        <Text style={text}>
          {invitedBy} has invited{inviteEmail ? ` ${inviteEmail}` : ' you'} to join the Champa
          Enterprise admin portal.
        </Text>
        <Section style={{ margin: '28px 0' }}>
          <Button href={signupUrl} style={button}>
            Create your admin account
          </Button>
        </Section>
        <Section style={note}>
          <Text style={noteText}>
            Important: you must sign up using this exact email address
            {inviteEmail ? ` (${inviteEmail})` : ''}. After signing up, a Super Admin will approve
            your access before you can use the admin portal.
          </Text>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          If you weren't expecting this invitation, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'You have been invited as a Champa Enterprise admin',
  displayName: 'Admin invitation',
  previewData: {
    inviteEmail: 'teammate@company.com',
    signupUrl: `${SITE_URL}/auth`,
    invitedBy: 'Champa Enterprise',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'DM Sans, Helvetica, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const brand = {
  fontSize: '11px',
  letterSpacing: '2px',
  color: '#8a8a8f',
  fontWeight: 700,
  margin: '0 0 18px',
}
const h1 = { fontSize: '24px', color: '#111113', margin: '0 0 12px', fontWeight: 700 }
const text = { fontSize: '15px', lineHeight: '24px', color: '#3c3c43', margin: '0 0 8px' }
const button = {
  backgroundColor: '#ECC61D',
  color: '#111113',
  fontSize: '15px',
  fontWeight: 700,
  padding: '13px 24px',
  borderRadius: '14px',
  textDecoration: 'none',
  display: 'inline-block',
}
const note = { backgroundColor: '#F7F7F8', borderRadius: '14px', padding: '14px 16px' }
const noteText = { fontSize: '13px', lineHeight: '20px', color: '#57575e', margin: 0 }
const hr = { borderColor: '#ececee', margin: '28px 0 16px' }
const footer = { fontSize: '12px', color: '#8a8a8f', margin: 0 }
