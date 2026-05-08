import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEditorStore } from '../store/useEditorStore';
import { SECTION_TYPES } from '../lib/constants';
import type { Section } from '../types';

function SortableSectionItem({
  section,
  isSelected,
  onSelect,
  onRemove,
}: {
  section: Section;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const sectionInfo = SECTION_TYPES.find((s) => s.type === section.type);

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        padding: '10px 12px',
        margin: '4px 0',
        background: isSelected ? '#eff6ff' : '#f8fafc',
        borderRadius: '6px',
        border: isSelected ? '1px solid #3b82f6' : '1px solid #e2e8f0',
        cursor: 'grab',
        gap: '8px',
      }}
      {...attributes}
      {...listeners}
      onClick={onSelect}
    >
      <span style={{ fontSize: '16px', cursor: 'grab' }}>⋮⋮</span>
      <span style={{ flex: 1, fontSize: '13px', fontWeight: isSelected ? 600 : 400 }}>
        {sectionInfo?.icon} {sectionInfo?.label}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#94a3b8',
          fontSize: '14px',
          padding: '4px',
        }}
        title="Remove section"
      >
        🗑️
      </button>
    </div>
  );
}

export function SectionList() {
  const pageConfig = useEditorStore((s) => s.pageConfig);
  const selectedSectionId = useEditorStore((s) => s.selectedSectionId);
  const setSelectedSection = useEditorStore((s) => s.setSelectedSection);
  const removeSection = useEditorStore((s) => s.removeSection);
  const reorderSections = useEditorStore((s) => s.reorderSections);

  

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortedSections = [...pageConfig.sections].sort((a, b) => a.order - b.order);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = sortedSections.findIndex((s) => s.id === active.id);
    const newIndex = sortedSections.findIndex((s) => s.id === over.id);

    const newSections = arrayMove(sortedSections, oldIndex, newIndex);
    reorderSections(newSections);
  }

  if (sortedSections.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
        No sections yet. Add one above to get started.
      </div>
    );
  }

  return (
    <div style={{ padding: '8px' }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sortedSections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {sortedSections.map((section) => (
            <SortableSectionItem
              key={section.id}
              section={section}
              isSelected={selectedSectionId === section.id}
              onSelect={() => setSelectedSection(section.id)}
              onRemove={() => removeSection(section.id)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}