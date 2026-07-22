/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body,
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

interface OrderItem {
  name?: string
  quantity?: number
  price?: number
}

interface Props {
  customerName?: string
  orderId?: string
  orderTotal?: string
  currency?: string
  deliveryMethod?: string
  deliveryAddress?: string
  paymentMethod?: string
  status?: string
  items?: OrderItem[]
}

const Email = ({
  customerName = 'Customer',
  orderId = '',
  orderTotal = '',
  currency = 'USD',
  deliveryMethod = '',
  deliveryAddress = '',
  paymentMethod = '',
  status = 'Confirmed',
  items = [],
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your Champa Enterprise order {orderId ? `#${orderId.slice(0, 8)}` : ''} is confirmed</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>Order Confirmed</Heading>
          <Text style={subtle}>Champa Enterprise</Text>
        </Section>

        <Text style={greeting}>Hi {customerName},</Text>
        <Text style={paragraph}>
          Thanks for your order. We've confirmed it and it's now being prepared. You'll receive
          updates as its status changes.
        </Text>

        <Section style={card}>
          <Text style={label}>Order Number</Text>
          <Text style={value}>#{orderId.slice(0, 8).toUpperCase()}</Text>
          <Hr style={hr} />
          <Text style={label}>Status</Text>
          <Text style={badge}>{status}</Text>
          <Hr style={hr} />
          {deliveryMethod ? (
            <>
              <Text style={label}>Delivery Method</Text>
              <Text style={value}>{deliveryMethod}</Text>
            </>
          ) : null}
          {deliveryAddress ? (
            <>
              <Text style={label}>Delivery Address</Text>
              <Text style={value}>{deliveryAddress}</Text>
            </>
          ) : null}
          {paymentMethod ? (
            <>
              <Hr style={hr} />
              <Text style={label}>Payment Method</Text>
              <Text style={value}>{paymentMethod}</Text>
            </>
          ) : null}
        </Section>

        {items.length > 0 ? (
          <Section style={card}>
            <Text style={sectionTitle}>Items</Text>
            {items.map((it, i) => (
              <Text key={i} style={itemRow}>
                {(it.quantity ?? 1)}× {it.name ?? 'Item'}
                {typeof it.price === 'number' ? ` — ${currency} ${(it.price * (it.quantity ?? 1)).toFixed(2)}` : ''}
              </Text>
            ))}
            <Hr style={hr} />
            <Text style={total}>Total: {currency} {orderTotal}</Text>
          </Section>
        ) : null}

        <Text style={paragraph}>
          You can track your order anytime from your account. If you have any questions, just
          reply to this email or contact our support team.
        </Text>

        <Text style={footer}>Champa Enterprise · Vientiane, Laos</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Props) =>
    `Order Confirmed · #${(data.orderId ?? '').slice(0, 8).toUpperCase() || 'Champa Enterprise'}`,
  displayName: 'Order Confirmation',
  previewData: {
    customerName: 'Alex',
    orderId: 'abcdef1234567890',
    orderTotal: '129.00',
    currency: 'USD',
    deliveryMethod: 'Delivery',
    deliveryAddress: '123 Samsenthai Rd, Vientiane',
    paymentMethod: 'Card',
    status: 'Confirmed',
    items: [
      { name: 'Cisco Catalyst Switch', quantity: 1, price: 129 },
    ],
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = { padding: '32px 24px', maxWidth: '560px', margin: '0 auto' }
const header = { paddingBottom: '8px' }
const h1 = { color: '#111111', fontSize: '26px', fontWeight: 700, margin: '0 0 4px 0' }
const subtle = { color: '#8a8a8a', fontSize: '13px', margin: 0 }
const greeting = { color: '#111111', fontSize: '16px', marginTop: '24px' }
const paragraph = { color: '#3f3f46', fontSize: '15px', lineHeight: '22px' }
const card = {
  background: '#F7F7F8',
  borderRadius: '16px',
  padding: '20px',
  margin: '20px 0',
}
const label = { color: '#71717a', fontSize: '12px', margin: '6px 0 2px 0', textTransform: 'uppercase' as const, letterSpacing: '0.4px' }
const value = { color: '#111111', fontSize: '15px', margin: '0 0 8px 0' }
const badge = {
  display: 'inline-block',
  background: '#ECC61D',
  color: '#111111',
  padding: '4px 10px',
  borderRadius: '999px',
  fontSize: '13px',
  fontWeight: 600,
  margin: '0 0 8px 0',
}
const sectionTitle = { color: '#111111', fontSize: '15px', fontWeight: 600, margin: '0 0 8px 0' }
const itemRow = { color: '#27272a', fontSize: '14px', margin: '4px 0' }
const total = { color: '#111111', fontSize: '16px', fontWeight: 700, margin: '8px 0 0 0' }
const hr = { borderColor: '#e5e7eb', margin: '12px 0' }
const footer = { color: '#a1a1aa', fontSize: '12px', textAlign: 'center' as const, marginTop: '24px' }
