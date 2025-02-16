flight-delay-insurance
├── app
│ ├── api
│ │ ├── auth
│ │ │ ├── [...nextauth]
│ │ │ │ └── route.ts
│ │ │ └── signup
│ │ │ └── route.ts
│ │ ├── flights
│ │ │ └── search
│ │ │ └── route.ts
│ │ ├── bookings
│ │ │ ├── confirmation
│ │ │ │ └── route.ts
│ │ │ └── route.ts
│ │ ├── create-checkout-session
│ │ │ └── route.ts
│ │ ├── user
│ │ │ └── profile
│ │ │ └── route.ts
│ │ ├── flight-status
│ │ │ └── route.ts
│ │ └── webhooks
│ │ └── stripe
│ │ └── route.ts
│ ├── signup
│ │ └── page.tsx
│ ├── login
│ │ └── page.tsx
│ ├── booking
│ │ ├── confirmation
│ │ │ └── page.tsx
│ │ └── page.tsx
│ ├── profile
│ │ └── page.tsx
│ ├── dashboard
│ │ └── page.tsx
│ ├── globals.css
│ ├── layout.tsx
│ └── page.tsx
├── components
│ ├── ui
│ │ ├── accordion.tsx
│ │ ├── alert-dialog.tsx
│ │ ├── alert.tsx
│ │ ├── aspect-ratio.tsx
│ │ ├── avatar.tsx
│ │ ├── badge.tsx
│ │ ├── breadcrumb.tsx
│ │ ├── button.tsx
│ │ ├── calendar.tsx
│ │ ├── card.tsx
│ │ ├── carousel.tsx
│ │ ├── chart.tsx
│ │ ├── checkbox.tsx
│ │ ├── collapsible.tsx
│ │ ├── command.tsx
│ │ ├── context-menu.tsx
│ │ ├── dialog.tsx
│ │ ├── drawer.tsx
│ │ ├── dropdown-menu.tsx
│ │ ├── form.tsx
│ │ ├── hover-card.tsx
│ │ ├── input-otp.tsx
│ │ ├── input.tsx
│ │ ├── label.tsx
│ │ ├── menubar.tsx
│ │ ├── navigation-menu.tsx
│ │ ├── pagination.tsx
│ │ ├── popover.tsx
│ │ ├── progress.tsx
│ │ ├── radio-group.tsx
│ │ ├── resizable.tsx
│ │ ├── scroll-area.tsx
│ │ ├── select.tsx
│ │ ├── separator.tsx
│ │ ├── sheet.tsx
│ │ ├── sidebar.tsx
│ │ ├── skeleton.tsx
│ │ ├── slider.tsx
│ │ ├── sonner.tsx
│ │ ├── switch.tsx
│ │ ├── table.tsx
│ │ ├── tabs.tsx
│ │ ├── textarea.tsx
│ │ ├── toast.tsx
│ │ ├── toaster.tsx
│ │ ├── toggle-group.tsx
│ │ ├── toggle.tsx
│ │ ├── tooltip.tsx
│ │ ├── use-mobile.tsx
│ │ ├── use-toast.ts
│ │ ├── icons.tsx
│ │ └── date-picker.tsx
│ ├── providers
│ │ └── SessionProvider.tsx
│ ├── theme-provider.tsx
│ ├── ErrorBoundary.tsx
│ ├── LoadingSpinner.tsx
│ └── PricingCard.tsx
├── hooks
│ ├── use-mobile.tsx
│ └── use-toast.ts
├── lib
│ ├── utils.ts
│ ├── email.ts
│ ├── emailTemplates.ts
│ ├── airports.ts
│ └── flightService.ts
├── public
│ ├── placeholder-logo.png
│ ├── placeholder-logo.svg
│ ├── placeholder-user.jpg
│ ├── placeholder.jpg
│ └── placeholder.svg
├── prisma
│ └── schema.prisma
├── store
│ └── bookingStore.ts
├── .next
│ ├── cache
│ │ ├── swc
│ │ │ └── plugins
│ │ │ ├── v7_windows_x86_64_4.0.0
│ │ │ └── v7_windows_x86_64_0.106.15
│ │ ├── webpack
│ │ │ ├── client-development
│ │ │ │ ├── 1.pack.gz
│ │ │ │ ├── 0.pack.gz
│ │ │ │ ├── index.pack.gz
│ │ │ │ └── index.pack.gz.old
│ │ │ ├── server-development
│ │ │ │ ├── 0.pack.gz
│ │ │ │ ├── index.pack.gz
│ │ │ │ └── index.pack.gz.old
│ │ │ └── client-development-fallback
│ │ │ ├── 0.pack.gz
│ │ │ └── index.pack.gz.old
│ │ └── .rscinfo
│ ├── server
│ │ ├── middleware-build-manifest.js
│ │ ├── next-font-manifest.js
│ │ ├── next-font-manifest.json
│ │ ├── middleware-react-loadable-manifest.js
│ │ ├── app-paths-manifest.json
│ │ ├── pages-manifest.json
│ │ ├── server-reference-manifest.js
│ │ ├── server-reference-manifest.json
│ │ ├── interception-route-rewrite-manifest.js
│ │ └── middleware-manifest.json
│ ├── static
│ │ ├── development
│ │ │ ├── \_ssgManifest.js
│ │ │ └── \_buildManifest.js
│ │ └── chunks
│ │ └── polyfills.js
│ ├── types
│ │ └── package.json
│ ├── package.json
│ ├── react-loadable-manifest.json
│ ├── build-manifest.json
│ ├── app-build-manifest.json
│ └── trace
├── scripts
│ ├── test-db.ts
│ └── test-db.js
├── z.docs
│ ├── api
│ │ ├── Pricing API.txt
│ │ ├── Airport Schedule API.txt
│ │ └── Flight Tracking API.txt
│ ├── stripe-test-cards.txt
│ └── project-structure.md
├── .gitignore
├── components.json
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── middleware.ts
├── next-env.d.ts
├── package-lock.json
├── .env.local
└── .env
