# ArkFarm CMS Setup

Admin URL: https://nakmuthu.github.io/arkfarm/admin/

## One-time GitHub OAuth Setup

Sveltia CMS handles auth directly via GitHub — no external proxy needed.

1. Go to https://github.com/settings/developers → "OAuth Apps" → "New OAuth App"
2. Fill in:
   - Application name: `ArkFarm CMS`
   - Homepage URL: `https://nakmuthu.github.io/arkfarm/`
   - Authorization callback URL: `https://nakmuthu.github.io/arkfarm/admin/`
3. Click "Register application"
4. Copy the **Client ID**
5. Generate a **Client Secret** and copy it
6. In `admin/config.yml`, add under `backend`:
   ```yaml
   backend:
     name: github
     repo: nakmuthu/arkfarm
     branch: main
     app_id: YOUR_CLIENT_ID
   ```
7. Commit and push

## Usage

- Visit https://nakmuthu.github.io/arkfarm/admin/
- Click "Login with GitHub" — opens GitHub's own login page
- Must have write access to nakmuthu/arkfarm repo
- Select a plant, edit Tamil fields, click "Publish"
- Changes commit directly to GitHub and go live in ~1 minute

## Adding new admins

Add them as a collaborator in GitHub repo Settings → Collaborators. They can then log in from any device.

## After adding new plants

Run `node scripts/generate-cms-config.js` to update the CMS plant list, then commit and push.
