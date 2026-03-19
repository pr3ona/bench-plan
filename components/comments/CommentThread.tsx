'use client'

import { useState, useTransition } from 'react'
import type { CommentWithAuthor, Profile } from '@/lib/types/app.types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createComment, deleteComment } from '@/lib/actions/comments'
import { formatDateRelative } from '@/lib/utils/format'
import { Trash2 } from 'lucide-react'

interface CommentThreadProps {
  comments: CommentWithAuthor[]
  taskId: string
  category: string
  currentUserId: string
}

function CommentItem({
  comment,
  currentUserId,
  taskId,
  category,
}: {
  comment: CommentWithAuthor
  currentUserId: string
  taskId: string
  category: string
}) {
  const [isPending, startTransition] = useTransition()

  const initials = comment.author.full_name
    ? comment.author.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : comment.author.email.slice(0, 2).toUpperCase()

  return (
    <div className="flex gap-3">
      <Avatar className="h-7 w-7 shrink-0 mt-0.5">
        <AvatarImage src={comment.author.avatar_url ?? undefined} />
        <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-gray-900">
            {comment.author.full_name ?? comment.author.email}
          </span>
          <span className="text-xs text-gray-400">{formatDateRelative(comment.created_at)}</span>
          {comment.edited && <span className="text-xs text-gray-400">(edited)</span>}
        </div>
        <p className="text-sm text-gray-700 mt-0.5 whitespace-pre-wrap">{comment.body}</p>
      </div>
      {comment.author_id === currentUserId && (
        <button
          onClick={() =>
            startTransition(() => deleteComment(comment.id, taskId, category))
          }
          disabled={isPending}
          className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
          title="Delete comment"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

export function CommentThread({ comments, taskId, category, currentUserId }: CommentThreadProps) {
  const [body, setBody] = useState('')
  const [isPending, startTransition] = useTransition()

  function submit() {
    if (!body.trim()) return
    const text = body.trim()
    setBody('')
    startTransition(() => createComment({ task_id: taskId, body: text, category }))
  }

  return (
    <div className="space-y-4">
      {/* Input */}
      <div className="space-y-2">
        <Textarea
          placeholder="Add a comment…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit()
          }}
        />
        <div className="flex justify-end">
          <Button size="sm" onClick={submit} disabled={isPending || !body.trim()}>
            {isPending ? 'Posting…' : 'Comment'}
          </Button>
        </div>
      </div>

      {/* Comments */}
      <div className="space-y-4">
        {comments.map((c) => (
          <CommentItem
            key={c.id}
            comment={c}
            currentUserId={currentUserId}
            taskId={taskId}
            category={category}
          />
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No comments yet</p>
        )}
      </div>
    </div>
  )
}
