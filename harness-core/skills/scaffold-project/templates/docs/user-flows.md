# User Flows

## Flow Inventory

| Flow Name | Trigger | Happy Path Steps | Edge Cases | Status |
|-----------|---------|-----------------|------------|--------|
| | | | | |

---

## Flow Template

<!-- Copy this section for each flow -->

### {{FLOW_NAME}}

**User goal:** <!-- One sentence: what the user is trying to accomplish -->

**Entry point:** <!-- Where does this flow start? (URL, button, notification, etc.) -->

#### Happy Path

```
1. User lands on [page]
   -> Sees [primary content]
   -> CTA: [action label]

2. User [action]
   [? Decision point]
   |-- Yes -> Step 3
   |-- No  -> [alternative path]

3. User [completes action]
   -> Success state: [what they see]
   -> Redirect: [where they go next]
```

#### Error States

| Step | Error | User Sees | Recovery |
|------|-------|-----------|----------|
| | | | |

#### Edge Cases

- **Returning user mid-flow:**
- **Slow network:**
- **Denied permission:**
- **Long text / overflow:**

#### Responsive Behavior

| Breakpoint | Changes |
|-----------|---------|
| Mobile (360-767px) | |
| Tablet (768-1023px) | |
| Desktop (1024+) | |

---

## Cross-Flow Connections

<!-- How do flows link to each other? -->

| From Flow | Trigger | To Flow |
|-----------|---------|---------|
| | | |
