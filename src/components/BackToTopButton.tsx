import { useEffect, useState } from 'react';

export default function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > 600);
    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });
    return () => window.removeEventListener('scroll', updateVisibility);
  }, []);

  if (!visible) return null;

  return <button type="button" className="back-to-top" onClick={() => window.scrollTo({ top: 0 })}>
    <span aria-hidden="true">↑</span> Arriba
  </button>;
}
