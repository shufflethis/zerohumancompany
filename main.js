// ============================================
// ZERO HUMAN COMPANY – Frontend JS
// ============================================

// --- Nav scroll effect ---
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
});

// --- Mobile nav toggle ---
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
});

// Close mobile nav on link click
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// --- Scroll reveal animations ---
const revealElements = document.querySelectorAll(
    '.glass-card, .section-title, .section-lead, .section-text, .section-highlight, ' +
    '.step, .comparison, .savings-box, .hero-stats, .intro-text, .subsection-title, ' +
    '.contrast-box, .urgency-card, .audience-grid, .timeline, .phases, .faq-list, ' +
    '.workday-card, .closing-card, .contact-form'
);

revealElements.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
});

revealElements.forEach(el => observer.observe(el));

// --- Contact form submission ---
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const btnText = submitBtn.querySelector('.btn-text');
const btnLoading = submitBtn.querySelector('.btn-loading');
const formSuccess = document.getElementById('formSuccess');
const formError = document.getElementById('formError');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Reset states
    formSuccess.style.display = 'none';
    formError.style.display = 'none';
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    submitBtn.disabled = true;

    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        anliegen: document.getElementById('anliegen').value.trim()
    };

    try {
        const res = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (res.ok) {
            formSuccess.style.display = 'block';
            contactForm.reset();
        } else {
            throw new Error('Server error');
        }
    } catch (err) {
        console.error('Form submit error:', err);
        formError.style.display = 'block';
    } finally {
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        submitBtn.disabled = false;
    }
});

// --- Smooth scroll for anchor links ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
