

## Add Resend Email Delivery to Form Submissions

### What This Does
When someone submits a form on your site (Contact Sales, Free Trial, etc.), you'll receive a nicely formatted email notification at **info@worldaml.com** via Resend, in addition to the existing database storage.

### What You Need
A **Resend API key** — you can get one for free at [resend.com/api-keys](https://resend.com/api-keys). You'll also need a verified sending domain in Resend (or use Resend's default `onboarding@resend.dev` for testing).

### Steps

1. **Add the RESEND_API_KEY secret**
   - You'll be prompted to securely enter your Resend API key

2. **Update the `submit-form` edge function** to:
   - Initialize the Resend client with the API key
   - After saving to the database, send a formatted HTML email to `info@worldaml.com`
   - Include all submission details: name, email, company, phone, form type, message, products, etc.
   - Use a `from` address like `WorldAML Forms <forms@worldaml.com>` (must match a verified domain in Resend, or use `onboarding@resend.dev` for testing)
   - Email failures are logged but don't block the form submission (the data is already saved)

3. **Test end-to-end** by submitting a form and checking your inbox

### Technical Details

- **Import**: Use `import { Resend } from "npm:resend"` (npm specifier for Deno)
- **Sending domain**: Will default to `forms@worldaml.com`. If your domain isn't verified in Resend yet, we can temporarily use `onboarding@resend.dev`
- **Error handling**: Email send is wrapped in try/catch — if Resend fails, the form still succeeds (data is persisted in the database)
- **No frontend changes needed** — only the edge function is updated
