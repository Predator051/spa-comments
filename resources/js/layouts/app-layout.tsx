import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
}

export default ({ children }: AppLayoutProps) => (
    <div>
        {children}
    </div>
);
