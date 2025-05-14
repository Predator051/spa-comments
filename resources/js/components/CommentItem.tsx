import { useState } from 'react';
import axios from 'axios';
import { Comment } from '@/types';
import { useCommentStore } from '@/hooks/use-comment-store';
import ReplyCommentDialog from '@/components/ReplyCommentDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import * as React from 'react';

export interface Paginated<T> {
    data: T[];
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

export default function CommentItem(comment: Comment) {
    const [childPages, setChildPages] = useState<Record<number, number | null>>({});
    const { controller, addComment } = useCommentStore();
    const node = controller.findCommentById(comment.id);

    if (!node) return null;

    console.log(comment.file_url);

    const loadChildren = async (parentId: number) => {
        const page = childPages[parentId] ?? 1;
        const response = await axios.get<Paginated<Comment>>(`/comments/${parentId}/children?page=${page}`);
        const data = response.data;

        for (const comment of data.data) {
            addComment(comment);
        }

        setChildPages((prev) => ({
            ...prev,
            [parentId]: data.links.some((link) => link.label === 'Next' && link.url) ? page + 1 : null,
        }));
    };

    const isImage = (file: string): boolean => {
        return /\.(jpg|jpeg|png|gif)$/i.test(file);
    };

    return (
        <div key={comment.id}
             className="rounded-2xl border bg-white p-5 shadow-sm dark:border-[#2c2c2c] dark:bg-[#1c1c1c]">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <Avatar>
                        <AvatarImage alt={`@${comment.username}`} />
                        <AvatarFallback>{comment.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">{comment.username}</span>
                </div>
                <ReplyCommentDialog comment={comment}></ReplyCommentDialog>
            </div>

            <p className="mt-2 whitespace-pre-line text-sm text-gray-900 dark:text-gray-200"
               style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                {comment.text}
            </p>

            {comment.file_url && isImage(comment.file_url) && (
                <div className="mt-3">
                    <img
                        src={comment.file_url}
                        alt="comment attachment"
                        className="max-w-xs rounded-lg border dark:border-neutral-700"
                    />
                </div>
            )}

            <div className="mt-4 ml-5 space-y-3 border-l border-gray-300 pl-4 dark:border-gray-600">
                {node.children.map((c) => (
                    <CommentItem key={c.id} {...c}></CommentItem>
                ))}

                {childPages[comment.id] !== null && (
                    <button className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                            onClick={() => loadChildren(comment.id)}>
                        Загрузить ещё ответы
                    </button>
                )}
            </div>
        </div>
    );
}
