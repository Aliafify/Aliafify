<?php

namespace AliafifySEO\Filters;

abstract class AbstractKeywordFilter implements KeywordFilterInterface
{
    protected function isEmptyCriteria(array $criteria): bool
    {
        return count(array_filter($criteria, static fn($v) => $v !== null && $v !== '')) === 0;
    }
}
