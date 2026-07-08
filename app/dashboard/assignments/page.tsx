'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  CheckCircle, Clock, AlertCircle, Search, UserPlus, Filter, X, Eye
} from 'lucide-react'
import { useToast } from '@/lib/stores/ToastStore'
import { useSettings } from '@/lib/stores/SettingsStore'
import { AssignModal } from '@/components/responses/AssignModal'

interface AssignmentRecord {
  id: string
  numericId: number
  respondentName: string
  respondentEmail: string
  respondentPhone: string
  surveyTitle: string
  status: string
  npsScore: number | null
  feedback: string | null
  assignedToId: number | null
  assignedToName: string | null
  assignedAt: string | null
  submittedAt: string
}

export default function AssignmentsPage() {
  const toast = useToast()
  const { state: settingsState } = useSettings()
  const user = settingsState.profile
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [selectedResponseId, setSelectedResponseId] = useState<string | null>(null)
  
  // Details Modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentRecord | null>(null)
  const [fullDetails, setFullDetails] = useState<any | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  
  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager'

  const fetchAssignments = useCallback(async () => {
    setLoading(true)
    try {
      // If Admin/Manager, fetch all responses that might need assignment or are assigned.
      // We can just fetch all or filter. Let's fetch all active responses.
      // If Viewer, fetch ONLY assigned to me.
      const params = new URLSearchParams({ pageSize: '50', sort: 'submittedAt', sortDir: 'desc' })
      if (isAdminOrManager) {
        // Admins see all assigned surveys
        params.set('assignedToId', 'assigned')
      } else if (user?.id) {
        // Staff see only their assigned surveys
        params.set('assignedToId', String(user.id))
      }

      const res = await fetch(`/api/responses?${params}`, { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        setAssignments(json.data || [])
      }
    } catch {
      toast.error('Failed to load assignments', 'Please try again.')
    } finally {
      setLoading(false)
    }
  }, [isAdminOrManager, user?.id, toast])

  useEffect(() => {
    if (user) fetchAssignments()
  }, [user, fetchAssignments])

  async function handleSolve(numericId: number) {
    try {
      const res = await fetch(`/api/responses/${numericId}/solve`, { method: 'PATCH' })
      if (res.ok) {
        toast.success('Problem Solved', 'The response has been marked as solved.')
        fetchAssignments()
      } else {
        toast.error('Failed to update', 'Could not mark as solved.')
      }
    } catch (e) {
      toast.error('Error', 'An error occurred while updating the status.')
    }
  }

  function handleOpenAssign(id: string) {
    setSelectedResponseId(id)
    setAssignModalOpen(true)
  }

  async function handleOpenDetails(record: AssignmentRecord) {
    setSelectedAssignment(record)
    setDetailsModalOpen(true)
    setLoadingDetails(true)
    setFullDetails(null)
    try {
      const res = await fetch(`/api/responses/${record.numericId}`)
      if (res.ok) {
        const json = await res.json()
        setFullDetails(json.data)
      }
    } catch {
      toast.error('Failed to load details', 'Please try again.')
    } finally {
      setLoadingDetails(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-7">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[20px] font-bold tracking-[-0.02em] text-[#0D1B2E]">Assignments</h1>
          <p className="mt-0.5 text-[12.5px] text-[#4A5568]">
            {isAdminOrManager 
              ? 'Manage and assign customer responses to team members for resolution.' 
              : 'View and resolve customer problems assigned to you.'}
          </p>
        </div>
      </div>

      {/* Main List */}
      <div className="rounded-[16px] border border-[#E2E8F3] bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#8FA0B5]">
            <Clock className="animate-spin h-5 w-5 mr-2" /> Loading assignments...
          </div>
        ) : assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-12 w-12 rounded-full bg-[#F4F7FB] flex items-center justify-center mb-3">
              <CheckCircle className="h-6 w-6 text-[#17A673]" />
            </div>
            <h3 className="text-[14px] font-semibold text-[#0D1B2E]">All caught up!</h3>
            <p className="text-[12px] text-[#8FA0B5] mt-1">There are no responses needing attention right now.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F3] bg-[#F4F7FB]">
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#6B7A90]">Response ID</th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#6B7A90]">Customer</th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#6B7A90]">Issue / Feedback</th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#6B7A90]">Status</th>
                {isAdminOrManager && <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#6B7A90]">Assigned To</th>}
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#6B7A90] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F3]">
              {assignments.map(a => (
                <tr key={a.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-5 py-4">
                    <div className="text-[12px] font-semibold text-[#0D1B2E]">{a.id}</div>
                    <div className="text-[11px] text-[#8FA0B5]">{new Date(a.submittedAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-[12.5px] font-medium text-[#0D1B2E]">{a.respondentName}</div>
                    <div className="text-[11px] text-[#8FA0B5]">{a.surveyTitle}</div>
                  </td>
                  <td className="px-5 py-4 max-w-[250px]">
                    <div className="text-[12.5px] text-[#4A5568] line-clamp-2" title={a.feedback || 'No feedback provided'}>
                      {a.feedback || <span className="text-[#A0AABF] italic">No feedback provided</span>}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-[5px] text-[10.5px] font-bold uppercase tracking-wide
                      ${a.status === 'solved' || a.status === 'closed' ? 'bg-[#ECFDF5] text-[#17A673]' : 
                        a.status === 'actioned' ? 'bg-[#EFF6FF] text-[#0B4A8B]' : 'bg-[#FFFBEB] text-[#F59E0B]'}`}>
                      {a.status}
                    </span>
                  </td>
                  {isAdminOrManager && (
                    <td className="px-5 py-4">
                      {a.assignedToName ? (
                        <div className="text-[12px] font-medium text-[#0B4A8B]">{a.assignedToName}</div>
                      ) : (
                        <div className="text-[11px] text-[#A0AABF] italic">Unassigned</div>
                      )}
                    </td>
                  )}
                  <td className="px-5 py-4 text-right space-x-2">
                    <button 
                      onClick={() => handleOpenDetails(a)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E2E8F3] rounded-[6px] text-[11px] font-semibold text-[#4A5568] hover:bg-[#F4F7FB] hover:text-[#0B4A8B] transition-colors"
                    >
                      <Eye size={12} /> View Details
                    </button>
                    {isAdminOrManager && (
                      <button 
                        onClick={() => handleOpenAssign(a.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F7FB] border border-[#E2E8F3] rounded-[6px] text-[11px] font-semibold text-[#4A5568] hover:bg-white hover:text-[#0B4A8B] transition-colors"
                      >
                        <UserPlus size={12} /> Reassign
                      </button>
                    )}
                    {(a.status !== 'solved' && a.status !== 'closed') && (!isAdminOrManager || a.assignedToId === user?.id) && (
                      <button 
                        onClick={() => handleSolve(a.numericId)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#17A673] border border-[#17A673] rounded-[6px] text-[11px] font-semibold text-white hover:bg-[#128a5f] transition-colors"
                      >
                        <CheckCircle size={12} /> Problem Solved
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AssignModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        responseId={selectedResponseId}
        onAssigned={() => {
          setAssignModalOpen(false)
          fetchAssignments()
        }}
      />

      {/* View Details Modal */}
      {detailsModalOpen && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D1B2E]/40 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[16px] bg-white shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-[#E2E8F3] px-6 py-5">
              <h2 className="text-[16px] font-bold text-[#0D1B2E]">Response Details</h2>
              <button 
                onClick={() => setDetailsModalOpen(false)}
                className="rounded-[6px] p-1.5 text-[#8FA0B5] hover:bg-[#F4F7FB] hover:text-[#0D1B2E] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {loadingDetails ? (
                <div className="flex flex-col items-center justify-center py-10 text-[#8FA0B5]">
                  <Clock className="animate-spin h-5 w-5 mb-2" />
                  <div className="text-[12px]">Loading response details...</div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#8FA0B5] mb-1">Customer</div>
                    <div className="text-[14px] font-semibold text-[#0D1B2E]">{selectedAssignment.respondentName}</div>
                    {selectedAssignment.respondentEmail && (
                      <div className="text-[12px] text-[#4A5568]">{selectedAssignment.respondentEmail}</div>
                    )}
                    {selectedAssignment.respondentPhone && (
                      <div className="text-[12px] text-[#4A5568]">{selectedAssignment.respondentPhone}</div>
                    )}
                  </div>
                  
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#8FA0B5] mb-1">Survey</div>
                    <div className="text-[13px] text-[#4A5568]">{selectedAssignment.surveyTitle}</div>
                    <div className="text-[12px] text-[#8FA0B5] mt-0.5">Submitted on {new Date(selectedAssignment.submittedAt).toLocaleString()}</div>
                  </div>
                  
                  {selectedAssignment.npsScore !== null && (
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#8FA0B5] mb-1">NPS Score</div>
                      <div className={`inline-flex h-8 w-8 items-center justify-center rounded-[6px] text-[13px] font-bold 
                        ${selectedAssignment.npsScore >= 9 ? 'bg-[#ECFDF5] text-[#17A673]' : 
                          selectedAssignment.npsScore >= 7 ? 'bg-[#FFFBEB] text-[#F59E0B]' : 'bg-[#FEF2F2] text-[#E5484D]'}`}
                      >
                        {selectedAssignment.npsScore}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#8FA0B5] mb-1">Feedback</div>
                    <div className="text-[13px] text-[#4A5568] bg-[#F4F7FB] p-3 rounded-[8px] whitespace-pre-wrap">
                      {selectedAssignment.feedback || <span className="italic text-[#8FA0B5]">No textual feedback provided.</span>}
                    </div>
                  </div>

                  {/* Dynamic Survey Questions & Answers */}
                  {fullDetails?.answers && fullDetails.answers.length > 0 && (
                    <div className="border-t border-[#E2E8F3] pt-4">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#8FA0B5] mb-3">Survey Questions & Answers</div>
                      <div className="space-y-3.5">
                        {fullDetails.answers.map((ans: any, idx: number) => (
                          <div key={idx} className="bg-[#F8FAFC] border border-[#E2E8F3] p-3 rounded-[8px]">
                            <div className="text-[12px] font-bold text-[#0D1B2E] mb-1.5 flex items-start gap-1.5">
                              <span className="text-[#0B4A8B] font-extrabold">Q:</span>
                              <span>{ans.question}</span>
                            </div>
                            <div className="text-[12.5px] text-[#4A5568] flex items-start gap-1.5 pl-3.5">
                              <span className="text-[#17A673] font-bold">A:</span>
                              <span className="font-medium">{ans.answer || <span className="text-[#A0AABF] italic">No answer provided</span>}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#8FA0B5] mb-1">Status</div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-[5px] text-[11px] font-bold uppercase tracking-wide
                      ${selectedAssignment.status === 'solved' || selectedAssignment.status === 'closed' ? 'bg-[#ECFDF5] text-[#17A673]' : 
                        selectedAssignment.status === 'actioned' ? 'bg-[#EFF6FF] text-[#0B4A8B]' : 'bg-[#FFFBEB] text-[#F59E0B]'}`}>
                      {selectedAssignment.status}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="border-t border-[#E2E8F3] px-6 py-4 bg-[#F9FAFB] flex justify-end gap-3 rounded-b-[16px]">
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="px-4 py-2 rounded-[8px] text-[13px] font-semibold text-[#4A5568] hover:bg-[#E2E8F3] transition-colors"
              >
                Close
              </button>
              {(selectedAssignment.status !== 'solved' && selectedAssignment.status !== 'closed') && (!isAdminOrManager || selectedAssignment.assignedToId === user?.id) && (
                <button
                  onClick={() => {
                    handleSolve(selectedAssignment.numericId)
                    setDetailsModalOpen(false)
                  }}
                  className="px-4 py-2 rounded-[8px] text-[13px] font-semibold bg-[#17A673] text-white hover:bg-[#128a5f] transition-colors flex items-center gap-2"
                >
                  <CheckCircle size={14} /> Mark as Solved
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
