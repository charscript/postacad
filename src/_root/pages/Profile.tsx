import { useUserContext } from '@/context/AuthContext';
import React, { useEffect, useState } from 'react';
import { Link, Outlet, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { useGetUserById, useIsFollowing } from '@/lib/react-query/queriesAndMutations';
import Loader from '@/components/shared/loader';
import { Button } from '@/components/ui/button';
import GridPostList from '@/components/shared/GridPostList';
import LikedPosts from './LikedPosts';
import { followUser, getFollowersCount, getFollowingCount, unfollowUser } from '@/lib/appwrite/api';
import { INewPost } from '@/types';

interface StatBlockProps {
  value: string | number;
  label: string;
}

const StatBlock = ({ value, label }: StatBlockProps) => (
  <div className="flex-center gap-2">
    <p className="small-semibold lg:body-bold text-primary-500">{value}</p>
    <p className="small-medium lg:base-medium text-light-2">{label}</p>
  </div>
);

const Profile = () => {
  const { id } = useParams();
  const { user } = useUserContext();
  const { pathname } = useLocation();
  const { data: currentUser, isLoading, refetch } = useGetUserById(id || "");
  const isFollowingQuery = useIsFollowing(user.username, currentUser?.username);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);
  const [resourcesCount, setResourcesCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      if (currentUser) {
        const followers = await getFollowersCount(currentUser.username);
        const following = await getFollowingCount(currentUser.username);
        const posts = currentUser.posts.length;
        const resources = currentUser.posts.filter((post: INewPost) => post.isResource).length;
        
        setFollowersCount(followers);
        setFollowingCount(following);
        setPostsCount(posts);
        setResourcesCount(resources);
      }
    };

    fetchCounts();
  }, [currentUser]);

  useEffect(() => {
    if (isFollowingQuery.data !== undefined) {
      setIsFollowing(isFollowingQuery.data);
    }
  }, [isFollowingQuery.data]);

  if (isLoading || !currentUser) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  const handleFollowToggle = async () => {
    setIsFollowingLoading(true);
    if (!isFollowing) {
      await followUser(user.username, currentUser.username);
      setFollowersCount(followersCount + 1);
    } else {
      await unfollowUser(user.username, currentUser.username);
      setFollowersCount(followersCount - 1);
    }
    setIsFollowing(!isFollowing);
    await refetch();
    setIsFollowingLoading(false);
  };

  const postsWithImages = currentUser.posts.filter((post: { imageUrl: string }) => post.imageUrl && post.imageUrl !== 'https://example.com/default-image.jpg');

  return (
    <div className="profile-container">
      <div className="profile-inner_container">
        <div className="flex xl:flex-row flex-col max-xl:items-center flex-1 gap-7">
          <img
            src={currentUser.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt="profile"
            className="w-28 h-28 lg:h-36 lg:w-36 rounded-full"
          />
          <div className="flex flex-col flex-1 justify-between md:mt-2">
            <div className="flex flex-col w-full">
              <h1 className="text-center xl:text-left h3-bold md:h1-semibold w-full">
                {currentUser.name}
              </h1>
              <p className="small-regular md:body-medium text-light-3 text-center xl:text-left">
                @{currentUser.username}
              </p>
            </div>

            <div className="flex gap-8 mt-10 items-center justify-center xl:justify-start flex-wrap z-20">
              <StatBlock value={postsCount} label="Posts" />
              <StatBlock value={resourcesCount} label="Recursos" />
              <StatBlock value={followersCount} label="Followers" />
              <StatBlock value={followingCount} label="Following" />
            </div>

            <p className="small-medium md:base-medium text-center xl:text-left mt-7 max-w-screen-sm">
              {currentUser.bio}
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <div className={`${user.id !== currentUser.$id && "hidden"}`}>
              <Link
                to={`/update-profile/${currentUser.$id}`}
                className={`h-12 bg-dark-4 px-5 text-light-1 flex-center gap-2 rounded-lg ${
                  user.id !== currentUser.$id && "hidden"
                }`}
              >
                <img
                  src={"/assets/icons/edit.svg"}
                  alt="edit"
                  width={20}
                  height={20}
                />
                <p className="flex whitespace-nowrap small-medium">
                  Editar Perfil
                </p>
              </Link>
            </div>
            <div className="flex justify-center gap-4">
              {!isFollowing && user.id !== currentUser.$id && (
                <Button
                  type="button"
                  className="shad-button_primary px-8"
                  onClick={handleFollowToggle}
                  disabled={isFollowingLoading}
                >
                  Seguir
                </Button>
              )}
              {isFollowing && user.id !== currentUser.$id && (
                <Button
                  type="button"
                  className="shad-button_primary px-8"
                  onClick={handleFollowToggle}
                  disabled={isFollowingLoading}
                >
                  Dejar De Seguir
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {currentUser.$id === user.id && (
        <div className="flex max-w-5xl w-full">
          <Link
            to={`/profile/${id}`}
            className={`profile-tab rounded-l-lg ${
              pathname === `/profile/${id}` && "!bg-dark-3"
            }`}
          >
            <img
              src={"/assets/icons/posts.svg"}
              alt="posts"
              width={20}
              height={20}
            />
            Posts
          </Link>
          <Link
            to={`/profile/${id}/liked-posts`}
            className={`profile-tab rounded-r-lg ${
              pathname === `/profile/${id}/liked-posts` && "!bg-dark-3"
            }`}
          >
            <img
              src={"/assets/icons/like.svg"}
              alt="like"
              width={20}
              height={20}
            />
            Tus Me Gusta
          </Link>
        </div>
      )}

      <Routes>
        <Route
          index
          element={<GridPostList posts={postsWithImages} showUser={false} />}
        />
        {currentUser.$id === user.id && (
          <Route path="/liked-posts" element={<LikedPosts />} />
        )}
      </Routes>
      <Outlet />
    </div>
  );
};

export default Profile;
