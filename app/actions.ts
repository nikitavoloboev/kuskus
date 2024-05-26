"use server"

import { auth } from "@/edgedb-next-client"
import { createPost, updateUser } from "@/edgedb/crud/mutations"
import OpenAI from "openai"
import { create } from "ronin"
import z from "zod"
import { createServerAction, createServerActionProcedure } from "zsa"

const publicAction = createServerAction()
const authAction = createServerActionProcedure()
	.handler(async () => {
		try {
			const session = auth.getSession()
			const client = session.client
			return {
				client,
			}
		} catch {
			throw new Error("User not authenticated")
		}
	})
	.createServerAction()
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
})

export const updateUserProfileAction = authAction
	.input(
		z.object({
			username: z.string(),
			displayName: z.string().optional(),
			profileImage: z.custom<File>((file) => file instanceof File),
		}),
		{ type: "formData" },
	)
	.handler(async ({ input, ctx }) => {
		const { username, displayName, profileImage } = input
		const client = ctx.client
		if (profileImage) {
			const resRoninUpload = await create.user.with({
				profilePhotoUrl: profileImage,
			})
			const resUpdateUser = await updateUser.run(client, {
				username,
				displayName,
				roninId: resRoninUpload.id,
				profilePhotoUrl: resRoninUpload.profilePhotoUrl.src,
			})
			if (resUpdateUser) {
				return "ok"
			}
		} else {
			const resUpdateUser = await updateUser.run(client, {
				username,
				displayName,
			})
			if (resUpdateUser) {
				return "ok"
			}
		}
		throw new Error("Error updating user profile")
	})

export const describeImageAction = authAction
	.input(
		z.object({
			imageAsBase64: z.string(),
		}),
	)
	.handler(async ({ input }) => {
		const { imageAsBase64 } = input
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
		// if (!response) throw new Error("Error describing image")
		// return response.choices[0].message.content
		return `This image shows a hand holding a cup of coffee with latte art on the surface. The latte art appears to be shaped like a heart. The background consists of a paved pathway and some greenery on the side.`
	})

export const suggestCategoriesAction = authAction
	.input(
		z.object({
			foodDescription: z.string(),
		}),
	)
	.handler(async ({ input }) => {
		const { foodDescription } = input
		console.log(foodDescription, "food desc")
		const categories = await fetch(
			`http://158.160.90.161:8000/suggest-categories/?text=${encodeURIComponent(foodDescription)}&k=1`,
		)
		console.log(categories, "categories")
		console.log(categories.json(), "json")
		if (!categories.ok) throw new Error("Error suggesting categories")
		return await categories.json()
	})

export const createPostAction = authAction
	.input(
		z.object({
			postImage: z.custom<File>((file) => file instanceof File),
			aiDescription: z.string(),
			description: z.string(),
			categories: z.optional(z.array(z.string())),
		}),
		{ type: "formData" },
	)
	.handler(async ({ input, ctx }) => {
		const { postImage, aiDescription, description, categories } = input
		const client = ctx.client
		const roninPost = await create.post.with({
			photo: postImage,
			aiDescription,
			description,
		})
		const dbPost = await createPost.run(client, {
			imageUrl: roninPost.photo.src,
			roninId: roninPost.id,
			imageWidth:
				"width" in roninPost.photo.meta ? roninPost.photo.meta.width : 0,
			imageHeight:
				"height" in roninPost.photo.meta ? roninPost.photo.meta.height : 0,
			imagePreviewBase64Hash: roninPost.photo.placeholder.base64,
			aiDescription: aiDescription,
			description: description,
			categories: categories,
		})
		if (!dbPost) throw new Error("Error creating post")
		return "ok"
	})
