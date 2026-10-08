<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Platform architecture
- Keep public structured content in CMS records and load it through a public server function with RLS; this keeps pages publishable and content centrally managed.
- Keep private customer and administration pages beneath the authenticated layout and verify identity and roles inside every server mutation; page guards alone do not protect data.
- Keep roles separate from profiles and require publishing privileges for changes to live records; editing must not bypass publication review.
- Store the shopping bag in browser session storage and leave payment execution disabled until approved commerce settings and a provider are available; browsing must never imply an order was placed.
- Use shared editorial components and semantic CSS tokens throughout the site; this preserves the supplied design direction across pages.
- Keep the combined Group/about and leadership sections in the Group page CMS payload; this keeps imported editorial content centrally editable without a separate leadership route.
