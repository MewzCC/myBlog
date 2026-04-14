import gsap from 'gsap'

export const fadeIn = (element: string | Element, delay = 0) => {
  gsap.fromTo(
    element,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.6, delay, ease: 'power2.out' }
  )
}

export const staggerFadeIn = (elements: string | Element[] | NodeListOf<Element>, delay = 0) => {
  gsap.fromTo(
    elements,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.6, delay, stagger: 0.1, ease: 'power2.out' }
  )
}
