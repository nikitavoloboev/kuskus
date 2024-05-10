import e from "../../dbschema/edgeql-js"

export async function createPost(
  data: {
    photoUrl: string
    description?: string
  },
  userId?: string | null,
) {
  return await e.insert(e.Post, {
    photoUrl: data.photoUrl,
    description: data.description,
    created_by: userId
      ? e.cast(e.User, e.uuid(userId))
      : e.cast(e.User, e.set()),
  })
}

export const createGlobalState = e.params(
  {
    popularDishes: e.optional(e.array(e.str)),
  },
  ({ popularDishes }) => {
    return e.insert(e.GlobalState, {
      popularDishes: e.array_unpack(
        e.op(popularDishes, "??", e.cast(e.array(e.str), e.set())),
      ),
    })
  },
)

export const updateUser = e.params(
  {
    userId: e.optional(e.uuid),
    bio: e.optional(e.str),
    place: e.optional(e.str),
    displayName: e.optional(e.str),
  },
  ({ userId, bio, place, displayName }) => {
    const user = e.op(
      e.cast(e.User, userId),
      "if",
      e.op("exists", userId),
      "else",
      e.global.current_user,
    )
    return e.update(user, (u) => ({
      set: {
        bio: e.op(bio, "??", u.bio),
        place: e.op(place, "??", u.place),
        displayName: e.op(displayName, "??", u.displayName),
      },
    }))
  },
)

export const updateGlobalState = e.params(
  {
    popularDishes: e.optional(e.array(e.str)),
  },
  ({ popularDishes }) => {
    const globalState = e.assert_exists(e.assert_single(e.GlobalState))

    return e.update(globalState, (global) => ({
      set: {
        popularDishes: e.array_unpack(
          e.op(popularDishes, "??", e.cast(e.array(e.str), e.set())),
        ),
      },
    }))
  },
)
