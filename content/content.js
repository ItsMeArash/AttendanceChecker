console.log("content.js loaded SUCCESSFULLY");
console.log("extractAttendanceData invoked in content.js");

// const observer = new MutationObserver(() => {
    setTimeout(() => {
    let ulElement = document.querySelector("ul.zp-timelineTraffic");
    
    if(!ulElement.children.length) {
        console.log('WHU')
        let newLi = document.createElement("li");
        newLi.className = "zp-log-in d-flex align-items-center justify-content-between position-relative";
        newLi.style.color = "orange";
        newLi.style.fontWeight = "bold";
        newLi.innerText = `امروز اصلا انگشت نزدی`;

        // Insert at the beginning of the UL
        ulElement.prepend(newLi);
        return;
    };

    if (!ulElement) {
        console.error("404 UL element not found!");
        return;
    }

    let listItems = ulElement.querySelectorAll("li");
    if (listItems.length === 0) {
        console.error("No list items found in UL!");
        return;
    }

    console.log("Extracted listItems:", listItems);

    let workMinutes = 0;
    let workSessions = [];
    let lastEntryTime = null;
    let currentlyInside = false;

    // Iterate from the last item (earliest entry) backwards
    for (let i = listItems.length - 1; i >= 0; i -= 2) {
        let entryTime = extractTime(listItems[i].innerText);
        let exitTime = i - 1 >= 0 ? extractTime(listItems[i - 1].innerText) : null;

        if (!lastEntryTime) lastEntryTime = entryTime; // Store the first (earliest) entry time

        if (entryTime && exitTime) {
            let minutesWorked = exitTime - entryTime;
            workMinutes += minutesWorked;
            workSessions.push({ entryTime, exitTime, minutesWorked });
        }
    }

    // If the number of list items is odd, it means the employee is currently inside
    if (listItems.length % 2 !== 0) {
        currentlyInside = true;
        let lastEntry = extractTime(listItems[0].innerText);
        let now = new Date();
        let currentTimeMinutes = now.getHours() * 60 + now.getMinutes(); // Convert current time to minutes
        let additionalMinutes = currentTimeMinutes - lastEntry;

        workMinutes += additionalMinutes;
        workSessions.push({ entryTime: lastEntry, exitTime: currentTimeMinutes, minutesWorked: additionalMinutes });

        console.log("Employee is currently inside. Additional worked minutes added:", additionalMinutes);
    }

    console.log("Total Work Minutes:", workMinutes);
    console.log("Work Sessions:", workSessions);

    // Calculate when the employee can leave
    let allowedExitTime = calculateAllowedExitTime(workMinutes);

    // Insert a new <li> at the beginning of the UL
    addAllowedExitTimeToPage(allowedExitTime, ulElement);

    // Store data in Chrome storage for popup.js
    chrome.storage.local.set({
        totalWorkMinutes: workMinutes,
        allowedExitTime: allowedExitTime,
        workSessions: workSessions,
        currentlyInside: currentlyInside
    });

    console.log("Data stored in Chrome storage");

}, 5000);
// });
// observer.observe(document.body, { childList: true, subtree: true });

// Function to extract time (HH:MM) from string and convert to minutes
function extractTime(timeString) {
    let match = timeString.match(/(\d{2}):(\d{2})/); // Find time format HH:MM
    if (!match) return null;

    let [_, hours, minutes] = match.map(Number);
    return hours * 60 + minutes; // Convert to total minutes
}

// Function to calculate allowed exit time
function calculateAllowedExitTime(workMinutes) {
    let remainingMinutes = 530 - workMinutes; // Time left to reach 8 hours

    let now = new Date();
    let currentMinutes = now.getHours() * 60 + now.getMinutes(); // Current time in minutes
    let exitTimeMinutes = currentMinutes + remainingMinutes; // Calculate exit time

    let exitHour = Math.floor(exitTimeMinutes / 60);
    let exitMin = exitTimeMinutes % 60;

    return `${exitHour.toString().padStart(2, "0")}:${exitMin.toString().padStart(2, "0")}`;
}

// Function to add allowed exit time to the beginning of the UL
function addAllowedExitTimeToPage(allowedExitTime, ulElement) {
    let newLi = document.createElement("li");
    newLi.className = "zp-log-in d-flex align-items-center justify-content-between position-relative";
    newLi.style.color = "green"; // Highlight the message
    newLi.style.fontWeight = "bold";
    newLi.innerText = `تایم مجاز خروج: ${allowedExitTime}`;

    // Insert at the beginning of the UL
    ulElement.prepend(newLi);
    console.log("Allowed exit time added to the page.");
}
