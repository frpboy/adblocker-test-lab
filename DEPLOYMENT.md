# Deployment checklist

- [ ] Install dependencies and run `npm run build`.
- [ ] Test on Chromium, Firefox, and WebKit where available.
- [ ] Audit each scoring-eligible test; confirm fixtures and expected behavior.
- [ ] Keep third-party endpoint failures out of the authoritative score unless strong controls isolate cause.
- [ ] Obtain Monetag's explicit approval for the site's use case before adding monetized code.
- [ ] Add provider code only to the approved testing block, then verify behaviour with and without filtering enabled.
- [ ] Import repository into Vercel and confirm deployment.
- [ ] Add `lab.frpboy.in` in Vercel, then configure its DNS records at the domain's DNS provider.
- [ ] Verify HTTPS, responsive layout, privacy notice, and contact information.
