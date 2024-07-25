import React from 'react'
import Loader from '@/components/shared/loader'
import { useGetRecentPosts } from '@/lib/react-query/queriesAndMutations';
import { Models } from 'appwrite';
import PostCard from '@/components/shared/PostCard';

const Home = () => {
  const {data: posts, isPending: isPostLoading, isError: isErrorPosts } = useGetRecentPosts();
  return (
    <div className="flex flex-1">
      <div className="home-container">
        <div className="home-posts">
          <h2 className="h3-bold md:h2-bold text-left w-full">
            Inicio
          </h2>
          {isPostLoading && !posts ? (
            <Loader />
          ) : (
            <ul className="flex flex-col gap-3 w-full">
              {posts?.documents.map((post: Models.Document) => (
                <PostCard post={post} key={post.$id}/>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home