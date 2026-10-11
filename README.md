# Kelsey Greene Group

build this web app following the business description and build specification documents. also ensure to explicitly follow the ui/ux design pdf uploaded for the homepage and apply the same design direction for the other pages. also use the uploaded logo as the site's logo and favicon.

This project was built with [Lovable](https://lovable.dev).

## Media on independent deployments

- Default photos, logos and video are committed under `public/media` and served from the deployment's own origin; the frontend does not require Lovable asset URLs.
- CMS uploads use the `cms-media` private storage bucket. Saved content stores stable references, not expiring preview links. The `/api/public/media` handler serves only files referenced by published records.
- Retain the app's server-function runtime and existing backend environment configuration on Vercel: publishing media updates content and does not require redeployment. Public content refreshes every 15 seconds and when returning to the browser tab.
- In the content editor, upload a new file, choose an existing upload or enter an HTTPS URL, then save with published status. Images fall back to defaults or a neutral placeholder if unavailable.

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9be3103f-ec77-442c-a643-a740704ea131).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
