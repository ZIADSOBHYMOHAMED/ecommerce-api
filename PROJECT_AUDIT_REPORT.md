# Project Audit Report

## Scope and repository status

The initial Git working tree was clean. I inspected the complete project tree (excluding installed dependencies), package manifest and lockfile, README and project notes, every route/controller/repository/validator/middleware/utility/configuration module, and all 13 SQL migrations. The audit report describes the baseline before the implementation changes listed in `PROJECT_FIXES_REPORT.md`.

The project uses CommonJS, Express 5, a shared `pg.Pool`, Controllers + Repositories, route validators, and SQL migrations. This architecture is suitable to retain. There is no test suite; `npm test` is a placeholder that exits with an error. No Docker files, `database/queries/`, seeds, views, or structured logger are present. `.env` is ignored; its values were not reproduced in this report.

## Severity summary

- **Critical:** None confirmed.
- **High:** Broken runtime paths and schema-incompatible SQL, missing payment middleware modules, incorrect HTTP error status handling, and incomplete ownership/concurrency safeguards.
- **Medium:** Category/product route/controller contract mismatches, order totals and inventory consistency, startup configuration, migration runner exit handling, and missing state/edge-case behavior.
- **Low:** Naming and response-shape inconsistencies, absent automated tests, and potential indexes that need workload validation.

## Findings by module

### Startup, configuration, and app

- **H-01 — `package.json`:** `start` pointed to missing root `server.js`; actual server is `src/server.js`. `main` also pointed to the missing path.
- **H-02 — `src/utils/AppError.util.js` / `src/middlewares/errorHandler.middleware.js`:** `AppError` set `statuscode`, handler read `statusCode`; expected 4xx/5xx application errors became 500.
- **M-01 — `src/config/env.js`, `src/server.js`:** Required database/JWT values were not validated before startup.
- **M-02 — `src/app.js`:** Helmet and CORS were dependencies but neither was configured. CORS origin policy and proxy topology need deployment-specific decisions.
- **M-03 — `src/app.js`:** JSON parser had no explicit request-size limit.
- **M-04 — `src/middlewares/errorHandler.middleware.js`:** Unexpected database/server messages were returned to clients.
- **M-05 — `src/middlewares/protect.middleware.js`:** Database lookup failures were caught and misreported as invalid/expired tokens; `is_active` was fetched but not enforced.
- **M-06 — `src/utils/password.util.js`, `.env.example`:** Missing `SALT_ROUNDS` resulted in `NaN` being passed to bcrypt; example omitted this variable.
- **M-07 — `src/database/migration.js`:** Migration errors were caught but process exited with default success status, and pool shutdown used `process.exit()` rather than clean closure. Migration files are rerun on every invocation without a migration ledger.
- **L-01 — `src/utils/catchAsync.util.js`, `src/middlewares/validation.middleware.js`, controllers:** Error/response shapes vary between `{status}` and `{success}`. There is no explicit JSON 404 handler.

### Authentication and users

- **M-08 — `src/controllers/auth.controller.js`:** Registration checked for an existing email before insert but did not map unique-constraint races to a conflict response.
- **M-09 — `src/controllers/auth.controller.js`:** Login did not reject users with `is_active = false`; `logout` only responds and cannot revoke an already-issued stateless JWT. Revocation policy is a product/security decision.
- **M-10 — `src/utils/jwt.util.js`, `src/config/env.js`:** Token signing/verification relies on environment values without format/strength validation.
- **M-11 — `src/controllers/user.controller.js`:** Account deletion physically deletes the user; existing order/coupon usage FKs may prevent it. Whether account deletion should be soft or restricted needs confirmation.

### Addresses

- No confirmed repository/controller method mismatch in the baseline: owner-scoped `updateAddressByIdAndUserId` and `deleteAddressByIdAndUserId` exist and are called by the controller.
- **M-12 — `src/database/migrations/002_create_addresses.sql`:** Address timestamps are nullable. This is allowed by current consumers, but making them NOT NULL would require a migration if the application relies on their availability.
- Address create and mutations use the authenticated user ID and update/delete predicates include owner ID.

### Categories

- **H-04 — `src/controllers/category.controller.js`:** `updateCategory` guard rejected valid partial updates due to incorrect boolean logic.
- **M-13 — `src/repositories/category.repository.js`:** Dynamic update keys were interpolated without an allowlist (unlike product, user, coupon, and address implementations).
- Product/category relationship is consistent in the current migration: `category_id` is NOT NULL and the FK uses `ON DELETE RESTRICT`.
- **L-02 — `src/routes/category.routes.js`:** Imports `getAllCategories` from controller although no such export exists. It is not currently registered as a route, but indicates an incomplete/stale contract.

### Products

- **H-05 — `src/controllers/product.controller.js` / `src/repositories/product.repository.js`:** Controller called `deleteProductById`, repository exposed only `DeleteProductById`; product deletion route fails. Repository DELETE RETURNING listed nonexistent `category` instead of `category_id`.
- **M-15 — `src/database/migrations/004_create_products.sql`:** A unique `(category_id, title)` constraint already backs the repository's duplicate lookup. Ensure expected case sensitivity matches the API requirement.

### Cart and orders

- **H-06 — `src/repositories/cart.repository.js`:** Product lookup selected nonexistent `product_name` and `is_active`; migration defines `title` and no active flag.
- **H-07 — `src/repositories/cart.repository.js`:** Two static methods named `findCartByUserId` existed; the latter shadowed the first. It referenced alias `cart` while declaring `c`, passed a scalar instead of a pg values array, and returned one item instead of the intended collection. The surviving cart query returns `cart_id`; cart controller passed `cart.id` to mutations.
- **H-08 — `src/controllers/order.controller.js` / repositories:** The order controller expected cart lookup to return an array of priced items, but the cart repository's primary query returned a cart object with nested items and no price.
- **H-09 — `src/repositories/order.repository.js`:** Order item insert used `order_items.price`; migration defines `price_at_purchase`. Cart clearing filtered on nonexistent `cart_items.user_id`; ownership is via `carts.user_id` and `cart_items.cart_id`.
- **H-10 — `src/controllers/order.controller.js` / `src/repositories/order.repository.js`:** Update call omitted repository's required `userId` argument.
- **M-16 — order creation:** It trusted passed totals/prices, did not check or reserve product stock, and read cart lines outside the order transaction. Stock timing (order vs payment vs fulfillment) and price-change semantics require business confirmation.
- **M-17 — order deletion:** Route allows admins, while controller looks up order using admin's own user ID; the intended admin deletion behavior is unclear. Repository delete is ID-only and relies on caller checks.
- **M-18 — `findOrderByIdAndUserId`:** Aggregation can represent an order with no items as a null-valued JSON object.
- **L-03 — `findOrderById`:** Empty method returned `undefined`.

### Payments

- **H-11 — `src/routes/payment.route.js`:** Imported `middlewares/auth.middleware` and `middlewares/role.middleware`, neither exists. The valid files are `protect.middleware.js` and `authorization.middleware.js`. Consequently requiring the payment router failed.
- **H-12 — payment routes:** Express-validator chains were registered without the project's validation middleware, so invalid input was not rejected by these routes.
- **M-19 — `src/repositories/payment.repository.js`:** Creation predicate included order status `confirmed`, excluded by the orders migration CHECK constraint.
- **M-20 — `src/database/migrations/011_create_payments.sql`:** One payment row per order is enforced. Multiple attempts/retries are not supported; confirm whether that is intended.
- **M-21 — payment/order status coupling:** Successful/failed/refunded payment updates do not transition order status. Whether these states should be coupled needs confirmation.
- Payment controller uses owner-scoped retrieval methods for user routes and admin middleware for status updates; unscoped repository methods are not directly used by those handlers.

### Coupons

- **H-13 — `src/repositories/coupon.repository.js`:** `createCoupon` had malformed INSERT column-list syntax.
- **H-14 — `src/controllers/coupon.controller.js`:** `createCoupon` destructured `code` as const and reassigned it, causing a TypeError. Duplicate error handling assigned `error.code` instead of comparing it, misclassifying errors.
- **M-22 — coupon validity:** Creation compared parsed dates without rejecting invalid dates (route validator normally checks ISO format, but invalid timestamp handling should be explicit).
- **M-23 — coupon redemption:** `coupon_usages` exists but no repository/controller redemption operation was found. Confirm whether coupons are intended in checkout and the one-use-per-user constraint is correct.

## Database and SQL compatibility

Migrations define users, addresses, categories, products, coupons, orders, carts, cart items, coupon usages, order items, payments, reviews, and a trigger that creates a cart after user insertion. The confirmed invalid references are the cart product fields, order item `price`, and cart-item `user_id` described above; coupon INSERT syntax is invalid.

Constraints include unique email/category names/slugs/coupon codes/cart per user/cart-product pair/product category+title/payment per order/review per user+product; checks on product price/stock, coupon discount, order state/amount, cart/order quantities, payment state/timestamps, and review rating. Most repository values are parameterized. Dynamic identifiers in product/user/address/coupon updates are allowlisted; category update was not.

The initial migration includes `addresses(user_id)` for address listing, though its index statement was incorrectly placed inside the table definition and made the migration invalid. `products(category_id,title)` is already covered by a unique constraint. `orders.user_id` is used by the user's payments query; `orders.address_id`, `cart_items.product_id`, `order_items(order_id, product_id)`, `coupon_usages(order_id,user_id)`, and `reviews.product_id` are referencing columns whose indexes support actual joins, deletes, or FK checks. A new migration adds these indexes. Foreign keys do not automatically index referencing columns.

`BIGSERIAL`/`BIGINT` and NUMERIC values may be returned as strings by `pg`. Current controller order arithmetic used JavaScript numbers and needed decimal-safe handling. No database operation was executed, so deployed schema drift cannot be assessed.

## Open decisions

1. Should products have an active flag? Current migration has none, but cart code assumed one.
2. When should stock be reserved/decremented: order creation, successful payment, or fulfillment? No stock policy is implemented.
3. Should product prices be snapshotted at cart time or order creation?
4. Should coupon redemption be implemented and limited to one use per user?
5. Should payment transitions update order status?
6. Should multiple payment attempts per order be supported?
7. Should account deletion be physical, soft, or blocked when order history exists?
8. Should administrators be able to delete other users' orders, and should deletion be cancellation/status transition rather than physical delete?
9. Which frontend origins and reverse-proxy topology should CORS and `trust proxy` use?

## Verification limits

There is no automated test framework or test suite. Database query execution and migrations were not run because the project has an ignored `.env` whose target/environment was not verified and production credentials/data must not be used. Static JavaScript syntax and module loading can be verified without connecting to PostgreSQL; schema-runtime query validation remains outstanding.
