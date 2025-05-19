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
    const { controller, addComment, sortKey, setSortKey, sortAsc, setSortAsc } = useCommentStore();

    useEffect(() => {
        const channel = window.Echo.channel('create_comment').listen('.comment.created', (e: { comment: Comment }) => {
            console.log(e.comment);
            addComment(e.comment);
        });

        for (const comment of comments.data) {
            addComment(comment);
        }

        return () => {
            channel.stopListening('comment.created');
        };
    }, []);

    const sortedTree = controller.getSortedTree(sortKey, sortAsc);

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white p-6 text-gray-800 dark:from-[#0a0a0a] dark:to-[#111] dark:text-gray-100">
            <div className="mx-auto max-w-2xl space-y-6">
                <h1 className="text-center text-3xl font-bold">💬 Комментарии</h1>
                <div className="mb-4 flex flex-wrap items-center justify-center gap-3 text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Сортировка:</span>
                    <button
                        onClick={() => {
                            setSortKey('username');
                            setSortAsc(sortKey !== 'username' ? true : !sortAsc);
                        }}
                        className={`rounded px-3 py-1 font-medium transition ${
                            sortKey === 'username' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-white'
                        }`}
                    >
                        Имя {sortKey === 'username' && (sortAsc ? '↑' : '↓')}
                    </button>
                    <button
                        onClick={() => {
                            setSortKey('user_email');
                            setSortAsc(sortKey !== 'user_email' ? true : !sortAsc);
                        }}
                        className={`rounded px-3 py-1 font-medium transition ${
                            sortKey === 'user_email' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-white'
                        }`}
                    >
                        E-mail {sortKey === 'user_email' && (sortAsc ? '↑' : '↓')}
                    </button>
                    <button
                        onClick={() => {
                            // useCommentStore.setState(s => ({sortKey: 'created_at'}));
                            setSortKey('created_at');
                            setSortAsc(sortKey !== 'created_at' ? true : !sortAsc);
                        }}
                        className={`rounded px-3 py-1 font-medium transition ${
                            sortKey === 'created_at' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-white'
                        }`}
                    >
                        Дата {sortKey === 'created_at' && (sortAsc ? '↑' : '↓')}
                    </button>
                </div>

                {sortedTree.map((c) => (
                    <CommentItem key={c.id} {...c} />
                ))}
            </div>
        </div>
    );
}
