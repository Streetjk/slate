# Campaign 7 — Perth Calendar, Weather, and Google News

Repository: `Streetjk/slate`
Feature branch: `feature/perth-calendar-weather-google-news`
Base integration branch: `integration/note4-custom`

## Authority and isolation

This campaign is a separate backend/shared/frontend feature campaign. It must not alter Campaign 6D e-ink controller timing, waveform/LUT, partial-window implementation, SPI settings, power sequencing, or flash state.

Before implementation:
1. Fetch origin and rebase/merge only when safe against the latest `integration/note4-custom`.
2. Read `AGENTS.md`, `docs/campaign-reports/CAMPAIGN-INSTRUCTIONS.md`, `docs/campaign-reports/CAMPAIGN-STATE.md`, and this directive.
3. Treat Codex as controller/integrator and sole production-write authority. Claude Sonnet 5 may be used as a bounded implementation/research worker through an existing authorized Claude/Claude Code login path. AGY/Gemini remains the required independent reviewer.
4. Do not introduce new static AI credentials.

## Current root-cause observations

### Calendar

The current daily/month calendar path is not English-only:
- `daily-calendar.json` renders `data.weekdayCN`, lunar and solar-term fields.
- `calendar-frame-renderer.ts` contains Chinese weekday labels, lunar/Ganzhi/festival/宜/忌 labels and Chinese relative-day strings.
- `calendar-data.service.ts` builds Chinese lunar/Ganzhi/traditional-festival data.

The Outlook calendar path is already closer to the target: it defaults to `Australia/Perth`, uses `en-AU`, and formats event times as 24-hour local time. Preserve Outlook read-only isolation and Gemini separation.

### Weather

The current weather path is structurally China-specific:
- shared config accepts only `provider: qweather`;
- QWeather city lookup forces `range=cn` and `lang=zh`;
- forecast/current calls force `lang=zh`;
- visible fallback labels are Chinese;
- QWeather additionally depends on deployment API host/key configuration.

This is not a suitable default path for Perth/Australian weather.

### News

No first-class Google News dynamic content type exists. Do not overload `hot_list`; add a dedicated provider/config/renderer so caching, parsing, locale and failure behavior are explicit and testable.

## Product requirements

### C7.1 — English-only Perth calendar

Apply to built-in `daily_calendar` and `month_calendar`, and ensure `outlook_calendar` remains consistent.

Requirements:
- User-visible calendar text must be English only.
- Default and canonical timezone for this NOTE4 deployment: `Australia/Perth`.
- Locale: `en-AU`.
- Event times: 24-hour Perth local time (`HH:mm`), preserving `ALL DAY` for all-day events.
- Dates must follow Australian conventions, e.g. `Tue 01 Sep`, `1 September 2026`, or another compact `en-AU` equivalent appropriate to 400x300.
- Month weekday headings must be English (`Sun`–`Sat` or compact unambiguous English equivalents).
- Remove lunar calendar, Ganzhi, Chinese solar terms, Chinese traditional-festival labels, 宜/忌 and Chinese relative-day labels from the English NOTE4 calendar render path.
- No hidden UTC/local conversion bug around midnight. Add deterministic tests covering UTC dates that fall on a different calendar date in Perth.
- Existing Outlook calendar privacy remains unchanged: read-only Graph calendarView only; do not expose Outlook token, descriptions, attendees, or Graph access to Gemini.

A clean daily-calendar layout should prioritize:
1. English weekday/date;
2. optional WA public-holiday name when applicable;
3. simple useful date information rather than Chinese almanac fields.

### C7.2 — WA public holidays on month calendar

Display Western Australian public holidays in the monthly calendar for Perth/metropolitan WA.

Authoritative source:
- Western Australian Government public-holiday page: `https://www.wa.gov.au/service/employment/workplace-arrangements/public-holidays-western-australia`
- As of 2026-09-01 it publishes confirmed 2026 and 2027 dates and notes future dates such as 2028 are published when confirmed.

Requirements:
- Use confirmed WA Government dates, including substitute/additional public-holiday dates where WA law creates both an actual and observed day.
- For Perth use the ordinary WA King's Birthday date, not Karratha/Port Hedland regional alternative dates.
- Do not assume proposed future public-holiday-review changes are law until confirmed by an authoritative source.
- Prefer a small deterministic, versioned WA-holiday data module for confirmed years with source URL/source-as-of metadata and tests. Do not scrape the WA Government page on every render.
- Do not invent unconfirmed future-year dates. If a year lacks confirmed data, render the calendar normally and record a bounded warning/telemetry signal rather than fabricating holidays.
- Holiday text must be compact enough for a 400x300 month grid. Use an English abbreviated holiday label or visible marker with a concise legend if the full name will not fit.
- Tests must cover at least all official 2026 and 2027 Perth WA public-holiday dates, including Anzac/Christmas/Boxing Day substitute dates.

### C7.3 — Repair weather for Perth/global locations

First diagnose the currently deployed weather failure and record the exact failure class without exposing secrets.

Then provide a weather path that works for Perth without requiring a China-only provider.

Preferred implementation:
- Add `open_meteo` as a supported weather provider and make it the default/recommended provider for Australia/global locations.
- Preserve existing QWeather compatibility for existing China configurations rather than breaking them.
- Use Open-Meteo geocoding for human-readable city search and persist stable latitude/longitude plus `location_label` and timezone where appropriate.
- Use `Australia/Perth` for Perth.
- Open-Meteo Weather Forecast API documentation: `https://open-meteo.com/en/docs`
- Open-Meteo geocoding documentation: `https://open-meteo.com/en/docs/geocoding-api`
- Do not add an API key for the normal personal/non-commercial Open-Meteo path.

Weather tile requirements:
- English-only visible labels and weather condition descriptions for the Perth configuration.
- Celsius, km/h, hPa, metric precipitation.
- Current temperature, feels-like, humidity, wind and concise condition.
- At least a 3-day forecast consistent with the existing tile size.
- Correct Perth local day labels; no Chinese `今日/明日/后天` fallback.
- WMO weather-code mapping must be deterministic and tested.
- Existing cache, timeout, stale-data fallback and bounded error-backoff behavior must remain or improve.
- Fixed provider endpoints only; do not create an arbitrary-URL SSRF surface.
- If Open-Meteo fails and recent last-good data is within the bounded reuse window, retain the last-good frame and expose a stale marker only if it can be done cleanly.

### C7.4 — Google News AU + Taiwan tile

Add a dedicated dynamic content type, proposed name: `google_news`.

The provider must use fixed Google News RSS edition URLs, not arbitrary user-supplied URLs.

Probe the live feeds during implementation before locking the exact URLs. Candidate edition forms:
- Australia: `https://news.google.com/rss?hl=en-AU&gl=AU&ceid=AU:en`
- Taiwan Traditional Chinese: `https://news.google.com/rss?hl=zh-TW&gl=TW&ceid=TW:zh-Hant`

Requirements:
- Config supports `edition: au | tw | both`, with `both` as the NOTE4 default.
- AU headlines stay English/source-provided.
- Taiwan headlines stay Traditional Chinese/source-provided; do not machine-translate them unless separately requested.
- For `both`, render a compact split/sectioned tile with clear `AU` and `TW` headings. Prefer 2–3 readable headlines per region over overcrowding the 400x300 screen.
- Render headline + source; publication time is optional only if space remains.
- Do not fetch or reproduce full article bodies.
- Do not use Gemini to summarize news in this PR.
- Strip/normalize HTML entities and whitespace safely.
- Use a bounded XML parser configuration; no external entity/network expansion.
- Fixed Google hostname/feed routes only, request timeout, response-size cap, sane User-Agent, bounded cache, in-flight dedupe and stale last-good fallback.
- Deduplicate repeated titles/links and cap stored/rendered items.
- Add deterministic parser fixtures for AU English and TW Traditional Chinese RSS.
- Add a dedicated 1bpp renderer and snapshot/hash-oriented tests demonstrating the two editions remain legible.

If Google changes or blocks the candidate RSS routes during implementation, stop the Google News subtask with evidence and propose a fallback source; do not silently switch to scraping Google News HTML.

### C7.5 — Frontend/Web UI

Expose the new/updated options through the existing dynamic-content editor without requiring hand-edited JSON:
- Calendar defaults to Perth and English presentation.
- Weather can search/select Perth and other global cities through the selected provider.
- Google News exposes AU / Taiwan / Both.
- Preserve validation through shared Zod schemas.

Do not display provider secrets in the UI.

## Testing and gates

For all production changes:
- provider/config unit tests;
- renderer tests producing exact 400x300 / `FRAME_BYTES` output;
- timezone boundary tests using `Australia/Perth` and `en-AU`;
- WA holiday fixtures for 2026 and 2027;
- weather success/failure/cache/stale fallback tests;
- Google News RSS parser tests for AU and TW;
- frontend editor/config tests where available;
- full backend tests;
- shared tests;
- format/lint/typecheck;
- frontend production build;
- Prisma validation if touched;
- secret-pattern scan;
- `git diff --check`.

No firmware build is required if this remains entirely backend/shared/frontend and generic dynamic-frame delivery is unchanged. If firmware source is touched, exact ESP-IDF 5.5.2 / esp32s3 becomes mandatory.

Run AGY medium review for the complete PR; use high effort if authentication, public ingress, or security boundaries are changed. Maximum three review/fix loops for substantive findings.

## Deployment/physical acceptance

Do not merge or deploy automatically into the Orange Pi production instance until:
- deterministic gates pass;
- reviewer returns PASS/no unresolved P1;
- the PR report lists exact changed dynamic types and migration compatibility.

After deployment is separately authorized, physically verify on NOTE4:
1. daily calendar: English + Perth date;
2. month calendar: English + correct current-month WA public holiday marking;
3. Outlook tile: Perth 24-hour times still correct;
4. weather: Perth current conditions + forecast update successfully;
5. Google News AU mode;
6. Google News TW mode;
7. Google News Both mode.

Do not disturb Campaign 6D refresh measurements/firmware while this PR is under development.

## Report

Before requesting merge, create/update:
`docs/campaign-reports/07-PERTH-CALENDAR-WEATHER-GOOGLE-NEWS.md`

Report must include:
- base/head SHAs;
- root cause of weather failure;
- exact weather provider chosen and why;
- exact Google News feed URLs proven live during implementation;
- WA holiday source/as-of date and years included;
- tests/gates;
- reviewer verdict;
- any new dependency and license/security impact;
- whether firmware was touched (`NO` preferred);
- deployment status (`NOT DEPLOYED` until separately authorized).
