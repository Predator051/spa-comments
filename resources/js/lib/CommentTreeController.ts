
import { Comment } from '@/types';

export interface CommentNode extends Comment {
    children: CommentNode[];
}

export class CommentTreeController {
    private rootComments: CommentNode[] = [];

    constructor(initial: Comment[] = []) {
        this.rootComments = this.buildTree(initial);
    }

    private buildTree(comments: Comment[]): CommentNode[] {
        const map = new Map<number, CommentNode>();
        const roots: CommentNode[] = [];

        comments.forEach(c => map.set(c.id, { ...c, children: [] }));

        map.forEach(node => {
            if (node.parent_id && map.has(node.parent_id)) {
                map.get(node.parent_id)!.children.push(node);
            } else {
                roots.push(node);
            }
        });

        return roots;
    }

    private findNode(id: number, nodes: CommentNode[] = this.rootComments): CommentNode | null {
        for (const node of nodes) {
            if (node.id === id) return node;
            const found = this.findNode(id, node.children);
            if (found) return found;
        }
        return null;
    }

    addComment(comment: Comment): void {
        const newNode: CommentNode = { ...comment, children: [] };
        if (!comment.parent_id) {
            this.rootComments.push(newNode);
        } else {
            const parent = this.findNode(comment.parent_id);
            if (parent) parent.children.push(newNode);
        }
    }

    getTree(): CommentNode[] {
        return this.rootComments;
    }

    findCommentById(id: number): CommentNode | null {
        return this.findNode(id);
    }
}
