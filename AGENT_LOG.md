## Agent Log — AI Usage & Iteration Notes

I started by carefully going through the assignment document and the provided reference links to understand the expected functionality, UX patterns, and overall scope. Based on that, I designed the architecture step by step — thinking through routing, data flow, and how different parts of the system (editor, preview, public page) would connect. Before jumping into coding, I had a clear high-level plan and a rough internal “spec” including the tech stack and structure.

For implementation, I used AI as a development assistant rather than a direct solution provider. I approached the build feature-by-feature. For each feature, I wrote detailed prompts describing exactly what I wanted, including constraints and expected behavior. After AI generated code, I didn’t directly accept it — I reviewed how it worked, verified it against my design, and adjusted where needed.

In some areas, I explored multiple approaches before deciding. A good example is authentication — I first asked AI for different possible approaches, compared them (session-based vs token-based), and then chose session cookies as the best fit for this MVP. Only after making that decision did I ask AI to implement it.

For the editor and page-building features, I combined my own ideas with AI assistance. I described the behavior I wanted (like structured sections, live preview, and simple customization) and iteratively refined the implementation through multiple prompts. This helped me maintain control over the product direction while still moving quickly.

The concurrency logic was more intentional. I had a clear idea that I didn’t want multiple admins overwriting each other’s changes silently. I designed the approach using a versioning system (`draft_version`) and then guided AI to implement it. This part required more reasoning and validation, as I ensured the logic handled conflicts correctly and didn’t break in edge cases.

Throughout the process, I relied on prompt engineering — refining prompts, adding constraints, and iterating on outputs — to get closer to what I had in mind. AI helped speed up development and reduce boilerplate, but key decisions (like data modeling, concurrency handling, and overall architecture) were driven and validated by me.

Overall, AI acted as a productivity tool, while I focused on structuring the system, making tradeoffs, and ensuring the implementation aligned with the intended design.
