# BDHS Bell Schedules — setup

## Included
- New student/teacher-friendly UI
- Automatic/manual schedule selector
- A/B/C lunch selector
- Existing schedule family/date-override architecture
- Live clock/countdown
- Email/password accounts
- Secure remember-device sessions using HttpOnly cookies
- Forgot password -> Gmail code -> verification -> new password
- Google sign-in backend
- Cloudflare Worker + D1
- Resend email integration

## 1. Exact schedule times
Open `public/js/schedules.js`. The architecture and known schedule names/date overrides are already present. Replace the example period times and fill the other arrays with the exact times from your current website. This is the only part I could not safely copy because the exact live period-time arrays were not present in the available saved file.

## 2. Cloudflare D1
Create a D1 database named `bdhs-auth`. Put its ID in `wrangler.jsonc` where it says `REPLACE_WITH_YOUR_D1_DATABASE_ID`.
Run:
`No manual D1 schema command is required. The Worker automatically creates the required tables on its first API request.`

## 3. Cloudflare variables/secrets
Edit `wrangler.jsonc` and set `APP_ORIGIN (optional)` to your real HTTPS site.
Then set secrets:
`npx wrangler secret put RESEND_API_KEY`
`npx wrangler secret put EMAIL_FROM`
`npx wrangler secret put GOOGLE_CLIENT_ID`

Do not put API keys/passwords in `public/`, GitHub, or localStorage.

## 4. Resend
Create a Resend account, verify a domain you control, and use a sender such as `BDHS Schedules <no-reply@your-domain.example>`. The reset email is sent from the Worker.

## 5. Google
Create a Google web client ID. Add your production site origin to its authorized JavaScript origins. Put the client ID in `public/index.html` where `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com` appears, and also store it as the Worker secret.

## 6. Deploy from the Cloudflare screen in your screenshot
Project name: `bdhs-bell-schedules`
Build command: leave blank
Deploy command: `npx wrangler deploy`

You do NOT need the old Pages `Output directory` field.

## 7. GitHub
Upload the contents of this folder to your repository, including `wrangler.jsonc`, `package.json`, `src/`, `public/`, and `schema.sql`. Connect the repository to Cloudflare Workers Builds.

## 8. Local testing
Copy `.dev.vars.example` to `.dev.vars`, fill local values, then run `npm install` and `npx wrangler dev`.

## Security
Passwords are PBKDF2-derived, reset codes are stored as derived hashes, sessions are HttpOnly/Secure cookies, reset codes expire after 10 minutes, failed reset-code attempts are limited, and changing a password invalidates existing sessions.
