Careers Page Builder
Overview
This project is a simplified Careers Page Builder inspired by platforms like Workable and Ashby. The goal is to create a small, usable product where recruiters can build branded careers pages for their company, and candidates can browse job listings from those pages.
The focus of this project is not on building a full ATS, but on delivering a clean and intuitive experience for both recruiters and candidates.
________________________________________
What I Built
The application supports two types of users:
Recruiter (Admin)
•	Can log in to the system
•	Can customize their company’s careers page
•	Can preview changes before publishing
•	Can publish a public careers page
Candidate (Public User)
•	Does not need to log in
•	Can visit a company’s careers page
•	Can browse and filter job listings
•	Can view job details

Access Restrictions
•	Only authenticated users can access the editing interface (/company-slug/edit)
•	Public users (candidates) can only access the careers page (/company-slug/careers)
•	Direct access to edit routes without login is restricted
Design Rationale
•	Keeps implementation simple and fast
•	Avoids complexity of role-based access control
•	Ensures basic security by preventing unauthorized edits
•	Suitable for a prototype-level system
Trade-offs
•	Multiple users from the same company share credentials
•	No fine-grained access control (e.g., admin vs editor roles)

 Application Flow
1.	First time admin sign up and from next time use login
2.	For each company there should be one user id and one password , multiple members of same company have to use these credentials to login in
3.	Redirect to /company-slug/edit
4.	Customize page:
o	Branding
o	Sections
5.	Two options available preview and publish
6.	Preview shows how the page is and then admin can publish or either he can directly publish without preview

NOTE :  there should be an option called save when admin again comes back if he is saved previously , then continuation has to be shown upto that points all the editing that he had done should be save under some company name.
________________________________________
Key Features
1. Careers Page Builder (Main Feature)
The builder is designed with a split layout:
•	Left side: Controls (editing panel)
•	Right side: Live preview (real-time updates)
This allows recruiters to immediately see how their changes affect the final page.
________________________________________
2. Branding Customization
Recruiters can:
•	Upload a company logo
•	Upload a banner image
•	Choose a primary theme color
•	Add a culture video link (optional)
Instead of allowing full design freedom, branding is controlled through a global theme to keep the UI consistent and clean.
________________________________________
3. Section-Based Page Structure
The careers page is built using predefined sections. This avoids complexity while still allowing customization.
Supported sections:
•	About Us (text-based)
•	Life at Company (supports multiple layouts like text, images, or cards)
•	Jobs Section (fixed and always present)
Recruiters can:
•	Add/remove sections
•	Reorder sections use simple up and down buttons avoid complex drag and drop options
•	Edit content within each section
________________________________________
4. Template-Based Customization
Instead of allowing users to design everything from scratch, sections follow predefined templates.
For example:
•	“Life at Company” can be:
o	Text layout
o	Image gallery
o	Card-based layout
This keeps the UI manageable and ensures consistency across pages.
________________________________________
5. Live Preview
Changes made in the editor are reflected instantly in the preview panel.
There is also a dedicated preview mode to view the full page before publishing.
________________________________________
6. Public Careers Page
Each company has a public URL:
/company-slug/careers
This page includes:
•	Branding (banner, logo)
•	All configured sections
•	Job listings
________________________________________
7. Jobs Section
The jobs section is designed to be simple and easy to use.
This information will be added by admin and candidate can see.Information has to be stored for each company separately.
Job Cards (Minimal View)
Each job displays:
•	Job title
•	Location
•	Work type (Remote/Office)
•	Employment type (Full-time/Intern)
Filters
To avoid clutter, only a few meaningful filters are provided:
•	Search by job title
•	Location
•	Employment type
•	Work type
Job Details Page
Clicking a job opens a detailed view showing:
•	Title
•	Location
•	Work type
•	Employment type
•	Salary (if available)
•	Experience level
•	Posted time
•	Description
An “Apply Now” button is included but is non-functional, as the assignment focuses only on browsing.

________________________________________
Design Decisions
1. Limited Customization Instead of Full Freedom
Instead of building a fully flexible page builder, I used predefined sections and layouts. This keeps the experience simple and avoids overwhelming users.
________________________________________
2. Global Styling Instead of Per-Text Styling
Styling is applied globally (colors, fonts) instead of allowing customization for every individual text element. This ensures visual consistency and reduces UI complexity.
________________________________________
3. Minimal Job Cards
Only essential information is shown on job cards to make scanning easier. Additional details are moved to the job details page.
________________________________________
4. Controlled Filters
Only the most useful filters are included. Adding too many filters would clutter the interface and reduce usability.
________________________________________
5. No Application Flow
The application process (form submission, resume upload, etc.) is intentionally not implemented. The assignment specifically focuses on job discovery, not applications.
________________________________________
6. Real-Time Feedback
The live preview helps recruiters understand changes instantly, improving usability and reducing friction.
________________________________________
What I Did Not Build
To keep the scope focused and aligned with the assignment:
•	No full authentication system
•	No job application flow
•	No advanced drag-and-drop builder
•	No analytics or tracking features
________________________________________
Possible Improvements
If this were extended further, I would consider:
•	Adding more section templates
•	Manage different companies information more efficiently
•	Adding better filtering (multi-select, tags)
•	Improving mobile responsiveness further
________________________________________
Final Thoughts
This project focuses on delivering a clean and usable prototype rather than a feature-heavy system. The main goal was to replicate how real-world careers pages work while keeping the implementation simple, scalable, and easy to demo.
The decisions made prioritize:
•	Simplicity
•	Usability
•	Maintainability
Over adding unnecessary complexity.
________________________________________
Techstack:

1.Frontend: Next.js
2.Styling: Tailwind CSS
3.Backend: Next.js API Routes (Node.js)
4.Database: PostgreSQL (Supabase or Neon)
5.Authentication: Basic email/password (custom or Supabase Auth)
6.Hosting: Vercel
7.Storage (images): Supabase Storage / Cloudinary

