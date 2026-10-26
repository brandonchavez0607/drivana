import SoloRoles from '../../components/SoloRoles'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SoloRoles roles={['admin', 'superadmin']}>{children}</SoloRoles>
}
