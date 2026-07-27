/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface OrderItem {
  name?: string
  quantity?: number
  price?: number
  imageUrl?: string
  productUrl?: string
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

const SITE_URL = 'https://champaenterprise.com'

const Email = ({
  customerName = 'Customer',
  orderId = '',
  orderTotal = '',
  currency = 'LAK',
  deliveryMethod = '',
  deliveryAddress = '',
  paymentMethod = '',
  status = 'Confirmed',
  items = [],
}: Props) => {
  const shortId = orderId.slice(0, 8).toUpperCase()
  const itemCount = items.reduce((n, i) => n + (i.quantity ?? 1), 0)
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your Champa Enterprise order #{shortId} is confirmed</Preview>
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
            <Text style={value}>#{shortId}</Text>

            {items.length > 0 ? (
              <>
                <Hr style={hr} />
                <Text style={label}>Items ({itemCount})</Text>
                {items.map((it, i) => {
                  const line = (
                    <Row key={i} style={itemRowWrap}>
                      <Column style={imgCol}>
                        {it.imageUrl ? (
                          <Img
                            src={it.imageUrl}
                            width="64"
                            height="64"
                            alt={it.name ?? 'Item'}
                            style={itemImg}
                          />
                        ) : (
                          <div style={itemImgPlaceholder} />
                        )}
                      </Column>
                      <Column style={itemInfoCol}>
                        <Text style={itemName}>{it.name ?? 'Item'}</Text>
                        <Text style={itemMeta}>
                          Qty {it.quantity ?? 1}
                          {typeof it.price === 'number'
                            ? ` · ${currency} ${(it.price * (it.quantity ?? 1)).toLocaleString('en-US', { minimumFractionDigits: currency.toUpperCase() === 'LAK' ? 0 : 2, maximumFractionDigits: currency.toUpperCase() === 'LAK' ? 0 : 2 })}`
                            : ''}
                        </Text>
                        {it.productUrl ? (
                          <Link href={it.productUrl} style={itemLink}>
                            View product →
                          </Link>
                        ) : null}
                      </Column>
                    </Row>
                  )
                  return it.productUrl ? (
                    <Link key={i} href={it.productUrl} style={itemLinkWrap}>
                      {line}
                    </Link>
                  ) : (
                    line
                  )
                })}
                <Hr style={hr} />
                <Text style={total}>Total: {currency} {orderTotal}</Text>
              </>
            ) : null}

            <Hr style={hr} />
            <Text style={label}>Status</Text>
            <Text style={badge}>{status}</Text>

            {deliveryMethod ? (
              <>
                <Hr style={hr} />
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

          <Section style={{ textAlign: 'center' as const }}>
            <Button href={`${SITE_URL}/shop`} style={cta}>
              Continue Shopping
            </Button>
          </Section>

          <Text style={paragraph}>
            You can track your order anytime from your account. If you have any questions, just
            reply to this email or contact our support team.
          </Text>

          <Text style={footer}>Champa Enterprise · Vientiane, Laos</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (data: Props) =>
    `Order Confirmed · #${(data.orderId ?? '').slice(0, 8).toUpperCase() || 'Champa Enterprise'}`,
  displayName: 'Order Confirmation',
  previewData: {
    customerName: 'Alex',
    orderId: 'abcdef1234567890',
    orderTotal: '129.00',
    currency: 'LAK',
    deliveryMethod: 'Delivery',
    deliveryAddress: '123 Samsenthai Rd, Vientiane',
    paymentMethod: 'Card',
    status: 'Confirmed',
    items: [
      {
        name: 'Cisco Catalyst Switch',
        quantity: 1,
        price: 129,
        imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200',
        productUrl: 'https://champaenterprise.com/shop/abcdef12',
      },
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
const label = {
  color: '#71717a',
  fontSize: '12px',
  margin: '6px 0 2px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.4px',
}
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
const itemRowWrap = { margin: '10px 0' }
const imgCol = { width: '76px', verticalAlign: 'top' as const }
const itemInfoCol = { verticalAlign: 'top' as const, paddingLeft: '4px' }
const itemImg = {
  borderRadius: '12px',
  border: '1px solid #e5e7eb',
  background: '#ffffff',
  objectFit: 'cover' as const,
}
const itemImgPlaceholder = {
  width: '64px',
  height: '64px',
  borderRadius: '12px',
  background: '#eeeeef',
}
const itemName = { color: '#111111', fontSize: '14px', fontWeight: 600, margin: '0 0 2px 0' }
const itemMeta = { color: '#52525b', fontSize: '13px', margin: '0 0 4px 0' }
const itemLink = { color: '#111111', fontSize: '13px', fontWeight: 600, textDecoration: 'underline' }
const itemLinkWrap = { textDecoration: 'none', color: 'inherit', display: 'block' }
const total = { color: '#111111', fontSize: '16px', fontWeight: 700, margin: '8px 0 0 0' }
const hr = { borderColor: '#e5e7eb', margin: '12px 0' }
const cta = {
  background: '#ECC61D',
  color: '#111111',
  padding: '12px 22px',
  borderRadius: '999px',
  fontSize: '14px',
  fontWeight: 700,
  textDecoration: 'none',
  display: 'inline-block',
  margin: '4px 0 20px 0',
}
const footer = { color: '#a1a1aa', fontSize: '12px', textAlign: 'center' as const, marginTop: '24px' }
