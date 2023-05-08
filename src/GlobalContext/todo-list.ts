import {
  batch,
  createComputed,
  createMemo,
  createSelector,
  createSignal,
} from "solid-js"
import { createContextProvider } from "@solid-primitives/context"
import {
  ClientSubtask,
  ClientTodo,
  TodoKey,
  createTodosState,
  getNewKey,
} from "./todos"
import { todayDate } from "~/lib/lib"
import { SetterParam } from "@solid-primitives/utils"
import { PageType, useActivePage } from "~/pages/App"

export type { ClientSubtask, ClientTodo } from "./todos"

export type NewSubtask = {
  isNewSubtask: true
  parent: TodoKey
  key: TodoKey
}

export const enum TodoListMode {
  Default,
  Edit,
  NewTodo,
  NewSubtask,
  Search,
  Suggest,
}

type TodoListModeDataMap = {
  [TodoListMode.NewSubtask]: NewSubtask
  [TodoListMode.Edit]: { initEditingNote: boolean }
}

type TodoListModeState = {
  [K in TodoListMode]: { type: K } & (K extends keyof TodoListModeDataMap
    ? { data: TodoListModeDataMap[K] }
    : { data?: undefined })
}[TodoListMode]

export function createTodoListState() {
  const todosState = createTodosState()
  const [activePage] = useActivePage()

  const [focusedTodoFromSearch, setFocusedTodoFromSearch] = createSignal(0)
  const [highlitedTodosFromSearch, setHighlightedTodosFromSearch] =
    createSignal([])

  const [focusedTodoKey, setFocusedTodoKey] = createSignal<TodoKey | null>(null)
  const isTodoFocused = createSelector<TodoKey | null, TodoKey>(focusedTodoKey)

  const [todoListModeState, _setTodoListMode] = createSignal<TodoListModeState>(
    { type: TodoListMode.Default },
    { equals: (a, b) => a.type === b.type && a.data === b.data }
  )
  const setTodoListMode = <T extends TodoListMode>(
    ..._: T extends keyof TodoListModeDataMap
      ? [mode: T, data: TodoListModeDataMap[T]]
      : [mode: T]
  ) => _setTodoListMode({ type: _[0], data: _[1] } as any)

  const todoListMode = createMemo(() => todoListModeState().type)
  const inTodoListMode = createSelector<TodoListMode, TodoListMode>(
    () => todoListModeState().type
  )

  function setFocusedTodo(key: TodoKey | null) {
    batch(() => {
      setFocusedTodoKey(key)
      // focusing a different todo should reset viewing mode
      setTodoListMode(TodoListMode.Default)
    })
  }

  function addNewTask() {
    batch(() => {
      setTodoListMode(TodoListMode.NewTodo)
      setFocusedTodoKey(null)
    })
  }

  const newSubtask = createMemo(() => {
    const mode = todoListModeState()
    return mode.type === TodoListMode.NewSubtask ? mode.data : null
  })

  function addNewSubtask(parent: TodoKey): TodoKey {
    const key = getNewKey()
    batch(() => {
      setTodoListMode(TodoListMode.NewSubtask, {
        parent,
        key,
        isNewSubtask: true,
      })
      setFocusedTodoKey(key)
    })
    return key
  }

  function addSubtask(
    subtask: Pick<
      ClientSubtask,
      "title" | "note" | "starred" | "priority" | "dueDate"
    >
  ) {
    batch(() => {
      const { parent } = newSubtask()!
      const key = todosState.addSubtask(parent, {
        ...subtask,
        done: false,
        parent: getTodoByKey(parent) as ClientTodo,
      })
      setTodoListMode(TodoListMode.Edit, { initEditingNote: false })
      setFocusedTodoKey(key)
    })
  }

  const [todoEditInput, setTodoEditInput] = createSignal("")
  const [localSearchResultIds, setLocalSearchResultIds] = createSignal<
    TodoKey[]
  >([])
  const [localSearchResultId, setLocalSearchResultId] =
    createSignal<TodoKey | null>(null)
  const [clickTimeStamp, setClickTimeStamp] = createSignal(0)
  const [localSearchResultIndex, setLocalSearchResultIndex] =
    createSignal<number>(0)

  const compareTodos = (a: ClientTodo, b: ClientTodo): number => {
    if (b.starred && !a.starred) {
      return 1
    } else if (a.starred && !b.starred) {
      return -1
    }
    return b.priority - a.priority
  }

  const filterPredicateMap: Record<PageType, (t: ClientTodo) => boolean> = {
    [PageType.All]: (t) => !t.done,
    [PageType.Today]: (t) => !t.done && t.dueDate === todayDate(),
    [PageType.Done]: (t) => t.done,
    [PageType.Starred]: (t) => !t.done && t.starred,
  }

  const orderedTodos = createMemo(() =>
    todosState.todos.filter(filterPredicateMap[activePage()]).sort(compareTodos)
  )

  const flatTasks = createMemo(() =>
    orderedTodos()
      .map((t) => {
        const list: (NewSubtask | ClientSubtask | ClientTodo)[] = [
          t,
          ...t.subtasks,
        ]
        const ns = newSubtask()
        if (ns?.parent === t.key) list.push(ns)
        return list
      })
      .flat()
  )

  function getTodoByKey(
    key: TodoKey
  ): NewSubtask | ClientSubtask | ClientTodo | undefined {
    return flatTasks().find((t) => t.key === key)
  }

  const focusedTodoIndex = createMemo(() =>
    flatTasks().findIndex((t) => t.key === focusedTodoKey())
  )

  function setFocusedTodoIndex(index: SetterParam<number>) {
    const todo =
      flatTasks()[
        typeof index === "function" ? index(focusedTodoIndex()) : index
      ]
    if (todo) setFocusedTodoKey(todo.key)
  }

  // replace with memo/intercapt setter later
  // Focus the first todo every time the page changes
  createComputed(() => {
    activePage()
    setFocusedTodoIndex(0)
  })

  const focusedTodo = createMemo<
    NewSubtask | ClientTodo | ClientSubtask | undefined
  >(() => flatTasks()[focusedTodoIndex()])

  const getTodoIndex = (todo: ClientTodo): number => {
    return todosState.todos.findIndex((t) => t.key === todo.key)
  }

  function isNewSubtask(
    task: NewSubtask | ClientSubtask | ClientTodo
  ): task is NewSubtask {
    return "isNewSubtask" in task
  }

  function isSubtask(
    task: NewSubtask | ClientSubtask | ClientTodo
  ): task is ClientSubtask {
    return "parent" in task
  }

  return {
    todosState,
    getTodoIndex,
    flatTasks,
    // all the todosState state and methods can be available top level
    ...todosState,
    orderedTodos,
    focusedTodo,
    focusedTodoKey,
    focusedTodoIndex,
    isTodoFocused,
    setFocusedTodo,
    setFocusedTodoIndex,
    todoListMode,
    inTodoListMode,
    setTodoListMode,
    todoEditInput,
    setTodoEditInput,
    focusedTodoFromSearch,
    setFocusedTodoFromSearch,
    highlitedTodosFromSearch,
    setHighlightedTodosFromSearch,
    localSearchResultIds,
    setLocalSearchResultIds,
    localSearchResultId,
    setLocalSearchResultId,
    clickTimeStamp,
    setClickTimeStamp,
    localSearchResultIndex,
    setLocalSearchResultIndex,
    addNewTask,
    newSubtask,
    addNewSubtask,
    addSubtask,
    isSubtask,
    isNewSubtask,
    getTodoByKey,
  } as const
}

export const [TodoListProvider, useTodoList] = createContextProvider(
  (state: ReturnType<typeof createTodoListState>) => state,
  // @ts-expect-error this is just to assert context as non-nullable
  {}
)
