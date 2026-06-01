<?php

namespace AliafifySEO\Filters;

interface KeywordFilterInterface
{
    public function apply(array $rows, array $criteria): array;
}
