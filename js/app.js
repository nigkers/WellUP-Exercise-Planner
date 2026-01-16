/**
 * PolyPulse - Wellness Companion App
 * Lightweight workout tracking with n8n chatbot integration
 */

// Configuration
const CONFIG = {
    STORAGE_KEY: 'polypulse_workouts',
};

// ===================================
// Page Router
// ===================================

const PageRouter = {
    currentPage: 'dashboard',

    init() {
        console.log('PageRouter.init() called');
        const navBtns = document.querySelectorAll('.nav-btn');
        console.log('Found nav buttons:', navBtns.length);
        
        navBtns.forEach((btn, index) => {
            console.log(`Setting up button ${index}: ${btn.textContent}`);
            btn.addEventListener('click', (e) => {
                console.log('Button clicked:', e.target.dataset.page);
                this.navigateTo(btn.dataset.page);
            });
        });
    },

    navigateTo(page) {
        console.log('Navigating to page:', page);
        
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
        
        // Show selected page
        const selectedPage = document.getElementById(`page-${page}`);
        console.log('Selected page element:', selectedPage);
        
        if (selectedPage) {
            selectedPage.style.display = 'block';
        }

        // Update active nav button
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.page === page) {
                btn.classList.add('active');
            }
        });

        this.currentPage = page;

        // Trigger page-specific actions
        if (page === 'insights') {
            UIManager.renderInsights();
        }
    },
};

// ===================================
// Storage Manager
// ===================================

const StorageManager = {
    getWorkouts() {
        const data = localStorage.getItem(CONFIG.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    saveWorkouts(workouts) {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(workouts));
    },

    addWorkout(workout) {
        const workouts = this.getWorkouts();
        const newWorkout = {
            id: Date.now().toString(),
            ...workout,
            createdAt: new Date().toISOString(),
        };
        workouts.push(newWorkout);
        this.saveWorkouts(workouts);
        return newWorkout;
    },

    updateWorkout(id, updates) {
        const workouts = this.getWorkouts();
        const index = workouts.findIndex(w => w.id === id);
        if (index !== -1) {
            workouts[index] = { ...workouts[index], ...updates };
            this.saveWorkouts(workouts);
            return workouts[index];
        }
        return null;
    },

    deleteWorkout(id) {
        const workouts = this.getWorkouts();
        const filtered = workouts.filter(w => w.id !== id);
        this.saveWorkouts(filtered);
    },

    getThisWeekWorkouts() {
        const workouts = this.getWorkouts();
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        
        return workouts.filter(w => {
            const workoutDate = new Date(w.date);
            return workoutDate >= weekStart && workoutDate < new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
        });
    },

    calculateStats() {
        const weekWorkouts = this.getThisWeekWorkouts();
        const now = new Date();
        
        // Only count workouts that have already occurred (date and time have passed)
        const completedWorkouts = weekWorkouts.filter(w => {
            if (!w.date || !w.time) return false;
            
            // Create a date from the stored date and time
            const [year, month, day] = w.date.split('-');
            const [hours, minutes] = w.time.split(':');
            
            // Create date in local timezone
            const workoutDateTime = new Date(year, month - 1, day, hours, minutes, 0);
            
            // Workout is completed if its datetime is in the past
            return workoutDateTime < now;
        });
        
        return {
            count: completedWorkouts.length,
            totalMinutes: completedWorkouts.reduce((sum, w) => sum + parseInt(w.duration || 0), 0),
            totalCalories: completedWorkouts.reduce((sum, w) => sum + parseInt(w.calories || 0), 0),
        };
    },
};

// ===================================
// UI Manager
// ===================================

const UIManager = {
    updateStats() {
        const stats = StorageManager.calculateStats();
        const countEl = document.getElementById('workoutCount');
        const minutesEl = document.getElementById('totalMinutes');
        const caloriesEl = document.getElementById('caloriesBurned');
        
        if (countEl) countEl.textContent = stats.count;
        if (minutesEl) minutesEl.textContent = stats.totalMinutes;
        if (caloriesEl) caloriesEl.textContent = stats.totalCalories;
    },

    renderWorkouts() {
        const workouts = StorageManager.getThisWeekWorkouts();
        const list = document.getElementById('workoutsList');
        
        if (!list) return;  // Element doesn't exist on current page
        
        if (workouts.length === 0) {
            list.innerHTML = '<p style="color: #9CA3AF; text-align: center; padding: 2rem;">No workouts this week. Get started!</p>';
            return;
        }

        list.innerHTML = workouts.map(w => `
            <div class="workout-item">
                <div class="workout-name">${w.name}</div>
                <div class="workout-meta">
                    <span>📅 ${new Date(w.date).toLocaleDateString()}</span>
                    <span>⏱️ ${w.duration} min</span>
                    <span>🔥 ${w.calories} cal</span>
                    <span>${w.type}</span>
                </div>
                <div class="workout-actions">
                    <button onclick="window.editWorkout('${w.id}')">Edit</button>
                    <button onclick="window.deleteWorkout('${w.id}')" style="background: #FEE2E2;">Delete</button>
                </div>
            </div>
        `).join('');
    },

    renderWeekCalendar() {
        const calendar = document.getElementById('weekCalendar');
        if (!calendar) return;  // Element doesn't exist on current page
        
        const workouts = StorageManager.getThisWeekWorkouts();
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        let html = '';
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - date.getDay() + i);
            const dateStr = date.toISOString().split('T')[0];
            const dayWorkouts = workouts.filter(w => w.date === dateStr);
            
            html += `
                <div class="day-card">
                    <div class="day-name">${days[date.getDay()]}</div>
                    <div class="day-date">${date.getDate()}</div>
                    <div class="day-stats">${dayWorkouts.length} workout${dayWorkouts.length !== 1 ? 's' : ''}</div>
                </div>
            `;
        }
        calendar.innerHTML = html;
    },

    renderInsights() {
        const stats = StorageManager.calculateStats();
        const workouts = StorageManager.getThisWeekWorkouts();

        // Update summary stats
        document.getElementById('insightWorkoutCount').textContent = stats.count;
        document.getElementById('insightTotalMinutes').textContent = stats.totalMinutes;
        document.getElementById('insightCalories').textContent = stats.totalCalories;

        // Workout distribution by type
        const typeDistribution = {};
        workouts.forEach(w => {
            typeDistribution[w.type] = (typeDistribution[w.type] || 0) + 1;
        });

        let distributionHtml = '';
        if (Object.keys(typeDistribution).length === 0) {
            distributionHtml = '<p style="color: #9CA3AF;">No workout data this week.</p>';
        } else {
            distributionHtml = Object.entries(typeDistribution)
                .map(([type, count]) => `
                    <div class="distribution-item">
                        <span class="distribution-label">${type.charAt(0).toUpperCase() + type.slice(1)}</span>
                        <span class="distribution-value">${count} ${count === 1 ? 'workout' : 'workouts'}</span>
                    </div>
                `)
                .join('');
        }
        document.getElementById('insightDistribution').innerHTML = distributionHtml;

        // Weekly activity with bar chart
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const fullDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        // Calculate daily minutes
        const dailyMinutes = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - date.getDay() + i);
            const dateStr = date.toISOString().split('T')[0];
            const dayWorkouts = workouts.filter(w => w.date === dateStr);
            const dayMinutes = dayWorkouts.reduce((sum, w) => sum + parseInt(w.duration || 0), 0);
            dailyMinutes.push(dayMinutes);
        }
        
        // Find max value for scaling
        const maxMinutes = Math.max(...dailyMinutes, 1); // At least 1 to avoid division by zero
        
        // Create bar chart HTML
        let activityHtml = '<div class="weekly-chart-container">';
        activityHtml += '<div class="chart-header"><span>Weekly Workout Duration</span><span class="chart-unit">minutes</span></div>';
        activityHtml += '<div class="chart-bars">';
        
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - date.getDay() + i);
            const dayMinutes = dailyMinutes[i];
            const barHeight = (dayMinutes / maxMinutes) * 100;
            const barHeightPx = Math.max(barHeight * 1.2, 5); // Scale for visibility
            
            activityHtml += `
                <div class="activity-item">
                    <div class="activity-bar-container">
                        <div class="activity-bar" style="height: ${barHeightPx}px">
                            ${dayMinutes > 0 ? `<div class="activity-bar-value">${dayMinutes}m</div>` : ''}
                        </div>
                    </div>
                    <div class="activity-day">${days[date.getDay()]}</div>
                </div>
            `;
        }
        
        activityHtml += '</div></div>';
        document.getElementById('insightActivity').innerHTML = activityHtml;

        // Personal records
        if (workouts.length === 0) {
            document.getElementById('insightRecords').innerHTML = '<p style="color: #9CA3AF;">Start tracking to see your records!</p>';
        } else {
            const longestWorkout = Math.max(...workouts.map(w => parseInt(w.duration || 0)));
            const mostCalories = Math.max(...workouts.map(w => parseInt(w.calories || 0)));
            const favoriteType = Object.entries(typeDistribution).reduce((a, b) => a[1] > b[1] ? a : b)[0];

            document.getElementById('insightRecords').innerHTML = `
                <div class="record-item">
                    <span class="record-label">Longest Workout</span>
                    <span class="record-value">${longestWorkout} min</span>
                </div>
                <div class="record-item">
                    <span class="record-label">Most Calories</span>
                    <span class="record-value">${mostCalories} cal</span>
                </div>
                <div class="record-item">
                    <span class="record-label">Favorite Type</span>
                    <span class="record-value">${favoriteType.charAt(0).toUpperCase() + favoriteType.slice(1)}</span>
                </div>
            `;
        }
    }
};

// ===================================
// Event Handlers
// ===================================

window.addWorkout = (e) => {
    e.preventDefault();
    
    const workout = {
        name: document.getElementById('workoutName').value,
        date: document.getElementById('workoutDate').value,
        time: document.getElementById('workoutTime').value,
        duration: document.getElementById('workoutDuration').value,
        calories: document.getElementById('workoutCalories').value,
        type: document.getElementById('workoutType').value,
        notes: document.getElementById('workoutNotes').value,
    };

    StorageManager.addWorkout(workout);
    document.getElementById('workoutForm').reset();
    
    // Navigate back to dashboard
    PageRouter.navigateTo('dashboard');
    
    UIManager.renderWorkouts();
    UIManager.renderWeekCalendar();
    UIManager.updateStats();
    
    // Update bot metadata for next message
    const updatedStats = StorageManager.calculateStats();
    
    if (window.wellupChat) {
        window.wellupChat._metadata = {
            workoutCount: updatedStats.count,
            totalMinutes: updatedStats.totalMinutes,
            totalCalories: updatedStats.totalCalories
        };
    }
};

window.deleteWorkout = (id) => {
    if (confirm('Delete this workout?')) {
        StorageManager.deleteWorkout(id);
        UIManager.renderWorkouts();
        UIManager.renderWeekCalendar();
        UIManager.updateStats();
    }
};

window.editWorkout = (id) => {
    const workouts = StorageManager.getWorkouts();
    const workout = workouts.find(w => w.id === id);
    if (workout) {
        document.getElementById('workoutName').value = workout.name;
        document.getElementById('workoutDate').value = workout.date;
        document.getElementById('workoutTime').value = workout.time;
        document.getElementById('workoutDuration').value = workout.duration;
        document.getElementById('workoutCalories').value = workout.calories;
        document.getElementById('workoutType').value = workout.type;
        document.getElementById('workoutNotes').value = workout.notes || '';
        
        // Navigate to add-workout page
        PageRouter.navigateTo('add-workout');
        
        // Change submit button to update
        const submitBtn = document.querySelector('#workoutForm button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Update';
        submitBtn.onclick = (e) => {
            e.preventDefault();
            StorageManager.updateWorkout(id, {
                name: document.getElementById('workoutName').value,
                date: document.getElementById('workoutDate').value,
                time: document.getElementById('workoutTime').value,
                duration: document.getElementById('workoutDuration').value,
                calories: document.getElementById('workoutCalories').value,
                type: document.getElementById('workoutType').value,
                notes: document.getElementById('workoutNotes').value,
            });
            submitBtn.textContent = originalText;
            submitBtn.onclick = null;
            document.getElementById('workoutForm').reset();
            PageRouter.navigateTo('dashboard');
            UIManager.renderWorkouts();
            UIManager.renderWeekCalendar();
            UIManager.updateStats();
        };
    }
};

// ===================================
// Initialize App
// ===================================

// Expose current stats function globally for n8n workflow
window.getCurrentStats = () => StorageManager.calculateStats();

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');
    
    // Initialize page router
    PageRouter.init();

    // Form handling
    const workoutForm = document.getElementById('workoutForm');
    if (workoutForm) {
        workoutForm.addEventListener('submit', window.addWorkout);
    }

    // Set today's date as default
    const workoutDateInput = document.getElementById('workoutDate');
    if (workoutDateInput) {
        const today = new Date().toISOString().split('T')[0];
        workoutDateInput.valueAsDate = new Date();
    }

    // Initial render
    UIManager.updateStats();
    UIManager.renderWorkouts();
    UIManager.renderWeekCalendar();
    
    console.log('App initialization complete');
});
