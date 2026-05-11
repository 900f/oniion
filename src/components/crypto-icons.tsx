import React from 'react';

type P = { size?: number };

// Each coin rendered as a proper SVG icon
export const CryptoIcons: Record<string, React.FC<P>> = {
  eth: ({ size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#627EEA" fillOpacity="0.15"/>
      <path d="M16 5l-7 11.5 7 4 7-4L16 5z" fill="#627EEA" opacity="0.7"/>
      <path d="M16 22.5l-7-7 7 9.5 7-9.5-7 7z" fill="#627EEA"/>
    </svg>
  ),
  btc: ({ size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#F7931A" fillOpacity="0.15"/>
      <path d="M21 13.5c.4-2.5-1.5-3.8-4-4.7l.8-3.2-2-.5-.8 3.1c-.5-.1-1-.2-1.6-.4l.8-3.2-2-.5-.8 3.2c-.4-.1-.9-.2-1.3-.3l-2.7-.7-.5 2.1s1.5.3 1.4.4c.8.2 1 .7.9 1.1l-2.2 8.8c-.1.3-.4.7-1 .5.02.03-1.4-.35-1.4-.35l-1 2.3 2.6.6 1.4.4-.8 3.2 2 .5.8-3.2c.5.1 1 .3 1.5.4l-.8 3.1 2 .5.8-3.2c3.4.6 5.9.4 7-2.7.9-2.5 0-3.9-1.8-4.8 1.3-.3 2.3-1.1 2.6-2.8zm-4.7 6.6c-.6 2.5-4.9 1.1-6.3.8l1.1-4.5c1.4.4 5.9 1 5.2 3.7zm.6-6.7c-.6 2.3-4.1 1.1-5.3.8l1-4.1c1.2.3 5 .9 4.3 3.3z" fill="#F7931A"/>
    </svg>
  ),
  sol: ({ size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#9945FF" fillOpacity="0.15"/>
      <path d="M9 20.5h11.5a.5.5 0 0 1 .35.85l-2 2a.5.5 0 0 1-.35.15H7a.5.5 0 0 1-.35-.85l2-2A.5.5 0 0 1 9 20.5z" fill="url(#sg)"/>
      <path d="M9 14h11.5a.5.5 0 0 1 .35.85l-2 2a.5.5 0 0 1-.35.15H7a.5.5 0 0 1-.35-.85l2-2A.5.5 0 0 1 9 14z" fill="url(#sg)"/>
      <path d="M20.5 8.5a.5.5 0 0 1 .35.15l2 2A.5.5 0 0 1 22.5 11.5H11a.5.5 0 0 1-.35-.15l-2-2A.5.5 0 0 1 9 8.5H20.5z" fill="url(#sg)"/>
      <defs>
        <linearGradient id="sg" x1="6" y1="16" x2="23" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9945FF"/>
          <stop offset="1" stopColor="#14F195"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  usdt: ({ size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#26A17B" fillOpacity="0.15"/>
      <path d="M17 17.5c-.3.02-.6.03-1 .03s-.7-.01-1-.03v-2.5h-4V13h10v2h-4v2.5z" fill="#26A17B"/>
      <path d="M16 18c2.76 0 5-.67 5-1.5S18.76 15 16 15s-5 .67-5 1.5S13.24 18 16 18z" fill="#26A17B"/>
      <path d="M12 9h8v2H12V9zM10 21l2 2h8l2-2H10z" fill="#26A17B" opacity="0.6"/>
    </svg>
  ),
  bnb: ({ size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#F3BA2F" fillOpacity="0.15"/>
      <path d="M16 8l2.5 2.5L21 8l2.5 2.5L16 18 9.5 11.5 12 9 14.5 10.5 16 8z" fill="#F3BA2F" opacity="0.6"/>
      <path d="M16 24l-6.5-6.5 2.5-2.5L16 19l4-4 2.5 2.5L16 24z" fill="#F3BA2F"/>
      <path d="M8 16l2-2 2 2-2 2-2-2zM22 16l-2-2-2 2 2 2 2-2z" fill="#F3BA2F"/>
    </svg>
  ),
  xrp: ({ size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#346AA9" fillOpacity="0.15"/>
      <path d="M22 8h2.5l-5.5 5.3c-1.7 1.6-4.3 1.6-6 0L7.5 8H10l4.5 4.3c.8.8 2.2.8 3 0L22 8zM10 24H7.5l5.5-5.3c1.7-1.6 4.3-1.6 6 0L24.5 24H22l-4.5-4.3c-.8-.8-2.2-.8-3 0L10 24z" fill="#346AA9"/>
    </svg>
  ),
  ltc: ({ size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#BFBBBB" fillOpacity="0.15"/>
      <path d="M16 5C9.9 5 5 9.9 5 16s4.9 11 11 11 11-4.9 11-11S22.1 5 16 5zm-1.7 14.5l.7-2.8-1.5.5.4-1.7 1.5-.5 1.6-6h2.2l-1.4 5.3 1.5-.5-.4 1.7-1.5.5-.8 3h-2.3v.5h.9v-1z" fill="#BFBBBB"/>
    </svg>
  ),
  doge: ({ size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#C2A633" fillOpacity="0.15"/>
      <path d="M11 9h5c4.4 0 7 2.7 7 7s-2.6 7-7 7h-5V9zm2 2v10h3c3 0 5-1.8 5-5s-2-5-5-5h-3z" fill="#C2A633"/>
      <path d="M9 15h6v2H9v-2z" fill="#C2A633"/>
    </svg>
  ),
  ada: ({ size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#0D1E2E" fillOpacity="0.3"/>
      <circle cx="16" cy="9" r="1.5" fill="#0033AD"/>
      <circle cx="16" cy="23" r="1.5" fill="#0033AD"/>
      <circle cx="9" cy="12.5" r="1.5" fill="#0033AD"/>
      <circle cx="23" cy="12.5" r="1.5" fill="#0033AD"/>
      <circle cx="9" cy="19.5" r="1.5" fill="#0033AD"/>
      <circle cx="23" cy="19.5" r="1.5" fill="#0033AD"/>
      <circle cx="16" cy="16" r="2.5" fill="#0033AD" opacity="0.6"/>
    </svg>
  ),
  avax: ({ size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#E84142" fillOpacity="0.15"/>
      <path d="M16 7l9 16H7L16 7zm0 5l-5.5 9h11L16 12z" fill="#E84142"/>
    </svg>
  ),
  matic: ({ size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#8247E5" fillOpacity="0.15"/>
      <path d="M20.5 13.5L16 11l-4.5 2.5v5L16 21l4.5-2.5v-5zm-2 4.2L16 19l-2.5-1.3v-3.4L16 13l2.5 1.3v3.4z" fill="#8247E5"/>
      <path d="M22 10.5L16 7l-6 3.5v7L16 21l6-3.5v-7z" fill="#8247E5" opacity="0.3"/>
    </svg>
  ),
  trx: ({ size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#FF0013" fillOpacity="0.15"/>
      <path d="M23 11l-14 2 8 12 6-14zm-9.5 9.5L9.5 12.5 20.5 11l-7 9.5z" fill="#FF0013"/>
    </svg>
  ),
};

export const CRYPTO_META: Record<string, { name: string; color: string }> = {
  eth:   { name: 'Ethereum',  color: '#627EEA' },
  btc:   { name: 'Bitcoin',   color: '#F7931A' },
  sol:   { name: 'Solana',    color: '#9945FF' },
  usdt:  { name: 'Tether',    color: '#26A17B' },
  bnb:   { name: 'BNB',       color: '#F3BA2F' },
  xrp:   { name: 'XRP',       color: '#346AA9' },
  ltc:   { name: 'Litecoin',  color: '#BFBBBB' },
  doge:  { name: 'Dogecoin',  color: '#C2A633' },
  ada:   { name: 'Cardano',   color: '#0033AD' },
  avax:  { name: 'Avalanche', color: '#E84142' },
  matic: { name: 'Polygon',   color: '#8247E5' },
  trx:   { name: 'TRON',      color: '#FF0013' },
};
