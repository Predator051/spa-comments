import CommentForm from '@/components/CommentsForm';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Comment } from '@/types';
import { ReactNode, useState } from 'react';

export default function (props: { comment?: Comment; trigger?: ReactNode }) {
    const [open, setOpen] = useState(false);

    if (props.comment == null) {
        props.comment = {
            children_count: null,
            created_at: '',
            file_path: '',
            file_url: '',
            id: -1,
            parent_id: null,
            text: '',
            user_email: '',
            user_home_page_url: '',
            username: '',
        };
    }

    if (!props.comment) {
        return;
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {props.trigger ?? (
                    <Button variant="outline" onClick={() => setOpen(true)}>
                        Reply
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    {props.comment.username && <DialogTitle>Reply to {props.comment.username}</DialogTitle> && <Separator></Separator>}
                    {props.comment.text && (
                        <DialogDescription>
                            <ScrollArea className="h-20 w-115 rounded-md border">{props.comment.text}</ScrollArea>
                        </DialogDescription>
                    )}
                    <Separator></Separator>
                </DialogHeader>
                <ScrollArea className="h-100 w-120">
                    <CommentForm parent_id={props.comment.id} onSubmit={() => setOpen(false)}></CommentForm>
                </ScrollArea>
                <DialogFooter className="sm:justify-end">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
