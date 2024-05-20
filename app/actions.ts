"use server"

import { auth } from "@/edgedb-next-client"
import { updateUser } from "@/edgedb/crud/mutations"
import { profileLoadMorePosts } from "@/edgedb/crud/queries"
import { actionClient } from "@/lib/safe-action"
import OpenAI from "openai"
import { z } from "zod"

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
})

export const logoutAction = actionClient.action(async () => {
	const { signout } = auth.createServerActions()
	signout()
})

const updateUserSchema = z.object({
	bio: z.string().optional(),
	place: z.string().optional(),
	displayName: z.string().optional(),
})
export const updateUserAction = actionClient
	.schema(updateUserSchema)
	.action(async ({ parsedInput: { bio, place, displayName } }) => {
		const session = auth.getSession()
		const client = session.client
		try {
			await updateUser.run(client, { bio, place, displayName })
		} catch (err) {
			return { failure: "EdgeDB error:", errorDetails: err.message }
		}
	})

const profileLoadMostPostsSchema = z.object({
	username: z.string(),
	pageNumber: z.number(),
})
export const profileLoadMostPostsAction = actionClient
	.schema(profileLoadMostPostsSchema)
	.action(async ({ parsedInput: { username, pageNumber } }) => {
		const session = auth.getSession()
		const client = session.client
		try {
			const res = await profileLoadMorePosts.run(client, {
				username,
				pageNumber,
			})
			return res
		} catch (err) {
			return { failure: "EdgeDB error:", errorDetails: err.message }
		}
	})

const describeImageSchema = z.object({
	imageAsBase64: z.string(),
})
export const describeImageAction = actionClient
	.schema(describeImageSchema)
	.action(async ({ parsedInput: { imageAsBase64 } }) => {
		try {
			// const response = await openai.chat.completions.create({
			// 	model: "gpt-4o",
			// 	messages: [
			// 		{
			// 			role: "user",
			// 			content: [
			// 				{ type: "text", text: "What’s in this image?" },
			// 				{
			// 					type: "image_url",
			// 					image_url: {
			// 						url: imageAsBase64,
			// 					},
			// 				},
			// 			],
			// 		},
			// 	],
			// })
			// return response.choices[0]
			await new Promise((resolve) => setTimeout(resolve, 3000))
			return "The image shows a serving of French toast topped with banana slices, blueberries, and a drizzle of syrup, likely maple syrup. The dish appears to be garnished with a light dusting of powdered sugar and is presented on a dark plate. The layers of the toast and the toppings look visually appealing and appetizing."
		} catch (err) {
			return { failure: "Describe image error:", errorDetails: err.message }
		}
	})

// const globalSearchSchema = z.object({
//   query: z.string(),
//   // categories: z.array(z.string()),
// })
// export const globalSearchAction = actionClient
//   .schema(globalSearchSchema)
//   .action(async ({ parsedInput: { query } }) => {
//     // TODO: turn query into vector..
//     // pass vector to edgedb for search, return results
//     return

//     const session = auth.getSession()
//     const client = session.client
//     try {
//       await updateUser.run(client, { bio, place, displayName })
//     } catch {
//       // TODO: consider better errors
//       return { failure: "Error with EdgeDB" }
//     }
//   })
