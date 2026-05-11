# Admio — Cost & Profitability Analysis

> Last updated: May 2026

---

## 1. Revenue Model

| Plan | Price | Billing |
|------|-------|---------|
| Free | $0 | Forever |
| Pro  | $10/month | Monthly recurring (Stripe) |

---

## 2. API Costs (Anthropic Claude)

### Pricing Tiers Used

| Model | Input Cost | Output Cost | Used For |
|-------|-----------|-------------|----------|
| Claude Sonnet 4 | $3.00 / 1M tokens | $15.00 / 1M tokens | Counselor chat, college list, roadmaps, essay review, profile strength, scholarships, competitions, resume |
| Claude Haiku 3.5 | $0.80 / 1M tokens | $4.00 / 1M tokens | Daily tips, activity polish |

### Cost Per API Call

| Endpoint | Model | Avg Input | Avg Output | Cost/Call | Max Frequency |
|----------|-------|-----------|------------|-----------|---------------|
| AI Counselor (streaming) | Sonnet 4 | ~2,000 tok | ~800 tok | $0.018 | 400/mo (Pro), 7 lifetime (Free) |
| College List | Sonnet 4 | ~2,500 tok | ~2,500 tok | $0.045 | 1x per 24h |
| Extracurricular Analysis | Sonnet 4 | ~2,000 tok | ~1,200 tok | $0.024 | 3x per hour |
| Roadmap Generation | Sonnet 4 | ~2,500 tok | ~2,000 tok | $0.038 | Per category (Pro) |
| Roadmap Adjustment | Sonnet 4 | ~3,000 tok | ~2,500 tok | $0.047 | Counts toward 400 msg cap |
| Profile Strength | Sonnet 4 | ~2,500 tok | ~1,000 tok | $0.023 | On-demand |
| Essay Review | Sonnet 4 | ~3,000 tok | ~1,200 tok | $0.027 | 1x per week (Pro) |
| Scholarship Matching | Sonnet 4 | ~2,500 tok | ~2,000 tok | $0.038 | 1x per 24h (Pro) |
| Competition Matching | Sonnet 4 | ~2,500 tok | ~2,000 tok | $0.038 | 1x per 24h (Pro) |
| Resume Generation | Sonnet 4 | ~2,000 tok | ~1,500 tok | $0.030 | 1x per 24h (Pro) |
| Daily Tip | Haiku 3.5 | ~1,500 tok | ~200 tok | $0.002 | 1x per day |
| Activity Polish | Haiku 3.5 | ~800 tok | ~300 tok | $0.002 | Counts toward msg cap |

---

## 3. Cost Per User Per Month

### Free User

| Action | Frequency | Unit Cost | Monthly Cost |
|--------|-----------|-----------|-------------|
| College list (cached) | 1x | $0.045 | $0.045 |
| Counselor messages | ~3 of 7 lifetime | $0.018 | $0.054 |
| Profile strength | 1x | $0.023 | $0.023 |
| Daily tip | 15 days avg | $0.002 | $0.030 |
| **Total** | | | **$0.15** |

Free users are effectively free after their first month (everything is cached). Ongoing cost approaches ~$0.03/mo (just daily tips on active days).

### Pro User — Light (50 messages/mo)

| Action | Frequency | Unit Cost | Monthly Cost |
|--------|-----------|-----------|-------------|
| Counselor messages | 50 | $0.018 | $0.90 |
| Daily tips | 25 days | $0.002 | $0.05 |
| College list regen | 2x | $0.045 | $0.09 |
| Scholarship regen | 1x | $0.038 | $0.04 |
| Competition regen | 1x | $0.038 | $0.04 |
| Roadmap generation | 2x | $0.038 | $0.08 |
| Roadmap adjustments | 3x | $0.047 | $0.14 |
| Profile strength | 2x | $0.023 | $0.05 |
| Essay review | 1x | $0.027 | $0.03 |
| Resume | 1x | $0.030 | $0.03 |
| Activity polish | 5x | $0.002 | $0.01 |
| **Total** | | | **$1.46** |

### Pro User — Average (100 messages/mo)

| Action | Frequency | Unit Cost | Monthly Cost |
|--------|-----------|-----------|-------------|
| Counselor messages | 100 | $0.018 | $1.80 |
| Daily tips | 28 days | $0.002 | $0.06 |
| College list regen | 4x | $0.045 | $0.18 |
| Scholarship regen | 3x | $0.038 | $0.11 |
| Competition regen | 3x | $0.038 | $0.11 |
| Roadmap generation | 3x | $0.038 | $0.11 |
| Roadmap adjustments | 8x | $0.047 | $0.38 |
| Profile strength | 4x | $0.023 | $0.09 |
| Essay review | 2x | $0.027 | $0.05 |
| Resume | 2x | $0.030 | $0.06 |
| Activity polish | 10x | $0.002 | $0.02 |
| **Total** | | | **$2.97** |

### Pro User — Heavy (300 messages/mo)

| Action | Frequency | Unit Cost | Monthly Cost |
|--------|-----------|-----------|-------------|
| Counselor messages | 300 | $0.018 | $5.40 |
| Daily tips | 30 days | $0.002 | $0.06 |
| College list regen | 4x | $0.045 | $0.18 |
| Scholarship regen | 4x | $0.038 | $0.15 |
| Competition regen | 4x | $0.038 | $0.15 |
| Roadmap generation | 4x | $0.038 | $0.15 |
| Roadmap adjustments | 15x | $0.047 | $0.71 |
| Profile strength | 4x | $0.023 | $0.09 |
| Essay review | 4x | $0.027 | $0.11 |
| Resume | 2x | $0.030 | $0.06 |
| Activity polish | 20x | $0.002 | $0.04 |
| **Total** | | | **$7.10** |

### Pro User — Max (400 messages/mo)

| Action | Frequency | Unit Cost | Monthly Cost |
|--------|-----------|-----------|-------------|
| Counselor messages | 400 | $0.018 | $7.20 |
| All other features (max) | — | — | $1.70 |
| **Total** | | | **$8.90** |

---

## 4. Profit Per Pro User Per Month

| Usage Level | Messages | API Cost | Revenue | **Profit** | **Margin** |
|-------------|----------|----------|---------|-----------|-----------|
| Light | 50 | $1.46 | $10.00 | **$8.54** | 85% |
| Average | 100 | $2.97 | $10.00 | **$7.03** | 70% |
| Heavy | 300 | $7.10 | $10.00 | **$2.90** | 29% |
| Max | 400 | $8.90 | $10.00 | **$1.10** | 11% |

Average expected margin across user mix: **~70%**

---

## 5. Infrastructure Costs

### Free Tier (0–500 users)

| Service | Cost | Notes |
|---------|------|-------|
| Vercel (Hosting) | $0 | Hobby plan, sufficient for early traffic |
| Supabase (Database + Auth) | $0 | Free tier: 500MB DB, 50K MAU, 1GB storage |
| Stripe | 2.9% + $0.30/txn | Per Pro subscription payment |
| Domain (admio.io) | $50/year ($4.17/mo) | One-time annual cost |
| **Total fixed** | **~$4/mo** | |

### Growth Tier (500–5,000 users)

| Service | Cost | Notes |
|---------|------|-------|
| Vercel Pro | $20/mo | Higher limits, analytics |
| Supabase Pro | $25/mo | 8GB DB, 100K MAU, better performance |
| Stripe | 2.9% + $0.30/txn | ~$0.59 per $10 payment |
| Domain | $4.17/mo | |
| **Total fixed** | **~$49/mo** | |

### Scale Tier (5,000+ users)

| Service | Cost | Notes |
|---------|------|-------|
| Vercel Pro | $20/mo | May need Team ($100/mo) at very high traffic |
| Supabase Pro | $25–75/mo | Scale based on DB size and requests |
| Stripe | 2.9% + $0.30/txn | |
| Domain | $4.17/mo | |
| **Total fixed** | **~$50–200/mo** | |

---

## 6. Scaling Projections

Assumes 10% of users convert to Pro, average Pro user sends ~100 messages/mo.

### 100 Total Users (10 Pro)

| | Monthly |
|---|---|
| Revenue | $100 |
| API costs (10 Pro × $2.97 + 90 Free × $0.15) | $43.20 |
| Infrastructure | $4 |
| Stripe fees (10 × $0.59) | $5.90 |
| **Net Profit** | **$46.90** |

### 500 Total Users (50 Pro)

| | Monthly |
|---|---|
| Revenue | $500 |
| API costs (50 Pro × $2.97 + 450 Free × $0.05) | $171 |
| Infrastructure | $49 |
| Stripe fees | $29.50 |
| **Net Profit** | **$250.50** |

### 1,000 Total Users (100 Pro)

| | Monthly |
|---|---|
| Revenue | $1,000 |
| API costs (100 Pro × $2.97 + 900 Free × $0.03) | $324 |
| Infrastructure | $49 |
| Stripe fees | $59 |
| **Net Profit** | **$568** |

### 5,000 Total Users (500 Pro)

| | Monthly |
|---|---|
| Revenue | $5,000 |
| API costs (500 Pro × $2.97 + 4,500 Free × $0.03) | $1,620 |
| Infrastructure | $100 |
| Stripe fees | $295 |
| **Net Profit** | **$2,985** |

### 10,000 Total Users (1,000 Pro)

| | Monthly |
|---|---|
| Revenue | $10,000 |
| API costs | $3,240 |
| Infrastructure | $150 |
| Stripe fees | $590 |
| **Net Profit** | **$6,020** |
| **Annual** | **$72,240** |

---

## 7. Break-Even Analysis

| Scenario | Break-Even Point |
|----------|-----------------|
| Cover domain only ($50/yr) | 1 Pro user for 1 month |
| Cover infra (growth tier, $49/mo) | 7 Pro users |
| Cover infra + API costs | 10 Pro users |
| Profitable after all costs | 15+ Pro users |

---

## 8. Cost Optimization Levers

| Lever | Savings | Trade-off |
|-------|---------|-----------|
| Switch more endpoints to Haiku 3.5 | ~60% per call | Lower quality for complex tasks |
| Lower message cap to 300 | ~$1.80/mo per heavy user | Slightly worse UX for power users |
| Add annual plan ($96/yr = $8/mo) | Better cash flow, lower churn | Lower monthly revenue per user |
| Prompt caching (already implemented) | ~30% on repeated system prompts | None — already in use |
| Batch regeneration limits to 48h | ~50% fewer regen calls | Slightly less fresh data |

---

## 9. Key Takeaways

1. **70% gross margin on average Pro users** — healthy SaaS economics
2. **Free users cost almost nothing** ($0.03–0.15/mo) — excellent acquisition funnel
3. **Break-even at just 15 Pro subscribers** — achievable within first month of launch
4. **Max-usage users still profitable** ($1.10 margin) — the 400 msg cap is well-calibrated
5. **Infrastructure costs are negligible** until 500+ users — Vercel and Supabase free tiers are generous
6. **Stripe fees are the biggest fixed cost** at scale (2.9% + $0.30), but unavoidable
7. **At 1,000 Pro users: $6,020/mo profit ($72K/yr)** — achievable SaaS milestone
