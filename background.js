chrome.runtime.onInstalled.addListener(() => {
    console.log("Attendance Tracker installed");
    chrome.alarms.create("checkWorkHours", { periodInMinutes: 1 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "checkWorkHours") {
        chrome.storage.local.get(["totalWorkMinutes"], (data) => {
            let totalWorkMinutes = data.totalWorkMinutes || 0;
            const workHours = totalWorkMinutes / 60;

            if (workHours >= 8) {
                chrome.notifications.create({
                    type: "basic",
                    // iconUrl: "icons/favicon-32x32.png", // Replace with your icon path
                    title: "اعلان حضور چک",
                    message: "ساعت کاری ۸ ساعته شما به پایان رسیده است."
                });
            }
        });
    }
});
