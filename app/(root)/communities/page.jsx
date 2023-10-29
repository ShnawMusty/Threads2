import { currentUser } from "@clerk/nextjs"
import { fetchUser, fetchUsers } from '@/lib/actions/userActions'
import { redirect } from "next/navigation";
import Image from "next/image";
import UserCard from '@/components/cards/UserCard'
import { fetchCommunities } from "@/lib/actions/communityActions";
import CommunityCard from '@/components/cards/CommunityCard'

const page = async () => {
    const user = await currentUser();

    if (!user) return null;

    const userInfo =  await fetchUser(user.id);

    if(!userInfo?.onboarded) redirect('/onboarding');

    const result = await fetchCommunities({
      searchString: '',
      pageNumber: 1,
      pageSize: 25
    })

    return (
    <section>
      <h1 className='head-text mb-10' >Communities</h1>

      {/* TODO: Search Bar */}
      <div>
        {result.communities.length === 0 ? (
          <p className="no-result">No users</p>
        ) : (
          <>
          <div className="flex flex-wrap items-center gap-3">

          {result.communities.map(community => (
            <CommunityCard
            key={community.id}
            id={community.id}
            name={community.name}
            username={community.username}
            imgUrl={community.image}
            bio={community.bio}
            members={community.members}
            />
          ))}
          </div>
          </>
        )}
      </div>
    </section>
  )
}

export default page