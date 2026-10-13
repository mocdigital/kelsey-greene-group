import { createFileRoute, redirect } from '@tanstack/react-router';

// The campaign page now lives at /1mbreakfast. This keeps links, bookmarks and
// search results pointing at the old address working instead of showing a 404.
export const Route = createFileRoute('/movement')({
  beforeLoad: () => {
    throw redirect({ to: '/1mbreakfast', code: 301 });
  },
});
