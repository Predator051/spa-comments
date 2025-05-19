<?php

declare(strict_types=1);

namespace App\Wrappers;

use App\Http\Resources\CommentResource;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class CommentLengthAwarePaginatorWrapper extends LengthAwarePaginator
{
    public static function fromBaseClass(LengthAwarePaginator $paginator): self
    {
        $me = new CommentLengthAwarePaginatorWrapper(
            $paginator->items,
            $paginator->total,
            $paginator->perPage,
            $paginator->currentPage,
            $paginator->options
        );

        $newItems = new Collection;
        foreach ($me->items as $item) {
            $newItems->push((new CommentResource($item)));
        }
        $me->items = $newItems;

        return $me;
    }
}
