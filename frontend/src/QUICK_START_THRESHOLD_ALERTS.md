# Quick Start: Custom Threshold Alerts

## 🎯 What Is This Feature?

Get notified by **email or SMS** when water hyacinth coverage in a specific zone reaches your custom threshold.

**Example**: "Alert me when Zone 3 reaches 50% hyacinth coverage"

---

## 📍 Where to Find It

1. Log into the dashboard
2. Click **"Hyacinth Monitoring"** tab
3. Look for **"Custom Threshold Alerts"** card at the top

---

## ⚡ Quick Setup (30 seconds)

### Step 1: Click "Add Alert"
Located in the top-right of the Custom Threshold Alerts card.

### Step 2: Fill in 3 Things
```
📍 Zone:      [Select which zone to monitor]
📊 Threshold: [Enter percentage, e.g., 50]
📧 Notify:    [Toggle Email and/or SMS]
```

### Step 3: Click "Create Alert"
Done! You'll now be notified when your threshold is exceeded.

---

## 💡 Common Use Cases

### Monitor Critical Zone
```
Zone:      Zone 3 - Central
Threshold: 50%
Notify:    Email + SMS
Why:       Zone 3 is historically problematic
```

### Track Overall Health
```
Zone:      Overall Coverage
Threshold: 40%
Notify:    Email only
Why:       Get daily summaries without SMS spam
```

### Multiple Zone Strategy
```
Alert 1: Zone 3 at 35% → Email + SMS (urgent)
Alert 2: Zone 1 at 60% → Email only (monitoring)
Alert 3: Overall at 45% → Email only (tracking)
```

---

## 🔔 What Happens When Threshold Is Exceeded?

### You Receive:
1. **Pop-up notification** in the dashboard
2. **Email** to your registered address (if enabled)
3. **SMS** to your phone number (if enabled)

### The Notification Shows:
- Which zone exceeded the threshold
- Current hyacinth level (e.g., 52%)
- Your threshold setting (e.g., 50%)
- When it happened
- What actions to consider

---

## 🎨 Understanding the Visual Display

### Alert Status Colors

**🟢 Green Border** = Active and monitoring
- Current level is below your threshold
- System is watching for changes

**🔴 Red Border** = THRESHOLD EXCEEDED
- Current level has reached/exceeded your threshold
- Notifications have been sent
- Immediate attention may be needed

**⚪ Gray Border** = Inactive
- Alert is paused (you can reactivate anytime)
- No monitoring or notifications

### Progress Bar

```
Current: 45% ████████░░░░░░░░░░ Threshold: 50%
         └─────────────┬──────────────┘
              Getting close to threshold
```

When the bar fills to 100%, your threshold is exceeded and you'll be notified.

---

## 🛠️ Managing Your Alerts

### Viewing Active Alerts
All your alerts are listed in the Custom Threshold Alerts card.

Each shows:
- Zone name
- Current level vs your threshold
- Progress bar
- Notification methods (email/SMS icons)
- Active/Exceeded status

### Pause an Alert
Click the **✓ checkmark icon** to temporarily pause monitoring.
(Changes to **✗** when inactive)

### Reactivate an Alert
Click the **✗** icon to resume monitoring.

### Delete an Alert
Click the **🗑️ trash icon** to permanently remove.

---

## ⚠️ Important Notes

### Guest Users
- **Cannot** create custom alerts
- Must log in with an account
- This ensures notifications go to verified contacts

### One Alert Per Zone
- You can only have one active alert per zone
- To change the threshold: delete the old alert, create a new one
- Prevents conflicting alerts for the same zone

### Cooldown Period
- After triggering, alerts wait 30 minutes before re-triggering
- Prevents notification spam
- If level drops below threshold, the alert resets immediately

### Data Persistence
- Your alerts are saved in your browser
- They'll remain even after closing the dashboard
- **Important**: Clearing browser data will remove your alerts

---

## 🎓 Pro Tips

### 1. Set Strategic Thresholds
- Don't set too low (you'll get too many alerts)
- Review the Zone Breakdown to see typical levels
- Add 5-10% buffer above current average

### 2. Use Both Notification Types Wisely
- **Email + SMS**: Critical zones needing immediate action
- **Email only**: General monitoring and record keeping
- **SMS only**: When you need instant awareness

### 3. Start with Overall Coverage
- Good for learning how the system works
- Set at 40-45% for general dam health
- Add zone-specific alerts once comfortable

### 4. Review Regularly
- Check your alerts weekly
- Adjust thresholds based on trends
- Deactivate during maintenance periods

### 5. Combine with Existing Alerts
- Automatic alerts still work (≥2% increases, critical levels)
- Custom alerts are additional, not replacement
- Use custom alerts for YOUR specific concerns

---

## 🐛 Troubleshooting

### "Cannot create alert"
**Problem**: Already have an alert for that zone
**Solution**: Delete the existing alert first, or choose a different zone

### "Not receiving notifications"
**Problem**: Settings or contact info issue
**Solution**: 
1. Check Profile → verify email and phone are correct
2. Check spam folder for emails
3. Ensure toggles are ON when creating alert

### "Alert says Active but nothing happens"
**Problem**: Current level is below threshold
**Solution**: This is correct! Alert only triggers when threshold is exceeded

### "Guest Mode" message appears
**Problem**: Not logged in or using Guest access
**Solution**: Log in with a registered account

---

## 📊 Example Scenarios

### Scenario 1: Preventive Monitoring
**Goal**: Catch problems before they're critical
```
✓ Create alert: Zone 3 at 40%
✓ Current level: 38%
✓ Result: Alert triggers before reaching critical 60%
✓ Benefit: Time to plan intervention
```

### Scenario 2: Multiple Zone Tracking
**Goal**: Monitor all high-risk areas
```
✓ Zone 1: 55% threshold (historically stable)
✓ Zone 2: 50% threshold (moderate risk)
✓ Zone 3: 35% threshold (high risk area)
✓ Zone 4: 50% threshold (moderate risk)
✓ Zone 5: 55% threshold (historically stable)
```

### Scenario 3: After Intervention
**Goal**: Monitor treatment effectiveness
```
✓ Recent treatment in Zone 3
✓ Create alert: Zone 3 at 30%
✓ Purpose: Ensure treatment is working
✓ If triggered: Treatment may not be effective
```

---

## 🚀 Next Steps

1. **Create Your First Alert**
   - Start with Overall Coverage at 45%
   - Enable email notifications
   - Watch how it works for a few days

2. **Expand Your Monitoring**
   - Add zone-specific alerts
   - Adjust thresholds based on experience
   - Enable SMS for critical zones

3. **Integrate Into Workflow**
   - Use alerts as early warning system
   - Plan interventions based on notifications
   - Track effectiveness over time

4. **Share Knowledge**
   - Show team members how to use
   - Establish team threshold standards
   - Create response protocols for alerts

---

## 📞 Need Help?

- Review the full guide: `THRESHOLD_ALERTS_GUIDE.md`
- Check tooltips in the dashboard
- Contact system administrator
- Report issues through feedback form

---

**Remember**: Custom Threshold Alerts put YOU in control of when you're notified!

---

*Last updated: October 14, 2025*
