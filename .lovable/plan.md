
## Grant Admin Role

Insert a single row into `public.user_roles` for your account:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('c0f8fa58-6443-4617-8fa1-9e8c9ff58026', 'admin');
```

This is a **data insert only** — no schema changes needed. After this runs, your account will have the `admin` role and the `has_role()` function will return `true` for you, unlocking access to `/admin`.
