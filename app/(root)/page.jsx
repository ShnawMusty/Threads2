// import { UserButton } from "@clerk/nextjs";
import { fetchThreads } from "@/lib/actions/threadActions"
import ThreadCard from '@/components/cards/ThreadCard'
import { currentUser} from "@clerk/nextjs";

export default async function Home() {

  const res = await fetchThreads(1, 30);

  const user = await currentUser();

  
  return (
    <>
       {/* <UserButton afterSignOutUrl="/"/> */}
       <h1 className="head-text text-left">Home</h1>

       <section className="mt-9 flex flex-col gap-10">
        {res.threads.length === 0 ? (
          <p>No threads found</p>
          ) : (
            <>
          {res.threads.map(thread => (
            <ThreadCard
            key={thread._id}
            id={thread._id}
            currentUserId={user?.id}
            parentId={thread.parentId}
            content={thread.text}
            author={thread.author}
            communityId={thread.communityId}
            createdAt={thread.createdAt}
            comments={thread.children}
            />
          ))}
          </>
        )}
       </section>
    </>
  )
}