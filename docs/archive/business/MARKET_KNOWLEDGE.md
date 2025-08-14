Sharpened — Market Intelligence & GTM Brief (Aug 13, 2025)
ICP: 18–30 “builder-athletes” (CS/eng students, indie devs, junior SWEs who lift/run and study hard).
Wedges:

Feel Sharper (FS) — “Quick Log + Streaks” (meals/workouts/weight; daily streak hook)

Study Sharper (SS) — “Auto Focus + Leaderboard” (passive focus via tab/inactivity; weekly small-group competition)

Executive takeaways (decision-ready)
FS is riding two tailwinds: (a) fitness app usage is still large + growing; (b) frictionless/photo logging is maturing fast enough for a credible “1-tap log” MVP. Design around photo→human-verified macros + streaks. 
Business of Apps
Gridfiti

SS demand exists via massive study/focus communities (Discord, Forest, Study Together). Passive desktop tracking with Page Visibility + Idle Detection is feasible with clear consent. Lean into weekly micro-leagues (5–12 people) to avoid global-board toxicity. 
studytogether.com
Reddit

Streaks work—early. Evidence shows highlighted (intact) streaks increase subsequent engagement; but broken streaks can backfire. Build gentle recovery (grace windows, freezes, “fresh-start” nudges). 
Oxford Academic
MedRxiv

Launch where these users already are: uni barbell/running clubs + CS clubs (US & Brazil), Strava clubs, Discord study servers. Run campus micro-tournaments (SS) and 7-day FS streak challenges with club leaders. 
stanfordrunningclub.com
prip.usp.br

Wedge 1 — Feel Sharper (FS): Quick Log + Streaks
Landscape & user behavior (last 12 months)
Fitness app category remains huge; Business of Apps’ 2025 brief highlights scale (345M+ users; 850M downloads). FS can win through lower logging friction, not new content. 
Business of Apps

Photo-based logging is credible now. SnapCalorie’s photo logging (ex-Google Lens team) uses a marketplace of human verifiers to improve accuracy—proof there’s demand for low-input logging with QA. MVP can copy the pattern: photo→instant AI estimate→optional human verify on flagged items. 
Gridfiti

Strava stays culturally dominant for builder-athletes (125M+). Their weekly club leaderboards keep students engaged—a cue for FS “weekly streak + club view.” 
Rumen
Strava Community Hub

Streak mechanics: what to copy & avoid
Do: visibly highlight intact streaks (JCR shows increased re-engagement when streaks are emphasized). 
Oxford Academic

Avoid: brittle streaks. A Dec-2024 preprint finds ending long streaks can demotivate; offer “freeze” tokens and 24-hour grace after travel/illness. Duolingo popularized streak freezes and a broader “keep your streak” system. 
MedRxiv
coglode.com

FS MVP spec (de-risking the wedge)
Capture: 1-tap weight; 1-tap “repeat last meal/workout”; photo meal log with auto-parse; quick add macros. (Flag for human verify when confidence < threshold.)

Autofill: recurring meals/workouts from history templates; “usual at this time?” prompts.

Streak UX: daily chain, freeze tokens, weekend-skip mode, soft reset that preserves “longest streak”.

Insights: mini card after log (“calories remaining”, “protein gap”, “today vs 7-day avg”)—no generic coach fluff.

Privacy: on-device photo processing first; server only for verification.

Success gates (first 2 weeks alpha): median TTF-Log ≤ 12s (meal), ≤ 4s (weight); ≥ 60% of meal logs via 1-tap/photo; parse-failure rate < 1% with fallback; D7 retention ≥ 35%; ≥ 20% actives view a daily insight and click an action. (Matches your Zero-Friction bar.)

Wedge 2 — Study Sharper (SS): Auto Focus + Leaderboard
Feasibility of passive focus tracking
Tab visibility (document.hidden/visibilitychange) + Idle Detection API (user-granted; monitors keyboard/mouse inactivity) enable low-overhead “focus minutes” without spyware. Build as desktop app/extension with explicit consent. 
forestapp.cc
YouTube

Comparable tools show demand for automatic tracking + summaries (Rize auto-tracks; daily/weekly reports). RescueTime runs in background with focus sessions. Proof that passive > manual. 
rize.io
rescuetime.com

Competition & community proof
Forest uses social planting and challenges; large community & Discord offshoots. Feature parity for “room focus” and “weekly group challenge” is table stakes. 
JustAnswer
thehiveindex.com

Study Together/StudyStream: 850k–1M+ member ecosystem; leaderboards + stats are core. We can niche down to builder-athlete micro-leagues (CS + lifting/running friends). 
Discord
studytogether.com

SS MVP spec (de-risking the wedge)
Signal: focus minute = visible tab of whitelisted apps/sites and user not idle. Count short “micro-breaks” (≤60s) as continuous.

Anti-cheat: random “still focused?” micro-prompts (optional), app whitelist, idle threshold editing, log transparency.

Leaderboard: weekly groups of 5–12 (avoid global toxicity), metrics: focus minutes, “no-distraction blocks”, recovery streaks. Include “handicap” for different schedules.

Consent & privacy: local logs by default; export/share opt-in; clear “on/off” hotkey.

Success gates (first 2 weeks beta): median setup ≤ 60s; passive capture accuracy agreement with self-report ≥ 85% on spot checks; weekly league engagement ≥ 70% (posted at least 3 sessions); D7 retention ≥ 40%; ≥ 50% of focus time is in ≥25-min blocks.

Launch-ready community map (US + Brazil; plus global online)
University clubs (US):

Stanford Running Club (active weekly schedule) & Powerlifting Club (official 2025–26 roster) → ideal micro-leagues + FS streak challenge. 
stanfordrunningclub.com
Stanford Recreation

MIT Running/Cycling/Club Sports umbrella → broad access to student-led sport orgs (barbell interest visible in campus forums). 
cycling.mit.edu
Club Sports
Reddit

UW (Washington) Barbell Club (Huskylink) → powerlifting culture; easy SS league pilot. 
huskylink.washington.edu

University clubs (Brazil):

Atlética Poli-USP (official sports org) + Circuito USP de Corrida e Caminhada 2025 (9-stage running circuit across campuses) → perfect FS streak races + SS focus sprints before exams. 
atleticapoliusp.com.br
prip.usp.br

Atletismo Unicamp (official team; active schedule) → recruit captains for early cohorts. 
Instagram

Online ecosystems to seed:

Study Together / StudyStream (largest Discord study rooms; public leaderboards/stats). Run “builder-athlete” weekly leagues. 
studytogether.com

Forest communities & Discord (study/focus). Offer joint “plant + focus” events. 
JustAnswer

Strava Clubs (college and local) with built-in weekly leaderboards; sponsor “FS 7-day streak challenge”. 
Strava Community Hub

Notion habit-streak templates (users already track streaks there) → distribute a “Sharpened streak board” template for top-of-funnel. 
Notion

Risks & mitigations (flagged)
Streak backfire / anxiety after a break: add freezes, grace windows, “resume at last tier” messaging. 
MedRxiv

Privacy optics (SS): use standard browser APIs (Page Visibility, Idle Detection) and explicit consent; default local storage; simple pause control; publish a clear privacy page. 
forestapp.cc
YouTube

Photo logging accuracy (FS): keep human-verify queue for low-confidence items (users opt-in); show confidence labels. (Market precedent exists.) 
Gridfiti

30-day go-to-market experiments (US + Brazil)
Week 1 – Seed + instrument

Ship FS alpha (photo + 1-tap repeats + weight) and SS desktop (passive focus + 5–12 group boards).

Recruit 6 captains (Stanford/MIT/USP/Unicamp: running + barbell + CS each). Each captain forms a 12-person cohort.

Week 2 – Streak & micro-league pilots

FS: 7-day “Don’t Break the Chain” sprint; give 2 freeze tokens per user. Goal: ≥60% complete 5+ days. 
todoist.com

SS: 3× 50-min focus races per cohort; points for distraction-free blocks and comeback streaks.

Week 3 – Cross-community

Partner a Strava club run with a post-run FS quick-log booth. Offer “longest streak” social badge. 
Strava Community Hub

Host a Study Together co-event: “Builder-Athlete Focus Night” with SS leagues. 
studytogether.com

Week 4 – Scale the working loop

Roll winner mechanics network-wide; publish results posts to r/fitness, r/running, r/studying (no spam; provide value).

Ship Notion streak board template with deep-link into Sharpened. 
Notion

Primary KPIs:

FS: TTF-Log median, % 1-tap logs, D7/D14 retention, parse-fail %, daily insights CTR.

SS: install→first-focus time, % sessions auto-detected, weekly league participation, D7/D14 retention, “distraction-free block” rate.

Go/No-Go (end of Day 30):

FS meets all alpha gates and D14 ≥ 28% → scale to 10 campuses.

SS D7 ≥ 40% and weekly group participation ≥ 70% → scale leagues + add mobile presence.

Appendices — Key evidence (last 12 months unless noted)
Fitness category scale / 2025 snapshot: Business of Apps. 
Business of Apps

Photo food logging viability: TechCrunch on SnapCalorie’s photo + human verification. 
Gridfiti

Strava cultural relevance: WSJ profile; weekly club leaderboard mechanics. 
Rumen
Strava Community Hub

Streaks & engagement: Journal of Consumer Research on intact streaks (2022, durable); 2024 preprint on streak backfire risk; Duolingo 2025 streak design notes. 
Oxford Academic
MedRxiv

Passive tracking feasibility: MDN Page Visibility; Chrome Idle Detection API docs. 
forestapp.cc
YouTube

Auto-tracking tools used by our ICP: Rize (auto time tracking; daily/weekly reports), RescueTime (background tracking + focus sessions). 
rize.io
rescuetime.com

Study communities / leaderboards: Study Together/StudyStream (1M+; leaderboards/stats); Forest challenges/community. 
studytogether.com
JustAnswer

Brazil campus running ecosystem: USP multi-campus running circuit 2025. 
prip.usp.br

US & Brazil campus sports orgs (targets): Stanford Powerlifting Club (2025–26); Atlética Poli-USP (official sports org). 
Stanford Recreation
atleticapoliusp.com.br

