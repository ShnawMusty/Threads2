import { fetchUserPosts } from "@/lib/actions/userActions"
import ThreadCard from "../cards/ThreadCard";

const ThreadsTab = async ({currentUserId, accountId, accountType}) => {

  let result = await fetchUserPosts(accountId);


  return (
    <section className="mt-9 flex flex-col gap-10">
      {result.threads.map(thread => (
        <ThreadCard
         key={thread._id}
         id={thread._id}
         currentUserId={currentUserId}
         parentId={thread.parentId}
         content={thread.text}
         author={accountType === 'User' ? {name: result.name, image: result.image, id: result.id} : {name: thread.author.name, image: thread.author.image, id: thread.author.id}} 
         community={thread.communityId} // todo
         createdAt={thread.createdAt}
         comments={thread.children}
        />
      ))}
    </section>
  )
}

export default ThreadsTab