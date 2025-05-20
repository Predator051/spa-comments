// useCommentStore.ts
import { create } from 'zustand';
import { CommentTreeController } from '@/lib/CommentTreeController';
import { Comment, SortTypes } from '@/types';

type CommentStore = {
    controller: CommentTreeController;
    trigger: number;
    forceUpdate: () => void;
    addComment: (comment: Comment) => void;
    sortKey: SortTypes;
    sortAsc: boolean;
    setSortKey: (newSortKey: SortTypes) => void;
    setSortAsc: (newSortAsc: boolean) => void;
};

export const useCommentStore = create<CommentStore>((set, get) => ({
    controller: new CommentTreeController(),
    trigger: 0,
    forceUpdate: () => set((s) => ({ trigger: s.trigger + 1 })),
    addComment: (comment: Comment) => {
        get().controller.addComment(comment);
        get().forceUpdate();
    },
    sortKey: 'created_at',
    sortAsc: false,
    setSortKey: (newSortKey: SortTypes) => {
        set(() => ({ sortKey: newSortKey }))
    },
    setSortAsc: (newSortAsc: boolean) => {
        set(() => ({ sortAsc: newSortAsc }));
    }
}));
