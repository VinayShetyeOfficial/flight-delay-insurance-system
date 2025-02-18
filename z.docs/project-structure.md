flight-delay-insurance
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
│ ├── PricingCard.tsx
│ └── flight-card.tsx
├── hooks
│ ├── use-mobile.tsx
│ └── use-toast.ts
├── lib
│ ├── utils.ts
│ ├── email.ts
│ ├── emailTemplates.ts
│ ├── airports.ts
│ ├── flightService.ts
│ └── airlineLogos.ts
├── prisma
│ └── schema.prisma
├── public
│ ├── assets
│ │ ├── airlines
│ │ │ ├── airline-american.png
│ │ │ ├── airline-delta.png
│ │ │ ├── airline-jetblue.png
│ │ │ ├── airline-southwest.png
│ │ │ ├── airline-united.png
│ │ │ ├── airline-lufthansa.png
│ │ │ ├── airline-emirates.png
│ │ │ ├── airline-qatar.png
│ │ │ ├── airline-british.png
│ │ │ └── Better Site.txt
│ │ ├── icons
│ │ ├── images
│ │ │ └── misc
│ │ └── branding
│ └── Note.txt
├── scripts
│ ├── test-db.ts
│ └── test-db.js
├── store
│ └── bookingStore.ts
├── z.docs
│ ├── api
│ │ ├── Amadeus-Flight-API
│ │ │ ├── Access-Token-generation.txt
│ │ │ ├── Request-Type-1.txt
│ │ │ ├── Request-Type-2.txt
│ │ │ └── All-API-Services
│ │ ├── Pricing API.txt
│ │ ├── Airport Schedule API.txt
│ │ └── Flight Tracking API.txt
│ ├── stripe-test-cards.txt
│ └── project-structure.md
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
├── .env
├── .gitignore
├── components.json
├── middleware.ts
├── next.config.mjs
├── next-env.d.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
