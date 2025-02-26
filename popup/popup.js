document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get(["totalWorkMinutes", "allowedExitTime", "workSessions", "currentlyInside"], (data) => {
        let totalWorkMinutes = data.totalWorkMinutes || 0;
        let allowedExitTime = data.allowedExitTime || "Not available";
        let workSessions = data.workSessions || [];
        let currentlyInside = data.currentlyInside || false;

        // Update UI elements
        document.getElementById("total-time").textContent = `Total Worked: ${Math.floor(totalWorkMinutes / 60)}h ${totalWorkMinutes % 60}m`;
        document.getElementById("allowed-exit").textContent = `Allowed Exit Time: ${allowedExitTime}`;

        // Show "Currently Inside" message if employee is still in the office
        let statusMessage = document.getElementById("status-message");
        if (currentlyInside) {
            statusMessage.textContent = "You are currently inside the company.";
            statusMessage.style.color = "red";
        } else {
            statusMessage.textContent = "";
        }

        // Populate work session list
        let sessionList = document.getElementById("work-sessions");
        sessionList.innerHTML = "";

        workSessions.forEach(session => {
            let item = document.createElement("li");
            item.textContent = `Entry: ${formatTime(session.entryTime)} - Exit: ${formatTime(session.exitTime)} | ${session.minutesWorked} min`;
            sessionList.appendChild(item);
        });
    });
});

// Function to convert minutes to HH:MM format
function formatTime(minutes) {
    let hours = Math.floor(minutes / 60);
    let mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}
