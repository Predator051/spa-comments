// resources/js/Pages/Home.tsx
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import CommentItem, { Paginated } from '@/components/CommentItem';
import { useCommentStore } from '@/hooks/use-comment-store';
import { Comment } from '@/types';

interface PageProps {
    comments: Paginated<Comment>;

    [key: string]: unknown;
}

export default function Home() {
    const { props } = usePage<PageProps>();
    const { comments } = props;
    const { controller, addComment } = useCommentStore();

    useEffect(() => {
        const channel = window.Echo.channel('create_comment').listen('.comment.created', (e: {comment: Comment}) => {
            console.log(e.comment);
            addComment(e.comment);
        });

        for (const comment of comments.data) {
            addComment(comment);
        }

        return () => {
            channel.stopListening('comment.created')
        }
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white p-6 text-gray-800 dark:from-[#0a0a0a] dark:to-[#111] dark:text-gray-100">
            <div className="mx-auto max-w-2xl space-y-6">
                <h1 className="text-center text-3xl font-bold">💬 Комментарии</h1>
                {controller.getTree().map(c => (
                    <CommentItem {...c} />
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
