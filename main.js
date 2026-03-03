const menuButton = document.getElementById("menuButton");
const drawer = document.getElementById("drawer");
const topbar = document.getElementById("topbar");

menuButton?.addEventListener("click", () => {
  const isOpen = drawer.classList.toggle("open");
  drawer.setAttribute("aria-hidden", String(!isOpen));
});

window.addEventListener("scroll", () => {
  topbar?.classList.toggle("scrolled", window.scrollY > 8);
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".reveal").forEach((item) => {
  observer.observe(item);
});
