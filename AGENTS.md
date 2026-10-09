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
- Render leadership CMS entries through portrait-ready cards with optional image and name fields and a missing-photo fallback; this supports approved portraits without inventing leader identities.
- Render the standalone Values page from the Group payload's values array so the two pages cannot present conflicting brand principles.
- Keep illustrative sector imagery in a browser-safe shared business-visuals mapping, distinct from CMS editorial content, so directory and detail pages show consistent sector-specific images without claiming company operations.
- Keep progressive page motion and homepage section tracking in the shared page-experience component, respecting reduced-motion settings and keeping content visible without JavaScript.
- Scope Movement editorial styles to its page and send participation enquiries through the existing enquiry handler, including region and participation details in the message; this preserves shared navigation and avoids a separate submission pipeline.
- Isolate Businesses and Partnerships editorial layouts in page-specific components with scoped shared styles, retain CMS-driven business records, and reuse the enquiry handler for partnership details; this prevents redesigns from changing the homepage or shared shell.
- Keep the cross-business marketplace in CMS product records with a listing_type discriminator; property listings stay enquiry-led and are excluded from bag purchases.
- Resolve all displayed prices and bag totals through shared ESPEE-based pricing helpers and CMS conversion settings; this prevents stale conversions across catalogue and bag views.
- Give /admin a dedicated workspace shell while retaining authenticated server mutations; administration styling and navigation must not affect the public site.

- Create orders only through the server checkout function, which re-prices the bag from CMS records and settings; client totals are display-only and must never be trusted.
- Guest order receipts are read by order id plus a secret access token; never expose orders by id alone.
- Only super_admin may change user roles, through server functions that re-check the caller's roles.
- Shared announcement, menu highlights and footer links live in the CMS site/shell record so they have one edit location.
