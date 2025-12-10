# Facebook Ads Manager - Complete Setup & Configuration Guide

**Document Version**: 1.0
**Created**: November 18, 2025
**Purpose**: Step-by-step guide for setting up all 12 QuickSell ad campaigns in Facebook Ads Manager

---

## Table of Contents

1. [Pre-Launch Checklist](#pre-launch-checklist)
2. [Account Setup](#account-setup)
3. [Campaign Structure](#campaign-structure)
4. [Campaign Configurations](#campaign-configurations)
5. [Audience Setup](#audience-setup)
6. [Ad Creation Workflow](#ad-creation-workflow)
7. [Bidding & Budget Strategy](#bidding--budget-strategy)
8. [Optimization Rules](#optimization-rules)
9. [A/B Testing Framework](#ab-testing-framework)
10. [Monitoring & Reporting](#monitoring--reporting)

---

## Pre-Launch Checklist

### Prerequisites (Complete Before Setting Up Ads)

- [ ] **Facebook Business Account** created
- [ ] **Ad Account** created and verified
- [ ] **Pixel installed** on quicksell.monster website
- [ ] **Conversion tracking** enabled (app installs, signups)
- [ ] **Payment method** added and verified
- [ ] **Billing address** confirmed (matches payment method)
- [ ] **App Store Conversion** tracking configured
- [ ] **iOS 14+ Aggregated Events** configured
- [ ] **Domain verified** in Business Manager
- [ ] **Brand safety** settings reviewed
- [ ] **Ads policy** review completed
- [ ] **Creative assets** (images, videos, copy) prepared
- [ ] **Landing pages/App store links** ready
- [ ] **Analytics integration** (Firebase, Mixpanel) set up
- [ ] **Legal review** of ad copy completed
- [ ] **Budget approved** ($50,000 allocated)

---

## Account Setup

### Facebook Business Manager

**Step 1: Access & Verification**
```
1. Go to business.facebook.com
2. Create or login to existing business account
3. Verify ownership of: quicksell.monster domain
4. Add admin users with appropriate roles
5. Enable two-factor authentication
```

**Step 2: Payment Setup**
```
Settings → Billing
├─ Payment method: [Credit card on file]
├─ Billing address: [Verified address]
├─ Currency: USD
├─ Time zone: America/Los_Angeles
└─ Invoice email: [Team email]
```

**Step 3: Ad Account Configuration**
```
Settings → Ad Accounts
├─ Name: "QuickSell - Main Campaign"
├─ Time zone: America/Los_Angeles
├─ Currency: USD
├─ Account status: Active
└─ Daily spend limit: $5,000 (initial cap)
```

### Pixel & Conversion Setup

**Step 1: Install Facebook Pixel**
```javascript
// Add to <head> of quicksell.monster
<!-- Facebook Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1234567890'); // Replace with your Pixel ID
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=1234567890&ev=PageView&noscript=1"
/></noscript>
<!-- End Facebook Pixel Code -->
```

**Step 2: Configure Conversion Events**
```
Pixel Events to Track:
- ViewContent (visiting app page)
- AddToCart (adding to wishlist)
- InitiateCheckout (starting download)
- Purchase (app install completion)
- CompleteRegistration (account signup)
- Lead (requesting info)
- Search (in-app search)
- AddPaymentInfo (connecting marketplace)
```

**Step 3: App Events Configuration**

For iOS (via Facebook SDK):
```swift
import FBSDKCoreKit

// Track app install
Settings.appID = "your_app_id"
ApplicationDelegate.shared.application(application,
  didFinishLaunchingWithOptions: launchOptions)

// Track purchase
AppEvents.shared.logPurchase(amount: NSDecimalNumber(string: "0.99"),
  currency: "USD")

// Track custom event
AppEvents.shared.logEvent(.customEvent, valueToSum: 50,
  parameters: ["_eventName":"CreateListing"])
```

For Android:
```java
import com.facebook.appevents.AppEventsLogger;

// Track app install
FacebookSdk.sdkInitialize(context);

// Track purchase
AppEventsLogger.newLogger(context).logPurchase(
  new BigDecimal("0.99"), Currency.getInstance("USD"));

// Track custom event
AppEventsLogger.newLogger(context).logEvent(
  "CreateListing", 50, null);
```

---

## Campaign Structure

### Naming Convention

All campaigns follow this structure for organization:

```
[CAMPAIGN_TYPE]_[AUDIENCE]_[OBJECTIVE]_[START_DATE]

Examples:
- AWARENESS_RESELLERS_INSTALL_NOV2025
- CONVERSION_SIDEHUSTLERS_SIGNUP_NOV2025
- RETARGETING_CART_ABANDONERS_INSTALL_NOV2025
```

### Campaign Hierarchy

```
Ad Account
├─ Campaign 1: AWARENESS_RESELLERS_INSTALL_NOV2025
│  ├─ Ad Set 1.1: Age 25-45, US East
│  │  ├─ Ad 1.1.1: "Sell Faster" video
│  │  └─ Ad 1.1.2: "Sell Faster" carousel
│  └─ Ad Set 1.2: Age 45-55, US East
│
├─ Campaign 2: AWARENESS_SIDEHUSTLERS_INSTALL_NOV2025
│  ├─ Ad Set 2.1: Age 20-35, All US
│  ├─ Ad Set 2.2: Age 35-45, All US
│  └─ Ad Set 2.3: Female 25-35, Canada
│
├─ Campaign 3: ENGAGEMENT_LOOKALIKE_INSTALL_NOV2025
│
├─ Campaign 4: RETARGETING_WEBSITE_INSTALL_NOV2025
│
└─ Campaign 5: RETARGETING_APP_VISITORS_SIGNUP_NOV2025
```

---

## Campaign Configurations

### Campaign 1: Cold Awareness - Resellers

**Objective**: App Installs
**Budget**: $8,000 (2 weeks)
**Focus**: Targeting resellers and flippers

#### Ad Set 1.1: Age 25-45, US (Primary Market)

**Basic Settings**:
```
Name: AWARENESS_RESELLERS_INSTALL_NOV2025 - Tier1_25-45_US
Budget: $4,000 (2 weeks = $286/day)
Schedule: Daily
Optimization: Installs
Bid Strategy: Lowest cost
Bid Cap: $0.75
```

**Audience Setup**:
```
Location: United States
Age: 25-45
Gender: All
Language: English

Interests (One of):
- eBay (buying/selling)
- Mercari
- Letgo
- Facebook Marketplace
- Reselling communities
- Business ownership
- Side business

Behaviors:
- Recently purchased online
- High intent buyers
- Business decision makers

Exclusions:
- People who already installed QuickSell
- People who engaged (watched) ad recently
- Competitors' audiences
```

**Placements**:
```
Primary: Automatic Placements
├─ Facebook Feed (60%)
├─ Instagram Feed (20%)
├─ Instagram Stories (10%)
└─ Audience Network (10%)

OR Manual:
├─ Facebook Feed: ON
├─ Instagram Feed: ON
├─ Facebook Reels: ON
├─ Instagram Reels: ON
├─ Messenger Ads: OFF (not relevant)
├─ Audience Network: OFF
└─ Stories: ON
```

**Ads for This Set**:
- Ad: "Sell Faster" (Video 15sec)
- Ad: "Sell Faster" (Carousel - before/after)

#### Ad Set 1.2: Age 45-55, US (Secondary Market)

**Basic Settings**:
```
Name: AWARENESS_RESELLERS_INSTALL_NOV2025 - Tier2_45-55_US
Budget: $4,000 (2 weeks = $286/day)
Schedule: Daily
Optimization: Installs
Bid Strategy: Lowest cost
Bid Cap: $0.85
```

**Audience Setup** (Modified):
```
Location: United States
Age: 45-55
Gender: All (slight male bias)
Language: English

Interests:
- eBay
- Craigslist
- Poshmark
- Online selling
- Passive income
- Retirement investing

Behaviors:
- Recently purchased items
- Business professionals (older demographic)

Exclusions:
- Tech-averse users (exclude low device adoption)
```

**Placements**:
```
Primary: Automatic Placements
├─ Facebook Feed (70% - higher percentage for older demo)
├─ Instagram Feed (15%)
└─ Instagram Stories (15%)
```

**Ads for This Set**:
- Ad: "Time is Money" (Static image)
- Ad: "One Password" (Static image)

---

### Campaign 2: Cold Awareness - Side Hustlers

**Objective**: App Installs
**Budget**: $6,000 (2 weeks)
**Focus**: Young adults looking for side income

#### Ad Set 2.1: Age 20-35, US, All Genders

**Basic Settings**:
```
Name: AWARENESS_SIDEHUSTLERS_INSTALL_NOV2025 - Young_20-35_US
Budget: $3,000 (2 weeks = $214/day)
Schedule: Daily
Optimization: Installs
Bid Strategy: Lowest cost
Bid Cap: $0.65 (younger demographic = cheaper)
```

**Audience Setup**:
```
Location: United States
Age: 20-35
Gender: All
Language: English

Interests (One of):
- Making money apps
- Side hustle
- Passive income
- Freelancing
- Gig economy
- Financial independence
- Personal finance
- Business apps
- Entrepreneurship

Behaviors:
- High propensity to try new apps
- Early adopters
- Active social media users
- Recently purchased online

Exclusions:
- Previously installed app
- Over 50 years old income bracket
```

**Placements**:
```
Mobile-first placement:
├─ Instagram Feed (40%)
├─ Instagram Reels (30% - short form content)
├─ Instagram Stories (20%)
├─ Facebook Feed (10%)
└─ Messenger: OFF
```

**Ads for This Set**:
- Ad: "Make Money Fast" (Carousel - 4 cards)
- Ad: "Earn Rewards" (Gamification carousel)
- Ad: "Get Your First Sale" (Beginner carousel)

#### Ad Set 2.2: Age 35-45, Female, US

**Basic Settings**:
```
Name: AWARENESS_SIDEHUSTLERS_INSTALL_NOV2025 - Female_35-45_US
Budget: $3,000 (2 weeks = $214/day)
Schedule: Daily
Optimization: Installs
Bid Strategy: Lowest cost
Bid Cap: $0.70
```

**Audience Setup** (Modified):
```
Location: United States
Age: 35-45
Gender: Female
Language: English

Interests:
- Minimalism
- Decluttering (KonMari)
- Fashion/Style
- Home organization
- Parenting
- Work from home
- Financial independence
- Small business

Behaviors:
- Recently purchased fashion/home goods
- High intent for home organization
- Interested in sustainability/decluttering

Exclusions:
- Male audience
- Tech-averse signal
```

**Placements**:
```
├─ Instagram Feed (40%)
├─ Facebook Feed (40%)
├─ Instagram Stories (15%)
└─ Pinterest: Can add if audience available
```

**Ads for This Set**:
- Ad: "Earn $2,000+" (Testimonial video)
- Ad: "Success Story" (Social proof video)
- Ad: "Holiday Sales" (Seasonal)

---

### Campaign 3: Lookalike Audiences

**Objective**: App Installs
**Budget**: $8,000 (2 weeks)
**Focus**: Expand reach to similar audiences

#### Lookalike Audience Creation

**Create Lookalike from** (in this order of quality):
1. **High-value converters**: Users who signed up + connected 3+ marketplaces
2. **App installers**: All QuickSell app installers (custom audience)
3. **Website visitors**: Everyone who visited quicksell.monster in last 180 days
4. **Email list**: Quality email subscribers (>1K)

**For Each Lookalike**:
```
Source Audience: [Creator audience name]
Lookalike Location: United States
Lookalike %: 1% (very close match)
└─ Then create separate 1%, 2%, 5% ad sets for testing

Audience Size:
- 1%: 1-2M people
- 2%: 2-3M people
- 5%: 5-7M people

Budget Allocation:
- 1% Lookalike: 40% ($3,200)
- 2% Lookalike: 40% ($3,200)
- 5% Lookalike: 20% ($1,600)
```

#### Ad Set 3.1: 1% Lookalike (Highest Quality)

**Basic Settings**:
```
Name: AWARENESS_LOOKALIKE_INSTALL_NOV2025 - 1pct_highvalue
Budget: $3,200 (2 weeks)
Optimization: Installs
Bid Cap: $0.60 (highest quality audience)
```

**Audience**:
```
Lookalike Type: 1% of converters
Location: United States
Placements: Automatic
```

**Ads**:
- All top-performing ads from cold campaigns
- "AI Pricing" (Video)
- "One Universal Password" (Image)

---

### Campaign 4: Remarketing - Website Visitors

**Objective**: App Installs
**Budget**: $6,000 (2 weeks)
**Focus**: Warm audience who visited site

#### Ad Set 4.1: All Visitors (Last 30 Days)

**Basic Settings**:
```
Name: RETARGETING_WEBSITE_INSTALL_NOV2025 - All_Visitors
Budget: $2,000 (2 weeks)
Optimization: Installs
Bid Cap: $0.45 (warm audience = lower cost)
Frequency Cap: 5 (ads per day per person)
```

**Audience**:
```
Custom Audience: Website Visitors
├─ Timeframe: Last 30 days
├─ All visitors
├─ Exclude: People who installed app
└─ Size: ~5-10K people

Exclude audiences:
- App installers
- Past purchasers
```

**Ads**:
- Ad: "Try Free" / "No Credit Card"
- Ad: "Trust & Safety"
- Ad: "Success Stories"

#### Ad Set 4.2: High-Intent Visitors (Spent 2+ min)

**Basic Settings**:
```
Name: RETARGETING_WEBSITE_INSTALL_NOV2025 - HighIntent
Budget: $4,000 (2 weeks)
Optimization: Installs
Bid Cap: $0.55
Frequency Cap: 7
```

**Audience**:
```
Custom Audience: Website Visitors
├─ Timeframe: Last 30 days
├─ Page view time: > 120 seconds
├─ Visited key pages: (/features, /pricing, /reviews)
└─ Size: ~2-5K (smaller, higher intent)

Exclude:
- App installers
```

**Ads**:
- "Get Started Now" focused ads
- Strong CTA emphasis

---

### Campaign 5: Remarketing - App Visitors (Install but no signup)

**Objective**: Conversions (Account signup)
**Budget**: $5,000 (2 weeks)
**Focus**: Drive action from people who installed but didn't sign up

#### Ad Set 5.1: Installed, No Signup (3-7 Days)

**Basic Settings**:
```
Name: RETARGETING_APP_VISITORS_SIGNUP_NOV2025 - NoSignup_3-7d
Budget: $2,500 (2 weeks)
Optimization: Conversions
Conversion Event: CompleteRegistration
Bid Cap: $0.30 (mobile app users - cheaper)
```

**Audience**:
```
Custom Audience: App Installs
├─ People who installed but didn't sign up
├─ Installed: 3-7 days ago
├─ NOT signed up yet
└─ Size: ~1-2K people

Exclude:
- Active users
- Recent converters
```

**Ads** (via push notifications in app):
- "You're [X] Steps Away" (showing progress)
- "Free Forever" (removing objection)
- "Join 10K+ Sellers" (social proof)

**Note**: These can be in-app notifications rather than Facebook ads for better performance

---

### Campaign 6: Seasonal - Holiday (November-December)

**Objective**: App Installs
**Budget**: $8,000 (4 weeks)
**Focus**: Capitalize on holiday shopping surge

#### Ad Set 6.1: Holidays Campaign (All US)

**Basic Settings**:
```
Name: SEASONAL_HOLIDAY_INSTALL_NOV2025 - AllUS
Budget: $8,000 (4 weeks = $286/day)
Schedule: Daily
Optimization: Installs
Bid Cap: $0.70
Frequency Cap: 4
```

**Audience**:
```
Location: United States
Age: 18-65
Gender: All
Language: English

Interests:
- All audiences interested in selling
- Holiday shoppers
- Gift giving
- Last-minute sales

Behaviors:
- Recently purchased items
- High seasonal spending
```

**Placements**:
```
├─ Facebook Feed (50%)
├─ Instagram Feed (25%)
├─ Instagram Stories (15%)
└─ Instagram Reels (10%)
```

**Ads**:
- Ad: "Holiday Season = 3X Sales" (Holiday video)
- Seasonal messaging
- Urgency emphasis: "LIMITED TIME"
- Gift/Present emoji usage

---

## Audience Setup (Detailed)

### Core Audience Definitions

**Audience 1: Resellers & Flippers**
```
Demographics:
- Age: 25-55
- Income: $30K-150K+
- Education: High school+
- Employment: Various

Psychographics:
- Interest in eBay, Mercari, flipping
- Entrepreneurial mindset
- Active in reselling communities
- Seeking side income

Behaviors:
- Recently purchased items
- Active on marketplace apps
- Follow reselling influencers
- Read reselling blogs

Facebook Interests:
- eBay (Buying & Selling)
- Mercari
- Letgo
- Facebook Marketplace
- Business & Entrepreneurship
- Side Income
- Dropshipping
- E-commerce
- Business Management

Lookalikes:
- Create from: Email list, app installers, engaged users
```

**Audience 2: Side Hustlers**
```
Demographics:
- Age: 20-45
- Income: $40K+
- Education: Some college+
- Employment: Full-time + side income

Psychographics:
- Seeking supplemental income
- Tech-savvy
- Time-conscious
- Goal-oriented

Behaviors:
- Follow finance/business pages
- Active on career platforms
- Download productivity apps
- Engage with business content

Facebook Interests:
- Side Hustle
- Making Money
- Personal Finance
- Passive Income
- Entrepreneurship
- Small Business
- Freelancing
- Gig Economy
- Apps & Tech

Lookalikes:
- Create from: High-spending app installers
```

**Audience 3: Small Business Owners**
```
Demographics:
- Age: 30-65
- Income: $75K+
- Education: College+
- Employment: Self-employed/business owner

Psychographics:
- Scale-focused
- Automation-interested
- Efficiency-driven
- Leadership-minded

Behaviors:
- Follow business pages
- Engage with B2B content
- Active in business groups
- Attend webinars

Facebook Interests:
- Small Business
- E-commerce
- Business Management
- Marketing
- Leadership
- Business Books
- Entrepreneurship

Lookalikes:
- Create from: Premium users, high earners
```

---

## Ad Creation Workflow

### Step 1: Prepare Creative Assets

**Before creating ads in Ads Manager**:
- [ ] All 12 images designed (1200x628px)
- [ ] All 12 videos produced (1080x1920px)
- [ ] Monster character in multiple formats
- [ ] Headlines and copy finalized
- [ ] CTA buttons designed
- [ ] Legal review completed
- [ ] A/B test variations prepared

### Step 2: Upload Creative Assets

**In Ads Manager**:
```
Assets → Creative Assets
├─ Images:
│  ├─ Upload all 12 ad images (PNG/JPG)
│  ├─ Add alt text for accessibility
│  └─ Tag by campaign
├─ Videos:
│  ├─ Upload all 12 videos (MP4)
│  ├─ Add captions (for sound-off viewing)
│  └─ Set thumbnail
└─ Audience Network:
   └─ Enable for expanded reach
```

### Step 3: Create Ad Sets

**For Each Campaign**:
```
Ads Manager → Create Campaign
1. Select Objective: App Installs or Conversions
2. Set Campaign Budget & Schedule
3. Create Ad Sets (audience + budget breakdown)
4. Configure Targeting (location, age, interests)
5. Set Placements (automatic or manual)
6. Set Bidding Strategy (lowest cost)
7. Add Ads to each set
```

### Step 4: Create Individual Ads

**Ad Setup Process**:
```
Create Ad → Select Ad Set
1. Ad Format: Single Image / Carousel / Video
2. Upload Creative (image/video)
3. Primary Text: [Copy]
4. Headline: [Main message]
5. Description: [Secondary message]
6. CTA Button: [Download App / Learn More]
7. Link: [App store link or website]
8. Call-to-Action Destination: App Store
9. Review & Publish
```

### Step 5: Review & Launch

**Checklist Before Launch**:
- [ ] All targeting correct
- [ ] Budget verified
- [ ] Creative approved
- [ ] Legal compliant
- [ ] Links functional
- [ ] Pixel tracking confirmed
- [ ] A/B tests configured
- [ ] Budget pacing set
- [ ] Frequency caps applied
- [ ] Schedule correct

**Launch**:
```
1. Set campaign status: ACTIVE
2. Monitor first hour for errors
3. Check pixel fires correctly
4. Verify install tracking
5. Document start time
```

---

## Bidding & Budget Strategy

### Budget Allocation

**Total Monthly Budget**: $50,000

| Campaign | Type | Budget | Daily | Duration | Notes |
|----------|------|--------|-------|----------|-------|
| Resellers (Cold) | Install | $8,000 | $286 | 2 weeks | Primary audience |
| Side Hustlers (Cold) | Install | $6,000 | $214 | 2 weeks | Secondary audience |
| Lookalike (Warm) | Install | $8,000 | $286 | 2 weeks | Highest ROI potential |
| Website Retarget | Install | $6,000 | $214 | 2 weeks | Lower cost |
| App Retarget | Signup | $5,000 | $179 | 2 weeks | Optimize for conversions |
| Holiday (Seasonal) | Install | $8,000 | $286 | 4 weeks | Extended duration |
| Buffer/Testing | All | $3,000 | $107 | 2 weeks | A/B testing |
| **TOTAL** | | **$50,000** | **$1,786** | | |

### Bidding Strategy

**Lowest Cost Bidding** (Primary for installs):
```
Bidding Type: Lowest Cost
Bid Cap: Campaign-specific (see configurations)
Budget Optimization: Daily

Advantages:
- Facebook optimizes for most installs
- Predictable daily spend
- Good for new campaigns
- Better data for optimization

Use for: Cold audiences, awareness campaigns
```

**Cost Cap Bidding** (For conversion optimization):
```
Bidding Type: Cost Cap
Target Cost: $0.30-$0.45 per signup
Budget: Allocated daily

Advantages:
- Predictable cost per action
- Good for known ROAS
- Scales efficiently
- Reduces wasted spend

Use for: Retargeting, conversion campaigns
```

**Manual Bidding** (Advanced):
```
Bidding Type: Manual CPM/CPC
Bid Amount: Adjusted based on competition
Frequency: Increase gradually

Use for:
- High-value audiences
- Testing new creative
- Competitive auctions
```

### Budget Pacing

**Setting Daily Budget Pacing**:
```
Budget Schedule: Daily (not lifetime)
Pace Type: Accelerated (spend daily budget early)

Rationale:
- Better ad delivery throughout the day
- Captures peak traffic times
- Consistent performance data
- Easier to scale
```

**Budget Increase Strategy**:
```
Week 1: Start at planned budget
├─ Monitor performance daily
├─ Verify tracking working
└─ Collect baseline data

Week 2-3: If performing well
├─ Increase budget by 10-25%
├─ Double-check ROAS
└─ Scale winning ad sets

Week 3-4: Continue optimization
├─ Pause underperformers (CPA >$1.50)
├─ Scale top performers (+20-50%)
├─ Test new creative
└─ Maintain ROAS target 3:1+
```

---

## Optimization Rules

### Automatic Rules for Scaling

**Rule 1: Scale Winning Ad Sets**
```
Condition:
- Cost Per Result: < $0.80
- Daily Spend: >$200
- Duration: >7 days

Action:
- Increase daily budget by 25%
- Enable in all placements
- Monitor for 3 more days

Frequency: Check daily
```

**Rule 2: Pause Underperforming Sets**
```
Condition:
- Cost Per Result: > $1.50
- Duration: >7 days
- Spend: >$1,000 without result

Action:
- Decrease budget by 50%
- Reduce bid cap
- Change creative or audience
- Review after 3 days

Frequency: Check daily
```

**Rule 3: Prevent Ad Fatigue**
```
Condition:
- Cost Per Result increases >20%
- CTR decreases >25% over week
- Reach plateau with high frequency

Action:
- Introduce new creative
- Refresh ad copy
- Rotate audience segment
- Pause and restart with fresh audience

Frequency: Weekly
```

**Rule 4: Budget Reallocation**
```
Condition:
- Campaign A CPA: $0.60
- Campaign B CPA: $1.20
- Both spending allocated budget

Action:
- Move budget from B to A (10-25%)
- Increase A daily budget
- Decrease B daily budget
- Monitor for 3 days

Frequency: Weekly
```

### Optimization Metrics

**Key Performance Indicators**:

| Metric | Target | Acceptable | Alert |
|--------|--------|-----------|-------|
| CTR | 2-4% | 1.5-4.5% | <1.5% or >5% |
| CPC | $0.50-$1.00 | $0.40-$1.50 | >$1.50 |
| Cost Per Install | $0.50-$2.00 | $0.40-$2.50 | >$2.50 |
| Install Rate | 5-8% | 3-10% | <3% |
| ROAS | 3:1 | 2.5:1+ | <2:1 |
| Frequency | <4 per week | <5 | >6 |

**Daily Optimization Checklist**:
- [ ] Check spend vs. budget
- [ ] Monitor CPA trends
- [ ] Review new installs
- [ ] Check pixel firing
- [ ] Verify creative performance
- [ ] Assess CTR changes
- [ ] Monitor frequency
- [ ] Review audience sizes
- [ ] Check for policy violations
- [ ] Document changes

---

## A/B Testing Framework

### Testing Structure

**Test Elements**:
```
1. Creative Testing (images/videos)
2. Audience Testing (demographics/interests)
3. Placement Testing (feeds, stories, reels)
4. Copy Testing (headlines, descriptions, CTA)
5. Landing Page Testing (app store links)
```

### Ad Variation Examples

**Headline A/B Test**:
```
Variant A (Current):
"Stop Manual Listing"

Variant B (Alt 1):
"Turn Your Items into Cash"

Variant C (Alt 2):
"One App. 22 Marketplaces."

Variant D (Alt 3):
"Sell Smarter. Sell More."

Duration: 2 weeks
Metric: CTR, CPA
Winner Threshold: >20% better
```

**Audience A/B Test**:
```
Ad Set A:
- Age: 25-45
- Interest: eBay, Mercari

Ad Set B:
- Age: 35-55
- Interest: Craigslist, Poshmark

Ad Set C:
- Age: 20-35
- Interest: Side hustle, making money

Duration: 1 week
Metric: CPA, ROAS
Winner: Lowest CPA
```

**Creative Testing**:
```
Video A: Problem-focused
└─ Hook: 2 hours per item frustration
└─ Focus: Pain point
└─ Expected CTR: 2-3%

Video B: Solution-focused
└─ Hook: Magic of automation
└─ Focus: AI & speed
└─ Expected CTR: 3-4%

Video C: Social proof
└─ Hook: Real seller stories
└─ Focus: Earnings potential
└─ Expected CTR: 2-3%

Duration: 2 weeks
Metric: CTR, conversion rate
Winner: Best engagement + conversions
```

### Testing Methodology

**Setting Up A/B Test**:
```
1. Create single campaign
2. Create separate ad sets for each variant
3. Same audience, different creative/copy
4. Equal budget allocation
5. Run minimum 2 weeks
6. Collect baseline data (first 3 days)
7. Monitor daily but don't optimize mid-test
8. Declare winner at 2 weeks if >20% difference
```

**Statistical Significance Calculator**:
- Use Facebook's built-in test results
- Need >1000 impressions per variant
- Confidence level: 95%
- Minimum lift: 20% to declare winner

**Test Results Documentation**:
```
A/B Test Results Template

Test Name: [Test name]
Date: [Start] - [End]
Duration: [X days]

Variant A:
- Element: [What was tested]
- CTR: [X%]
- CPA: $[X]
- ROAS: [X:1]
- Sample size: [N] impressions

Variant B:
- Element: [What was tested]
- CTR: [X%]
- CPA: $[X]
- ROAS: [X:1]
- Sample size: [N] impressions

Winner: Variant [A/B]
Improvement: [X% better]
Statistical Confidence: [X%]

Action: [Implement winner / Run new test]
```

---

## Monitoring & Reporting

### Daily Dashboard Setup

**Create Facebook Ads Dashboard with columns**:
```
Campaign Name | Status | Budget | Spent | CTR | CPC | Cost/Install | ROAS | Actions
```

**Daily Tasks**:
- [ ] Spend vs. Budget (should be 1:1)
- [ ] Cost Per Install trend
- [ ] CTR trend (should be stable)
- [ ] Frequency check (ideally <4)
- [ ] Any errors/policy violations
- [ ] Audience size (should be stable)
- [ ] New installs (app store)
- [ ] Conversion tracking (signups)

### Weekly Reporting

**Weekly Performance Report Template**:

```markdown
# Weekly Ads Report - [Week of X]

## Summary
- Total Spend: $[X]
- Total Installs: [X]
- Cost Per Install: $[X]
- Return on Ad Spend: [X:1]
- Status: On/Under/Over target

## By Campaign
| Campaign | Spend | Installs | CPA | ROAS |
|----------|-------|----------|-----|------|
| [Campaign 1] | $X | X | $X | X:1 |
| [Campaign 2] | $X | X | $X | X:1 |
| [Campaign 3] | $X | X | $X | X:1 |

## Top Performing Ads
1. [Ad Name] - CPA: $[X], ROAS: [X:1]
2. [Ad Name] - CPA: $[X], ROAS: [X:1]
3. [Ad Name] - CPA: $[X], ROAS: [X:1]

## Underperforming
1. [Ad Name] - CPA: $[X] (Action: Pause)
2. [Ad Name] - CPA: $[X] (Action: Reduce budget)

## Audience Performance
- Best age group: [X-Y]
- Best gender: [X]
- Best placement: [X]
- Best interest group: [X]

## Optimizations Made
1. [Action 1] - Expected impact: [X]%
2. [Action 2] - Expected impact: [X]%
3. [Action 3] - Expected impact: [X]%

## Next Week Plan
- Focus: [Campaign/audience]
- Tests: [New creative/copy]
- Budget: [Allocation]
- Goal: [X installs at $X CPA]
```

### Monthly Campaign Review

**Monthly Performance Report**:

```markdown
# Monthly Ads Campaign Review - November 2025

## Campaign Performance
Total Spend: $50,000
Total Installs: [X] (target: 20K-25K)
Cost Per Install: $[X] (target: $0.50-$2.00)
ROAS: [X:1] (target: 3:1)

## Campaign Breakdown
[Detailed performance by each campaign]

## Top Insights
1. [Insight 1 with data]
2. [Insight 2 with data]
3. [Insight 3 with data]

## A/B Test Results
[Summary of major tests and winners]

## Audience Winners
[Best performing audience segments]

## Creative Winners
[Best performing ads/videos]

## Challenges & Learnings
[Issues encountered and solutions]

## Recommendations for Next Month
1. [Recommendation 1]
2. [Recommendation 2]
3. [Recommendation 3]

## Budget Allocation for December
[Proposed budget for next month based on learnings]
```

### Troubleshooting Guide

**High CPA (>$2.00)**:
- [ ] Check pixel tracking
- [ ] Verify app store link
- [ ] Test creative appeal
- [ ] Adjust audience targeting
- [ ] Lower bid cap
- [ ] Check for ad fatigue
- [ ] Try different placements

**Low CTR (<1%)**:
- [ ] Refresh creative (new ad)
- [ ] Change headline/copy
- [ ] Improve targeting
- [ ] Check placement performance
- [ ] Review competitor ads
- [ ] Test different audience segment

**Budget Not Spending**:
- [ ] Check audience size (too small?)
- [ ] Increase bid cap
- [ ] Expand targeting (age/interests)
- [ ] Add placements
- [ ] Check for policy violations
- [ ] Verify link is working
- [ ] Try different creative

**High Frequency (>5)**:
- [ ] Pause campaign temporarily
- [ ] Add new audience segment
- [ ] Create new creative
- [ ] Reduce budget cap daily
- [ ] Set frequency cap to 3-4
- [ ] Implement sequential messaging

---

## Compliance & Policy

### Facebook Ads Policies

**Key Restrictions**:
- [ ] No misleading income claims (avoid exact numbers)
- [ ] No before/after that misrepresent results
- [ ] No health claims (if any)
- [ ] No discriminatory targeting
- [ ] No disabled link destinations
- [ ] No spammy/clickbait language
- [ ] Privacy policy accessible
- [ ] Data usage transparent

**Compliant Copy**:
```
✅ "Turn Your Items into Cash"
❌ "Make $5,000 Per Month Guaranteed"

✅ "Sellers earn more with multiple marketplaces"
❌ "Earn 10x More Money in 7 Days"

✅ "Free to download"
❌ "Free Forever No Hidden Fees"

✅ "Join 100K+ sellers"
❌ "Proven System - Thousands Earning"
```

### Tracking & Privacy Compliance

**GDPR/CCPA Compliance**:
```
- Privacy policy linked in ads
- Consent tracking enabled
- User data handling transparent
- Right to opt-out honored
- Data retention limits respected
```

**Apple iOS 14+ Changes**:
```
- Aggregated Events setup (max 8 events)
- Primary conversion prioritized
- SKAdNetwork integrated
- Data loss accounted for
- Conversion window: 7 days
```

---

## Quick Launch Checklist

Before launching campaigns on [DATE]:

### 1-2 Weeks Before
- [ ] Business Manager & Ad Account setup
- [ ] Pixel installed and verified
- [ ] Domain verified
- [ ] Payment method added
- [ ] All creative assets ready
- [ ] Copy finalized and approved
- [ ] Landing pages/app links tested
- [ ] Team trained on monitoring

### 3-5 Days Before
- [ ] Assets uploaded to Ads Manager
- [ ] Campaigns & ad sets created
- [ ] Targeting configured
- [ ] Budgets set
- [ ] A/B tests planned
- [ ] Monitoring dashboard created
- [ ] Team notification sent

### Day Before
- [ ] Final creative review
- [ ] Link functionality test
- [ ] Pixel firing verification
- [ ] Budget confirmation
- [ ] Team standup
- [ ] Backup plan in place

### Launch Day
- [ ] All campaigns activated
- [ ] First hour monitoring (live)
- [ ] Install tracking verification
- [ ] Performance baseline captured
- [ ] Communication to team
- [ ] Escalation path ready

---

**Document Version**: 1.0
**Last Updated**: November 18, 2025
**Next Review**: Weekly

For questions about Ads Manager setup, contact the Marketing or Ads team.
