document.addEventListener('DOMContentLoaded', () => {
    const timeDisplay = document.getElementById('current-time');
    const dateDisplay = document.getElementById('current-date');
    const tipDisplay = document.getElementById('hydration-tip');
    const waterLevel = document.getElementById('water-level');
    const currentIntakeDisplay = document.getElementById('current-intake');
    const progressPercentDisplay = document.getElementById('progress-percent');

    const tips = [
        "Drinking water helps maintain the balance of body fluids.",
        "Water can help control calories by replacing sugary drinks.",
        "Water helps energize muscles by maintaining electrolyte balance.",
        "Drinking water helps keep skin looking healthy and hydrated.",
        "Water helps your kidneys flush out waste products.",
        "Staying hydrated helps maintain normal bowel function.",
        "A well-hydrated brain is more focused and productive.",
        "Even mild dehydration can drain your energy and make you tired.",
        "Drink a glass of water first thing in the morning to kickstart your day.",
        "Keep a reusable water bottle with you at all times."
    ];

    let currentTipIndex = 0;
    let intake = 1.8;
    const goal = 2.5;

    function updateTime() {
        const now = new Date();
        timeDisplay.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

        const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
        dateDisplay.textContent = now.toLocaleDateString('en-US', options);
    }

    function rotateTips() {
        currentTipIndex = (currentTipIndex + 1) % tips.length;
        tipDisplay.style.opacity = 0;

        setTimeout(() => {
            tipDisplay.textContent = tips[currentTipIndex];
            tipDisplay.style.opacity = 1;
        }, 500);
    }

    function simulateProgress() {
        // Slowly increase intake over time to simulate a day's progress
        // Resets when goal is reached for continuous signage loop
        intake += 0.01;
        if (intake > goal) {
            intake = 0.5; // Reset to 0.5L
        }

        const percent = Math.round((intake / goal) * 100);

        currentIntakeDisplay.textContent = `${intake.toFixed(1)}L`;
        progressPercentDisplay.textContent = `${percent}%`;
        waterLevel.style.height = `${percent}%`;
    }

    // Initial setup
    updateTime();
    setInterval(updateTime, 1000);
    setInterval(rotateTips, 10000); // New tip every 10 seconds
    setInterval(simulateProgress, 5000); // Progress update every 5 seconds

    // Initial animation delay
    tipDisplay.style.transition = 'opacity 0.5s ease-in-out';
});
