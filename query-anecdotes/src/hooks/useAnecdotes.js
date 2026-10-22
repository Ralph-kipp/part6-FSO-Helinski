import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createAnecdote, getAnecdotes, updateAnecdote } from '../requests'
import useNotify from './useNotify'

export const useAnecdotes = () => {
  const queryClient = useQueryClient()
  const { notify } = useNotify()

  const result = useQuery({
    queryKey: ['anecdotes'],
    queryFn: getAnecdotes,
    retry: 1,
    // The hook is used by several components; a component mounting later
    // must reuse the cached list instead of triggering another GET.
    refetchOnMount: false,
  })

  const newAnecdoteMutation = useMutation({
    mutationFn: createAnecdote,
    onSuccess: (newAnecdote) => {
      queryClient.setQueryData(['anecdotes'], (anecdotes) =>
        anecdotes.concat(newAnecdote)
      )
      notify(`you created '${newAnecdote.content}'`)
    },
    onError: (error) => {
      notify(error.message)
    },
  })

  const updateAnecdoteMutation = useMutation({
    mutationFn: updateAnecdote,
    // Optimistic update: show the new vote count right away, so a second
    // click computes its count from the already increased value.
    onMutate: async (updated) => {
      await queryClient.cancelQueries({ queryKey: ['anecdotes'] })
      queryClient.setQueryData(['anecdotes'], (anecdotes) =>
        anecdotes.map((a) => (a.id === updated.id ? updated : a))
      )
    },
    // The server response is deliberately not written to the cache on
    // success: a late response must not overwrite a newer local count.
    onSuccess: (updated) => {
      notify(`you voted '${updated.content}'`)
    },
    // Undo only this one vote, then resync with the server.
    onError: (error, updated) => {
      queryClient.setQueryData(['anecdotes'], (anecdotes) =>
        anecdotes.map((a) =>
          a.id === updated.id ? { ...a, votes: a.votes - 1 } : a
        )
      )
      queryClient.invalidateQueries({ queryKey: ['anecdotes'] })
    },
  })

  return {
    anecdotes: result.data,
    isPending: result.isPending,
    isError: result.isError,
    addAnecdote: (content) => newAnecdoteMutation.mutate({ content }),
    vote: (anecdote) =>
      updateAnecdoteMutation.mutate({ ...anecdote, votes: anecdote.votes + 1 }),
  }
}
