import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Below-the-fold films load lazily and only run while on screen.
const lazyVideos = document.querySelectorAll('.lazy-video')
if (!reducedMotion && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.play().catch(() => {})
      else e.target.pause()
    })
  }, { rootMargin: '25% 0px', threshold: 0.1 })
  lazyVideos.forEach((v) => io.observe(v))
}

if (reducedMotion) {
  // Freeze every film on its poster.
  document.querySelectorAll('video').forEach((v) => {
    v.removeAttribute('autoplay')
    v.pause()
  })
} else {
  const lenis = new Lenis({ lerp: 0.1 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)

  // Hero entrance — .cue deliberately excluded: the scrubbed timeline
  // owns its autoAlpha, and two owners corrupt the captured start value.
  gsap.from('.hero-copy > *, .hero-media', {
    y: 44,
    autoAlpha: 0,
    duration: 1.05,
    stagger: 0.12,
    ease: 'power3.out',
    delay: 0.15,
  })

  // The oval swallows the screen. Sized relative to the stage (100%)
  // rather than vw/vh so the collapsing mobile URL bar never opens a gap,
  // and start values are re-captured on refresh (resize, rotation).
  const heroTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      invalidateOnRefresh: true,
      onRefreshInit: () => gsap.set('.hero-media', {
        clearProps: 'width,height,borderRadius,marginBottom',
      }),
    },
  })
  heroTl.to('.hero-media', {
    width: '100%',
    height: '100%',
    marginBottom: 0,
    borderRadius: 0,
    ease: 'power1.inOut',
    duration: 0.7,
  }, 0)
  heroTl.to('.hero-copy', {
    yPercent: -36,
    autoAlpha: 0,
    ease: 'none',
    duration: 0.35,
  }, 0)
  heroTl.fromTo('.cue', { autoAlpha: 1 }, { autoAlpha: 0, ease: 'none', duration: 0.12 }, 0)
  // Dead-room so the full-bleed state is reached well before the pin releases.
  heroTl.to({}, { duration: 0.25 })

  // Word-by-word manifesto; the original sentence stays readable to
  // screen readers via aria-label while the visual copy is hidden.
  const mani = document.querySelector('.manifiesto-text')
  mani.setAttribute('aria-label', mani.textContent.replace(/\s+/g, ' ').trim())
  const visual = document.createElement('span')
  visual.setAttribute('aria-hidden', 'true')
  Array.from(mani.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      node.textContent.split(/\s+/).filter(Boolean).forEach((word) => {
        const s = document.createElement('span')
        s.className = 'w'
        s.textContent = word
        visual.appendChild(s)
        visual.appendChild(document.createTextNode(' '))
      })
    } else {
      node.classList.add('w')
      visual.appendChild(node)
      visual.appendChild(document.createTextNode(' '))
    }
  })
  mani.replaceChildren(visual)
  gsap.fromTo('.manifiesto-text .w',
    { opacity: 0.12, y: 8 },
    {
      opacity: 1, y: 0, ease: 'none', stagger: 0.35,
      scrollTrigger: { trigger: '.manifiesto', start: 'top 72%', end: 'center 45%', scrub: true },
    })

  // Parallax: anything with data-speed drifts at its own pace.
  gsap.utils.toArray('[data-speed]').forEach((el) => {
    const speed = parseFloat(el.dataset.speed)
    gsap.fromTo(el,
      { yPercent: (1 - speed) * 14 },
      {
        yPercent: (speed - 1) * 14,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      })
  })

  // Section reveals.
  gsap.utils.toArray('.carta-head, .plato, .mercado-head, .mercado-media, .paleta, .bar-media, .bar-info, .reservar-card').forEach((el) => {
    gsap.from(el, {
      y: 48,
      autoAlpha: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 86%', toggleActions: 'play none none reverse' },
    })
  })

  // Marquee.
  gsap.to('.marquee-track', { xPercent: -50, ease: 'none', duration: 22, repeat: -1 })

  // The brasa pill breathes slightly as it crosses the viewport.
  gsap.fromTo('.brasa-band', { scale: 0.94 }, {
    scale: 1,
    ease: 'none',
    scrollTrigger: { trigger: '.brasa', start: 'top 85%', end: 'center 45%', scrub: true },
  })

  // Magnetic reserve button — mouse-driven pointers only, quickTo setters
  // so pointermove never stacks tweens, single elastic release per exit.
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const btn = document.querySelector('.btn')
    const xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3.out' })
    const yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3.out' })
    let attracted = false
    window.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      if (Math.hypot(dx, dy) < 130) {
        attracted = true
        xTo(dx * 0.35)
        yTo(dy * 0.35)
      } else if (attracted) {
        attracted = false
        gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' })
      }
    })
  }
}
