# Project rules (template-derived)

Use this document to mirror **structure, tooling, and practices** from the reference template in new work. Replace placeholder names (API project name, entity names, routes) with your own domain; the **patterns** stay the same.

---

## Repository layout

- **`backend/`** — ASP.NET Core Web API (single API project folder, e.g. `YourSolution.API`).
- **`frontend/`** — Vite + React + TypeScript SPA.
- **Root `.gitignore`** — Ignore `node_modules`, build outputs (`dist`), logs, local env files, and common editor cruft; optionally keep `!.vscode/extensions.json` tracked if you use shared VS Code recommendations.

---

## Backend (ASP.NET Core)

### Project & language

- Target a current **.NET** SDK Web project (`Microsoft.NET.Sdk.Web`).
- Enable **nullable reference types** and **implicit usings** in the `.csproj`.
- Prefer the **minimal hosting model**: `Program.cs` with top-level statements (`WebApplication.CreateBuilder`, `var app = builder.Build()`, `app.Run()`).

### Composition root (`Program.cs`)

- Register **`AddControllers()`**.
- Register **`AddOpenApi()`** (or the OpenAPI package aligned with your ASP.NET version).
- Register **EF Core** with **`AddDbContext<TContext>`**, reading the connection string from configuration (e.g. `GetConnectionString("...")`).
- Register **`AddCors()`** without baking policy details into extension calls until the pipeline.
- After `Build()`:
  - In **Development**, map OpenAPI (e.g. `app.MapOpenApi()`).
  - Call **`UseCors`** with a policy that allows the **SPA dev origin** (same scheme/host/port as the Vite dev server).
  - **`UseHttpsRedirection`**, **`UseAuthorization`**, then **`MapControllers()`**.

### Configuration

- **`appsettings.json`**: logging levels, `AllowedHosts`, and **`ConnectionStrings`** for the database.
- **`appsettings.Development.json`**: development-only logging or overrides.
- **`Properties/launchSettings.json`**: `applicationUrl` for HTTPS (and optional HTTP) ports; set `ASPNETCORE_ENVIRONMENT` to `Development` for local profiles.

### Data access

- Use **Entity Framework Core** with the **SQLite** provider for a file-based dev database (adjust provider if you standardize on another engine).
- Place **`DbContext`** and **entity classes** under a **`Data/`** folder (or equivalent single namespace for persistence models).
- On entities, use **data annotations** where appropriate (e.g. `[Key]`, `[Required]`) and nullable (`string?`) for optional fields.

### API controllers

- Put controllers in **`Controllers/`**.
- Use **`[ApiController]`** and **`[Route("[controller]")]`** (conventional route prefix from controller name without the `Controller` suffix).
- Inherit **`ControllerBase`** for API-only controllers.
- Inject dependencies via **constructor injection** (e.g. `DbContext`) and store in private fields.
- Return **`IActionResult`** and use **`Ok(...)`** for JSON; use **anonymous objects** for shaped responses when you need multiple top-level properties (e.g. paged list + total count).
- Expose **query parameters** for pagination and filters (e.g. page size, page number, repeated filter values from query string).
- **File-scoped namespaces** and **block `namespace { }`** both appear in the template; pick one style per project for consistency in new code.

### Packages (conceptual)

- Web stack: ASP.NET OpenAPI integration matching your major version.
- EF Core: core, **SQLite** provider, **Design** and **Tools** packages (Design/Tools often marked `PrivateAssets` / tooling-only).

### Backend `.gitignore`

- Ignore **`bin/`**, **`obj/`**, Visual Studio / Rider artifacts, `*.user`, logs.

---

## Frontend (Vite + React + TypeScript)

### Tooling

- **Vite** with **`@vitejs/plugin-react`**.
- **TypeScript** with **`"strict": true`** and strict-friendly options (e.g. `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, `noFallthroughCasesInSwitch`).
- **ESLint 9** flat config (`eslint.config.js`): base JS recommended, **`typescript-eslint`** recommended, **`eslint-plugin-react-hooks`**, **`eslint-plugin-react-refresh`**, **`eslint-config-prettier`** (and optionally **`eslint-plugin-prettier`**).
- **Prettier** (e.g. `.prettierrc.json`): **semicolons**, **double quotes**, **`trailingComma: "es5"`**, reasonable **`printWidth`** / **`tabWidth`**.

### `package.json` scripts

- **`dev`** — Vite dev server.
- **`build`** — TypeScript project build then Vite production build.
- **`lint`** — ESLint on the project.
- **`preview`** — preview production build.

### Dev server alignment

- Configure Vite **`server.port`** to match the **CORS origin** allowed in the API (e.g. `http://localhost:3000` for the SPA and the same origin in `UseCors`).

### Runtime libraries

- **React** and **React DOM** (current major).
- **`react-router-dom`** for routing (**`BrowserRouter`**, **`Routes`**, **`Route`**).
- **Bootstrap** CSS imported once at the application entry (e.g. `bootstrap/dist/css/bootstrap.min.css` in `main.tsx`).

### Entry and shell

- **`index.html`**: root mount node (e.g. `#root`), script entry **`/src/main.tsx`** as ES module.
- **`main.tsx`**: import global styles (`index.css`, app shell CSS), import Bootstrap, **`createRoot`**, wrap the tree in **`StrictMode`**, render **`App`**.

### Application structure (`src/`)

| Area | Role |
|------|------|
| **`App.tsx`** | Top-level **providers** (e.g. context) wrapping **`Router`**, **`Routes`**, and **`Route`** definitions. |
| **`pages/`** | Route targets (one default export per page component). |
| **`components/`** | Reusable UI; import colocated **`./ComponentName.css`** when a component needs its own stylesheet. |
| **`context/`** | React context: **`createContext`**, a **`Provider`** component, and a **custom hook** that **throws** if used outside the provider. |
| **`types/`** | **`export interface`** types for API entities and client-only shapes; use **`import type`** where appropriate. |

### Routing

- Use **`BrowserRouter`** (aliased as `Router` is fine) with declarative **`Route`** elements.
- Use **`useNavigate`** for programmatic navigation and **`useParams`** for path parameters.
- Path patterns can include **dynamic segments** (e.g. `/section/:name/:id`).

### Data fetching & API contract

- Use the **`fetch` API** with the **full base URL** to the API in development (HTTPS URL and port from the API launch profile, e.g. `https://localhost:5000`).
- Build query strings for filters and pagination (repeat query keys or join parameters as your backend expects).
- Assume **JSON property names in camelCase** in responses when the API uses ASP.NET’s default JSON serialization.

### State & UI patterns

- **Local state**: `useState` / `useEffect` in components that own the data.
- **Cross-route client state**: React **Context** + **reducer-style or functional updates** in the provider (e.g. add/merge, remove, clear).
- **Layout**: Bootstrap **`container`**, **`row`**, **`col-*`** grid; **`card`**, **`btn`**, **`list-unstyled`** where appropriate.
- **Global styling**: CSS **custom properties** on **`:root`**, optional **`prefers-color-scheme`** dark palette, constrained **`#root`** width and flex column layout, typography for **`h1`/`h2`**.
- **Pagination UI**: buttons for previous/next and numeric pages; optional page-size `<select>` resetting page index.
- **Optional**: small fixed UI (e.g. summary chip) using **inline `style` objects** for positioning.

### TypeScript/React conventions observed

- Default export for page components; named exports for providers and hooks.
- **`function ComponentName()`** style components.
- **`type` imports** for interfaces used only as types.

---

## Local development workflow (conceptual)

1. Start the **API** from the backend project (HTTPS URL from `launchSettings`).
2. Start the **frontend** with **`npm run dev`** (or pnpm/yarn equivalent) on the port configured in Vite and allowed by CORS.
3. Ensure the SPA calls the API at the **matching base URL** and that **HTTPS** dev certificates are trusted if you use HTTPS locally.

---

## Conventions to preserve when cloning the idea

- **Separation**: API in `backend/`, SPA in `frontend/`; no mixing server and client in one package.
- **Configuration over hardcoding**: connection strings and ports in config/launch settings; frontend base URL should follow the same ports you ship in dev.
- **Thin controllers**: HTTP concerns in controllers; persistence via injected `DbContext`.
- **Typed client**: mirror API shapes with TypeScript **`interface`** types.
- **Lint + format**: ESLint + Prettier (Prettier last via `eslint-config-prettier`) so formatting does not fight lint rules.

---

## Optional template artifacts

- A sample **weather** API controller may ship with the scaffold; remove or replace in real projects if unused.

This file intentionally omits **domain-specific** naming and business rules so you can reuse the same structural rules for a different subject area.

---

## Addendum: structural evolutions (apply on top of the baseline)

The sections above describe the **initial** template. The reference app was later extended with **full CRUD**, an **admin-facing UI**, a **`src/api/` layer**, and a **shared pagination component**. When modeling another assignment after the **evolved** shape, adopt the following **in addition to** the baseline—not instead of it.

**Out of scope here:** Azure deployment, publish output folders, hosting profiles, and other production hosting steps—handle those manually per project when you ship.

### Backend: CRUD on the main entity

- **Create:** `[HttpPost("...")]` with `[FromBody]` for the entity; `_context.Set<Entity>().Add(entity)` (or `DbSet.Add`), `SaveChanges()`, return `Ok(entity)` (or a status that fits your API contract).
- **Update:** `[HttpPut(".../{id}")]` (or equivalent route template) with route `id` and `[FromBody]` for the updated shape; load the tracked entity (`Find`, `FirstOrDefault`, etc.), assign fields, `Update` / mark modified, `SaveChanges()`, return `Ok(...)`. Return `NotFound(...)` when the id does not exist (optionally with a small JSON body `{ message: "..." }`).
- **Delete:** `[HttpDelete(".../{id}")]`; load the entity, return `NotFound` if missing; otherwise `Remove`, `SaveChanges()`, return `NoContent()` on success.
- Keep existing **read** endpoints (paged list, filters, distinct values for filter UI) as in the baseline.

### Frontend: `src/api/` module(s)

- Add **`src/api/`** with **one file per resource area** (naming pattern: `SomethingAPI.ts`), exporting **named async functions** that wrap `fetch` for each endpoint (list with query params, optional filter list GET, POST, PUT, DELETE).
- Hold a **single `API_URL` (or base path) constant** per file so pages and components do not duplicate `https://localhost:.../Controller` strings.
- Use **`Content-Type: application/json`** for POST/PUT bodies (`JSON.stringify` for the payload).
- After `fetch`, **check `response.ok`**; throw `Error` (or rethrow) when the call fails; use **`catch`** with **`console.error`** for debugging.
- **Pages and components** should **import** these functions (`import { fetchItems, addItem, ... } from "../api/ItemsAPI"`) rather than inlining `fetch` everywhere—move any remaining direct `fetch` calls into the same module over time for consistency.

### Frontend: admin page for CRUD

- Add a **dedicated route** in `App.tsx` for an **admin** view (path name is up to you, e.g. `/adminItems` or `/admin/books`).
- **State** on the admin page typically includes: **loading**, **error** message, **pagination** (page size, current page, derived total pages), a flag or view mode for **show create form**, and **selected entity for edit** (nullable).
- **Layout:** Bootstrap **`table`** with **`table-bordered`**, **`table-striped`**, **`table-dark`** on `<thead>`; per-row **Edit** and **Delete**; use **`window.confirm`** (or similar) before delete.
- **Forms:** separate components for **create** and **edit** that receive **`onSuccess`** / **`onCancel`** props and call **`addX` / `updateX`** from the `api` module; on success, close the form and **refresh the list** (call the list fetch again with current page/size or update local state).
- **Delete** handler calls **`deleteX(id)`** then removes the row from local state or refetches the page.

### Frontend: shared `Pagination` component

- Extract the pagination block (Previous / numbered pages / Next, plus **results-per-page** `<select>`) into **`components/Pagination.tsx`** (or similar) with typed props: **`currentPage`**, **`totalPages`**, **`pageSize`**, **`onPageChange`**, **`onPageSizeChange`** (when size changes, reset to page 1 from the parent).

### How to use this document in another codebase

- Treat everything **above** “Addendum” as the **foundation**.
- Treat the **addendum** as the **delta** to reach the evolved structure (CRUD API + admin SPA + centralized HTTP).
- Swap in your own **entity names**, **routes**, and **controller segments**; the **patterns** stay the same (e.g. a bookstore catalog instead of another domain).
