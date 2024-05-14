import Link from "next/link"
import {
  GridIcon,
  SearchIcon,
  UserIcon,
  NotificationIcon,
  PlusIcon,
} from "../public/svg/search-icons"

export default function Header() {
  return (
    <>
      <div className="flex flex-row space-x-15">
        <div className="flex flex-row space-x-4 mt-8 ml-10">
          <Link href="/searchlaces">
            <p
              className="text-base font-semibold text-neutral-500"
              style={{ cursor: "pointer" }}
            >
              Places
            </p>
          </Link>
          <Link href="/searchusers">
            <p
              className="text-base font-semibold text-neutral-500"
              style={{ cursor: "pointer" }}
            >
              Members
            </p>
          </Link>
          <Link href="/searchdishes">
            <p
              className="text-base font-semibold text-neutral-500"
              style={{ cursor: "pointer" }}
            >
              Dishes
            </p>
          </Link>
        </div>

        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            width: "100%",
            zIndex: 100,
          }}
          className="flex flex-row space-x-2 justify-center"
        >
          <div
            className="mb-5 flex justify-center items-center space-x-3 rounded-full py-2"
            style={{
              width: "13%",
              marginLeft: "auto",
              marginRight: "10px",
              justifyContent: "center",
              backgroundColor: "rgb(47 47 48)",
              boxShadow: "5px 5px 15px rgba(0, 0, 0, 0.3)",
            }}
          >
            <GridIcon className="text-white w-7 h-7" />
            <SearchIcon className="text-white w-7 h-7" />
            <UserIcon className="text-white w-7 h-7" />
            <NotificationIcon className="text-white w-7 h-7" />
          </div>

          <button
            style={{
              backgroundColor: "rgb(47 47 48)",
              width: "40px",
              height: "40px",
              boxShadow: "5px 5px 15px rgba(0, 0, 0, 0.3)",
            }}
            className="rounded-full items-center justify-center flex text-white focus:outline-none focus:ring"
          >
            <PlusIcon className="text-white w-7 h-7" />
          </button>
        </div>
      </div>
    </>
  )
}