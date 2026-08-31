/* ═══════════════════════════════════════════════════════════
   OG DERMA — PACKAGING CONCEPT SURVEY
   Interactive Showcase & Form Logic
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────
     CONFIG — Update this URL after deploying Google Apps Script
     ───────────────────────────────────────────────────────── */
  const GOOGLE_SCRIPT_URL = '';  // ← Paste your Apps Script Web App URL here


  /* ─── DOM REFS ────────────────────────────────────────── */
  const form         = document.getElementById('survey-form');
  const submitBtn    = document.getElementById('submit-btn');
  const successState = document.getElementById('success-state');

  const fields = {
    name:   document.getElementById('name'),
    age:    document.getElementById('age'),
    reason: document.getElementById('reason'),
  };

  const choiceInputs = form ? form.querySelectorAll('input[name="choice"]') : [];
  const choiceGrid   = form ? form.querySelector('.choice-grid') : null;


  /* ═══════════════════════════════════════════════════════
     SMOOTH SCROLL FOR ANCHOR CTAs
     ═══════════════════════════════════════════════════════ */
  document.querySelectorAll('.page__scroll-cta').forEach((cta) => {
    cta.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(cta.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });


  /* ═══════════════════════════════════════════════════════
     HORIZONTAL PACKAGING SHOWCASE & CAROUSEL
     ═══════════════════════════════════════════════════════ */
  document.querySelectorAll('.concept-showcase').forEach((showcase) => {
    const track    = showcase.querySelector('.concept-carousel__track');
    const dots     = showcase.querySelectorAll('.concept-carousel__dot');
    const slides   = showcase.querySelectorAll('.concept-carousel__slide');
    const prevBtn  = showcase.querySelector('.showcase-nav--prev');
    const nextBtn  = showcase.querySelector('.showcase-nav--next');
    const hints    = showcase.querySelectorAll('.swipe-hint');

    if (!track || slides.length === 0) return;

    function goToSlide(index) {
      if (index >= 0 && index < slides.length) {
        slides[index].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start',
        });
      }
    }

    // Dot navigation
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => goToSlide(index));
    });

    // Side chevron buttons
    if (prevBtn) {
      prevBtn.addEventListener('click', () => goToSlide(0));
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => goToSlide(1));
    }

    // Swipe hint buttons
    hints.forEach((hint) => {
      hint.addEventListener('click', () => {
        const action = hint.getAttribute('data-action');
        if (action === 'next') goToSlide(1);
        if (action === 'prev') goToSlide(0);
      });
    });

    // Scroll listener for dot sync
    let scrollTimeout;
    track.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollLeft = track.scrollLeft;
        const slideWidth = track.offsetWidth;
        const activeIndex = Math.round(scrollLeft / slideWidth);

        dots.forEach((dot, i) => {
          dot.classList.toggle('is-active', i === activeIndex);
        });
      }, 50);
    });
  });


  /* ═══════════════════════════════════════════════════════
     SCROLL-TRIGGERED FADE-IN (IntersectionObserver)
     ═══════════════════════════════════════════════════════ */
  const animateOnScroll = () => {
    const targets = document.querySelectorAll('.form-group, .form-actions');

    if (!('IntersectionObserver' in window)) {
      targets.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -30px 0px' }
    );

    targets.forEach((el) => observer.observe(el));
  };

  animateOnScroll();


  /* ═══════════════════════════════════════════════════════
     CHOICE RADIO INTERACTION
     ═══════════════════════════════════════════════════════ */
  choiceInputs.forEach((input) => {
    input.addEventListener('change', () => {
      if (choiceGrid) choiceGrid.classList.remove('has-error');
    });
  });


  /* ═══════════════════════════════════════════════════════
     VALIDATION
     ═══════════════════════════════════════════════════════ */
  function clearErrors() {
    if (!form) return;
    form.querySelectorAll('.form-field.has-error').forEach((f) => {
      f.classList.remove('has-error');
    });
    if (choiceGrid) choiceGrid.classList.remove('has-error');
  }

  function setError(field, message) {
    const wrapper = field ? field.closest('.form-field') : null;
    if (!wrapper) return;

    wrapper.classList.add('has-error');

    let msgEl = wrapper.querySelector('.error-msg');
    if (!msgEl) {
      msgEl = document.createElement('span');
      msgEl.className = 'error-msg';
      wrapper.appendChild(msgEl);
    }
    msgEl.textContent = message;
  }

  function validate() {
    if (!form) return false;
    clearErrors();
    let valid = true;

    // Name
    if (!fields.name.value.trim()) {
      setError(fields.name, 'Please enter your name.');
      valid = false;
    }

    // Choice
    const choiceSelected = form.querySelector('input[name="choice"]:checked');
    if (!choiceSelected) {
      if (choiceGrid) choiceGrid.classList.add('has-error');
      valid = false;
    }

    // Reason
    if (!fields.reason.value.trim()) {
      setError(fields.reason, 'Please tell us why you made this choice.');
      valid = false;
    }

    return valid;
  }


  /* ═══════════════════════════════════════════════════════
     FORM SUBMISSION
     ═══════════════════════════════════════════════════════ */
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!validate()) {
        const firstError = form.querySelector('.has-error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      const choiceSelected = form.querySelector('input[name="choice"]:checked');

      const data = {
        name:      fields.name.value.trim(),
        age:       fields.age.value || 'Not specified',
        choice:    choiceSelected.value,
        reason:    fields.reason.value.trim(),
        timestamp: new Date().toISOString(),
      };

      submitBtn.classList.add('is-loading');

      try {
        if (!GOOGLE_SCRIPT_URL) {
          console.warn(
            'GOOGLE_SCRIPT_URL is not set. Logging data to console instead:',
            data
          );
          await new Promise((r) => setTimeout(r, 1000));
        } else {
          await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
        }

        form.hidden = true;
        if (successState) {
          successState.hidden = false;
          successState.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

      } catch (err) {
        console.error('Submission failed:', err);
        alert('Something went wrong. Please try again.');
      } finally {
        submitBtn.classList.remove('is-loading');
      }
    });
  }


  /* ═══════════════════════════════════════════════════════
     CLEAR FIELD ERROR ON INPUT
     ═══════════════════════════════════════════════════════ */
  Object.values(fields).forEach((field) => {
    if (!field) return;
    const events = field.tagName === 'SELECT' ? ['change'] : ['input'];
    events.forEach((evt) => {
      field.addEventListener(evt, () => {
        const wrapper = field.closest('.form-field');
        if (wrapper) wrapper.classList.remove('has-error');
      });
    });
  });

})();
