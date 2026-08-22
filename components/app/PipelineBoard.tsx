"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { moveDeal, markDealLost } from "@/lib/actions/crm";
import clsx from "clsx";

type Deal = {
  id: string;
  title: string;
  value: number;
  status: "OPEN" | "WON" | "LOST";
  stageId: string;
  contact: { name: string } | null;
};

type Stage = { id: string; name: string; color: string; order: number };

export function PipelineBoard({
  tenantSlug,
  stages,
  initialDeals,
  canEdit,
}: {
  tenantSlug: string;
  stages: Stage[];
  initialDeals: Deal[];
  canEdit: boolean;
}) {
  const [deals, setDeals] = useState(initialDeals);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function handleDragStart(e: DragStartEvent) {
    setActiveId(e.active.id as string);
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const dealId = e.active.id as string;
    const stageId = e.over?.id as string | undefined;
    if (!stageId || !canEdit) return;

    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.stageId === stageId) return;

    setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, stageId } : d)));
    startTransition(() => {
      moveDeal(tenantSlug, dealId, stageId);
    });
  }

  const activeDeal = deals.find((d) => d.id === activeId);

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="kanban-scroll flex gap-4 overflow-x-auto px-8 pb-8">
        {stages
          .sort((a, b) => a.order - b.order)
          .map((stage) => (
            <StageColumn
              key={stage.id}
              stage={stage}
              deals={deals.filter((d) => d.stageId === stage.id && d.status !== "LOST")}
              canEdit={canEdit}
              tenantSlug={tenantSlug}
              onLost={(id) =>
                setDeals((prev) => prev.map((d) => (d.id === id ? { ...d, status: "LOST" } : d)))
              }
            />
          ))}
      </div>
      <DragOverlay>{activeDeal && <DealCard deal={activeDeal} canEdit={false} />}</DragOverlay>
    </DndContext>
  );
}

function StageColumn({
  stage,
  deals,
  canEdit,
  tenantSlug,
  onLost,
}: {
  stage: Stage;
  deals: Deal[];
  canEdit: boolean;
  tenantSlug: string;
  onLost: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  const total = deals.reduce((sum, d) => sum + d.value, 0);

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        "flex w-72 shrink-0 flex-col rounded-lg border bg-white",
        isOver ? "border-ink" : "border-hairline"
      )}
    >
      <div className="border-b border-hairline px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: stage.color }} />
          <h3 className="font-display text-sm font-bold text-ink">{stage.name}</h3>
          <span className="ml-auto font-mono text-xs text-ink-soft">{deals.length}</span>
        </div>
        <div className="mt-1 font-mono text-xs text-ink-soft">${total.toLocaleString()}</div>
      </div>
      <div className="flex-1 space-y-2 p-3">
        {deals.map((deal) => (
          <DealCard
            key={deal.id}
            deal={deal}
            canEdit={canEdit}
            onLost={() => {
              onLost(deal.id);
              markDealLost(tenantSlug, deal.id);
            }}
          />
        ))}
        {deals.length === 0 && (
          <div className="rounded border border-dashed border-hairline p-4 text-center text-xs text-ink-soft">
            Drop a deal here
          </div>
        )}
      </div>
    </div>
  );
}

function DealCard({
  deal,
  canEdit,
  onLost,
}: {
  deal: Deal;
  canEdit: boolean;
  onLost?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: deal.id,
    disabled: !canEdit,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(canEdit ? listeners : {})}
      className={clsx(
        "group rounded border border-hairline bg-paper p-3 text-sm",
        canEdit && "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-40"
      )}
    >
      <div className="font-medium text-ink">{deal.title}</div>
      <div className="mt-1 font-mono text-xs text-pine">${deal.value.toLocaleString()}</div>
      {deal.contact && <div className="mt-1 text-xs text-ink-soft">{deal.contact.name}</div>}
      {canEdit && onLost && (
        <button
          onClick={onLost}
          className="mt-2 hidden text-xs text-ink-soft hover:text-red-600 group-hover:block"
        >
          Mark lost
        </button>
      )}
    </div>
  );
}
