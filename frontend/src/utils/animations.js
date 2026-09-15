import { gsap } from 'gsap';

export function initGsapAnimations() {
  if (typeof window === 'undefined') return;

  // Staggered fade up on hero elements
  const heroElements = document.querySelectorAll('.hero-animate');
  if (heroElements.length > 0) {
    gsap.fromTo(
      heroElements,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
    );
  }

  // Floating ambient levitation for hero badges
  const floatingBadges = document.querySelectorAll('.float-badge');
  floatingBadges.forEach((badge, index) => {
    gsap.to(badge, {
      y: index % 2 === 0 ? -10 : 8,
      duration: 3 + index * 0.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  });

  // 3D Card Tilt Interaction
  const tiltCards = document.querySelectorAll('.tilt-3d');
  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const rotX = -(y / (rect.height / 2)) * 7;
      const rotY = (x / (rect.width / 2)) * 7;

      gsap.to(card, {
        rotationX: rotX,
        rotationY: rotY,
        transformPerspective: 1000,
        ease: 'power1.out',
        duration: 0.4
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotationX: 0,
        rotationY: 0,
        ease: 'power2.out',
        duration: 0.6
      });
    });
  });
}
