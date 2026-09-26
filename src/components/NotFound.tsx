import { Link } from 'react-router-dom';
import ArrowUpRight from './ArrowUpRight';

export default function NotFound() {
  return <section className="page-shell py-16">
    <p className="eyebrow">Nos salimos del camino</p>
    <h1 className="page-title">No encontramos esta página.</h1>
    <Link className="primary-link mt-6" to="/">Volver al viaje <ArrowUpRight /></Link>
  </section>;
}
