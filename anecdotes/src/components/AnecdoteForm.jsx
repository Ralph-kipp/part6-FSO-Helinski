import { useAnecdoteActions } from "../store"
import { useNotificationActions } from "../notificationStore"

const AnecdoteForm = () => {
  const { create } = useAnecdoteActions()
  const { notify } = useNotificationActions()

  const onCreate = async (e) => {
    e.preventDefault()
    const form = e.target
    const content = form.anecdote.value.trim()
    if (content) {                      // ignore empty submissions
      await create(content)
      notify(`you created '${content}'`)
    }
    form.reset()
  }

  return (
    <>
      <h2>create new</h2>
      <form onSubmit={onCreate}>
        <div>
          <input name="anecdote" data-testid="new" />
        </div>
        <button>create</button>
      </form>
    </>
  )
}

export default AnecdoteForm
