export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface Comment {
    id: number;
    text: string;
    user_email: string;
    username: string;
    user_home_page_url: string | null;
    parent_id: number | null;
    file_path: string | null;
    file_url: string | null;
    children_count: number | null;
    created_at: string;
}

export type SortTypes = 'username' | 'user_email' | 'created_at'
