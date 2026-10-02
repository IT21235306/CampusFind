# API endpoint table

Base path: `/api`. All routes except health, registration, login, and image delivery require `Authorization: Bearer <JWT>`.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Atlas-backed service check |
| POST | `/auth/register` | Create user and return token |
| POST | `/auth/login` | Verify password and return token |
| GET | `/auth/me` | Restore authenticated account |
| PATCH | `/auth/me` | Update the current user's profile name |
| POST | `/auth/me/avatar` | Upload or replace a profile photo |
| GET | `/items` | Search/list items; `mine=true` lists own items |
| POST | `/items` | Create found item |
| GET | `/items/:id` | View item details |
| PATCH | `/items/:id` | Update owned available item |
| DELETE | `/items/:id` | Delete owned item without claims |
| POST | `/items/:id/image` | Upload or replace item image |
| GET | `/images/:id` | Deliver stored image |
| GET | `/claims` | List own claims, or `?itemId=` for an owned item |
| POST | `/claims` | Submit claim |
| GET | `/claims/:id` | View authorized claim |
| PATCH | `/claims/:id` | Update own pending claim |
| DELETE | `/claims/:id` | Delete non-approved claim |
| PATCH | `/claims/:id/status` | Approve, reject, or cancel |
| GET | `/admin/overview` | Read moderation counts; admin only |
| GET | `/admin/users` | List users; admin only |
| PATCH | `/admin/users/:id` | Activate/disable a user or change role; admin only |
| GET | `/admin/items` | List all items, including hidden items; admin only |
| PATCH | `/admin/items/:id` | Hide or show an item; admin only |
| GET | `/admin/claims` | List claims for moderation; admin only |
| PATCH | `/admin/claims/:id` | Reject a pending claim; admin only |

Errors use `400` invalid input, `401` missing/expired token, `403` forbidden action, `404` missing resource, `409` business-rule conflict, and `500` unexpected server error.
