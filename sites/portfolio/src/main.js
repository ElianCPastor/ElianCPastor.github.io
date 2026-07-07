import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

if (!reducedMotion) {
  const lenis = new Lenis({ lerp: 0.1 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)

  // Hero entrance.
  gsap.from('.eyebrow, .hero h1, .sub, .hint', {
    y: 34,
    autoAlpha: 0,
    duration: 1,
    stagger: 0.12,
    ease: 'power3.out',
    delay: 0.15,
  })

  // Slow parallax on the studio backdrop.
  gsap.to('.hero-bg', {
    yPercent: -10,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  })

  // Index cards and about line rise in as they arrive.
  gsap.utils.toArray('.works-head, .site-card, .about-line, .contact').forEach((el) => {
    gsap.from(el, {
      y: 44,
      autoAlpha: 0,
      duration: 0.85,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
    })
  })
}
