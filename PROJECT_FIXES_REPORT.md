# Project Fixes Report

## Summary

Implemented focused fixes in the existing CommonJS Controllers + Repositories architecture. No dependencies were installed, no database was contacted, and no existing file/function was deleted. A new idempotent index migration was added and the malformed address index placement in migration 002 was corrected; no migration was executed. Two requested Markdown reports were added.

## Files changed

- **`.env.example`** — Added `SALT_ROUNDS=12`, matching the password hashing fallback.
- **`package.json`** — Corrected `main` and `start` paths to `src/server.js`.
- **`src/app.js`** — Added Helmet, a 100 KB JSON body limit, and a JSON 404 handler.
- **`src/controllers/auth.controller.js`** — Rejects inactive users at login and maps a concurrent email uniqueness violation to HTTP 409.
- **`src/controllers/cart.controller.js`** — Uses `cart.cart_id`, matching the repository result.
- **`src/controllers/category.controller.js`** — Corrected the partial-update guard.
- **`src/controllers/coupon.controller.js`** — Fixed reassignment of a const value, compares duplicate error codes instead of assigning them, and rejects malformed/expired dates. Validation errors for inactive/expired coupons now use HTTP 400.
- **`src/controllers/order.controller.js`** — Checks cart lines before checkout, delegates authoritative total/price calculation to the order transaction, handles a cart consumed by a concurrent checkout, passes the user ID to order update, and handles conditional update failure.
- **`src/database/migration.js`** — Sets a nonzero exit status on failure and closes the pool cleanly. The migration script itself was not run.
- **`src/database/migrations/002_create_addresses.sql`** — Closed the addresses table before its index statement and made the index creation idempotent. This migration was malformed and could not run on a fresh database.
- **`src/database/migrations/014_add_repository_indexes.sql`** — Added idempotent indexes for orders by user/address, cart items by product, order items by order/product, coupon usages by order/user, and reviews by product. These support repository joins, existing FK checks/cascades, and the existing user payment query. Existing primary/unique indexes already cover cart ownership/product lines, payment order ID, and product `(category_id,title)`, so no duplicate indexes were added.
- **`src/middlewares/errorHandler.middleware.js`** — Preserves middleware status codes, hides unexpected error details from clients, and logs server errors without routine client-error stacks.
- **`src/middlewares/protect.middleware.js`** — Rejects inactive users and forwards database errors instead of misreporting them as invalid tokens.
- **`src/repositories/cart.repository.js`** — Aligns product selection with existing schema fields, preserves the original cart lookup, and renames/fixes the duplicate method as `findCartItemsByUserId` with current product prices.
- **`src/repositories/category.repository.js`** — Adds an allowed-field list to dynamic category updates.
- **`src/repositories/coupon.repository.js`** — Corrected the coupon INSERT column list.
- **`src/repositories/order.repository.js`** — Re-reads and locks cart/product rows in the transaction, computes total from database prices, inserts into `price_at_purchase`, deletes only those locked cart lines, returns an empty JSON array for orders with no lines, enforces pending status on address updates, rejects empty checkout through the transaction result, and implements the existing `findOrderById` stub.
- **`src/repositories/payment.repository.js`** — Restricts payment creation to the valid `pending` order status.
- **`src/repositories/product.repository.js`** — Corrected DELETE RETURNING columns and added the controller's lower-camel-case method as a compatibility wrapper while retaining the existing method.
- **`src/routes/payment.route.js`** — Uses the existing protect/authorization middleware and runs validation middleware after each validator chain.
- **`src/server.js`** — Fails fast if database or JWT startup settings are missing.
- **`src/utils/AppError.util.js`** — Uses `statusCode`, which the centralized handler reads.
- **`src/utils/password.util.js`** — Uses a safe bcrypt rounds default when the variable is unset.

## Reports added

- `PROJECT_AUDIT_REPORT.md` — Baseline audit, severity, module findings, database compatibility, security observations, open business decisions, and verification limits.
- `PROJECT_FIXES_REPORT.md` — This implementation summary and verification record.

## Verification performed

- `node --check` passed for every JavaScript file under `src/` after changes.
- `require('./src/app')` passed.
- `require('./src/routes/payment.route')` passed; this also confirms the missing middleware import was corrected.
- An in-process HTTP smoke check started the Express app on an ephemeral port and confirmed an unknown route returned HTTP 404 with the JSON API response shape.
- `git diff --check` passed. Git emitted only a line-ending normalization warning for `package.json`.
- `npm.cmd run` confirmed scripts are `start`, `dev`, `migrate`, and `test`.
- `npm.cmd test` was run and failed as configured: `Error: no test specified`. No project tests exist.

The full server was not launched because `src/server.js` probes the database URL from the ignored `.env`; its target was not verified as non-production. No migration or database-backed query validation was performed. Consequently, PostgreSQL integration is not claimed as verified.

## Remaining issues and manual decisions

- **Inventory:** No stock changes were added. The order transaction now locks rows and snapshots prices but does not reserve/decrement `products.stock`. Please choose the stock policy: reserve at order creation, decrement after successful payment, or leave unchanged.
- **Index rollout:** Migration `014` creates indexes and may take time/locks proportional to current table size. The user confirmed there is no current database/data, so this should be light on the fresh project schema. It has not been executed.
- **Coupon redemption:** `coupon_usages` has no implemented checkout operation. Confirm whether to implement it and whether one use per user is intended.
- **Payment/order states:** Payment status does not update order status. Confirm desired transitions before coupling them.
- **Multiple payments:** Schema allows one payment per order. Confirm if retry attempts need separate payment rows.
- **Account deletion:** Current user deletion is physical and can be blocked by FK constraints. Confirm whether to retain history through soft deletion.
- **Order administration:** The delete route is admin-only while its controller scopes lookup to the current admin's own user ID. Confirm whether admins should delete arbitrary orders, and whether cancellation should be a status transition instead.
- **Product active state:** The cart code no longer queries nonexistent `is_active`; all existing products are treated as available. Add an active field only if that product lifecycle behavior is required.
- **CORS/proxy settings:** Helmet is enabled. CORS remains unconfigured until allowed origins are known. `trust proxy` remains unset until deployment topology is known.
- **Schema indexes:** Candidate indexes should be measured against actual workload before adding. No indexes were added.
- **Migration tracking:** The runner still executes all idempotent migration files every time and has no applied-migration ledger.
- **Potential additional contract work:** Category router imports a nonexistent `getAllCategories` export but does not currently register a list route; response envelopes remain inconsistent across modules.
- **Testing:** Add a test framework and database test configuration before claiming end-to-end behavior. Current checks were static/import/smoke checks only.
