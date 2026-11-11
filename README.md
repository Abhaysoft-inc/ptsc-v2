This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Deploying to Vercel

Set the variables from `.env.example` under **Project → Settings → Environment Variables**
(at least `MONGODB_URI` and `AUTH_SECRET`).

### First admin account

The build runs `vercel-build` (see `package.json`), which builds the site and then runs
`scripts/setup-admin.ts`. For **Production** deployments it creates the first admin from:

| Variable | When it's needed |
| --- | --- |
| `ADMIN_EMAIL` | Always, to turn this on. Leave it out and the step is skipped. |
| `ADMIN_PASSWORD` | When the account doesn't exist yet (min 8 characters). |
| `ADMIN_MOBILE` | When the account doesn't exist yet (10 digits). |
| `ADMIN_FIRST_NAME`, `ADMIN_LAST_NAME`, `ADMIN_USERNAME` | Optional. |
| `ADMIN_RESET_PASSWORD=true` | Optional. Replaces the password of an existing account. |

It is safe on every deploy: a new account is created, an existing non-admin account is made an
approved admin, and an account that is already an admin is left alone (its password is **not**
reset). After the first deploy you can delete `ADMIN_PASSWORD` from Vercel.

If the settings are wrong or the database can't be reached, the build fails with a message
listing what to fix. If you override the Build Command in Vercel's project settings, this step
won't run; keep it as `npm run vercel-build` or leave the field empty.

Try it from your machine without changing anything: `node --env-file=.env scripts/setup-admin.ts --force --dry-run`
(set the `ADMIN_*` variables in `.env` first).
