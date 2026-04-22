DELETE FROM academy_modules WHERE course_id = 'a1000000-0000-0000-0000-000000000002';

INSERT INTO academy_modules (course_id, sort_order, title, content) VALUES
('a1000000-0000-0000-0000-000000000002', 1, 'What is CDD?', $md$
## What is Customer Due Diligence?

![CDD lifecycle: Identification, Verification, Risk Assessment, Ongoing Monitoring](/academy/cdd/cdd-lifecycle.jpg)

Customer Due Diligence, or **CDD**, is the process of identifying and verifying a client and understanding the nature of their business.

CDD is one of the most important controls in Anti-Money Laundering. It allows firms to:

- understand **who their client is**
- assess the **risk** they present
- detect **suspicious activity**

CDD is **not a one-time activity**. It begins at onboarding but continues throughout the entire business relationship.

💡 **Key takeaways:** CDD = knowing your client. Required by law. Ongoing process.

⚠️ CDD is your first and strongest defense against financial crime.
$md$),
('a1000000-0000-0000-0000-000000000002', 2, 'Identification of Clients', $md$
## Identifying the Client

The first step in CDD is **identifying** the client. You must determine:

- who the client is
- who is acting on their behalf
- whether there are related entities

### For individuals
- Full name
- Date of birth
- Address

### For companies
- Registered name
- Registration number
- Directors
- Ownership structure

💡 **Key takeaways:** Identification comes before verification. Applies to individuals and entities. Must be accurate and complete.

⚠️ If you identify the wrong client, everything else fails.
$md$),
('a1000000-0000-0000-0000-000000000002', 3, 'Verification of Identity', $md$
## Verifying the Client

![Identity verification using passport, ID and utility bill against official registers](/academy/cdd/identity-verification.jpg)

Verification confirms that the client is **who they claim to be**.

This is done using **reliable and independent sources** such as:

- passports or ID cards
- utility bills
- official registers

Verification must usually occur **before** establishing a business relationship. In some low-risk cases, verification may be completed shortly after onboarding.

💡 **Key takeaways:** Verification = confirm identity. Use reliable sources. Must be documented.

⚠️ Weak verification creates major AML exposure.
$md$),
('a1000000-0000-0000-0000-000000000002', 4, 'Beneficial Ownership (UBO)', $md$
## Who Really Owns the Client?

![UBO ownership tree showing 25% threshold and ultimate beneficial owner](/academy/cdd/ubo-ownership-tree.jpg)

A **beneficial owner** is the individual who **ultimately owns or controls** a client.

This is typically defined as:

📌 ownership of **25% or more**

However, control can also exist through:

- voting rights
- management influence
- indirect ownership

Complex structures may hide the real owner.

💡 **Key takeaways:** UBO = real owner. Threshold often 25%. Must understand ownership structure.

⚠️ Criminals often hide behind complex structures.
$md$),
('a1000000-0000-0000-0000-000000000002', 5, 'Risk-Based Approach to CDD', $md$
## One Size Does Not Fit All

Not all clients carry the same risk.

A **risk-based approach** means:

- applying **stronger controls** to high-risk clients
- **simplifying controls** for low-risk clients

### Risk factors include
- Geography
- Business activity
- Ownership complexity
- Transaction patterns

| Risk factor | Lower risk | Higher risk |
|---|---|---|
| Geography | FATF-compliant jurisdictions | High-risk / sanctioned countries |
| Activity | Salaried employee | Cash-intensive business |
| Structure | Single owner | Multi-layered offshore |

💡 **Key takeaways:** Focus on high-risk clients. Adjust controls accordingly. Continuous assessment.

⚠️ Overlooking high-risk clients is a major regulatory failure.
$md$),
('a1000000-0000-0000-0000-000000000002', 6, 'Simplified vs Enhanced Due Diligence', $md$
## Levels of Due Diligence

![CDD risk pyramid: Simplified, Standard, Enhanced Due Diligence](/academy/cdd/cdd-risk-pyramid.jpg)

There are different levels of due diligence depending on client risk.

### ✅ Simplified Due Diligence (SDD)
Applied to **low-risk** clients:
- fewer checks
- reduced monitoring

### ⚠️ Enhanced Due Diligence (EDD)
Applied to **high-risk** clients:
- additional verification
- source of wealth checks
- senior management approval

EDD is **required** for:
- high-risk jurisdictions
- Politically Exposed Persons (PEPs)
- complex structures

💡 **Key takeaways:** SDD = low risk. EDD = high risk. Risk determines level.

⚠️ EDD is one of the most scrutinized areas by regulators.
$md$),
('a1000000-0000-0000-0000-000000000002', 7, 'Ongoing Monitoring', $md$
## CDD Never Stops

![Ongoing monitoring loop: review transactions, update profile, reassess risk](/academy/cdd/ongoing-monitoring.jpg)

CDD does **not end** after onboarding.

Ongoing monitoring ensures that:

- transactions match the client profile
- information remains up to date
- suspicious activity is detected

### Monitoring includes
- Reviewing transactions
- Updating documents
- Reassessing risk

💡 **Key takeaways:** CDD is continuous. Monitor transactions. Update client data.

⚠️ Many AML failures happen **after** onboarding — not during it.
$md$),
('a1000000-0000-0000-0000-000000000002', 8, 'High-Risk Scenarios: PEPs & Non-Face-to-Face', $md$
## When Extra Care Is Required

Certain clients require additional attention.

### 📌 Politically Exposed Persons (PEPs)
- individuals with public roles
- higher corruption risk
- require enhanced monitoring

### 📌 Non-face-to-face clients
- higher identity fraud risk
- require additional verification measures (e.g. liveness checks, document authentication)

💡 **Key takeaways:** PEPs = higher risk. Remote onboarding increases risk. Additional controls required.

⚠️ Failure to properly manage PEPs is a common regulatory issue.
$md$);

UPDATE academy_courses SET duration_minutes = 60 WHERE id = 'a1000000-0000-0000-0000-000000000002';