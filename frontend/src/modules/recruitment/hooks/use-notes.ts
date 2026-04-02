import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { notesApi, type NoteListParams } from "@/api/notes"
import type { NoteCreate } from "@/types"

export function useNotes(
  applicationId: string,
  params: NoteListParams = {},
) {
  return useQuery({
    queryKey: ["applications", applicationId, "notes", params],
    queryFn: () =>
      notesApi.list(applicationId, params).then((r) => r.data),
    enabled: Boolean(applicationId),
  })
}

export function useCreateNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      applicationId,
      data,
    }: {
      applicationId: string
      data: NoteCreate
    }) => notesApi.create(applicationId, data).then((r) => r.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["applications", variables.applicationId, "notes"],
      })
    },
  })
}
