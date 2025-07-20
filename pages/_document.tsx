import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* PWA Meta Tags */}
        <meta name="application-name" content="FoodToday" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FoodToday" />
        <meta name="description" content="Discover personalized recipes, search by ingredients, and save your favorites with FoodToday - your smart cooking companion." />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#ea6100" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#ea6100" />
        
        {/* Favicon and Icons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
        
        {/* Splash Screen Images for iOS */}
        <link rel="apple-touch-startup-image" href="/icons/apple-splash-2048-2732.png" sizes="2048x2732" />
        <link rel="apple-touch-startup-image" href="/icons/apple-splash-1668-2224.png" sizes="1668x2224" />
        <link rel="apple-touch-startup-image" href="/icons/apple-splash-1536-2048.png" sizes="1536x2048" />
        <link rel="apple-touch-startup-image" href="/icons/apple-splash-1125-2436.png" sizes="1125x2436" />
        <link rel="apple-touch-startup-image" href="/icons/apple-splash-1242-2208.png" sizes="1242x2208" />
        <link rel="apple-touch-startup-image" href="/icons/apple-splash-750-1334.png" sizes="750x1334" />
        <link rel="apple-touch-startup-image" href="/icons/apple-splash-640-1136.png" sizes="640x1136" />
        
        {/* Windows Tile Icons */}
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
        <meta name="msapplication-square70x70logo" content="/icons/icon-70x70.png" />
        <meta name="msapplication-square150x150logo" content="/icons/icon-150x150.png" />
        <meta name="msapplication-wide310x150logo" content="/icons/icon-310x150.png" />
        <meta name="msapplication-square310x310logo" content="/icons/icon-310x310.png" />
        
        {/* Security & Performance */}
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-src 'none';" />
        
        {/* Preconnect for Performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* OpenGraph Meta Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="CookEase - Personalized Recipe App" />
        <meta property="og:description" content="Discover personalized recipes, search by ingredients, and save your favorites with CookEase - your smart cooking companion." />
        <meta property="og:site_name" content="CookEase" />
        <meta property="og:url" content="https://cookease.app" />
        <meta property="og:image" content="/icons/icon-512x512.png" />
        
        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CookEase - Personalized Recipe App" />
        <meta name="twitter:description" content="Discover personalized recipes, search by ingredients, and save your favorites with CookEase - your smart cooking companion." />
        <meta name="twitter:image" content="/icons/icon-512x512.png" />
        
        {/* Additional Meta Tags */}
        <meta name="keywords" content="recipes, cooking, food, ingredients, personalized, meal planning, nutrition, healthy eating" />
        <meta name="author" content="CookEase Team" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
