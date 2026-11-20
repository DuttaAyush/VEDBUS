import CustomizePackageClient from './CustomizePackageClient';
import { allPackagesData } from '@/lib/data/packagesData';
import { PACKAGE_ALIAS_MAP } from '@/lib/packages';

export const dynamicParams = false;

export function generateStaticParams() {
  const ids = new Set([
    ...Object.keys(allPackagesData),
    ...Object.keys(PACKAGE_ALIAS_MAP),
    'default',
  ]);
  return Array.from(ids).map((id) => ({ id }));
}

export default async function Page({ params }) {
  const resolvedParams = await params;
  return <CustomizePackageClient params={resolvedParams} />;
}
