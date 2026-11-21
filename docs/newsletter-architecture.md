# FlowChera21 Newsletter Architecture (Privacy-first)

## Status
Architecture approved for implementation; provider credentials and subscription UI are not configured yet. No email addresses are collected until the backend/provider integration is deployed.

## Recommended design
- **Provider:** Use a managed email marketing platform (Brevo is the suggested initial provider) for contacts, double-opt-in, campaigns, unsubscribe preferences and delivery suppression. Final provider choice is configurable before activation.
- **Frontend:** A newsletter form with email field, explicit consent checkbox, concise privacy notice, validation, loading/success/error states, and an accessible confirmation message. Do not save subscriber email in browser history or local storage.
- **Backend:** Add `POST /newsletter/subscribe` with strict email validation, payload size limit, per-IP rate limit, and provider API call using server-side secret only. Never expose provider keys to frontend.
- **Confirmation:** Require provider double-opt-in before activating a subscription. Do not treat submission as consent to unrelated AI product processing.
- **Unsubscribe:** Every campaign includes the provider-managed unsubscribe link. If an unsubscribe API is later exposed, require an opaque signed token, idempotent behavior, and no login.
- **Webhooks:** Validate provider webhook signatures and replay protections before changing subscription state. Never accept arbitrary unsigned subscription status changes.
- **Data minimization:** Provider holds subscriber records. Store no subscriber email locally unless a specific business need and retention policy are approved. Do not log raw emails, tokens, or provider secrets.
- **Abuse protection:** Rate-limit subscription requests and use provider anti-abuse controls; avoid aggressive CAPTCHA unless abuse requires it.
- **Consent record:** Provider records timestamp, source/form, consent wording/version, and confirmed status. Keep an auditable privacy notice version.
- **Privacy & retention:** Provide purpose, frequency, provider/data processor details, retention/deletion method, and rights contact in the privacy policy. Delete or anonymize records when the purpose expires, except minimal suppression data needed to honor unsubscribes.
- **Accessibility:** Label input, keyboard navigation, focus visibility, errors associated with the field, and screen-reader status feedback. Respect reduced motion.
- **Testing:** Unit tests for validation, consent required, invalid inputs, provider errors, duplicate submissions, rate limiting, signed webhooks, unsubscribe, and no secrets in responses. E2E test the consent/confirmation UI without sending real campaigns.

## Configuration (server-side only)
- `NEWSLETTER_PROVIDER`
- `NEWSLETTER_API_KEY`
- `NEWSLETTER_LIST_ID`
- `NEWSLETTER_WEBHOOK_SECRET` (only if signed webhooks are enabled)
- `NEWSLETTER_FROM_EMAIL` (verified sender; provider-dependent)

Do not activate the signup form until a provider account, sender/domain verification, consent wording, privacy notice, list/segment and credentials have been configured and tested in staging.

## Release gates
1. Choose/confirm provider.
2. Configure and verify sender domain and credentials in Render.
3. Implement backend endpoints and tests.
4. Implement form, localization, responsive/accessibility.
5. Verify double-opt-in and unsubscribe end-to-end.
6. Review privacy policy and deployment; then enable the public signup form.
