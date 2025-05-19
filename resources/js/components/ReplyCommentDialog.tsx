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
import { useState } from 'react';

export default function (props: { comment: Comment }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" onClick={() => setOpen(true)}>
                    Reply
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reply to {props.comment.username}</DialogTitle>
                    <Separator></Separator>
                    <DialogDescription>
                        <ScrollArea className="h-20 w-115 rounded-md border">{props.comment.text}</ScrollArea>
                    </DialogDescription>
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
