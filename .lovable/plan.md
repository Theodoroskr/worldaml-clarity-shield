# Check: a team member with Screening sees the full console

## What I'll do
1. **Pick a test company and member.** Use an existing test company with Screening switched on. In that company, use a non-admin team member who has a WorldAML account. If there is no such member, add one through Settings → Team Members as the company's Suite admin. The member gets the Analyst role.
2. **Before granting:** sign in as that member. Confirm AML Screening is hidden from the Suite menu, and that opening its address directly shows "Not available, ask your Suite admin".
3. **Grant Screening:** as the company's Suite admin, tick Screening for that member in Settings. Confirm the change appears in Audit Trail with the admin's name.
4. **After granting:** sign in as the member again. Open Suite → AML Screening and confirm the full console loads, not the basic search page. That means the company's existing cases are visible, the review controls work, and there is no "Start free trial" or "Preparing your workspace" screen.
5. **Separation check:** confirm the member sees none of another company's cases.
6. Report back with screenshots of each step.

## What may need your OK
- Signing the preview in as a specific test account may show an approval card naming that account's email.
- If a test member has to be added, it is a real team record in that test company. I'll remove it afterwards unless you want to keep it.

## If something fails
I'll report what broke and propose a fix. I won't change any code during the check.

## Technical details
- Find candidates: suite_org_members joined with suite_module_access (screening active) and profiles; prefer orgs whose names suggest test or demo.
- Session: `lovable auth-session --json --user <uuid>` for the admin and then the member, restored into Playwright at localhost:8080.
- Grant via the existing org_set_member_modules control in SuiteModulesPanel. Verify current_user_suite_modules() for the member returns screening.
- Screenshots go to /tmp/browser/suite-member-screening/.
