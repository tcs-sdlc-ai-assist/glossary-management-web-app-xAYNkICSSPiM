# Deployment Guide

This document covers deploying the Glossary Management application to [Vercel](https://vercel.com), including configuration, environment variables, build commands, and CI/CD setup.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Configuration](#project-configuration)
- [Environment Variables](#environment-variables)
- [Build Commands](#build-commands)
- [Vercel Deployment](#vercel-deployment)
  - [Git-Based Auto-Deploy](#git-based-auto-deploy)
  - [Manual Deploy via Vercel CLI](#manual-deploy-via-vercel-cli)
- [SPA Rewrite Configuration](#spa-rewrite-configuration)
- [CI/CD Notes](#cicd-notes)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [npm](https://www.npmjs.com/) v9 or later
- A [Vercel](https://vercel.com) account
- A Git repository hosted on GitHub, GitLab, or Bitbucket

---

## Project Configuration

The project uses **Vite** as the build tool with **React 18**. The production build outputs static files to the `dist/` directory.

Key configuration files:

| File                | Purpose                                      |
| ------------------- | -------------------------------------------- |
| `vite.config.js`    | Vite build configuration with React plugin   |
| `vercel.json`       | Vercel platform configuration (SPA rewrites) |
| `tailwind.config.js`| Tailwind CSS content paths and theme config  |
| `postcss.config.js` | PostCSS plugins (Tailwind CSS, Autoprefixer) |
| `package.json`      | Dependencies, scripts, and project metadata  |

---

## Environment Variables

Environment variables are managed via `.env` files locally and through the Vercel dashboard for deployed environments.

| Variable           | Description                  | Required | Default              |
| ------------------ | ---------------------------- | -------- | -------------------- |
| `VITE_APP_TITLE`   | Application title            | No       | `Glossary Management`|

### Local Development

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and set any required values.

> **Note:** Only variables prefixed with `VITE_` are exposed to the client-side bundle via `import.meta.env.VITE_*`. Never store secrets in `VITE_`-prefixed variables.

### Vercel Environment Variables

1. Navigate to your project in the [Vercel Dashboard](https://vercel.com/dashboard).
2. Go to **Settings** → **Environment Variables**.
3. Add each variable listed above for the appropriate environments (Production, Preview, Development).

---

## Build Commands

The following npm scripts are available:

| Command              | Description                                  |
| -------------------- | -------------------------------------------- |
| `npm run dev`        | Start the Vite development server            |
| `npm run build`      | Build the production bundle to `dist/`       |
| `npm run preview`    | Preview the production build locally         |
| `npm run test`       | Run all tests once via Vitest                |
| `npm run test:watch` | Run tests in watch mode via Vitest           |
| `npm run lint`       | Lint all `.js` and `.jsx` files with ESLint  |

### Production Build

```bash
npm install
npm run build
```

This generates optimized static assets in the `dist/` directory, ready for deployment.

---

## Vercel Deployment

### Git-Based Auto-Deploy

This is the recommended deployment method. Vercel automatically builds and deploys on every push to your repository.

1. **Import your repository on Vercel:**
   - Log in to [Vercel](https://vercel.com).
   - Click **Add New** → **Project**.
   - Select your Git provider (GitHub, GitLab, or Bitbucket).
   - Choose the repository containing this project.

2. **Configure build settings:**

   Vercel should auto-detect the Vite framework. Verify the following settings:

   | Setting              | Value          |
   | -------------------- | -------------- |
   | **Framework Preset** | Vite           |
   | **Build Command**    | `npm run build`|
   | **Output Directory** | `dist`         |
   | **Install Command**  | `npm install`  |
   | **Node.js Version**  | 18.x or later  |

3. **Add environment variables:**
   - Go to **Settings** → **Environment Variables**.
   - Add `VITE_APP_TITLE` (or any other required variables) for Production, Preview, and Development environments as needed.

4. **Deploy:**
   - Click **Deploy**. Vercel will install dependencies, run the build, and deploy the output.
   - All subsequent pushes to the default branch (e.g., `main`) will trigger automatic production deployments.
   - Pushes to other branches or pull requests will generate preview deployments with unique URLs.

### Manual Deploy via Vercel CLI

For manual or one-off deployments:

1. **Install the Vercel CLI:**

   ```bash
   npm install -g vercel
   ```

2. **Log in to Vercel:**

   ```bash
   vercel login
   ```

3. **Deploy from the project root:**

   ```bash
   # Preview deployment
   vercel

   # Production deployment
   vercel --prod
   ```

4. The CLI will prompt you to link the project to your Vercel account and configure settings on the first run.

---

## SPA Rewrite Configuration

The application is a single-page application (SPA) that uses client-side routing. The `vercel.json` file at the project root configures Vercel to rewrite all routes to `index.html`, ensuring that deep links and page refreshes work correctly:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**How it works:**

- Any request that does not match a static file in `dist/` is rewritten to `/index.html`.
- The React application then handles routing on the client side.
- Static assets (JS, CSS, images, fonts) are served directly without rewriting.

> **Important:** Do not remove or modify the `vercel.json` rewrite rule. Without it, navigating directly to any route other than `/` will result in a 404 error.

---

## CI/CD Notes

### Automatic Deployments

When connected to a Git repository, Vercel provides:

- **Production deployments** on every push to the default branch (e.g., `main` or `master`).
- **Preview deployments** on every push to non-default branches and on pull/merge requests. Each preview deployment gets a unique URL for testing.

### Running Tests Before Deploy

Vercel does not run tests as part of its default build pipeline. To ensure tests pass before deployment, set up one of the following:

#### Option A: GitHub Actions (Recommended)

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm run test
```

This ensures that linting and tests pass on every push and pull request before Vercel deploys.

#### Option B: Vercel Ignored Build Step

You can configure Vercel to skip builds when tests fail by using a custom **Ignored Build Step** script. In the Vercel Dashboard under **Settings** → **Git** → **Ignored Build Step**, you can reference a script, but note this only controls whether a build is triggered — it does not run tests during the build itself.

#### Option C: Custom Build Command with Tests

Override the build command in Vercel to include tests:

1. Go to **Settings** → **General** → **Build & Development Settings**.
2. Set the **Build Command** to:

   ```bash
   npm run test && npm run build
   ```

> **Note:** This approach increases build time and uses build minutes for test execution. Option A (GitHub Actions) is preferred for separating CI concerns from deployment.

### Branch Protection

For production safety, configure branch protection rules on your Git provider:

- Require status checks to pass before merging (e.g., the CI workflow above).
- Require pull request reviews before merging to the default branch.
- Prevent direct pushes to the default branch.

---

## Troubleshooting

### Build Fails with Module Not Found

Ensure all dependencies are listed in `package.json` and run `npm install` before building. Verify that import paths match the actual file names (case-sensitive on Linux-based build environments).

### 404 Errors on Page Refresh

Verify that `vercel.json` exists at the project root and contains the SPA rewrite rule. See [SPA Rewrite Configuration](#spa-rewrite-configuration).

### Environment Variables Not Available

- Ensure variables are prefixed with `VITE_` to be accessible in the client bundle.
- Verify variables are set for the correct environment (Production, Preview, Development) in the Vercel Dashboard.
- After adding or changing environment variables, trigger a new deployment for the changes to take effect.

### Styles Missing in Production

Ensure `tailwind.config.js` has the correct `content` paths:

```js
content: [
  "./index.html",
  "./src/**/*.{js,jsx}",
],
```

If content paths are incorrect, Tailwind CSS will tree-shake all utility classes from the production build.

### Tests Fail in CI but Pass Locally

- Ensure the CI environment uses the same Node.js version as local development.
- Check for tests that depend on timezone, locale, or platform-specific behavior.
- Verify that `localStorage` and other browser APIs are available in the test environment (the project uses `jsdom` via Vitest).