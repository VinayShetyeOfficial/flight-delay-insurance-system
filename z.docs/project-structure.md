📦flight-delay-insurance
┣ 📂app
┃ ┣ 📂api
┃ ┃ ┣ 📂auth
┃ ┃ ┃ ┣ 📂[...nextauth]
┃ ┃ ┃ ┃ ┗ 📜route.ts
┃ ┃ ┃ ┣ 📂signup
┃ ┃ ┃ ┃ ┗ 📜route.ts
┃ ┃ ┃ ┣ 📂verify
┃ ┃ ┃ ┃ ┗ 📜route.ts
┃ ┃ ┃ ┣ 📂resend-verification
┃ ┃ ┃ ┃ ┗ 📜route.ts
┃ ┃ ┃ ┣ 📂forgot-password
┃ ┃ ┃ ┃ ┗ 📜route.ts
┃ ┃ ┃ ┗ 📂reset-password
┃ ┃ ┃ ┃ ┗ 📜route.ts
┃ ┃ ┣ 📂flights
┃ ┃ ┃ ┗ 📂search
┃ ┃ ┃ ┃ ┗ 📜route.ts
┃ ┃ ┣ 📂bookings
┃ ┃ ┃ ┣ 📂confirmation
┃ ┃ ┃ ┃ ┗ 📜route.ts
┃ ┃ ┃ ┗ 📜route.ts
┃ ┃ ┣ 📂create-checkout-session
┃ ┃ ┃ ┗ 📜route.ts
┃ ┃ ┣ 📂user
┃ ┃ ┃ ┗ 📂profile
┃ ┃ ┃ ┃ ┗ 📜route.ts
┃ ┃ ┣ 📂flight-status
┃ ┃ ┃ ┗ 📜route.ts
┃ ┃ ┗ 📂webhooks
┃ ┃ ┃ ┗ 📂stripe
┃ ┃ ┃ ┃ ┗ 📜route.ts
┃ ┣ 📂signup
┃ ┃ ┗ 📜page.tsx
┃ ┣ 📂login
┃ ┃ ┣ 📜page.tsx
┃ ┃ ┗ 📜forgot-password.tsx
┃ ┣ 📂booking
┃ ┃ ┗ 📜page.tsx
┃ ┣ 📂profile
┃ ┃ ┗ 📜page.tsx
┃ ┣ 📂dashboard
┃ ┃ ┗ 📜page.tsx
┃ ┣ 📂(auth)
┃ ┃ ┗ 📂verify
┃ ┃ ┃ ┗ 📜page.tsx
┃ ┣ 📂reset-password
┃ ┃ ┗ 📜page.tsx
┃ ┣ 📜globals.css
┃ ┣ 📜layout.tsx
┃ ┗ 📜page.tsx
┣ 📂components
┃ ┣ 📂ui
┃ ┃ ┣ 📜accordion.tsx
┃ ┃ ┣ 📜alert-dialog.tsx
┃ ┃ ┣ 📜alert.tsx
┃ ┃ ┣ 📜aspect-ratio.tsx
┃ ┃ ┣ 📜avatar.tsx
┃ ┃ ┣ 📜badge.tsx
┃ ┃ ┣ 📜breadcrumb.tsx
┃ ┃ ┣ 📜button.tsx
┃ ┃ ┣ 📜calendar.tsx
┃ ┃ ┣ 📜card.tsx
┃ ┃ ┣ 📜carousel.tsx
┃ ┃ ┣ 📜chart.tsx
┃ ┃ ┣ 📜checkbox.tsx
┃ ┃ ┣ 📜collapsible.tsx
┃ ┃ ┣ 📜command.tsx
┃ ┃ ┣ 📜context-menu.tsx
┃ ┃ ┣ 📜dialog.tsx
┃ ┃ ┣ 📜drawer.tsx
┃ ┃ ┣ 📜dropdown-menu.tsx
┃ ┃ ┣ 📜form.tsx
┃ ┃ ┣ 📜hover-card.tsx
┃ ┃ ┣ 📜input-otp.tsx
┃ ┃ ┣ 📜input.tsx
┃ ┃ ┣ 📜label.tsx
┃ ┃ ┣ 📜menubar.tsx
┃ ┃ ┣ 📜navigation-menu.tsx
┃ ┃ ┣ 📜pagination.tsx
┃ ┃ ┣ 📜popover.tsx
┃ ┃ ┣ 📜progress.tsx
┃ ┃ ┣ 📜radio-group.tsx
┃ ┃ ┣ 📜resizable.tsx
┃ ┃ ┣ 📜scroll-area.tsx
┃ ┃ ┣ 📜select.tsx
┃ ┃ ┣ 📜separator.tsx
┃ ┃ ┣ 📜sheet.tsx
┃ ┃ ┣ 📜sidebar.tsx
┃ ┃ ┣ 📜skeleton.tsx
┃ ┃ ┣ 📜slider.tsx
┃ ┃ ┣ 📜sonner.tsx
┃ ┃ ┣ 📜switch.tsx
┃ ┃ ┣ 📜table.tsx
┃ ┃ ┣ 📜tabs.tsx
┃ ┃ ┣ 📜textarea.tsx
┃ ┃ ┣ 📜toast.tsx
┃ ┃ ┣ 📜toaster.tsx
┃ ┃ ┣ 📜toggle-group.tsx
┃ ┃ ┣ 📜toggle.tsx
┃ ┃ ┣ 📜tooltip.tsx
┃ ┃ ┣ 📜use-mobile.tsx
┃ ┃ ┣ 📜use-toast.ts
┃ ┃ ┣ 📜icons.tsx
┃ ┃ ┣ 📜date-picker.tsx
┃ ┃ ┣ 📜currency-selector.tsx
┃ ┃ ┗ 📜otp-input.tsx
┃ ┣ 📂providers
┃ ┃ ┗ 📜SessionProvider.tsx
┃ ┣ 📜theme-provider.tsx
┃ ┣ 📜ErrorBoundary.tsx
┃ ┣ 📜LoadingSpinner.tsx
┃ ┣ 📜PricingCard.tsx
┃ ┣ 📜flight-card.tsx
┃ ┣ 📜location-suggestions.tsx
┃ ┗ 📜flight-filters.tsx
┣ 📂hooks
┃ ┣ 📜use-mobile.tsx
┃ ┗ 📜use-toast.ts
┣ 📂lib
┃ ┣ 📂store
┃ ┃ ┗ 📜otpStore.ts
┃ ┣ 📜utils.ts
┃ ┣ 📜email.ts
┃ ┣ 📜emailTemplates.ts
┃ ┣ 📜airports.ts
┃ ┣ 📜flightService.ts
┃ ┣ 📜airlineLogos.ts
┃ ┣ 📜amadeus.ts
┃ ┗ 📜prisma.ts
┣ 📂prisma
┃ ┣ 📂migrations
┃ ┃ ┣ 📂20250221212402_add_verification_fields
┃ ┃ ┃ ┗ 📜migration.sql
┃ ┃ ┣ 📂20250222193954_add_password_reset_table
┃ ┃ ┃ ┗ 📜migration.sql
┃ ┃ ┣ 📂20250223033528_add_passenger_details
┃ ┃ ┃ ┗ 📜migration.sql
┃ ┃ ┗ 📜migration_lock.toml
┃ ┗ 📜schema.prisma
┣ 📂public
┃ ┣ 📂assets
┃ ┃ ┣ 📂airlines
┃ ┃ ┃ ┣ 📜airline-american.png
┃ ┃ ┃ ┣ 📜airline-delta.png
┃ ┃ ┃ ┣ 📜airline-jetblue.png
┃ ┃ ┃ ┣ 📜airline-southwest.png
┃ ┃ ┃ ┣ 📜airline-united.png
┃ ┃ ┃ ┣ 📜airline-lufthansa.png
┃ ┃ ┃ ┣ 📜airline-emirates.png
┃ ┃ ┃ ┣ 📜airline-qatar.png
┃ ┃ ┃ ┣ 📜airline-british.png
┃ ┃ ┃ ┗ 📜Better Site.txt
┃ ┃ ┣ 📂icons
┃ ┃ ┣ 📂images
┃ ┃ ┃ ┗ 📂misc
┃ ┃ ┗ 📂branding
┃ ┗ 📜Note.txt
┣ 📂scripts
┃ ┣ 📜test-db.ts
┃ ┗ 📜test-db.js
┣ 📂store
┃ ┗ 📜bookingStore.ts
┣ 📂z.docs
┃ ┣ 📂api
┃ ┃ ┣ 📂Amadeus-Flight-API
┃ ┃ ┃ ┣ 📜Access-Token-generation.txt
┃ ┃ ┃ ┣ 📜Request-Type-1.txt
┃ ┃ ┃ ┣ 📜Request-Type-2.txt
┃ ┃ ┃ ┣ 📜All-API-Services
┃ ┃ ┃ ┣ 📜Request-Type-3.txt
┃ ┃ ┃ ┗ 📜Request-Type-4.txt
┃ ┃ ┣ 📜Pricing API.txt
┃ ┃ ┣ 📜Airport Schedule API.txt
┃ ┃ ┣ 📜Flight Tracking API.txt
┃ ┃ ┣ 📜2. Duffel API.txt
┃ ┃ ┗ 📜1. Amadeus API.txt
┃ ┣ 📜stripe-test-cards.txt
┃ ┗ 📜project-structure.md
┣ 📜.gitignore
┣ 📜.env
┣ 📜components.json
┣ 📜middleware.ts
┣ 📜next.config.js
┣ 📜next-env.d.ts
┣ 📜package.json
┣ 📜package-lock.json
┣ 📜postcss.config.mjs
┣ 📜tailwind.config.ts
┣ 📜tsconfig.json
┗ 📜tsconfig - Copy.json
