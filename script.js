const menuToggle = document.querySelector("#menuToggle");
const navLinks = document.querySelector("#navLinks");
const filterButtons = document.querySelectorAll(".filter");
const projectCards = document.querySelectorAll(".project-card");
const emptyState = document.querySelector("#emptyState");
const contactForm = document.querySelector("#contactForm");
const formMessage = document.querySelector("#formMessage");

// Keep the copyright year current.
document.querySelector("#year").textContent = new Date().getFullYear();

// Mobile navigation toggle.
menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  menuToggle.textContent = isOpen ? "×" : "☰";
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    menuToggle.textContent = "☰";
  });
});

// Project category filtering.
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedFilter = button.dataset.filter;

    filterButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle("active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });

    let visibleCount = 0;
    projectCards.forEach((card) => {
      const shouldShow =
        selectedFilter === "all" || card.dataset.category === selectedFilter;
      card.hidden = !shouldShow;
      if (shouldShow) visibleCount += 1;
    });

    emptyState.hidden = visibleCount > 0;
  });
});

// Demo-only contact form validation; no data is sent to a server.
contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  formMessage.className = "form-message";

  const name = document.querySelector("#name").value.trim();
  const email = document.querySelector("#email").value.trim();
  const message = document.querySelector("#message").value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (name.length < 2) {
    showFormMessage("Please enter a name with at least 2 characters.", "error");
    document.querySelector("#name").focus();
    return;
  }

  if (!emailPattern.test(email)) {
    showFormMessage("Please enter a valid email address.", "error");
    document.querySelector("#email").focus();
    return;
  }

  if (message.length < 10) {
    showFormMessage("Please enter a message with at least 10 characters.", "error");
    document.querySelector("#message").focus();
    return;
  }

  showFormMessage("Validation successful! This demo does not send your message.", "success");
  contactForm.reset();
});

function showFormMessage(message, type) {
  formMessage.textContent = message;
  formMessage.classList.add(type);
}
