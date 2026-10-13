import type { Route } from '../../types/route'
import DriveHome from '../Drive/DriveHome'

export type HomePageProps = { onNavigate: (route: Route) => void; onOpenAuth: () => void }
export default function HomePage({ onNavigate }: HomePageProps) {
  return <DriveHome onNavigate={onNavigate} />
}
