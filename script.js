const eventDate = new Date("2026-07-18T11:00:00+02:00");
const invitationTitle = "دعوة مناقشة مشروع التخرج - محمد ميلود بوقمرة";
const invitationText = "دعوة لحضور مناقشة مشروع التخرج من برنامج هندسة البرمجيات بالجامعة الليبية الدولية.";

const countdownValues = {
  days: document.querySelector('[data-unit="days"]'),
  hours: document.querySelector('[data-unit="hours"]'),
  minutes: document.querySelector('[data-unit="minutes"]'),
  seconds: document.querySelector('[data-unit="seconds"]')
};

const modalCountdownValues = {
  days: document.querySelector('[data-modal-unit="days"]'),
  hours: document.querySelector('[data-modal-unit="hours"]'),
  minutes: document.querySelector('[data-modal-unit="minutes"]'),
  seconds: document.querySelector('[data-modal-unit="seconds"]')
};

const previousValues = {};
const previousModalValues = {};
const toast = document.getElementById("toast");
const timerModal = document.getElementById("timerModal");
const timerOpenButton = document.getElementById("timerOpenButton");
const timerCloseButton = document.getElementById("timerCloseButton");
const modalDetailsLink = document.getElementById("modalDetailsLink");
let timerAutoCloseId;
let timerCloseAnimationId;

// Background particles are generated with lightweight DOM nodes to keep the site static and dependency-free.
function createParticles() {
  const container = document.getElementById("particles");
  const count = window.matchMedia("(max-width: 600px)").matches ? 22 : 38;

  for (let index = 0; index < count; index += 1) {
    const particle = document.createElement("span");
    const size = Math.random() * 4 + 2;
    particle.className = "particle";
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.setProperty("--size", `${size}px`);
    particle.style.setProperty("--duration", `${Math.random() * 7 + 6}s`);
    particle.style.setProperty("--delay", `${Math.random() * -8}s`);
    container.appendChild(particle);
  }
}

function formatNumber(value) {
  return String(value).padStart(2, "0");
}

function animateNumber(element, nextValue) {
  if (!element || element.textContent === nextValue) return;
  element.textContent = nextValue;
  element.classList.remove("bump");
  void element.offsetWidth;
  element.classList.add("bump");
}

// Countdown updates every second and gracefully switches to a final message after the event starts.
function updateCountdown() {
  const now = new Date();
  const distance = eventDate.getTime() - now.getTime();

  if (distance <= 0) {
    Object.entries(countdownValues).forEach(([unit, element]) => {
      previousValues[unit] = "00";
      animateNumber(element, "00");
    });
    Object.entries(modalCountdownValues).forEach(([unit, element]) => {
      previousModalValues[unit] = "00";
      animateNumber(element, "00");
    });
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  const seconds = Math.floor((distance / 1000) % 60);

  const nextValues = {
    days: formatNumber(days),
    hours: formatNumber(hours),
    minutes: formatNumber(minutes),
    seconds: formatNumber(seconds)
  };

  Object.entries(nextValues).forEach(([unit, value]) => {
    if (previousValues[unit] !== value) {
      animateNumber(countdownValues[unit], value);
      previousValues[unit] = value;
    }
    if (previousModalValues[unit] !== value) {
      animateNumber(modalCountdownValues[unit], value);
      previousModalValues[unit] = value;
    }
  });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

async function shareInvitation() {
  const shareData = {
    title: invitationTitle,
    text: invitationText,
    url: window.location.href
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
    }
  }

  try {
    await navigator.clipboard.writeText(window.location.href);
    showToast("تم نسخ رابط الدعوة");
  } catch {
    showToast("تعذر النسخ، يمكنكم نسخ الرابط من شريط المتصفح");
  }
}

function escapeIcsText(value) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;")
    .replaceAll("\n", "\\n");
}

// Creates a standards-friendly ICS file in UTC for reliable import into phone calendars.
function downloadCalendarFile() {
  const title = "مناقشة مشروع التخرج - محمد ميلود بوقمرة";
  const location = "قاعة ليبيا الواعدة - الجامعة الليبية الدولية";
  const description = "دعوة لحضور مناقشة مشروع التخرج من برنامج هندسة البرمجيات.";
  const startUtc = "20260718T090000Z";
  const endUtc = "20260718T100000Z";
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Mohamed Graduation Invitation//AR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@mohamed-graduation-invitation`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `LOCATION:${escapeIcsText(location)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "graduation-discussion-invitation.ics";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("تم تنزيل ملف التقويم");
}

function setupRevealAnimations() {
  const revealItems = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach(item => observer.observe(item));
}

// A restrained parallax tilt gives the invitation card depth on desktop without disturbing mobile reading.
function setupCardParallax() {
  const card = document.getElementById("invitationCard");
  if (!card || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  card.addEventListener("mousemove", event => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(1200px) rotateX(${y * -3}deg) rotateY(${x * 4}deg) translateY(-2px)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
}

function playInvitationCardMotion() {
  const invitationSection = document.getElementById("invitation");
  const invitationCard = document.getElementById("invitationCard");
  if (!invitationSection || !invitationCard) return;

  invitationSection.scrollIntoView({ behavior: "smooth", block: "start" });
  invitationCard.classList.remove("card-spotlight");
  void invitationCard.offsetWidth;
  invitationCard.classList.add("card-spotlight");

  window.setTimeout(() => {
    invitationCard.classList.remove("card-spotlight");
  }, 2600);
}

function openTimerModal(autoCloseMs = 0) {
  window.clearTimeout(timerAutoCloseId);
  window.clearTimeout(timerCloseAnimationId);
  timerModal.classList.remove("closing");
  timerModal.hidden = false;
  timerOpenButton.setAttribute("aria-expanded", "true");
  updateCountdown();
  timerCloseButton.focus();

  if (autoCloseMs > 0) {
    timerAutoCloseId = window.setTimeout(() => {
      closeTimerModal(false);
    }, autoCloseMs);
  }
}

function closeTimerModal(restoreFocus = true) {
  window.clearTimeout(timerAutoCloseId);
  window.clearTimeout(timerCloseAnimationId);

  if (timerModal.hidden || timerModal.classList.contains("closing")) return;

  timerModal.classList.add("closing");
  timerOpenButton.setAttribute("aria-expanded", "false");

  timerCloseAnimationId = window.setTimeout(() => {
    timerModal.hidden = true;
    timerModal.classList.remove("closing");
    playInvitationCardMotion();
    if (restoreFocus) {
      timerOpenButton.focus();
    }
  }, 300);
}

document.getElementById("shareButton").addEventListener("click", shareInvitation);
document.getElementById("calendarButton").addEventListener("click", downloadCalendarFile);
timerOpenButton.addEventListener("click", openTimerModal);
timerCloseButton.addEventListener("click", closeTimerModal);
modalDetailsLink.addEventListener("click", () => {
  closeTimerModal(false);
});
timerModal.addEventListener("click", event => {
  if (event.target.matches("[data-close-timer]")) {
    closeTimerModal();
  }
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !timerModal.hidden) {
    closeTimerModal();
  }
});

createParticles();
setupRevealAnimations();
setupCardParallax();
updateCountdown();
window.addEventListener("load", () => {
  openTimerModal(5000);
});
window.setInterval(updateCountdown, 1000);
