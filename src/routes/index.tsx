import { Show, Suspense, createResource, createSignal, onMount } from "solid-js"
import { GlobalContextProvider } from "~/GlobalContext/store"
import { getUser } from "~/lib/auth"
import App from "~/pages/App"
import LandingPage from "~/pages/LandingPage"

export default function Home() {
  /**
   * undefined - loading
   * null - not-logged in
   * user - user
   */
  const [user] = createResource(async () => {
    return await getUser()
  })

  return (
    <main>
      <GlobalContextProvider>
        <Suspense fallback={<p>loading</p>}>
          <Show when={user()} fallback={LandingPage()}>
            <App />
          </Show>
        </Suspense>
      </GlobalContextProvider>
    </main>
  )
}
