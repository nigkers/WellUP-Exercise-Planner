
# WellUP Exercise Planner

WellUP is a simple, mobile-friendly website for planning and tracking your workouts. You can add workouts, view your weekly stats, and see your progress in a clear calendar view.

## How to Use

1. **Open the Website**
   - Open the `index.html` file in your web browser (Chrome, Safari, Edge, etc.).

2. **Add a Workout**
   - Tap the "Add Workout" button.
   - Fill in the workout name, date, time, duration, calories, type, and any notes.
   - Press "Save Workout" to add it to your plan.

3. **View Your Stats**
   - The dashboard shows your total workouts, minutes, and calories for the week.
   - Scroll down to see your upcoming workouts and a weekly calendar.

4. **Track Your Progress**
   - Check your workouts and stats each week.
   - Use the calendar to see which days you have workouts planned.

5. **Mobile Friendly**
   - The site is designed to work well on phones and tablets. All main features are easy to use on mobile.

## What the Website Is About

WellUP helps you organize your exercise routine, track your progress, and stay motivated. It’s a simple tool for anyone who wants to keep their fitness on track, whether you’re a beginner or experienced athlete.
3. **Return Response** → Sends back the AI response

Sample Webhook Response Format:
```json
{
  "reply": "Great! You've had 3 workouts this week with a total of 240 minutes. Keep up the excellent work! Consider adding a flexibility session to balance out your routine.",
  "message": "Great! You've had 3 workouts this week with a total of 240 minutes. Keep up the excellent work! Consider adding a flexibility session to balance out your routine."
}
```

## Data Storage

All your workouts are automatically saved to your browser's **LocalStorage**. This means:
- ✅ Your data persists between sessions
- ✅ No server needed - everything stays on your device
- ⚠️ Data is local to your browser (not synced across devices)
- 💡 Clear browser data will remove your workouts

## Tips for Best Results

1. **Be Consistent**: Log your workouts regularly for better tracking
2. **Set Realistic Goals**: Start with manageable workout schedules
3. **Use Notes**: Add details about how you felt or modifications you made
4. **Review Weekly**: Check your calendar to spot patterns and plan better
5. **Chat with AI**: Ask the assistant for personalized advice based on your routine

## Troubleshooting

### Chat not responding?
- Check that your n8n webhook URL is correct in `js/app.js`
- Verify your n8n workflow is active and running
- Check browser console (F12 → Console tab) for error messages

### Workouts not saving?
- Make sure LocalStorage is enabled in your browser
- Check that you're not in private/incognito mode
- Try clearing cache and reloading

### UI looks strange?
- Make sure all files are in the correct folder structure:
  ```
  PolyPulse/
  ├── index.html
  ├── css/
  │   └── styles.css
  ├── js/
  │   └── app.js
  └── assets/ (if needed)
  ```

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Files Overview

- **index.html**: Main app structure and UI
- **css/styles.css**: All styling with responsive design
- **js/app.js**: App logic, storage management, and n8n integration

## Privacy & Security

- All workout data is stored locally on your device
- No data is sent to any server unless you enable the chat feature
- Chat messages are sent to your n8n instance (ensure you trust it)
- For production use, add authentication to your n8n webhook

## Future Enhancements

Planned features:
- Export workouts to PDF/CSV
- Social sharing of achievements
- Advanced analytics and insights
- Custom workout templates
- Integration with fitness trackers
- Mobile app version

## Support & Feedback

Have questions or suggestions? Feel free to modify and extend the app!

---

**Stay active, stay healthy! 💪**
