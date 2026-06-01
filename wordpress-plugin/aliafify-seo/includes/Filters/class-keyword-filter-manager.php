<?php

namespace AliafifySEO\Filters;

class KeywordFilterManager
{
    /** @var KeywordFilterInterface[] */
    private array $filters = [];

    public function registerFilter(KeywordFilterInterface $filter): void
    {
        $this->filters[] = $filter;
    }

    public function returnAll(array $rows): array
    {
        return $rows;
    }

    public function apply(array $rows, array $criteria): array
    {
        foreach ($this->filters as $filter) {
            $rows = $filter->apply($rows, $criteria);
        }

        return $rows;
    }
}
