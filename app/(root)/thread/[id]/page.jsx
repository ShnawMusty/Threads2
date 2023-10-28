import ThreadCard from "@/components/cards/ThreadCard";
import { fetchThreadById } from "@/lib/actions/threadActions";
import { fetchUser } from "@/lib/actions/userActions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Comment from '@/components/forms/Comment';

const page = async ({params}) => {
    if (!params.id) return null;

    const user = await currentUser();
    if (!user) return null;

    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) redirect('/onboarding');

    const thread = await fetchThreadById(params.id);

  return (
    <section className="relative">
      <div>
      <ThreadCard
        key={thread._id}
        id={thread._id}
        currentUserId={user?.id}
        parentId={thread.parentId}
        content={thread.text}
        author={thread.author}
        community={thread.communityId}
        createdAt={thread.createdAt}
        comments={thread.children}
      />
      </div>
      <div className="mt-7">
        <Comment
        threadId={JSON.stringify(thread._id)}
        currentUserImg={userInfo.image}
        currentUserId={JSON.stringify(userInfo._id)}
        />
      </div>

      <div className="mt-10">
        {thread.children.map(child => (
          <ThreadCard
          key={child._id}
          id={child._id}
          currentUserId={user?.id}
          parentId={child.parentId}
          content={child.text}
          author={child.author}
          community={child.communityId}
          createdAt={child.createdAt}
          comments={child.children}
          isComment
          />
        ))}
      </div>
    </section>
  )
}

export default page