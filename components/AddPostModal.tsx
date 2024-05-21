"use client"
import { describeImageAction, uploadPostAction } from "@/app/actions"
import { observer, useObservable } from "@legendapp/state/react"
import React from "react"
import { FaImage } from "react-icons/fa6"
import { IoCloseOutline } from "react-icons/io5"
import AiThinking from "./AiThinking"
import Loader from "./Loader"
import { useRouter } from "next/navigation"

interface Props {
	open: boolean
	onClose: () => void
	postsState: any
}

export default observer(function AddPostModal(props: Props) {
	const local = useObservable({
		isOpen: props.open,
		title: "",
		description: "",
		uploadedImageAsFile: null as File | null,
		aiDescription: "",
		aiDescriptionLoading: false,
		aiGuessesCategories: [] as string[],
		aiCategoriesGuessLoading: false,
		uploadingPost: false,
		foodCategories: [
			"Sushi",
			"Breakfast",
			"Smoothie",
			"Vegan",
			"Pasta",
			"Salad",
			"Healthy",
			"Steak",
			"Cocktail",
			"Soup",
			"Coffee",
		],
		categories: [] as string[],
		initialCount: 6,
	})
	const router = useRouter()

	const addCategory = (
		category: string,
		event: React.MouseEvent<HTMLButtonElement>,
	) => {
		event.preventDefault()
		event.stopPropagation()
		local.categories.set((prevSelected) =>
			prevSelected.includes(category)
				? prevSelected.filter((cat) => cat !== category)
				: [...prevSelected, category],
		)
	}

	const sortedCategories = [
		...local.categories.get(),
		...local.foodCategories
			.get()
			.filter((cat) => !local.categories.get().includes(cat)),
	].slice(0, local.initialCount.get())

	const handleCloseModal = () => {
		local.isOpen.set(false)
		props.onClose()
	}

	if (!local.isOpen.get()) return null

	return (
		<div className="fixed inset-0 z-10 overflow-y-auto">
			<button
				className="absolute top-10 left-20 glass-background hover:opacity-40 px-3 py-3 rounded-full z-50"
				onClick={handleCloseModal}
			>
				<IoCloseOutline />
			</button>
			<div className="min-h-screen px-2 text-center">
				<div
					className="fixed inset-0 bg-neutral-900 opacity-95"
					style={{ backdropFilter: "blur(30px)" }}
				/>
				<span className="inline-block h-screen align-middle" aria-hidden="true">
					&#8203;
				</span>
				<div
					className="inline-block w-full max-w-7xl my-8 overflow-hidden text-left align-middle transition-all transform shadow-xl rounded-2xl"
					style={{ minHeight: "100%" }}
				>
					<form
						className="flex"
						style={{ minHeight: "100%" }}
						onSubmit={(e) => {
							e.preventDefault()
						}}
					>
						<div
							className="w-4/5 flex h-[650px] justify-center items-center m-auto"
							style={{
								borderRight: "1px solid #2c2c2c",
								background: "rgba(0, 0, 0, 0.95)",
								backdropFilter: "blur(200px)",
							}}
						>
							<label
								className="mt-1 w-full h-full flex justify-center items-center focus:outline-none cursor-pointer"
								htmlFor="image"
							>
								{!local.uploadedImageAsFile.get() && (
									<FaImage className="h-20 w-20 text-white hover:text-white" />
								)}
								{local.uploadedImageAsFile.get() && (
									<img
										// @ts-ignore
										src={URL.createObjectURL(local.uploadedImageAsFile.get())}
										className="max-w-full max-h-full"
									/>
								)}
								<input
									type="file"
									id="image"
									onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
										if (e.target.files && e.target.files[0]) {
											try {
												const uploadedFile = e.target.files[0]
												local.uploadedImageAsFile.set(uploadedFile)
												local.aiDescriptionLoading.set(true)

												const data = new FormData()
												data.append(
													"imageAsBase64",
													await fileToBase64(uploadedFile),
												)
												const resp = await describeImageAction({
													image: data,
												})
												if (resp.data) {
													// TODO: type well
													// @ts-ignore
													local.aiDescription.set(resp.data)
												}
												local.aiDescriptionLoading.set(false)
											} catch (err) {
												local.aiDescriptionLoading.set(false)
												console.log(err)
											}
										}
									}}
									className="hidden"
								/>
							</label>
						</div>
						<div className="flex flex-col glass-background">
							<div>
								<label
									htmlFor="description"
									className="block text-xs font-normal text-white text-opacity-60 py-2 mb-2"
									style={{
										borderBottom: "1px solid #2c2c2c",
										width: "100%",
										paddingLeft: "1rem",
									}}
								>
									Description
								</label>
								<textarea
									id="description"
									value={local.description.get()}
									placeholder="Write a description..."
									onChange={(e) => local.description.set(e.target.value)}
									style={{
										height: "150px",
										outline: "none",
										textAlign: "left",
										color: "white",
										resize: "none",
										overflow: "auto",
									}}
									className="bg-inherit mt-1 block w-full px-3 text-white border-none sm:text-sm textarea-placeholder"
								/>
							</div>

							{/* HEEEEEEEEEEEREEEEEEEEEEEEEEEEEEEEE */}

							<div
								style={{
									minHeight: "220px",
									height: local.aiDescriptionLoading.get() ? "auto" : "220px",
								}}
							>
								<label
									className="block text-xs font-normal text-white text-opacity-60 pb-2"
									style={{
										borderBottom: "1px solid #2c2c2c",
										width: "100%",
										paddingLeft: "1rem",
									}}
								>
									Image Description
								</label>
								<p className="font-thin text-white text-sm pl-4"></p>
								<div
									style={{
										display: "flex",
										flexDirection: "row",
										width: "100%",
										marginTop: "10px",
									}}
								>
									{local.aiDescriptionLoading.get() && <AiThinking />}
								</div>
								<div
									className="p-0 text-xs bg-inherit text-white"
									style={{ width: "400px", overflowWrap: "break-word" }}
								>
									{local.aiDescription.get()}
								</div>
							</div>

							<div
								style={{
									width: "320px",
									height: "100px",
									position: "relative",
								}}
							>
								<label
									className="block text-xs font-normal text-white text-opacity-60 pb-2 mb-2"
									style={{
										borderBottom: "1px solid #2c2c2c",
										width: "400px",
										marginBottom: "10px",
										paddingLeft: "1rem",
									}}
								>
									Categories
								</label>
								{/* TODO: add back when there is more categories */}
								{/* <input
									placeholder="Search categories..."
									className="mt-1 block w-full px-3 bg-inherit font-normal text-white border-none sm:text-sm textarea-placeholder"
								/> */}
								<div className="flex flex-wrap gap-3 pl-2 mt-2">
									{sortedCategories.map((category) => (
										<button
											key={category}
											className={`px-3 py-2 text-white font-light text-sm border rounded-full ${
												local.categories.get().includes(category)
													? "bg-inherit border-yellow-500"
													: "bg-inherit borer-white hover:border-yellow-200"
											}`}
											onClick={(e) => addCategory(category, e)}
										>
											{category}
										</button>
									))}
								</div>
								{/* TODO: add back when there is more categories */}
								{/* {local.initialCount.get() <
									local.foodCategories.get().length && (
									<button
										className="mt-2 ml-4 text-white text-xs font-thin cursor-pointer"
										onClick={viewMore}
									>
										view more
									</button>
								)} */}
							</div>
						</div>
						<div className="absolute right-4 bottom-4">
							{local.uploadingPost.get() && <Loader />}
							{!local.uploadingPost.get() && (
								<button
									className="bg-yellow-500 hover:bg-yellow-700 text-black font-semibold py-2 px-4 rounded-xl"
									onClick={async () => {
										local.uploadingPost.set(true)
										const data = new FormData()
										// TODO: issue with legend state https://discord.com/channels/1241991273322119250/1241992660776914948/1242475348134858853
										// @ts-ignore
										data.append("image", local.uploadedImageAsFile.get())
										const resp = await uploadPostAction({
											imageFile: data,
											aiDescription: "delete after",
											description: local.description.get(),
										})
										if (resp.data) {
											// TODO: redirect
											local.uploadingPost.set(false)
											router.push("/nikita")
										} else {
											// TODO: show toast with error
											local.uploadingPost.set(false)
										}
									}}
								>
									Share
								</button>
							)}
						</div>
					</form>
				</div>
			</div>
		</div>
	)
})

// TODO: move to utils, maybe do this logic on server
function fileToBase64(file: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => {
			resolve(reader.result as string)
		}
		reader.onerror = (error) => {
			reject(error)
		}
		reader.readAsDataURL(file)
	})
}
