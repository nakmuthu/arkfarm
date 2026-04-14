# ArkFarm CMS Setup

Admin URL: https://nakmuthu.github.io/arkfarm/admin/

## One-time GitHub OAuth Setup

1. Go to https://github.com/settings/developers → "OAuth Apps" → "New OAuth App"
2. Fill in:
   - Application name: `ArkFarm CMS`
   - Homepage URL: `https://nakmuthu.github.io/arkfarm/`
   - Authorization callback URL: `https://sveltia-cms-auth.pages.dev/callback`
3. Click "Register application"
4. Copy the **Client ID**
5. Generate a **Client Secret** and copy it
6. Go to https://sveltia-cms-auth.pages.dev and follow instructions to deploy your own auth worker with those credentials (free on Cloudflare Workers)
   - Or use the shared proxy by updating `base_url` in `admin/config.yml` with your deployed worker URL

## Usage

- Visit https://nakmuthu.github.io/arkfarm/admin/
- Log in with your GitHub account (must have write access to nakmuthu/arkfarm)
- Select a plant from the list
- Edit Tamil translation fields
- Click "Publish" — changes are committed directly to GitHub and go live after ~1 minute

## What can be edited

Each plant's Tamil translation file (`data/i18n-ta-<slug>.json`) — all field values shown in Tamil on the plant pages and category cards.

## What cannot be edited here

- Plant HTML structure
- English content values
- Images
- Search index (plants.json)

Use the existing scripts for those.
