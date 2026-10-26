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
- Serve default media from repository-owned public/media paths and resolve published CMS overrides through shared media helpers; this keeps GitHub/Vercel deployments independent of Lovable asset hosting.
- Store CMS uploads as immutable private-storage references and expose only files referenced by published CMS records through a verified public media handler; this respects storage policy and prevents draft media leaks.
- Keep image selection in each CMS record and render through the shared loading/error-aware image component, refreshing public content periodically; this makes published replacements consistent without redeployment.
- Keep public structured content in CMS records and load it through a public server function with RLS; this keeps pages publishable and content centrally managed.
- Keep private customer and administration pages beneath the authenticated layout and verify identity and roles inside every server mutation; page guards alone do not protect data.
- Keep roles separate from profiles and require publishing privileges for changes to live records; editing must not bypass publication review.
- Store the shopping bag in browser session storage and leave payment execution disabled until approved commerce settings and a provider are available; browsing must never imply an order was placed.
- Use shared editorial components and semantic CSS tokens throughout the site; this preserves the supplied design direction across pages.
- Keep the combined Group/about and leadership sections in the Group page CMS payload; this keeps imported editorial content centrally editable without a separate leadership route.
- Render leadership CMS entries through portrait-ready cards with optional image and name fields and a missing-photo fallback; this supports approved portraits without inventing leader identities.
- Render the standalone Values page from the Group payload's values array so the two pages cannot present conflicting brand principles.
- Keep illustrative sector imagery in a browser-safe shared business-visuals mapping, distinct from CMS editorial content, so directory and detail pages show consistent sector-specific images without claiming company operations.
- Keep progressive page motion and homepage section tracking in the shared page-experience component, observing newly rendered public content and respecting live reduced-motion preferences; this keeps filtering, navigation, and no-JavaScript content accessible.
- Keep cross-page visual polish in the global stylesheet and scope homepage changes to its page wrapper; this preserves PDF-specific layouts and leaves business flows unchanged.
- Scope Movement editorial styles to its page and send participation enquiries through the existing enquiry handler, including region and participation details in the message; this preserves shared navigation and avoids a separate submission pipeline.
- Isolate Businesses and Partnerships editorial layouts in page-specific components with scoped shared styles, retain CMS-driven business records, and reuse the enquiry handler for partnership details; this prevents redesigns from changing the homepage or shared shell.
- Keep the cross-business marketplace in CMS product records with a listing_type discriminator; property listings stay enquiry-led and are excluded from bag purchases.
- Resolve all displayed prices and bag totals through shared ESPEE-based pricing helpers and CMS conversion settings; this prevents stale conversions across catalogue and bag views.
- Give /admin a dedicated workspace shell while retaining authenticated server mutations; administration styling and navigation must not affect the public site.

- Create orders only through the server checkout function, which re-prices the bag from CMS records and settings; client totals are display-only and must never be trusted.
- Guest order receipts are read by order id plus a secret access token; never expose orders by id alone.
- Only super_admin may change user roles, through server functions that re-check the caller's roles.
- Shared announcement, menu highlights and footer links live in the CMS site/shell record so they have one edit location.
- Read published payment settings from the canonical payment record (with legacy commerce fallback) and share merchant filtering across checkout; public configuration must not require privileged credentials on external hosts.
- Store homepage media type, URL, poster and description in the homepage CMS payload and render through the shared home-media helper; this keeps image/video editing within existing publication permissions and provides a poster fallback and reduced-motion playback controls.
- Mount the homepage section strip inside the sticky public header and offset other sticky controls using navbar-height tokens; this prevents stacked navigation overlap without changing the administration shell.

- Reuse card bag controls and a session-persisted currency selector across the shopping flow, formatting NGN ledger amounts through shared pricing helpers; display conversions must never alter server settlement totals.
- Render the public logo cover in initial server markup and commit navigation covers before destination rendering, with bounded dismissal and reduced-motion support; this prevents content flashing before feedback without trapping users.
- Use the CMS publication status for quick catalogue visibility switches through the existing publishing-authorized save action; this keeps hidden products out of every public content surface without a separate visibility flag.

- Record sponsor-a-box submissions in the dedicated sponsorships table with a secret access token for proof upload, reviewed in the admin Enquiries Sponsorships tab; keeps payment proofs out of general enquiries.
- Build currency lists from built-in ESPEE/NGN plus CMS currency-settings additions via shared pricing helpers; selectors and conversions stay consistent site-wide.
