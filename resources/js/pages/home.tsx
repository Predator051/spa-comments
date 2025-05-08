// resources/js/Pages/Home.tsx
import CommentForm from '@/components/CommentsForm';
import { Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useState } from 'react';

interface Comment {
    id: number;
    text: string;
    user_email: string;
    username: string;
    user_home_page_url: string | null;
    parent_id: number | null;
}

interface Paginated<T> {
    data: T[];
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

interface PageProps {
    comments: Paginated<Comment>;

    [key: string]: unknown;
}

function CommentItem(comment: {id: number, text: string, username: string}) {
    const [children, setChildren] = useState<Record<number, Comment[]>>({});
    const [childPages, setChildPages] = useState<Record<number, number | null>>({});
    const [replyingTo, setReplyingTo] = useState<number | null>(null);

    const handleReply = (parentId: number) => {
        setReplyingTo((prev) => (prev === parentId ? null : parentId));
    };

    const loadChildren = async (parentId: number) => {
        const page = childPages[parentId] ?? 1;
        const response = await axios.get<Paginated<Comment>>(`/comments/${parentId}/children?page=${page}`);
        const data = response.data;

        setChildren((prev) => ({
            ...prev,
            [parentId]: [...(prev[parentId] ?? []), ...data.data],
        }));

        setChildPages((prev) => ({
            ...prev,
            [parentId]: data.links.some((link) => link.label === 'Next' && link.url) ? page + 1 : null,
        }));
    };


    return (
        <div key={comment.id} className="rounded-2xl border bg-white p-5 shadow-sm dark:border-[#2c2c2c] dark:bg-[#1c1c1c]">
            <div className="flex items-start justify-between">
                <div>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">@{comment.username}</span>
                    <p className="mt-1 whitespace-pre-line">{comment.text}</p>
                </div>
                <button className="ml-4 text-sm text-blue-600 hover:underline dark:text-blue-400" onClick={() => handleReply(comment.id)}>
                    {replyingTo !== comment.id ? 'Ответить' : 'Отмена'}
                </button>
            </div>

            {replyingTo === comment.id && <CommentForm parent_id={comment.id}></CommentForm>}

            <div className="mt-4 ml-5 space-y-3 border-l border-gray-300 pl-4 dark:border-gray-600">
                {(children[comment.id] ?? []).map((child) => (
                    <CommentItem {...child}></CommentItem>
                ))}

                {childPages[comment.id] !== null && (
                    <button className="text-sm text-blue-600 hover:underline dark:text-blue-400" onClick={() => loadChildren(comment.id)}>
                        Загрузить ещё ответы
                    </button>
                )}
            </div>
        </div>
    );
}

export default function Home() {
    const { props } = usePage<PageProps>();
    const { comments } = props;

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white p-6 text-gray-800 dark:from-[#0a0a0a] dark:to-[#111] dark:text-gray-100">
            <div className="mx-auto max-w-2xl space-y-6">
                <h1 className="text-center text-3xl font-bold">💬 Комментарии</h1>

                {comments.data.map((comment) => (
                    <CommentItem {...comment}/>
                ))}

                {/*<div className="flex justify-center gap-2 pt-6">*/}
                {/*    {comments.links.map((link, index) =>*/}
                {/*        link.url ? (*/}
                {/*            <Link*/}
                {/*                key={index}*/}
                {/*                href={link.url}*/}
                {/*                className={`rounded-full border px-4 py-2 transition dark:border-gray-600 ${*/}
                {/*                    link.active ? 'bg-indigo-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-[#222]'*/}
                {/*                }`}*/}
                {/*                dangerouslySetInnerHTML={{ __html: link.label }}*/}
                {/*            />*/}
                {/*        ) : (*/}
                {/*            <span key={index} className="px-4 py-2 text-gray-400" dangerouslySetInnerHTML={{ __html: link.label }} />*/}
                {/*        ),*/}
                {/*    )}*/}
                {/*</div>*/}
            </div>
        </div>
    );
}
