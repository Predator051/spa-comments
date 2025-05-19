import { useState } from 'react';
import axios from 'axios';
import { Comment } from '@/types';
import { useCommentStore } from '@/hooks/use-comment-store';
import ReplyCommentDialog from '@/components/ReplyCommentDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import * as React from 'react';
import UserInfoHoverCard from '@/components/UserInfoHoverCard';
import { motion } from 'framer-motion';

export interface Paginated<T> {
    data: T[];
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    per_page: number;
    next_page_url: string | null;
}

export default function CommentItem(comment: Comment) {
    const [loadedChildCount, setLoadedChildCount] = useState(0);
    const [loadMoreChildrenUrl, setLoadMoreChildrenUrl] = useState('');
    const { controller, addComment } = useCommentStore();
    const node = controller.findCommentById(comment.id);

    if (!node) return null;

    const loadChildren = async (parentId: number) => {
        const loadLink = loadMoreChildrenUrl.length == 0 ? `/comments/${parentId}/children?page=${0}` : loadMoreChildrenUrl;
        const response = await axios.get<Paginated<Comment>>(loadLink);
        const data = response.data;

        for (const comment of data.data) {
            addComment(comment);
        }

        console.log(data);
        setLoadMoreChildrenUrl(data.next_page_url ?? '');
        setLoadedChildCount(loadedChildCount + response.data.per_page);
    };

    const isImage = (file: string): boolean => /\.(jpg|jpeg|png|gif)$/i.test(file);
    const isText = (file: string): boolean => /\.(txt)$/i.test(file);

    const sanitizeHtml = (html: string): string => {
        const allowedTags = ['a', 'code', 'i', 'strong'];
        const parser = new DOMParser();
        const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');

        const cleanNode = (node: Node): Node => {
            if (node.nodeType === Node.TEXT_NODE) return node.cloneNode();

            if (node.nodeType === Node.ELEMENT_NODE && allowedTags.includes((node as Element).tagName.toLowerCase())) {
                const el = node.cloneNode(false) as HTMLElement;
                node.childNodes.forEach((child) => el.appendChild(cleanNode(child)));
                return el;
            }

            return document.createTextNode(node.textContent || '');
        };

        const sanitized = document.createElement('div');
        doc.body.firstChild?.childNodes.forEach((node) => sanitized.appendChild(cleanNode(node)));
        return sanitized.innerHTML;
    };

    return (
        <motion.div
            key={comment.id}
            initial={{ opacity: 0, x: comment.id % 2 === 0 ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="rounded-2xl border bg-white p-5 shadow-sm dark:border-[#2c2c2c] dark:bg-[#1c1c1c]"
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <Avatar>
                        <AvatarImage alt={`@${comment.username}`} />
                        <AvatarFallback>{comment.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <UserInfoHoverCard
                        comment={comment}
                        triggerElement={
                            <span className="cursor-pointer font-semibold text-indigo-600 underline-offset-4 transition hover:text-indigo-500 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300">
                                {comment.username}
                            </span>
                        }
                    />
                </div>
                <ReplyCommentDialog comment={comment}></ReplyCommentDialog>
            </div>

            <div
                className="mt-2 text-sm text-gray-900 dark:text-gray-200"
                style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(comment.text) }}
            ></div>

            {comment.file_url && (
                <div className="mt-3">
                    {isImage(comment.file_url) ? (
                        <img src={comment.file_url} alt="comment attachment" className="max-w-xs rounded-lg border dark:border-neutral-700" />
                    ) : isText(comment.file_url) ? (
                        <a
                            href={comment.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block rounded border border-dashed border-gray-400 bg-gray-100 px-3 py-2 text-sm text-gray-800 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                        >
                            📄 Открыть текстовый файл
                        </a>
                    ) : null}
                </div>
            )}

            <div className="mt-4 ml-5 space-y-3 border-l border-gray-300 pl-4 dark:border-gray-600">
                {node.children.map((c) => (
                    <CommentItem key={c.id} {...c}></CommentItem>
                ))}

                {comment.children_count !== null && comment.children_count > 0 && comment.children_count > loadedChildCount && (
                    <button className="text-sm text-blue-600 hover:underline dark:text-blue-400" onClick={() => loadChildren(comment.id)}>
                        Загрузить ещё ответы ({loadedChildCount} of {comment.children_count})
                    </button>
                )}
            </div>
        </motion.div>
    );
}
