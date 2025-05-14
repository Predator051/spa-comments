// useCommentStore.ts
import { create } from 'zustand';
import { CommentTreeController } from '@/lib/CommentTreeController';
import { Comment } from '@/types';

type CommentStore = {
    controller: CommentTreeController;
    trigger: number;
    forceUpdate: () => void;
    addComment: (comment: Comment) => void;
};

export const useCommentStore = create<CommentStore>((set, get) => ({
    controller: new CommentTreeController(),
    trigger: 0,
    forceUpdate: () => set((s) => ({ trigger: s.trigger + 1 })),
    addComment: (comment: Comment) => {
        get().controller.addComment(comment);
        get().forceUpdate();
    }
}));
