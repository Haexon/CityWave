document.addEventListener("DOMContentLoaded", () => {
  // Mobile nav toggle
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");

  if (toggle && links) {
    const setOpen = (open) => {
      links.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
    };

    toggle.addEventListener("click", () => setOpen(!links.classList.contains("open")));

    // Close after picking a link, on Escape, or on a tap outside the nav
    links.addEventListener("click", (e) => {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && links.classList.contains("open")) {
        setOpen(false);
        toggle.focus();
      }
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".site-nav")) setOpen(false);
    });
  }

  // Scroll reveal: fade section content up as it enters the viewport.
  // Skipped entirely for reduced-motion users, so nothing is ever hidden for them.
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("IntersectionObserver" in window && !reduceMotion) {
    const targets = document.querySelectorAll(
      "section .container > :not(.card-grid), .card-grid > *, .collab-strip .container"
    );

    const observer = new IntersectionObserver((entries) => {
      // Items that enter together (e.g. a row of cards) are staggered slightly
      entries
        .filter((entry) => entry.isIntersecting)
        .forEach((entry, i) => {
          entry.target.style.transitionDelay = `${Math.min(i, 5) * 90}ms`;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
    }, { rootMargin: "0px 0px -10% 0px" });

    targets.forEach((el) => {
      el.classList.add("reveal");
      observer.observe(el);
    });
  }

  // Stat count-up: numbers tick up from 0 the first time they scroll into view.
  // The HTML holds the final value, so without JS or with reduced motion the real number shows.
  const counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && !reduceMotion && counters.length) {
    const countUp = (el) => {
      const target = Number(el.dataset.count);
      const duration = 1400;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3))); // ease-out: fast start, gentle finish
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const counterObserver = new IntersectionObserver((entries) => {
      entries
        .filter((entry) => entry.isIntersecting)
        .forEach((entry) => {
          countUp(entry.target);
          counterObserver.unobserve(entry.target);
        });
    }, { threshold: 0.6 });

    counters.forEach((el) => {
      el.textContent = "0";
      counterObserver.observe(el);
    });
  }

  // Contact form: submits to Formspree in the background and shows the result inline.
  // Until the form's action has a real Formspree ID, it tells visitors to email instead.
  const form = document.querySelector(".contact-form");
  if (form) {
    const status = form.querySelector(".form-status");
    const button = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (form.action.includes("YOUR_FORM_ID")) {
        status.textContent = "This form isn't connected yet. Please email us directly.";
        return;
      }

      button.disabled = true;
      status.textContent = "Sending…";
      try {
        const res = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`Formspree responded ${res.status}`);
        form.reset();
        status.textContent = "Thanks! We'll be in touch soon.";
      } catch {
        status.textContent = "Something went wrong. Please email us directly.";
      } finally {
        button.disabled = false;
      }
    });
  }
});
