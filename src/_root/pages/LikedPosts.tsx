import Loader from "@/components/shared/loader";
import GridPostList from "@/components/shared/GridPostList";
import { INewPost } from "@/types";
import { useGetCurrentUser } from "@/lib/react-query/queriesAndMutations";
import { Models } from "appwrite";
import { useState } from "react";

interface Post extends INewPost, Models.Document {}


const LikedPosts = () => {
  const { data: currentUser } = useGetCurrentUser();
  const [showResourcesOnly, setShowResourcesOnly] = useState(false);


  if (!currentUser)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );


    const filterResourcePosts = (posts: Post[]): Post[] => {
      return posts.filter((post) => post.isResource);
    }

    const resourcePosts = filterResourcePosts(currentUser.liked as Post[]);
    const displayedPosts = showResourcesOnly ? resourcePosts : (currentUser.liked as Post[]);



  return (
    <div className="liked-posts-container">
      <div className="flex-between w-full mb-5">
        <h2 className="h3-bold md:h2-bold mb-3 mr-20">Tus Me Gusta</h2>
        <div className="flex-center gap-3 bg-dark-3 rounded-xl px-4 py-2 cursor-pointer mb-3" onClick={() => setShowResourcesOnly(!showResourcesOnly)}>
          <p className="small-medium md:base-medium text-light-2">
            {showResourcesOnly ? "Todo" : "Recursos"}
          </p>
          <img 
            src="/assets/icons/filter.svg"
            width={20}
            height={20}
            alt="filter"  
          />
        </div>
      </div>
      {currentUser.liked.length === 0 ? (
        <p className="text-light-4">No le has dado me gusta a ninguna publicación.</p>
      ) : (
        <GridPostList posts={displayedPosts} showStats={false} />
      )}
    </div>
  );
};

export default LikedPosts;
