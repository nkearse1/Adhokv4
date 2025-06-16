# Bolt + Supabase Cleanup Automation

This repo contains:

✅ Supabase Edge Function: `backfill-missing-ids`  
✅ Bolt post-deploy hook to trigger the cleanup

---

## How to Use

1️⃣ Deploy the Supabase function:

2️⃣ Add your project ref + service key in `bolt.yaml`.

3️⃣ Connect this repo to your Bolt deployment.

---

## ⚠ Important

- Only use service role keys in secure backend scripts.
- Do not expose keys in frontend code.
