<?php

namespace AliafifySEO\Services;

if (!defined('ABSPATH')) {
    exit;
}

class HierarchyValidatorService
{
    public function validateParentAssignment(int $entityId, ?int $parentId, callable $descendantsResolver): bool
    {
        if ($parentId === null) {
            return true;
        }

        if ($entityId === $parentId) {
            return false;
        }

        return !$this->isCircularRelation($entityId, $parentId, $descendantsResolver);
    }

    public function isCircularRelation(int $entityId, int $candidateParentId, callable $descendantsResolver): bool
    {
        $descendants = $this->getAllDescendants($entityId, $descendantsResolver);
        return in_array($candidateParentId, $descendants, true);
    }

    public function getAllDescendants(int $entityId, callable $descendantsResolver): array
    {
        $seen = [];
        $queue = [$entityId];

        while ($queue) {
            $current = array_shift($queue);
            $children = $descendantsResolver($current);
            foreach ($children as $childId) {
                if (!isset($seen[$childId])) {
                    $seen[$childId] = true;
                    $queue[] = (int) $childId;
                }
            }
        }

        return array_map('intval', array_keys($seen));
    }

    public function hasRecursiveLoop(int $entityId, callable $parentResolver): bool
    {
        $seen = [];
        $current = $entityId;

        while ($current !== 0) {
            if (isset($seen[$current])) {
                return true;
            }
            $seen[$current] = true;
            $parentId = (int) $parentResolver($current);
            if ($parentId === 0) {
                break;
            }
            $current = $parentId;
        }

        return false;
    }
}
