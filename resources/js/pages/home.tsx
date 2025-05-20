import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import CommentItem, { Paginated } from '@/components/CommentItem';
import { useCommentStore } from '@/hooks/use-comment-store';
import { Comment } from '@/types';
import ReplyCommentDialog from '@/components/ReplyCommentDialog';
import * as React from 'react';
import axios from 'axios';

interface PageProps {
    comments: Paginated<Comment>;
    [key: string]: unknown;
}

export default function Home() {
    const { props } = usePage<PageProps>();
    const { comments } = props;
    const { controller, addComment, sortKey, setSortKey, sortAsc, setSortAsc } = useCommentStore();
    const [loadedChildCount, setLoadedChildCount] = useState(0);
    const [loadMoreChildrenUrl, setLoadMoreChildrenUrl] = useState('');

    useEffect(() => {
        const channel = window.Echo.channel('create_comment').listen('.comment.created', (e: { comment: Comment }) => {
            addComment(e.comment);
        });

        for (const comment of comments.data) {
            addComment(comment);
        }

        setLoadMoreChildrenUrl(comments.next_page_url ?? '');
        setLoadedChildCount(comments.per_page);

        return () => {
            channel.stopListening('comment.created');
        };
    }, []);

    const loadMore = async () => {
        const response = await axios.get<Paginated<Comment>>(loadMoreChildrenUrl);
        const data = response.data;

        for (const comment of data.data) {
            addComment(comment);
        }

        setLoadMoreChildrenUrl(data.next_page_url ?? '');
        setLoadedChildCount(loadedChildCount + response.data.per_page);
    };

    const sortedTree = controller.getSortedTree(sortKey, sortAsc);

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white p-6 text-gray-800 dark:from-[#0a0a0a] dark:to-[#111] dark:text-gray-100">
            <div className="mx-auto max-w-2xl space-y-6">
                <h1 className="text-center text-3xl font-bold">💬 Comments</h1>

                <div className="flex justify-center">
                    <ReplyCommentDialog
                        trigger={
                            <button className="rounded-xl bg-blue-600 px-4 py-2 text-white shadow-md transition hover:bg-blue-700">
                                ➕ Add Comment
                            </button>
                        }
                    ></ReplyCommentDialog>
                </div>

                <div className="mb-4 flex flex-wrap items-center justify-center gap-3 text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Sort by:</span>
                    <button
                        onClick={() => {
                            setSortKey('username');
                            setSortAsc(sortKey !== 'username' ? true : !sortAsc);
                        }}
                        className={`rounded px-3 py-1 font-medium transition ${
                            sortKey === 'username'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 hover:bg-gray-300 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700'
                        }`}
                    >
                        Name {sortKey === 'username' && (sortAsc ? '↑' : '↓')}
                    </button>
                    <button
                        onClick={() => {
                            setSortKey('user_email');
                            setSortAsc(sortKey !== 'user_email' ? true : !sortAsc);
                        }}
                        className={`rounded px-3 py-1 font-medium transition ${
                            sortKey === 'user_email'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 hover:bg-gray-300 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700'
                        }`}
                    >
                        E-mail {sortKey === 'user_email' && (sortAsc ? '↑' : '↓')}
                    </button>
                    <button
                        onClick={() => {
                            setSortKey('created_at');
                            setSortAsc(sortKey !== 'created_at' ? true : !sortAsc);
                        }}
                        className={`rounded px-3 py-1 font-medium transition ${
                            sortKey === 'created_at'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 hover:bg-gray-300 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700'
                        }`}
                    >
                        Date {sortKey === 'created_at' && (sortAsc ? '↑' : '↓')}
                    </button>
                </div>

                {sortedTree.map((c) => (
                    <CommentItem key={c.id} {...c} />
                ))}

                {loadMoreChildrenUrl && (
                    <button className="text-sm text-blue-600 hover:underline dark:text-blue-400" onClick={() => loadMore()}>
                        Load more replies ({loadedChildCount} of {comments.total})
                    </button>
                )}
            </div>
        </div>
    );
}
