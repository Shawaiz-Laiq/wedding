// ===============================
// CURTAIN OPENING
// ===============================

const curtainStage = document.getElementById("curtainStage");
const openButton = document.getElementById("openButton");
const invitation = document.getElementById("invitation");

const duaText = document.getElementById("duaText");

const dua = "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا";


openButton.addEventListener("click", function () {

    // Prevent clicking multiple times
    openButton.disabled = true;

    // Open curtains
    curtainStage.classList.add("opened");

    // Allow page scrolling
    document.body.classList.add("invitation-open");

    // Remove curtain after animation
    setTimeout(function () {
        curtainStage.style.display = "none";
    }, 1300);

    // Start typing dua
    setTimeout(function () {
        typeDua();
    }, 900);

});


// ===============================
// DUA LETTER-BY-LETTER EFFECT
// ===============================

function typeDua() {

    let index = 0;

    duaText.textContent = "";

    const typing = setInterval(function () {

        duaText.textContent += dua.charAt(index);

        index++;

        if (index >= dua.length) {
            clearInterval(typing);
        }

    }, 100);

}


// ===============================
// SCROLL CONTROLLED GOLDEN LIGHT
// ===============================

const scrollLight = document.getElementById("scrollLight");

let lightY = 0;
let lastScrollY = window.scrollY;

function moveScrollLight() {

    const currentScrollY = window.scrollY;
    const scrollDifference = currentScrollY - lastScrollY;

    // Move light only when the page is scrolled
    if (scrollDifference !== 0) {

        const screenHeight = window.innerHeight;

        // Positive movement down, negative movement up
        lightY += scrollDifference * 0.75;

        // Keep light moving within a repeating vertical path
        const trackHeight = screenHeight + 100;

        lightY = ((lightY % trackHeight) + trackHeight) % trackHeight;

        // Gentle side-to-side drift as it travels vertically
        const progress = lightY / trackHeight;

        const horizontalPosition = 18 + (progress * 64);

        scrollLight.style.left = horizontalPosition + "%";

        // Move the light vertically
        scrollLight.style.transform =
            `translate3d(0, ${lightY - 2}px, 0)`;

        // Reverse the light trail when scrolling upward
        if (scrollDifference < 0) {
            scrollLight.classList.add("moving-up");
        } else {
            scrollLight.classList.remove("moving-up");
        }

    }

    lastScrollY = currentScrollY;
}


// Start light movement after opening invitation
window.addEventListener("scroll", function () {

    if (document.body.classList.contains("invitation-open")) {
        moveScrollLight();
    }

}, { passive: true });



 // ===============================
 // RSVP MODAL + BACKEND
 // ===============================

const rsvpOpen = document.getElementById("rsvpOpen");
const rsvpOverlay = document.getElementById("rsvpOverlay");
const closeRsvp = document.getElementById("closeRsvp");

const rsvpForm = document.getElementById("rsvpForm");
const rsvpMessage = document.getElementById("rsvpMessage");

const attendanceInput = document.getElementById("attendance");
const guestCountGroup = document.getElementById("guestCountGroup");
const guestCountInput = document.getElementById("guestCount");

const whatsappLink = document.getElementById("whatsappLink");

const API = "https://ahmedwedding-two.vercel.app/api/rsvp";

// Open modal
rsvpOpen.addEventListener("click", function () {
    rsvpOverlay.classList.add("active");
});

// Close modal
closeRsvp.addEventListener("click", function () {
    rsvpOverlay.classList.remove("active");
});

// Close by clicking outside
rsvpOverlay.addEventListener("click", function (event) {
    if (event.target === rsvpOverlay) {
        rsvpOverlay.classList.remove("active");
    }
});

// Show guest count only if attending
attendanceInput.addEventListener("change", function () {

    if (attendanceInput.value === "No") {
        guestCountGroup.style.display = "none";
        guestCountInput.required = false;
        guestCountInput.value = "1";
    } else {
        guestCountGroup.style.display = "flex";
        guestCountInput.required = true;
    }

});

// Submit RSVP to backend
rsvpForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const name = document.getElementById("guestName").value.trim();
    const phone = document.getElementById("guestPhone").value.trim();
    const attendance = attendanceInput.value;

    const guestCount =
        attendance === "Yes" ? Number(guestCountInput.value) : 1;

    if (!name || !phone || !attendance) {
        rsvpMessage.textContent = "Please complete all fields.";
        return;
    }

    if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 20) {
        rsvpMessage.textContent = "Guest count must be between 1 and 20.";
        return;
    }

    const submitButton = rsvpForm.querySelector('button[type="submit"]');

    submitButton.disabled = true;
    submitButton.textContent = "SUBMITTING...";
    rsvpMessage.textContent = "Please wait...";
    whatsappLink.style.display = "none";

    try {

        const response = await fetch(API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                phone,
                attendance,
                guestCount
            })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "RSVP submission failed.");
        }

        rsvpMessage.textContent =
            `Thank you, ${name}! Your response has been saved successfully.`;

        if (result.whatsappLink) {
            whatsappLink.href = result.whatsappLink;
            whatsappLink.style.display = "inline-block";
        }

        rsvpForm.reset();
        guestCountGroup.style.display = "flex";

    } catch (error) {

        console.error("RSVP Error:", error);

        rsvpMessage.textContent =
            error.message || "Something went wrong. Please try again.";

    } finally {

        submitButton.disabled = false;
        submitButton.textContent = "SUBMIT RESPONSE";

    }

});



// ===============================
// REVEAL SECTIONS ON SCROLL
// ===============================

const revealSections = document.querySelectorAll(".reveal-section");

const revealObserver = new IntersectionObserver(function (entries) {

    entries.forEach(function (entry) {

        if (entry.isIntersecting) {

            entry.target.classList.add("visible");

        }

    });

}, {
    threshold: 0.12
});

revealSections.forEach(function (section) {

    revealObserver.observe(section);

});


// ===============================
// LIVE WALIMA COUNTDOWN
// ===============================

// 1 January 2027, 8:00 PM Pakistan Time
const walimaDate = new Date("2027-01-01T20:00:00+05:00").getTime();

const daysElement = document.getElementById("days");
const hoursElement = document.getElementById("hours");
const minutesElement = document.getElementById("minutes");
const secondsElement = document.getElementById("seconds");
const countdownNote = document.getElementById("countdownNote");


function updateCountdown() {

    const currentTime = new Date().getTime();

    const difference = walimaDate - currentTime;

    if (difference <= 0) {

        daysElement.textContent = "000";
        hoursElement.textContent = "00";
        minutesElement.textContent = "00";
        secondsElement.textContent = "00";

        countdownNote.textContent =
            "The celebration has begun! Welcome!";

        clearInterval(countdownInterval);

        return;
    }

    const days = Math.floor(
        difference / (1000 * 60 * 60 * 24)
    );

    const hours = Math.floor(
        (difference / (1000 * 60 * 60)) % 24
    );

    const minutes = Math.floor(
        (difference / (1000 * 60)) % 60
    );

    const seconds = Math.floor(
        (difference / 1000) % 60
    );

    daysElement.textContent = String(days).padStart(3, "0");
    hoursElement.textContent = String(hours).padStart(2, "0");
    minutesElement.textContent = String(minutes).padStart(2, "0");
    secondsElement.textContent = String(seconds).padStart(2, "0");

}


// Update immediately and then every second
updateCountdown();

const countdownInterval = setInterval(updateCountdown, 1000);