# Vercel EZ Stats

A dashboard to view statistics and analytics for all your Vercel deployments.

## Features

- View deployment statistics across all your Vercel projects
- OAuth integration with Vercel
- Beautiful UI using Tremor components
- Real-time data updates

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with the following variables:
   ```
   VERCEL_CLIENT_ID=your_client_id
   VERCEL_CLIENT_SECRET=your_client_secret
   VERCEL_REDIRECT_URI=http://localhost:3000/api/auth/callback
   ```

4. Create a new OAuth application in your Vercel account:
   - Go to https://vercel.com/account/tokens
   - Click "Create" and select "OAuth App"
   - Set the redirect URI to match your VERCEL_REDIRECT_URI
   - Copy the Client ID and Client Secret to your `.env.local` file

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development

This project uses:
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Tremor for UI components
- SWR for data fetching

## License

MIT
