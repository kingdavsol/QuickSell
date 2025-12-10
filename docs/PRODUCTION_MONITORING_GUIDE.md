# Production Monitoring & Alert Configuration Guide

**Document Version**: 1.0
**Created**: November 18, 2025
**Purpose**: Comprehensive guide for setting up monitoring dashboards and critical alerts for QuickSell production environment

---

## Table of Contents

1. [Monitoring Architecture](#monitoring-architecture)
2. [Application Performance Monitoring](#application-performance-monitoring)
3. [Infrastructure Monitoring](#infrastructure-monitoring)
4. [Log Aggregation & Analysis](#log-aggregation--analysis)
5. [Alert Configuration](#alert-configuration)
6. [Dashboard Setup](#dashboard-setup)
7. [On-Call Procedures](#on-call-procedures)
8. [Incident Response](#incident-response)

---

## Monitoring Architecture

### Three-Layer Monitoring Strategy

```
┌─────────────────────────────────────────────────┐
│ Layer 1: Application Monitoring (Sentry, APM)  │
│ └─ Errors, performance, transactions          │
├─────────────────────────────────────────────────┤
│ Layer 2: Infrastructure Monitoring (CloudWatch)│
│ └─ CPU, memory, disk, network                 │
├─────────────────────────────────────────────────┤
│ Layer 3: Business Metrics (Mixpanel, Custom)  │
│ └─ Signups, sales, gamification               │
└─────────────────────────────────────────────────┘
```

### Tools Stack

```
Application Monitoring:
├─ Sentry - Error tracking & APM
├─ New Relic - Detailed APM
├─ Firebase Performance - Mobile app performance
└─ Mixpanel - User analytics

Infrastructure:
├─ AWS CloudWatch - Server metrics
├─ DataDog - Infrastructure monitoring
├─ PagerDuty - Alert aggregation
└─ Status Page - Public status

Logs:
├─ CloudWatch Logs - Centralized logs
├─ ELK Stack - Alternative log analysis
├─ Loggly - Log aggregation
└─ CloudFlare Logs - Edge logs

Uptime:
├─ Pingdom - Uptime monitoring
├─ Uptime Robot - Endpoint monitoring
└─ Synthetic monitoring - Transaction testing
```

---

## Application Performance Monitoring

### Sentry Setup

**Step 1: Create Sentry Project**

```bash
# Install Sentry SDK
npm install @sentry/node @sentry/tracing --save

# For React frontend
npm install @sentry/react --save

# For React Native
npm install @sentry/react-native --save
```

**Step 2: Initialize Backend (Node.js)**

```typescript
// backend/src/config/sentry.ts
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";

export const initializeSentry = (app: Express.Application) => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    release: process.env.APP_VERSION,
    maxValueLength: 8096,
    attachStacktrace: true,

    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Tracing.Express.RequestHandler(),
      new Tracing.Postgres(),
      new Sentry.Integrations.OnUncaughtException(),
      new Sentry.Integrations.OnUnhandledRejection(),
    ],
  });

  // Request handler
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());

  // Error handler
  app.use(Sentry.Handlers.errorHandler());
};

// Capture unhandled errors
process.on('unhandledRejection', (reason, promise) => {
  Sentry.captureException(new Error(`Unhandled Rejection: ${reason}`));
});
```

**Step 3: Initialize Frontend React**

```typescript
// frontend/src/index.tsx
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new BrowserTracing(),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Capture 10% of transactions for performance monitoring
  tracesSampleRate: 0.1,

  // Capture replay on 100% of Errors, 10% of transactions
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,

  release: process.env.REACT_APP_VERSION,
});

const sentryEnhancedApp = Sentry.withProfiler(App);
```

**Step 4: Tag Events for Better Tracking**

```typescript
// Automatic tag all errors with user context
Sentry.setTag("app.version", appVersion);
Sentry.setTag("environment", environment);

// Set user context
Sentry.setUser({
  id: userId,
  email: userEmail,
  username: username,
});

// Custom context
Sentry.setContext("marketplace", {
  connected: connectedMarketplaces.length,
  integration: currentMarketplace,
});

// Tag API calls
Sentry.captureMessage("Bulk marketplace signup initiated", {
  tags: {
    action: 'bulk_signup',
    user_id: userId,
    marketplace_count: selectedMarketplaces.length,
    level: 'info'
  }
});
```

### New Relic APM (Optional Enhanced Monitoring)

```typescript
// backend/src/config/newrelic.ts
require('newrelic'); // Must be first require

// In package.json
"newrelic": {
  "app_name": ["QuickSell"],
  "license_key": process.env.NEW_RELIC_KEY,
  "logging": {
    "level": "info"
  },
  "error_collector": {
    "enabled": true
  },
  "transaction_tracer": {
    "enabled": true,
    "transaction_threshold": "apdex_f"
  }
}
```

### Firebase Performance Monitoring (Mobile)

```swift
// iOS
import FirebasePerformance

// Automatically collects data on:
// - App startup time
// - Screen rendering performance
// - Network request performance
// - Custom traces

// Custom trace
let trace = Performance.startTrace(name: "bulk_marketplace_signup")
// ... do work ...
trace?.stop()
```

---

## Infrastructure Monitoring

### AWS CloudWatch Setup

**Step 1: Create CloudWatch Dashboard**

```bash
# AWS CLI command to create dashboard
aws cloudwatch put-dashboard \
  --dashboard-name QuickSell-Production \
  --dashboard-body file://dashboard-config.json
```

**Dashboard Metrics** (dashboard-config.json):

```json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/EC2", "CPUUtilization", { "stat": "Average" }],
          ["AWS/RDS", "CPUUtilization", { "stat": "Average" }],
          ["AWS/RDS", "DatabaseConnections", { "stat": "Average" }],
          ["AWS/ELB", "TargetResponseTime", { "stat": "Average" }],
          ["AWS/ELB", "RequestCount", { "stat": "Sum" }],
          ["AWS/ELB", "HTTPCode_Target_5XX", { "stat": "Sum" }]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-east-1",
        "title": "Infrastructure Health",
        "yAxis": { "left": { "min": 0 } }
      }
    },
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/ApplicationELB", "UnHealthyHostCount"],
          ["AWS/ApplicationELB", "HealthyHostCount"]
        ],
        "period": 60,
        "stat": "Average",
        "region": "us-east-1",
        "title": "Load Balancer Health"
      }
    },
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/RDS", "EngineUptime"],
          ["AWS/RDS", "ReadLatency", { "stat": "Average" }],
          ["AWS/RDS", "WriteLatency", { "stat": "Average" }]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-east-1",
        "title": "Database Performance"
      }
    }
  ]
}
```

**Key Metrics to Monitor**:

| Metric | Threshold | Alert On | Action |
|--------|-----------|----------|--------|
| CPU Utilization | 70% | >70% | Scale up / Optimize code |
| Memory Utilization | 80% | >80% | Increase instance size |
| Disk Space | 85% | >85% | Cleanup logs / Expand volume |
| Database Connections | 80/100 | >80 | Review open connections |
| Response Time | 500ms | >1000ms | Optimize queries |
| Error Rate | 1% | >1% | Investigate errors |
| Request Rate | Baseline | Spike >2x | Check for DDoS |

### CloudWatch Logs Insights Queries

```sql
-- Find all errors in last 1 hour
fields @timestamp, @message, @logStream
| filter @message like /ERROR/
| stats count() by @logStream

-- API response times by endpoint
fields @timestamp, @duration, @path
| filter @path like /api/
| stats avg(@duration), max(@duration) by @path

-- Database query performance
fields @timestamp, @duration, @query
| filter @duration > 1000
| sort @duration desc
| limit 50

-- Failed marketplace connections
fields @timestamp, @message, marketplace
| filter @message like /marketplace.*failed|error/
| stats count() by marketplace

-- User signup flow funnel
fields @timestamp, step, user_id
| filter step in [signup_start, email_confirm, profile_setup, first_listing]
| stats count() as attempts by step
```

---

## Log Aggregation & Analysis

### ELK Stack Setup (Self-Hosted Alternative)

**Step 1: Docker Compose Configuration**

```yaml
# docker-compose.yml - ELK Stack
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.5.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  kibana:
    image: docker.elastic.co/kibana/kibana:8.5.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200

  logstash:
    image: docker.elastic.co/logstash/logstash:8.5.0
    ports:
      - "5000:5000"
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    environment:
      - "LS_JAVA_OPTS=-Xmx256m -Xms256m"

volumes:
  elasticsearch_data:
```

**Step 2: Application Log Shipping**

```typescript
// backend/src/config/logger.ts
import winston from 'winston';
import WinstonElasticsearch from 'winston-elasticsearch';

const elasticsearchTransport = new WinstonElasticsearch({
  level: 'info',
  clientOpts: { nodes: ['http://localhost:9200'] },
  index: 'quicksell-logs',
  transformer: (logData) => {
    return {
      '@timestamp': new Date().toISOString(),
      message: logData.message,
      severity: logData.level,
      fields: logData.meta,
    };
  },
});

export const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    elasticsearchTransport,
  ],
});
```

**Step 3: Query Logs in Kibana**

```
# Find errors by error type
severity: "error" | stats count() by fields.error_type

# Track bulk marketplace signup failures
fields.action: "bulk_signup" AND severity: "error"
| stats count() by fields.marketplace

# Monitor response time degradation
@timestamp > now-24h
| stats avg(fields.response_time) by fields.endpoint

# User journey tracking
fields.user_id: "user_123"
| sort @timestamp desc
```

---

## Alert Configuration

### Critical Alert Triggers

**Alert 1: Application Error Rate**
```
Condition: Error rate > 1% (or 2 standard deviations above baseline)
Evaluation: Last 5 minutes, every 1 minute
Severity: CRITICAL
Action: Page on-call engineer
Notification: Slack + Email + SMS
Threshold: 10+ errors in 5 minutes OR >1% error rate
Escalation: If unacknowledged in 5 min, notify manager
```

**Alert 2: API Response Time**
```
Condition: P95 latency > 1000ms OR P99 > 2000ms
Evaluation: Last 5 minutes, every 2 minutes
Severity: HIGH
Action: Slack notification + Alert on dashboard
Threshold: Sustained for >5 minutes
Resolution: Check database queries, review recent deployments
```

**Alert 3: Database Connection Exhaustion**
```
Condition: Available connections < 10 (out of 100)
Evaluation: Continuous
Severity: CRITICAL
Action: Page on-call + Automatic scaling trigger
Threshold: Immediate
Resolution: Scale database, kill idle connections, review connection pooling
```

**Alert 4: Disk Space Critical**
```
Condition: /dev/sda1 > 90% full
Evaluation: Every 5 minutes
Severity: HIGH
Action: Slack alert + Disk cleanup script
Threshold: Auto cleanup if >92%
Resolution: Archive logs, review large files
```

**Alert 5: Marketplace Integration Failures**
```
Condition: >5% of bulk marketplace signups failing in 10 minutes
Evaluation: Every 10 minutes
Severity: HIGH
Action: Alert team
Threshold: Any 3+ failures in a row (same marketplace)
Resolution: Check marketplace API status, review error logs
```

**Alert 6: Payment Processing Failures**
```
Condition: Stripe API errors > 2 in 5 minutes
Evaluation: Every 1 minute
Severity: CRITICAL
Action: Page on-call, notify billing
Threshold: Immediate
Resolution: Check Stripe status, review recent code changes
```

**Alert 7: High CPU Usage**
```
Condition: Average CPU > 80% for 10 minutes
Evaluation: Every 2 minutes
Severity: HIGH
Action: Alert dashboard, consider auto-scaling
Threshold: Sustained for >10 minutes
Resolution: Scale up / Optimize hot code paths
```

**Alert 8: High Memory Usage**
```
Condition: Memory utilization > 85%
Evaluation: Every 5 minutes
Severity: HIGH
Action: Alert team
Threshold: Sustained for >5 minutes
Resolution: Restart service, investigate memory leak
```

**Alert 9: App Store Connectivity**
```
Condition: Cannot reach app store endpoints for 2+ minutes
Evaluation: Every 30 seconds
Severity: CRITICAL
Action: Page on-call
Threshold: Network unavailable for >2 minutes
Resolution: Check network, check app store status, restart service
```

**Alert 10: Authentication Service Down**
```
Condition: Login failures > 50% in 5 minutes
Evaluation: Every 1 minute
Severity: CRITICAL
Action: Page on-call + Start incident
Threshold: >50% of login attempts failing
Resolution: Check auth service health, review logs, rollback recent changes
```

### Sentry Alert Rules

```javascript
// Sentry Project Settings → Alerts

{
  name: "High Error Rate",
  conditions: [
    {
      type: "event.error_rate",
      value: 10, // 10 errors per minute
      comparisonType: "greater"
    }
  ],
  actions: [
    {
      service: "pagerduty",
      severity: "critical"
    },
    {
      service: "slack",
      channel: "#incidents"
    }
  ]
}

{
  name: "Bulk Marketplace Signup Failures",
  conditions: [
    {
      type: "event.error_message",
      pattern: "marketplace.*signup"
    },
    {
      type: "event.count",
      value: 5,
      comparisonType: "greater"
    }
  ],
  actions: [
    {
      service: "slack",
      channel: "#marketplace-integration"
    }
  ]
}

{
  name: "Unusual User Activity",
  conditions: [
    {
      type: "event.user.id",
      value: "suspicious"
    }
  ],
  actions: [
    {
      service: "slack",
      channel: "#security"
    }
  ]
}
```

### PagerDuty Integration

```bash
# Install PagerDuty CLI
npm install pagerduty --save

# Configure webhook for critical alerts
curl -X POST https://events.pagerduty.com/v2/enqueue \
  -H 'Content-Type: application/json' \
  -d '{
    "routing_key": "YOUR_INTEGRATION_KEY",
    "event_action": "trigger",
    "dedup_key": "baf3b3d798e41225a26dc340375433a9",
    "payload": {
      "summary": "Application error rate critical",
      "severity": "critical",
      "source": "Sentry",
      "custom_details": {
        "error_rate": "5%",
        "error_count": 45,
        "time_window": "5 minutes"
      }
    }
  }'
```

---

## Dashboard Setup

### Main Operations Dashboard

**Dashboard URL**: `internal.quicksell.monster/dashboard`

**Components**:

1. **Status Panel** (Top)
   - System Status: ✅ All Green / ⚠️ Degraded / 🔴 Down
   - Last Updated: [Time]
   - On-Call Engineer: [Name]

2. **Key Metrics** (Real-time)
   ```
   [ Active Users: 1,234 ] [ Requests/sec: 4.5 ] [ Error Rate: 0.2% ] [ Avg Latency: 245ms ]
   ```

3. **Error Rate Graph**
   - X-axis: Time (last 24h)
   - Y-axis: Error count/percentage
   - Target line: 1%
   - Alert threshold: 2%

4. **API Performance** (by endpoint)
   ```
   /api/listings - 245ms avg (green ✅)
   /api/marketplaces - 1200ms avg (yellow ⚠️)
   /api/bulk-signup - 890ms avg (green ✅)
   /api/gamification - 145ms avg (green ✅)
   ```

5. **Database Health**
   ```
   Connections: 45/100 (45%)
   Query Time: 125ms avg (p95: 450ms)
   Replication Lag: 0.2s
   ```

6. **Infrastructure**
   ```
   CPU: [=====>     ] 42%
   Memory: [======>  ] 68%
   Disk: [====>      ] 35%
   Network: 125 Mbps in / 85 Mbps out
   ```

7. **Recent Alerts** (Last 10)
   ```
   [🔴 CRITICAL] High error rate - 15:32
   [⚠️ HIGH] Marketplace API slow - 15:28
   [✅ RESOLVED] Database connection spike - 15:10
   ```

8. **Deployment Status**
   ```
   Last Deployment: 2025-11-18 14:23:45 UTC
   Version: v1.2.3
   Status: Healthy ✅
   ```

### Business Metrics Dashboard

**Accessible to**: Product/Marketing teams

**Metrics**:
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- New Installs (daily)
- User Retention (7-day, 30-day)
- Total Sales Volume
- Revenue (if premium features)
- Top Marketplaces (by usage)
- Average Earnings per User
- Points Distributed
- Badges Earned

### Performance Dashboard

**Accessible to**: Engineering team

**Metrics**:
- API endpoint response times (p50, p95, p99)
- Database query performance
- Redis cache hit rate
- Marketplace integration success rate
- Failed transaction rollbacks
- Email delivery rate
- Push notification delivery rate
- Third-party API latencies

---

## On-Call Procedures

### On-Call Rotation Setup

**Schedule**:
```
Week 1: Engineer A (Primary), Engineer B (Secondary)
Week 2: Engineer B (Primary), Engineer C (Secondary)
Week 3: Engineer C (Primary), Engineer D (Secondary)
Week 4: Engineer D (Primary), Engineer A (Secondary)

Handoff: Monday 9 AM UTC
Escalation: After 15 minutes unack, notify secondary
           After 30 minutes unack, notify manager
           After 1 hour unack, start incident
```

### On-Call Responsibilities

**During On-Call Week**:
- [ ] Keep phone with you (on vibrate)
- [ ] Check Slack/PagerDuty within 5 minutes
- [ ] Acknowledge alert within 5 minutes
- [ ] Provide status update every 15 minutes
- [ ] Resolve critical issues within 1 hour
- [ ] Keep team informed of actions

**Before Shift**:
- [ ] Review recent deployments
- [ ] Check ongoing incidents
- [ ] Verify access to all systems
- [ ] Prepare escalation contacts

**After Shift**:
- [ ] Handoff to next engineer
- [ ] Summarize week's incidents
- [ ] Document any outstanding issues
- [ ] Update runbooks if needed

### Alert Response Workflow

```
ALERT TRIGGERED
    ↓
PagerDuty notification → Slack alert
    ↓
On-call acknowledges (< 5 min)
    ↓
Assess severity:
  - CRITICAL: Start Slack incident channel, page on-call
  - HIGH: Slack alert, start investigating
  - MEDIUM: Log for morning review
    ↓
Gather information:
  - Check Sentry for errors
  - Review CloudWatch metrics
  - Check deployment history
    ↓
Root cause:
  - Code issue? Rollback or hot-fix
  - Infrastructure? Scale or restart
  - Third-party? Check status page
    ↓
Implement fix:
  - Test in staging first if possible
  - Deploy to production
  - Verify alert clears
    ↓
Post-incident:
  - Document what happened
  - Schedule postmortem (critical only)
  - Update runbooks
  - Implement prevention
```

### Common Incident Playbooks

**Playbook 1: High Error Rate (>2%)**

```
Symptoms:
- Error rate > 2%
- Sentry showing errors
- Users reporting issues

Diagnosis:
1. Check last deployment (time)
2. Review error logs in Sentry
3. Check if errors in specific endpoint
4. Check database connectivity
5. Check third-party API status

Resolution:
Option A: Rollback recent deployment
Option B: Restart affected service
Option C: Scale up resources
Option D: Database restart

Verification:
- Error rate < 1% for 5 minutes
- No new error alerts
- Confirm with team
```

**Playbook 2: Database Connection Exhaustion**

```
Symptoms:
- Alert: connections > 90 of 100
- API timeouts / 503 errors
- Slow queries

Diagnosis:
1. SSH to database server
2. Run: SELECT * FROM pg_stat_activity;
3. Look for idle connections
4. Check connection pool settings
5. Review recent queries

Resolution:
- Kill idle connections: SELECT pg_terminate_backend(pid)
- Restart connection pool
- Scale database if temporary spike
- Review application connection handling

Prevention:
- Lower connection timeout
- Implement connection pooling
- Monitor query execution
```

**Playbook 3: App Store API Failures**

```
Symptoms:
- Marketplace signup failures > 5%
- Specific marketplace affected
- Users can't connect accounts

Diagnosis:
1. Check marketplace status page
2. Test API endpoint manually
3. Review error messages in logs
4. Check IP whitelist status
5. Verify API credentials

Resolution:
- Wait for marketplace API to recover
- Or implement fallback flow
- Or notify users of temporary issue
- Update ETA in app if long outage

Prevention:
- Monitor marketplace API status
- Implement retry logic with backoff
- Add circuit breaker pattern
- Cache marketplace data
```

---

## Incident Response

### Incident Declaration

**Criteria for declaring incident**:
- Any CRITICAL alert (error rate >2%, critical service down)
- Multiple related failures (>3 errors)
- Customer impact (>10 users affected or >1 hour outage)
- Data integrity issue
- Security issue

**Incident Declaration Steps**:
```
1. Create Slack incident channel: #incident-YYYYMMDD-HHMM
2. Post incident summary with:
   - What happened
   - When it started
   - Current impact
   - Status: "INVESTIGATING"
3. Tag on-call team members
4. Set channel topic to severity level
5. Start incident post in Sentry/PagerDuty
```

### Incident Communication

**Status Updates** (every 15 minutes during incident):
```
Status: INVESTIGATING
  └─ What we know: [Summary]
  └─ What we're doing: [Action items]
  └─ ETA to resolution: [Time estimate]
```

**Once Resolved**:
```
Status: RESOLVED ✅
  └─ Root cause: [Brief explanation]
  └─ Resolution: [What we did]
  └─ Time to resolution: [Duration]
  └─ Impact: [Brief statement]
```

**Customer Communication** (if >1 hour outage):
- Post to Status Page (status.quicksell.monster)
- Send in-app notification (if recoverable)
- Email major customers
- Tweet update (@QuickSellApp)

### Post-Incident Process

**Postmortem Meeting** (Critical incidents only):
- When: Within 24 hours of resolution
- Who: Incident commander, relevant engineers, manager
- Duration: 30-60 minutes
- Document: Action items, preventions, timeline

**Postmortem Report**:
```markdown
# Incident Postmortem - [2025-11-18 HIGH ERROR RATE]

## Executive Summary
Brief 1-2 sentence summary of what happened

## Timeline
- 15:32 Alert: Error rate exceeded 2%
- 15:35 On-call acknowledged
- 15:42 Root cause identified: Database connection leak
- 15:47 Database connections restarted
- 15:50 Services recovered
- 15:55 Verified stability

## Root Cause
[Detailed explanation of what caused the incident]

## Impact
- Duration: 23 minutes
- Affected users: ~500
- Failed requests: ~5,000
- Revenue impact: ~$0

## Resolution
[What was done to fix it]

## Action Items
1. [ ] Implement connection pool monitoring (Owner: X, Due: X)
2. [ ] Add automated connection leak detection (Owner: Y, Due: X)
3. [ ] Update runbook with recovery procedure (Owner: Z, Due: X)

## Lessons Learned
- [Learning 1]
- [Learning 2]
- [Learning 3]
```

---

## Monitoring Checklists

### Daily Health Check (Morning)

- [ ] Check overnight alerts in PagerDuty
- [ ] Verify no unresolved incidents
- [ ] Review error count in Sentry
- [ ] Check CloudWatch for any anomalies
- [ ] Verify backups completed successfully
- [ ] Review user-reported issues
- [ ] Check marketplace API status

### Weekly Health Review

- [ ] Review all alerts from past week
- [ ] Analyze error patterns
- [ ] Check performance trends
- [ ] Review deployment history
- [ ] Database maintenance status
- [ ] Disk usage trends
- [ ] Plan for any needed scaling

### Monthly Health Report

```markdown
# Monthly Monitoring Report - November 2025

## Uptime
- Target: 99.5%
- Actual: 99.7% ✅

## Incidents
- Critical: 0
- High: 2 (both resolved in <1h)
- Medium: 5
- Low: 12

## Performance Metrics
- Avg response time: 245ms (↓ 5% from Oct)
- P95 latency: 890ms (↑ 10% from Oct)
- Error rate: 0.15% (↓ 50% from Oct)
- Successful deploys: 15/15 (100%)

## Infrastructure
- Avg CPU: 42% (healthy)
- Avg Memory: 68% (trending up)
- Disk usage: 35% (stable)

## Alerts Triggered
- High error rate: 2 times
- Database slowness: 1 time
- API timeouts: 3 times
- High CPU: 0 times

## Improvements Made
1. Added automatic scaling for spike traffic
2. Optimized marketplace API calls
3. Increased database connection pool
4. Implemented circuit breaker for third-party APIs

## Recommendations for December
1. Review and optimize slow endpoints
2. Implement caching for marketplace data
3. Monitor memory usage - may need optimization
4. Schedule database maintenance

Created by: [Name]
Date: [Date]
```

---

**Document Version**: 1.0
**Last Updated**: November 18, 2025
**Next Review**: Weekly by on-call team

For monitoring questions, contact: Infrastructure team or on-call engineer
