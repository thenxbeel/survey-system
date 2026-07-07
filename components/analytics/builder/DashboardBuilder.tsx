'use client'

import { Pencil, Check, Plus } from 'lucide-react'
import { DashboardWidget } from './DashboardWidget'
import { useAnalytics } from '../state/useAnalytics'

function colSpanClass(w: number) {
  return {
    1: 'lg:col-span-1',
    2: 'lg:col-span-2',
    3: 'lg:col-span-3',
    4: 'lg:col-span-4',
  }[w] ?? 'lg:col-span-1'
}

export function DashboardBuilder() {
  const { state, dispatch } = useAnalytics()

  function handleAddWidget() {
    dispatch({ type: 'OPEN_MODAL', modal: 'addWidget' })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-semibold tracking-[-0.2px] text-[#333333]">
            {state.savedDashboards.find(d => d.id === state.activeDashboardId)?.name ?? 'My Custom Dashboard'}
          </h2>
          <p className="text-[11px] text-[#8A94A6]">
            {state.isEditMode
              ? 'Edit mode active — adjust widgets, then save the layout.'
              : `${state.widgets.length} widgets · last modified ${
                  state.savedDashboards.find(d => d.id === state.activeDashboardId)?.lastModified ?? '—'
                }`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {state.isEditMode && (
            <button
              onClick={handleAddWidget}
              className="inline-flex h-8 items-center gap-2.5 rounded-[7px] border border-[#E6EDF3] bg-[#FFFFFF] px-3 text-[12px] font-medium text-[#8A94A6] transition-all hover:border-[#B0B8C4] hover:text-[#333333] items-center justify-center text-center"
            >
              <Plus size={12} />
              Add Widget
            </button>
          )}
          <button
            onClick={() => dispatch({ type: 'TOGGLE_EDIT_MODE' })}
            className={`inline-flex h-8 items-center gap-2.5 rounded-[7px] px-3 text-[12px] font-medium transition-all
              ${state.isEditMode
                ? 'bg-[#0B4A8B] text-white hover:opacity-90'
                : 'border border-[#E6EDF3] bg-[#FFFFFF] text-[#8A94A6] hover:border-[#B0B8C4] hover:text-[#333333]'
              }`}
          >
            {state.isEditMode
              ? <><Check size={12} /> Save Layout</>
              : <><Pencil size={12} /> Edit Layout</>}
          </button>
        </div>
      </div>

      <div
        className={`grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4
          ${state.isEditMode ? 'rounded-[10px] border border-dashed border-[rgba(11, 74, 139,0.25)] p-3' : ''}`}
      >
        {state.widgets.map(widget => (
          <div
            key={widget.id}
            className={`${colSpanClass(widget.w)} ${widget.h === 2 ? 'row-span-2' : ''}`}
          >
            <DashboardWidget
              widget={widget}
              isEditMode={state.isEditMode}
              onMove={(id, dir) => dispatch({ type: 'MOVE_WIDGET', id, dir })}
              onResize={(id, axis, delta) => dispatch({ type: 'RESIZE_WIDGET', id, axis, delta })}
              onDuplicate={id => dispatch({ type: 'DUPLICATE_WIDGET', id })}
              onDelete={id => dispatch({ type: 'DELETE_WIDGET', id })}
            />
          </div>
        ))}

        {state.widgets.length === 0 && (
          <div className="col-span-full flex min-h-[320px] items-center justify-center rounded-[10px] border border-dashed border-[#E6EDF3]">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-[8px] border border-[#E6EDF3] bg-[#F5F7FA]">
                <Plus size={16} className="text-[#B0B8C4]" />
              </div>
              <p className="text-[12px] text-[#8A94A6]">This dashboard is empty</p>
              <p className="mt-0.5 text-[11px] text-[#B0B8C4]">Add widgets to get started</p>
              <button
                onClick={handleAddWidget}
                className="mt-3 inline-flex h-8 items-center gap-2.5 rounded-[7px] border border-[#E6EDF3] bg-[#FFFFFF] px-3 text-[12px] font-medium text-[#8A94A6] transition-all hover:border-[#B0B8C4] hover:text-[#333333] items-center justify-center text-center"
              >
                <Plus size={12} />
                Add Your First Widget
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
