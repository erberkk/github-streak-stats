# GitHub Streak Stats

A clean, fast contribution streak card for your GitHub profile README. It follows your light/dark mode automatically.

[![GitHub Streak](https://github-streak-stats-gray.vercel.app/api/github/erberkk/svg)](https://github-streak-stats-gray.vercel.app/user/erberkk)

## Usage

Add this to your profile README (replace `erberkk` with your username):

```markdown
[![GitHub Streak](https://github-streak-stats-gray.vercel.app/api/github/erberkk/svg)](https://github-streak-stats-gray.vercel.app/user/erberkk)
```

Or open the [generator](https://github-streak-stats-gray.vercel.app) to preview and copy the snippet.

### Options

| Parameter | Values | Default |
| --- | --- | --- |
| `theme` | `auto`, `dark`, `light` | `auto` (follows the viewer's color scheme) |

Example: `https://github-streak-stats-gray.vercel.app/api/github/erberkk/svg?theme=dark`

### JSON API

```bash
curl https://github-streak-stats-gray.vercel.app/api/github/erberkk
```

## What it shows

- **Total contributions** since the account was created
- **Current streak**, with progress toward your longest streak
- **Longest streak** and its date range
- **Last 30 days** of activity and total active days

## Self-hosting

1. Deploy to Vercel.
2. Set `GITHUB_TOKEN` (a personal access token, no scopes needed for public data; add `read:user` to include private contributions you've made visible on your profile).

Without a token the service falls back to parsing the public contribution calendar, which is slower.

Responses are cached on the CDN for 10 minutes and served stale while refreshing, so the card loads instantly on GitHub instead of timing out.
