document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get(["totalWorkMinutes", "allowedExitTime", "workSessions", "currentlyInside"], (data) => {
        let totalWorkMinutes = data.totalWorkMinutes || 0;
        let allowedExitTime = data.allowedExitTime || "در دسترس نیست";
        let workSessions = data.workSessions || [];
        let currentlyInside = data.currentlyInside || false;

        // Update UI elements
        document.getElementById("total-time").textContent = `کل حضور: ${Math.floor(totalWorkMinutes / 60)}ساعت ${totalWorkMinutes % 60}دقیقه`;
        document.getElementById("allowed-exit").textContent = `پایان ساعت کاری: ${allowedExitTime}`;

        // Show "Currently Inside" message if employee is still in the office
        let statusMessage = document.getElementById("status-message");
        if (currentlyInside) {
            statusMessage.textContent = "حضورت خورده";
            statusMessage.style.color = "green";
        } else {
            statusMessage.textContent = "";
        }

        // Populate work session list
        let sessionList = document.getElementById("work-sessions");
        sessionList.innerHTML = "";

        workSessions.forEach(session => {
            let item = document.createElement("li");
            item.textContent = `ورود: ${formatTime(session.entryTime)} - خروج: ${formatTime(session.exitTime)} | ${session.minutesWorked} دقیقه`;
            sessionList.appendChild(item);
        });

        // Check work hours and send notification if needed
        checkWorkHours(totalWorkMinutes);
    });
});

// Request notification permissions
if (Notification.permission !== "granted") {
    Notification.requestPermission().then(permission => {
        if (permission !== "granted") {
            console.warn("Notification permissions denied.");
        }
    });
}

// Function to send a notification
function sendNotification(message) {
    if (Notification.permission === "granted") {
        new Notification("اعلان حضور چک", {
            body: message,
            // icon: "icon.png" // Replace with the path to your notification icon
        });
    }
}

// Function to check if 8-hour work period is complete
function checkWorkHours(totalMinutes) {
    const workHours = totalMinutes / 60;
    if (workHours >= 8) {
        sendNotification("ساعت کاری ۸ ساعته شما به پایان رسیده است.");
    }
}

// Function to convert minutes to HH:MM format
function formatTime(minutes) {
    let hours = Math.floor(minutes / 60);
    let mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}
