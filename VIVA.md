# NutriAI Viva Questions & Answers (Final Year Major Project Guide)

To prepare you for your final major project review and examination, here are **20 highly curated, professional Viva Questions & Answers** covering all layers of the **NutriAI** architecture.

---

### Q1: What is the primary objective of the NutriAI application?
**Answer:** The objective of NutriAI is to build a modern, high-performance, and AI-driven nutrition and physique transformation web application. It automates daily fitness tracking by estimating individual body parameters (BMR, TDEE, and BMI) and dynamically allocating custom calorie budgets and macronutrient splits (Protein, Carbs, Fat) alongside an AI-powered fitness chatbot coach.

### Q2: What is the Technology Stack used in this project, and why?
**Answer:** 
* **Frontend:** Next.js 14 (App Router) with React, TypeScript, and Tailwind CSS. Next.js was chosen for its high-performance server-side rendering (SSR), optimized search engine visibility (SEO), and simplified routing.
* **Animations:** Framer Motion (for liquid-smooth transitions).
* **Charts:** Recharts (dynamic client-side line and bar graphs).
* **Database:** PostgreSQL (Supabase DB) with active Row-Level Security (RLS) policies.
* **AI:** Official Gemini API / OpenAI API.

### Q3: Explain BMR and TDEE. What equation is used in this project?
**Answer:** 
* **BMR (Basal Metabolic Rate):** The minimum number of calories your body requires to perform basic life-sustaining functions at rest.
* **TDEE (Total Daily Energy Expenditure):** The total number of calories your body burns in a 24-hour period, calculated by multiplying BMR by an Activity Level multiplier.
* **Equation:** NutriAI uses the **Mifflin-St Jeor Equation**, which is clinical medicine's gold standard:
  * **Men:** $BMR = (10 \times \text{weight in kg}) + (6.25 \times \text{height in cm}) - (5 \times \text{age in years}) + 5$
  * **Women:** $BMR = (10 \times \text{weight in kg}) + (6.25 \times \text{height in cm}) - (5 \times \text{age in years}) - 161$

### Q4: How are Macronutrients (Protein, Carbs, Fats) calculated in the system?
**Answer:** After calculating target calories (TDEE minus 500 kcal for fat loss; TDEE plus 300 kcal for muscle gain):
1. **Protein:** Set based on bodyweight multiplier ratio ($1.6g$ to $2.2g$ per kg) aligned with goals.
2. **Fat:** Allocated to cover exactly **25%** of daily calorie budget ($1g$ of fat = 9 calories).
3. **Carbohydrates:** Cover the remaining calorie budget ($1g$ of carb = 4 calories). 
   * $\text{Carbs (g)} = \frac{\text{Target Calories} - (\text{Protein} \times 4) - (\text{Fat} \times 9)}{4}$.

### Q5: What is "Glassmorphism" and how did you implement it in Tailwind CSS?
**Answer:** Glassmorphism is a modern, premium design aesthetic characterized by frosted glass-like panels, translucent overlays, and floating neon drop shadows. 
* We implemented it by creating a custom reusable **`<GlassCard />`** component.
* Tailwind classes used: **`bg-slate-900/60`** (translucency), **`backdrop-blur-xl`** (frosted blur), and **`border-white/[0.08]`** (reflective borders) along with neon outer shadows (**`shadow-[0_0_30px_rgba(16,185,129,0.15)]`**).

### Q6: How does the Dual-Mode Authentication and State architecture work?
**Answer:** To make the application instantly demonstrable, we built a transparent **Mock-to-Production Sync Context**:
* **Standalone Mock Mode:** If Supabase keys are not present in `.env.local`, the application stores active profiles, weight logs, food catalog catalogs, and chatbot history directly in persistent **`localStorage`**.
* **Production Mode:** Once Supabase configuration endpoints are added, the hooks automatically switch to secure Supabase JWT authorizations and real-time PostgreSQL database synchronizations.

### Q7: Explain the folder structure and why Next.js App Router was preferred.
**Answer:** Next.js 14 App Router uses a nested routing system based on folder hierarchies (e.g. `/app/dashboard/page.tsx` translates directly to the `/dashboard` route). It was preferred because:
1. **Layout Persistence:** Header navigation bars are defined in `layout.tsx` and preserve state during page transitions.
2. **Built-in API Routes:** Allows proxying serverless APIs (e.g. `/api/ai`) in the same project without managing a separate backend server.

### Q8: What are Next.js API Routes and how are they used in NutriAI?
**Answer:** Next.js API Routes (defined under `/app/api/*`) represent backend serverless API endpoints. In NutriAI, `/app/api/ai/route.ts` is used as a secure server-side proxy:
* It protects client safety by wrapping LLM API keys (`GEMINI_API_KEY`) on the server.
* It parses user requests, appends physical context metadata (name, weight, target calories), and makes direct requests to the Gemini API, returning the response as clean JSON.

### Q9: Why is Recharts imported dynamically using Next.js `dynamic()`?
**Answer:** Recharts uses HTML5 canvas elements which require client-side browser windows (`window` object) to measure layouts and render graphs. Since Next.js uses server-side pre-rendering, importing Recharts directly would cause **Hydration Mismatches** and crash the server. We bypass this by wrapping Recharts in `dynamic(() => import('recharts'), { ssr: false })` to force browser-only execution.

### Q10: How does the AI Assistant Chatbot maintain context?
**Answer:** On every messaging transaction:
* The client gathers the latest calorie counts and weight logs from `AppContext`.
* It appends these metrics into a system prompt on the backend (`api/ai/route.ts`), instructing the LLM: *"You are coaching Rahul Sharma who weighs 78kg and has logged 850kcal out of 2000kcal today."*
* This ensures that the assistant's responses are not generic but highly customized to the user's progress.

### Q11: Explain Row-Level Security (RLS) in PostgreSQL.
**Answer:** Row-Level Security (RLS) is a PostgreSQL security standard that enables fine-grained authorization rules. Rather than letting any user query the whole table, RLS applies policies directly on SQL operations:
* **Example:** `CREATE POLICY "Users own data" ON meals FOR ALL USING (auth.uid() = user_id);`
* This guarantees that a user can only select, insert, or delete rows where the `user_id` matches their authenticated session ID.

### Q12: How are preloaded Indian foods structured?
**Answer:** We created a predefined dictionary catalog in `src/lib/foods.ts` mapping typical Indian staples (Roti, Basmati Rice, Palak Paneer, Dal Tadka, Moong Dal Cheela, Egg Bhurji) with their serving sizes, calories, and exact protein/carb/fat content. This makes the search tracker extremely fast, accurate, and relevant to regional users.

### Q13: What triggers calorie budget calculations in the app?
**Answer:** Daily calorie limits are dynamically calculated immediately when the user:
1. Completes the initial onboarding assessment.
2. Updates their current weight using the "Log Weight" tracker on their dashboard.

### Q14: How does the Admin Panel manage food records?
**Answer:** The Admin Panel leverages state hooks exported by `AppContext`. When an administrator fills in the custom food creator, it authorizes the entry and executes `addNewFoodToCatalog()`, adding the food directly to the catalog so regular users can immediately search and log it.

### Q15: What calculations govern the hydration wave tracker?
**Answer:** The wave container measures the proportion: $\text{Percent} = \frac{\text{Logged Water (ml)}}{\text{Target Water (ml)}} \times 100$. 
* The active height of the indigo absolute wave overlay is driven by this percentage, using CSS transitions for smooth animations.

### Q16: How did you implement state management?
**Answer:** State management is implemented using **React Context API** (`AuthContext` and `AppContext`). It provides centralized states for authenticated users, daily logged foods, weights, and hydration, exposing unified setters and callbacks to components across the entire layout tree.

### Q17: What security features does your database structure have?
**Answer:**
1. **Cascade Deletes:** Foreign keys utilize `ON DELETE CASCADE` so deleting a user profile automatically purges their weight log, goals, and meals history, leaving no orphan rows.
2. **Relational Constraints:** Unique constraints (`unique_user_date_weight`) prevent duplicate weights being logged on the same calendar day.

### Q18: What is the benefit of using TypeScript?
**Answer:** TypeScript provides static typing, catching data structural errors during development rather than at runtime. For example, it guarantees that any logged meal adheres exactly to the `LoggedMeal` interface containing numeric values for calories, protein, carbs, and fat.

### Q19: How would you deploy this project to production?
**Answer:** 
1. **Frontend Hosting:** Vercel (seamlessly links with the GitHub repository, building Next.js optimization blocks automatically).
2. **Database:** Supabase (provisions the PostgreSQL engine).
3. **API Keys:** API secrets are configured securely inside Vercel's Environment Variables panel.

### Q20: What is the future scope of this project?
**Answer:**
1. **Computer Vision Food Logging:** Integrating photographic image recognition so users can take a photo of a meal and let AI analyze calories (similar to Cal AI).
2. **Wearable Integrations:** Connecting smartwatches via Google Fit or Apple HealthKit to automatically sync workout TDEE calories.
