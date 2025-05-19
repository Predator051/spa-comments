import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Comment } from '@/types';
import { ReactNode } from 'react';

export default function UserInfoHoverCard(props: { comment: Comment; triggerElement: ReactNode }) {
    return (
        <>
            <HoverCard>
                <HoverCardTrigger>{props.triggerElement}</HoverCardTrigger>
                <HoverCardContent>
                    <div className="flex items-center rounded-xl bg-gray-50 px-4 py-3 shadow-sm dark:bg-neutral-800">
                        <Avatar>
                            <AvatarImage alt={`@${props.comment.username}`} />
                            <AvatarFallback>{props.comment.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col text-sm text-neutral-700 dark:text-neutral-200">
                            <span className="font-medium text-indigo-600 dark:text-indigo-400">{props.comment.username}</span>
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">{props.comment.user_email}</span>
                            {props.comment.user_home_page_url && (
                                <a
                                    href={props.comment.user_home_page_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    {props.comment.user_home_page_url}
                                </a>
                            )}
                        </div>
                    </div>
                </HoverCardContent>
            </HoverCard>
        </>
    );
}
