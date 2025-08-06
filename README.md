# Troney

Reworking this in Next.js. Original project [made with Nuxt](https://github.com/brunobragaw8t/troney).

Troney (word-play for tracking money) is an expense tracker web app focused on a
simple and fast UI to keep my life on track.

Some of its features are:

- Record earnings, expenses and movements;
- Separate money by wallets;
- Organize expenses with buckets and categories;
- Monthly graphs;
- Keyboard shortcuts for navigating the UI.

Here's a [demo](https://troney.vercel.app/),
and here's the [Storybook](https://troney-storybook.vercel.app/)

## ToDo and milestones

- [x] Validate environment variables
- [x] Switch ESLint for Biome
- [x] Setup Prettier
- [x] Setup Storybook
- [x] Create auth landing
- [x] Create user registration
- [x] Create user activation
- [ ] Create route to resend activation email
- [x] Create user login
- [ ] Create user logout
- [ ] Create password recovery functionality
- [ ] Send email when user password changes
- [ ] Implement refresh session functionality
- [ ] Create wallets CRUD
- [ ] Create buckets CRUD
- [ ] Create categories CRUD
- [ ] Seed default categories for user
- [ ] Emoji in categories (to serve as icons when minimized)
- [ ] Create earnings CRUD
- [ ] Create expenses CRUD
- [ ] Create movements CRUD
- [ ] Add autocomplete of previously registered expenses, with price
- [ ] View history of prices
- [ ] Keyboard navigation in lists
- [ ] Charts per month, trimester, semester and year
- [ ] Switch between pie and bar chart
- [ ] OCR
- [ ] Extraordinary expense (doesn't count toward average)

## Technologies

- [React](https://react.dev/) & [Next.js](https://nextjs.org/)
- [tRPC](https://trpc.io/)
- [Zod](https://zod.dev/)
- [PostgreSQL](https://www.postgresql.org/) & [Drizzle ORM](https://orm.drizzle.team/)
- [Redis](https://redis.io/) & [Upstash](https://upstash.com/)
- [Nodemailer](https://www.nodemailer.com/)
- [Tailwind CSS](https://tailwindcss.com/)
