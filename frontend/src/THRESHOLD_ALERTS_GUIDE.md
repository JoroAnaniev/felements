# Custom Threshold Alerts - User Guide

## Overview

The new **Custom Threshold Alerts** feature allows users to set up personalized notifications for specific zones when Water Hyacinth coverage reaches or exceeds custom-defined thresholds.

## Feature Location

Navigate to: **Dashboard → Hyacinth Monitoring Tab**

The **Custom Threshold Alerts** card is displayed at the top of the Hyacinth Monitoring tab.

## How to Set Up a Custom Alert

### Step 1: Access the Alert Creation Dialog
1. Navigate to the **Hyacinth Monitoring** tab in the Dashboard
2. Click the **"Add Alert"** button in the Custom Threshold Alerts card

### Step 2: Configure Your Alert
1. **Select Zone**: Choose from:
   - Overall Coverage
   - Zone 1 - North
   - Zone 2 - Northeast
   - Zone 3 - Central
   - Zone 4 - West
   - Zone 5 - South

2. **Set Threshold**: Enter a percentage value (1-100%)
   - Example: Setting 50% means you'll be alerted when hyacinth coverage reaches or exceeds 50%

3. **Choose Notification Methods**:
   - **Email Notification**: Sends alert to your registered email address
   - **SMS Notification**: Sends text message to your registered phone number
   - You can enable one or both methods

### Step 3: Create the Alert
- Click **"Create Alert"** to activate your custom threshold
- The system will immediately start monitoring for this threshold

## Managing Your Alerts

### Active Alerts Display
Each active alert shows:
- **Zone Name**: The monitored zone
- **Status Badge**: 
  - "Active" (green) - Currently monitoring
  - "EXCEEDED" (red) - Threshold has been surpassed
  - "Inactive" (gray) - Alert is paused
- **Current Level vs Threshold**: Real-time comparison
- **Progress Bar**: Visual indicator of current level relative to your threshold
- **Notification Methods**: Icons showing email/SMS delivery

### Alert Actions
- **Activate/Deactivate**: Toggle the checkmark icon to pause/resume monitoring
- **Delete**: Click the trash icon to permanently remove the alert

## How Alerts Work

### Monitoring Logic
1. The system continuously monitors hyacinth coverage levels for your selected zones
2. When the current level **reaches or exceeds** your threshold, an alert is triggered
3. Notifications are sent via your chosen method(s): email and/or SMS

### Alert Triggering
- Alerts trigger when crossing the threshold from below (rising edge detection)
- Once triggered, the same alert won't re-trigger for 30 minutes to prevent spam
- If the level drops below the threshold and rises again, a new alert will be sent

### Notification Delivery
When a threshold is exceeded, you will receive:
1. **In-App Toast Notification**: Immediate visual alert in the dashboard
2. **Email Notification**: Sent to your registered email address (if enabled)
3. **SMS Notification**: Text message to your registered phone number (if enabled)

## Notification Content

Each threshold alert includes:
- **Zone Name**: Which area exceeded the threshold
- **Current Level**: The actual hyacinth coverage percentage
- **Your Threshold**: The limit you set
- **Timestamp**: When the threshold was exceeded
- **Contact Information**: Confirmation of where the alert was sent

## Example Use Cases

### Example 1: Monitor Critical Zone
- **Zone**: Zone 3 - Central
- **Threshold**: 50%
- **Notifications**: Email + SMS
- **Result**: Get immediately notified when the most critical zone reaches concerning levels

### Example 2: Overall Dam Monitoring
- **Zone**: Overall Coverage
- **Threshold**: 40%
- **Notifications**: Email only
- **Result**: Track general dam conditions without SMS interruptions

### Example 3: Multiple Zone Monitoring
- Create separate alerts for each zone with different thresholds
- Tailor notification methods per zone based on priority
- Zone 3 (critical): 35% threshold with Email + SMS
- Zone 1 (stable): 60% threshold with Email only

## Important Notes

### Guest Mode Restrictions
- Guest users cannot create or manage custom threshold alerts
- You must be logged in to access this feature
- This ensures alerts are sent to verified email/phone contacts

### Alert Limits
- Currently, you can have one active alert per zone
- To change a threshold, delete the existing alert and create a new one
- Future updates may allow editing existing alerts

### Data Persistence
- Your threshold alerts are saved locally to your browser
- Alerts persist across sessions for the same user account
- Clearing browser data will remove saved alerts

### Relationship with Existing Alerts
This feature complements the existing alert systems:
- **General Hyacinth Alerts**: Automatic notifications for any significant increases (≥2%)
- **Critical Level Alerts**: Automatic warnings when any zone reaches 60%+
- **Status Change Alerts**: Notifications when buoy status changes (good/warning/critical)
- **Custom Threshold Alerts**: YOUR personalized thresholds for specific zones

## Best Practices

1. **Set Meaningful Thresholds**: 
   - Consider historical data for each zone
   - Don't set thresholds too low (may generate too many alerts)
   - Review the zone breakdown to understand typical levels

2. **Strategic Zone Selection**:
   - Monitor high-risk zones (Zone 3 - Central is often problematic)
   - Use "Overall Coverage" for general dam health
   - Create zone-specific alerts for targeted monitoring

3. **Choose Appropriate Notification Methods**:
   - Use SMS for critical zones requiring immediate action
   - Use Email for general monitoring and record-keeping
   - Enable both for maximum awareness of critical situations

4. **Regular Review**:
   - Check your alerts periodically
   - Adjust thresholds based on seasonal patterns
   - Deactivate alerts temporarily during maintenance periods

## Troubleshooting

### Alert Not Triggering
- Verify the alert is marked as "Active" (green badge)
- Check that current levels haven't already exceeded the threshold
- Ensure the 30-minute cooldown period has passed

### No Notifications Received
- Confirm your email/phone number in Profile Settings
- Check spam/junk folder for email notifications
- Verify notification methods are enabled (toggles are ON)

### Cannot Create Alert
- Ensure you're logged in (not in Guest Mode)
- Check if you already have an active alert for that zone
- Verify threshold is between 1-100%
- Confirm at least one notification method is selected

## Technical Details

### Alert Storage
- Alerts are stored in browser localStorage
- Key format: `hyacinth_thresholds_{userId}`
- Each alert includes: zone, threshold, notification preferences, active status

### Monitoring Frequency
- Real-time monitoring with each data update
- Typical update interval: 5-10 seconds
- Previous values cached for comparison
- Efficient processing to avoid performance impact

### Data Format
```json
{
  "id": "threshold-{timestamp}-{random}",
  "zone": "zone3",
  "threshold": 50,
  "notifyEmail": true,
  "notifyPhone": true,
  "active": true,
  "createdAt": "2025-10-14T10:30:00Z"
}
```

## Future Enhancements

Planned improvements include:
- **Edit Existing Alerts**: Modify thresholds without deleting
- **Multiple Thresholds per Zone**: Set warning and critical levels
- **Alert History**: View past triggered alerts
- **Scheduled Alerts**: Time-based alert activation
- **Alert Templates**: Quick setup for common scenarios
- **Email Digest**: Summary of all threshold breaches
- **Mobile App Integration**: Push notifications

## Support

For questions or issues with Custom Threshold Alerts:
1. Check this guide first
2. Review the in-app tooltips and descriptions
3. Contact system administrator
4. Report bugs through the feedback mechanism

---

**Last Updated**: October 14, 2025
**Feature Version**: 1.0
**Compatible with**: Hartbeespoort Dam Monitoring Dashboard v2.5+
