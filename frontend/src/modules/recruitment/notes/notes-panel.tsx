import { useState } from "react"
import { Send, Lock } from "lucide-react"
import {
  Button,
  Badge,
  Separator,
  Textarea,
  LoadingSpinner,
} from "@/shared/components"
import { useToast } from "@/shared/components/toast"
import { useNotes, useCreateNote } from "@/modules/recruitment/hooks"
import { formatDateTime } from "@/lib/utils"

interface NotesPanelProps {
  applicationId: string
}

export function NotesPanel({ applicationId }: NotesPanelProps) {
  const [content, setContent] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const { data, isLoading } = useNotes(applicationId)
  const createNote = useCreateNote()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    try {
      await createNote.mutateAsync({
        applicationId,
        data: { content: content.trim(), is_private: isPrivate },
      })
      setContent("")
      setIsPrivate(false)
      toast("Note added")
    } catch {
      toast("Failed to add note", "error")
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a note..."
          rows={3}
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="size-3.5 rounded border-slate-300"
            />
            <Lock className="size-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Private</span>
          </label>
          <Button
            type="submit"
            size="sm"
            disabled={!content.trim() || createNote.isPending}
          >
            <Send className="size-3.5" />
            {createNote.isPending ? "Sending..." : "Add Note"}
          </Button>
        </div>
      </form>

      <Separator />

      {isLoading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      )}

      {!isLoading && data?.items?.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No notes yet.
        </p>
      )}

      <div className="space-y-3">
        {data?.items?.map((note) => (
          <div
            key={note.id}
            className="rounded-lg border border-border bg-slate-50/50 p-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {note.author_name || "System"}
                </span>
                {note.is_private && (
                  <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                    <Lock className="mr-0.5 size-2.5" /> Private
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDateTime(note.created_at)}
              </span>
            </div>
            <p className="mt-1.5 whitespace-pre-wrap text-sm text-foreground">
              {note.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
