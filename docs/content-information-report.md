# Mistravora content information report

Prepared from the current website source, admin forms, database migrations, and a read-only inspection of public Supabase content on 6 September 2026.

**Purpose:** collect your real business information so I can write complete website content, map it to the correct admin/Supabase fields, and identify any fields that still need connecting to the website. You can provide rough notes; you do not need to write polished marketing copy or prepare SQL.

No website content or Supabase records were changed for this report.

## 1. What is currently missing

The live inspection used the public anonymous connection. “No published records” does not prove that there are no private drafts. Populated text also does not prove that a claim is accurate or approved. The raw inventory is in [content-inventory.json](audits/content-inventory.json).

| Area | Public content found | What we need |
|---|---:|---|
| Services | 0 | Your actual service catalogue and details for each service |
| Solutions | 0 | Business problems you solve and the products/systems you deliver; some screens currently use fallback copy |
| Blog | 0 | Topics, real expertise, authors and source material |
| Research | 0 | Genuine research, experiments or technical analysis; optional if you have none |
| Knowledge base | 0 | Guides and answers to recurring customer questions |
| Glossary | 0 | Relevant terms and the audience’s level of technical understanding |
| Authors | 0 | Real author names, roles, biographies and expertise |
| Downloadable resources | 0 | Useful document ideas, source material and approved downloadable files |
| Demo apps | 0 | Real demo links, screenshots, features and access instructions |
| Careers | 0 published jobs | Actual vacancies, or confirmation that you are not hiring |
| Case studies | 7 | Six cover images are missing; validate existing descriptions and results |
| Industries | 4 | All four industry images are missing; validate industry-specific capability claims |
| Team | 4 | All four photos are missing; verify names, roles and biographies |
| Testimonials | 4 | All four avatars are missing; verify quotes, attribution and permission |
| Trusted companies | 7 | Six logos and all seven `website_url` fields are blank; links are optional where none exist |
| Pricing | 3 tiers, 6 notes, 5 add-ons | Confirm actual commercial terms and reconcile calculator figures |
| FAQs | 7, all assigned to `general` | Validate answers; supply service-specific and booking/pricing questions |
| Policies | 4 | Verify that existing policies describe actual business practices |
| Contact | 1 record | Confirm current details and response expectations |
| Hero sections | 9 records | Confirm messaging; some page headings are still supplied in code |
| Technology stack | 24 records | Confirm which technologies you genuinely use and want to advertise |
| Values, benefits and statistics | Populated | Validate claims and decide which should remain visible |

Specific missing project images: **Unic Motors & Services, Dubai Store, Assalafiya Book Shop, TamDrill, Amaluna Resorts, and Wijesinghe Jewellers.** ShopMate already has a cover image.

The same six companies lack logos. All seven companies, including ShopMate, have empty website URL fields. Do not invent a public website for an internal business system.

The industry images needed are **Retail, Hospitality, Healthcare, and Manufacturing**.

Existing team records are **Shakeel, Sarah, Ahmed, and Fatima**. Please confirm which are real/current team members and provide corrections. Existing testimonial attributions include **Rashid, Manager, Nimal, and Aisha**; “Manager” needs clearer attribution or an explicitly approved anonymous description.

## 2. Information needed once for the whole business

Provide:

- Public brand name and exact legal/trading name, if different.
- Founding year, founder names, and where the business operates.
- A short account of why Mistravora started and its main milestones.
- What you actually sell today, what is planned, and what you do not offer.
- Your main customer types: business size, industry, buyer role, country and typical problem.
- Primary market and supported languages. Confirm whether the main focus is Sri Lanka, international clients, or both.
- Your three most important advantages, with examples or evidence.
- Preferred tone: straightforward, friendly, technical, premium, or another description.
- The main action visitors should take: request a quote, book a consultation, call, WhatsApp, or try a demo.
- Official email, phone, WhatsApp, public address/service area, office hours and timezone.
- Approved logo files, brand colours, and any existing company profile or presentation.
- Who approves final copy, pricing, case studies and policies.

**Used in:** Settings, Contact, Hero Sections, About, footer, structured data, page metadata and assistant responses. Some of these still use constants in code and need synchronising after you confirm the facts.

## 3. Homepage and page introductions

For the homepage, tell me:

- Who should immediately recognise that the site is for them?
- What problem do you solve for that customer?
- What realistic outcome can you promise?
- Which three services or solutions should receive the most attention?
- Which projects and testimonials should provide the main proof?
- What happens after someone presses “Start your project”?
- Which statistics are accurate, and how were they measured?

For each major page—About, Services, Solutions, Industries, Pricing, Projects, Blog, Research, Careers, Tools and Contact—give me its purpose, audience and preferred next step. I can write the badge, headline, highlighted phrase, introduction and button text from that.

**Admin:** `/dashboard/hero`. **Table:** `hero_sections`.

Confirm claims already present in the code or fallback content, including “50+ projects”, “7 years”, “100% client satisfaction”, “24/7 support”, “1-business-day response”, and the About page’s referral offer of “10% off” or “LKR 10,000”. These are verification questions, not claims I have independently confirmed.

## 4. Services: what customers can hire you to do

**Admin:** `/dashboard/services`. **Tables:** `services`, `service_features`, `service_technologies`; service FAQs also have a schema table.

Repeat the following for each real service:

1. Service name and its priority in the navigation/catalogue.
2. Intended customer and their main problem.
3. What you do, in practical terms.
4. What the customer receives: pages, modules, designs, source code, training, documentation, deployment, etc.
5. What is included and excluded.
6. Typical project stages and what you need from the customer at each stage.
7. Typical timeline and the factors that change it.
8. Starting price/range, or whether every project needs a custom quote.
9. Technologies you actually use for this service.
10. Ongoing maintenance, support and warranty arrangements.
11. A relevant completed project, demonstration or other proof.
12. Common customer questions and objections.
13. Any approved screenshots or illustrations.

I will turn this into the title, tagline, short description, full body, category, features, technologies and suggested CTA. Possible categories can be discussed, but I will not assume you offer every category shown in existing fallback text.

## 5. Solutions: the business systems you deliver

**Admin:** `/dashboard/solutions`. **Tables:** `solutions` and its feature, technology, service and process child tables.

A service explains the work you perform; a solution explains a customer’s business problem and the system that addresses it. We need both only where they offer distinct useful information.

For each solution, provide:

- Name and intended business/customer.
- Current workflow and the problems with it.
- The improved workflow after implementation.
- Main modules and user roles.
- Included services and features.
- Required integrations and whether those are already available or custom work.
- Implementation stages, dependencies and approximate timing.
- Business benefits without unsupported numerical promises.
- Screenshots, demo URL, and a relevant case study.
- Pricing approach and ongoing support.

For **Mistravora CRM, the custom booking system, and the campaign module**, clarify whether each is an internal Mistravora tool, a reusable client solution, or a product currently available for sale. Website descriptions must not advertise unfinished internal functionality as a ready product.

## 6. Industries

**Admin:** `/dashboard/industries`. **Tables:** `industries`, `industry_challenges`, `industry_solutions`.

For Retail, Hospitality, Healthcare and Manufacturing—and any additional sector you really serve—provide:

- Typical customer size/type and country.
- Three to five specific workflow problems.
- The features you can deliver to solve those problems.
- Integrations customers commonly need.
- A real project example or a clear statement that you do not yet have one.
- Relevant operational or data-handling requirements you can actually meet.
- An approved industry image or permission to use a generic illustration.

Do not imply certification, regulatory compliance, specialist healthcare capability or measured outcomes unless you can substantiate them.

## 7. Case studies and project portfolio

**Admin:** `/dashboard/case-studies`. **Tables:** `case_studies`, `case_study_results`, `case_study_technologies`.

For each existing project, provide or verify:

- Project name, client name, industry, location and completion/launch date.
- Whether we may publish the client’s name and logo.
- The client’s original problem and previous workflow.
- Exactly what Mistravora built and what other parties supplied.
- Main features, technical decisions and integrations.
- Project duration and scope.
- Outcomes: measured results where available, otherwise honest qualitative improvements.
- For every number: baseline, later value, measurement period, source, and approval to publish.
- A cover screenshot and two or three additional screenshots if available.
- Public URL or demo URL, if one exists.
- An approved client quote, if available.
- Confidential details to leave out and who can approve the final case study.

Existing prose is a starting point for verification, not evidence by itself. Missing result data is acceptable; we can describe what was delivered without inventing percentages or revenue.

## 8. Client logos and testimonials

**Admins:** `/dashboard/trusted-companies`, `/dashboard/testimonials`.

For each client/company:

- Exact display name, category and one-sentence description.
- Official logo and public website/demo link, where appropriate.
- Permission to identify them as a client or trusted company.
- Whether they should be featured on the homepage.

For each testimonial:

- Original quote or feedback message.
- Author’s approved display name, role and company.
- Related project and approximate date of feedback.
- Rating only if the customer actually supplied one.
- Photograph only if available and approved; an avatar is not mandatory.
- Permission to publish and any restrictions on editing the quote.

I can correct grammar or propose a shorter quote for approval, but cannot manufacture an endorsement.

## 9. About, people and company credibility

**Admins:** `/dashboard/about`, `/dashboard/authors`; some story sections remain in code.

For the company story, provide the founding background, important milestones, current team structure, working approach, and concrete examples behind your values.

For every team member and author:

- Correct public name and role.
- Responsibilities and actual areas of expertise.
- Relevant experience and verifiable qualifications, where useful.
- A few biographical notes and one or two notable projects.
- Approved portrait.
- Public LinkedIn/GitHub links where appropriate.
- Whether they write or review articles, and preferred author credit.

A team profile and an author profile serve different pages. The same person can have both, but the records are currently separate. We will keep their information consistent.

For statistics, provide the exact value, definition, date/period and evidence. Decide what “projects delivered”, “years of experience”, “satisfaction” and “uptime” each mean before publishing them.

## 10. Pricing, quotes, support and calculators

**Admin:** `/dashboard/pricing`. **Tables:** pricing tiers, features, notes and add-ons. Calculator formulas and some reference prices remain in code.

For Starter, Growth and Custom—or your replacement packages—provide:

- Package name and intended customer.
- Starting price, fixed price or range; currency and tax treatment.
- One-time versus recurring charges.
- Included deliverables and clear scope limits.
- Exclusions and optional add-ons, with actual add-on prices if available.
- Typical timeline and prerequisites.
- Number of revision rounds.
- Payment milestones, deposit and quote validity period.
- Hosting, domain, software licences and transaction fees: who pays and who owns the accounts?
- Maintenance/support cost, hours, response expectations and duration.
- Ownership of source code, designs and content after payment.
- Cancellation, refund and handover rules.
- Which package, if any, should be highlighted as popular.

For the calculators, provide approved base costs, feature costs, urgency adjustments, currency-conversion assumptions and the wording that explains estimates are not final quotes. For ROI examples, provide defensible assumptions; visitor-entered estimates are not guaranteed results.

## 11. FAQs and the AI assistant

**Admin:** `/dashboard/contact` includes FAQ editing. **Table:** `faqs`. Assistant behaviour and its knowledge sources also need to stay aligned with the site.

Send questions prospects actually ask, with rough answers. Useful topics include:

- What you build and who you work with.
- Price, project duration, deposits and payment methods.
- What a customer must prepare before work starts.
- Revisions, delivery, ownership, hosting and support.
- Existing-system migrations and integrations.
- Booking, cancellation and consultation expectations.
- What information should never be shared in chat.
- When the assistant should hand off to a person, and which contact route to use.

Tell me which answers apply everywhere and which are specific to a service. The current seven public FAQs are all labelled `general`.

## 12. Blog, knowledge base, glossary and research

**Admins:** `/dashboard/blog`, `/dashboard/knowledge-base`, `/dashboard/glossary`, `/dashboard/research`.

For a useful initial editorial plan, send:

- Your preferred audience and their most common decisions/problems.
- Questions raised on calls, in proposals, during implementation and after delivery.
- Subjects your team can credibly explain from experience.
- Internal notes, existing presentations, article drafts, approved project examples or source links.
- Topics to avoid, confidential information and named competitors you do not want discussed.
- Who will author/review content and what publication frequency you can maintain.

For each **blog post**, a topic, audience, key points, source material and author are enough to begin. I can write the headline, excerpt, body, category, tags and metadata, and calculate reading time from the finished copy.

For each **knowledge-base guide**, provide the user’s goal, prerequisites, accurate steps, screenshots if needed, common errors and the expected result. Specify whether the guide is for prospects, clients or administrators.

For the **glossary**, provide terms your customers misunderstand and any Mistravora-specific meaning. I can draft general definitions, examples and relevant cross-links. You only need to explain your proprietary terms and confirm business-specific claims.

For **research**, provide the real question, method, tools/data, findings, limitations, references and author. If no original research exists, say so; we can keep the section unpublished or use clearly labelled technical analysis instead of inventing experiments.

The Insights hub, related-content lists and search largely draw from these collections; they do not need separate duplicate articles.

## 13. Resources and demo apps

**Admins:** `/dashboard/resources`, `/dashboard/demo-apps`.

For each downloadable resource:

- Who it helps and what it enables them to do.
- Proposed title, document type and main sections.
- Existing material, or the facts needed for us to create the document.
- Whether it is freely downloadable or whether you want a future access form.
- Branding, author/owner, version/date and permission to distribute.
- Final file or approved content from which I can prepare one.

Possible formats are a project brief template, scope checklist, buying guide, maintenance checklist or company profile. These are options, not resources currently available. The current resource flow uses a direct download link; gated access would require additional implementation.

For each demo:

- Real working URL, system name and target industry.
- Main features and what a visitor should try.
- Approved screenshot and whether it can be publicly indexed.
- Whether login is required and the process for granting demo access.
- Whether data resets and what the demo does not represent.

Do not send production passwords or real customer data. If there is no public demo, we can describe a request-a-demo process instead.

## 14. Careers

**Admin:** `/dashboard/careers`. **Tables:** `jobs`, plus benefits where used.

If you are hiring, provide the role, employment type, location/remote rules, responsibilities, required and optional skills, experience expectations, salary range if public, benefits, application destination, selection process and closing date.

If you are not hiring, simply confirm that. An honest “No open positions” message is complete content; the page does not need fictional vacancies. Also confirm whether you accept general applications, internships or freelance enquiries.

## 15. Contact and booking

**Admins:** `/dashboard/contact`, `/dashboard/booking-slots`.

Confirm:

- Public email, phone, WhatsApp and address/service area.
- Working days, office hours, timezone and expected first-response time.
- Preferred enquiry channel and who receives each type of enquiry.
- Whether consultations are free or paid.
- Meeting duration, online/in-person format and who conducts them.
- Available dates/time windows, breaks, notice period and holidays.
- Cancellation/rescheduling rules and any preparation visitors should complete.

The current booking system uses individual start/end slots with timezones. Recurring availability, automatic meeting links and Google Calendar synchronisation are not configured. A blank availability calendar can mean no slots have been created; it is not fixed by writing a paragraph.

## 16. Email campaigns and CRM

**Admins:** `/dashboard/campaigns`, `/dashboard/inquiries`, `/dashboard/newsletter`.

For campaign copy, provide the business objective, intended subscribed audience, topic/offer, benefit, CTA and destination, send date/time/timezone, sender display name, public sender/reply contact and who reviews the message. Include exact offer terms and dates where applicable.

Confirm what the business wants to send: for example, occasional useful updates, a launch announcement or an approved offer. Complex automated sequences and audience segmentation would need additional implementation beyond the current scheduled campaign worker.

For CRM conventions, provide your definitions of new, qualified, proposal, won and lost; service categories; budget bands; follow-up expectations; and responsibility for handling leads. The current deal-value label uses LKR—confirm that is appropriate.

**Do not fill blank inquiries, subscribers, bookings, delivery logs or revision logs with marketing copy or invented people.** These are operational records generated by actual use. Existing subscriber imports, if later requested, need a separate controlled process; they are not necessary to draft content.

Booking, CRM additions, campaign delivery and SEO controls depend on migration 0039 being applied. Its remote installation was not verified by this public content audit. Email delivery also requires server configuration and a scheduler; this report does not request secret keys.

## 17. Policies

**Admin:** `/dashboard/policies`. Existing pages: Privacy Policy, Terms of Service, Cookie Policy and Refund Policy.

To draft accurate updates, provide your approved business practices and any existing approved policy text:

- Legal business name and policy contact.
- Countries served and intended contractual jurisdiction.
- What personal information you collect, for what purposes and through which forms/tools.
- Actual hosting, database, analytics, email and payment providers.
- Who can access customer data and how long you retain it.
- How someone requests access, correction, deletion or unsubscribe.
- Which cookies/tracking tools are actually enabled.
- Actual payment, cancellation, refund, revision, ownership and support terms.
- Effective date, version and the person responsible for approving policy wording.

I can organise and draft text from those facts. I cannot determine your contractual decisions or infer legal compliance from the current technology list. The existing four records should be reviewed rather than treated as approved solely because they are populated.

## 18. SEO, brand assets and optional tracking

**Admins:** `/dashboard/seo`, `/dashboard/media`, `/dashboard/marketing`, `/dashboard/settings`.

For each important page, I need its intended customer, main topic, target location if relevant, and main action. From approved copy I can derive a sensible page title, meta description, URL slug and social-card text. You do not need to supply keyword lists or technical schema JSON.

Tell me about old URLs that must keep working, pages that should stay private/unindexed, alternate domains and any brand naming rules. Do not change existing slugs casually; redirects may be needed.

For images, supply original logos, real portraits, permission-cleared project screenshots, approved industry imagery and any brand guide. Label each asset with its subject, intended page, caption/context, permission status and any confidential areas to remove. I can handle cropping, responsive versions, compression, filenames and alt text. Large videos are optional and need a delivery/performance plan.

Only provide analytics/verification IDs if you actually use those services. Blank optional tracking fields do not need filling just to make the admin look complete. Social-media API integrations remain outside this content task; public profile URLs can be supplied as ordinary links. Do not paste API keys, service-role keys, database passwords or private client credentials into the content brief.

## 19. Admin and website connection gaps to account for

Not every blank area is a writing problem, and not every admin field currently controls the visible page.

| Gap found in source review | Implication |
|---|---|
| Homepage robot headline/CTA copy is in `RobotHeroClient.tsx` | Editing the `home` hero record alone will not update that text |
| About story, milestones and referral offer contain hardcoded text | Approved company facts require corresponding code/CMS connection work |
| Site constants supply some footer/contact/SEO information | Settings, Contact and code need a consistency pass |
| Calculators and the admin pricing reference contain hardcoded amounts | Changing pricing tiers alone will not update every estimate |
| Services schema includes image/icon/FAQ fields not fully exposed in the Services form | Content can be prepared now, but those controls/rendering need completing |
| Knowledge-base schema includes author and cover fields not exposed in its current form | Author/image assignment needs a form enhancement or controlled database entry |
| Glossary schema includes related concepts and service relationships not exposed in its form | Prepare those notes separately for later wiring |
| Statistics and some supporting content tables have no dedicated editing section in the current dashboard | They need an editor or controlled Supabase update, not a guessed destination |
| Several public collections deliberately show an empty-state message | Publishing real records is what fills them |
| Some content defaults/fallbacks already display names, figures and offers | Review those as carefully as empty fields |

These are implementation follow-ups identified by this report, not changes performed in this turn. When content is ready, we should distinguish “written”, “saved in Supabase” and “verified on the public page”. They are different completion steps.

## 20. What I can prepare from your information

Once you provide the facts, I can prepare:

- Consistent page copy and calls to action.
- Service/solution descriptions, features, FAQs and workflow explanations.
- Case studies based on your approved evidence.
- Team/author biographies and properly attributed testimonials.
- Article/guide drafts, glossary entries and resource drafts.
- SEO titles, descriptions, slugs, categories, tags and image alt text.
- A record-by-record admin/Supabase entry plan, including child-table fields.
- A list of missing assets, factual questions and required CMS connections.

You do not need to provide database IDs, timestamps, SQL, icon identifiers, reading-time estimates, finished HTML/Markdown or polished English. I will prepare those technical/editorial details where needed. Publication dates, prices, factual claims, permissions and business terms remain your decisions.

## 21. Suggested order for sending information

1. **Business essentials:** company facts, contact details, audience, tone, confirmed services and real pricing.
2. **Trust material:** project facts/screenshots, client logos, team details, approved testimonials and verified statistics.
3. **Conversion details:** FAQs, consultation availability, support/payment terms and policy practices.
4. **Content expansion:** authors, article/guide topics, glossary, resources, demos and actual vacancies.
5. **Final approval:** resolve missing facts, approve drafts, configure publishing/availability, and verify each public page after entry.

Mark each item **Confirmed**, **Needs correction**, **Unknown**, or **Not applicable**. You can send one batch at a time. Empty optional sections can remain unpublished until you have something useful and true to publish.

Use [the reply template](content-intake-template.md) to send your answers.
