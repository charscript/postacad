"use client"

import GridPostList from '@/components/shared/GridPostList';
import SearchResults from '@/components/shared/SearchResults';
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useGetPosts, useGetFollowedPosts, useSearchPostsWithImages } from '@/lib/react-query/queriesAndMutations';
import React, { useState, useEffect } from 'react'
import Loader from '@/components/shared/loader';
import { useInView } from 'react-intersection-observer';
import { toast } from "@/components/ui/use-toast";
import useDebounce from '@/hooks/useDebounce';

const Explore = () => {
  const { ref, inView } = useInView();
  const [filterOption, setFilterOption] = useState('todos'); // 'todos' or 'seguidos'
  const [postType, setPostType] = useState('posts'); // 'posts' or 'recursos'
  const { data: posts, fetchNextPage, hasNextPage } = useGetPosts();
  const { data: followedPosts, isLoading: isLoadingFollowed } = useGetFollowedPosts();
  const [searchValue, setSearchValue] = useState('');
  const debouncedValue = useDebounce(searchValue, 500);
  const { data: searchedPostsWithImages, isFetching: isSearchFetching } = useSearchPostsWithImages(debouncedValue);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debouncedValue !== '') {
      setIsSearching(true);
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      const timeout = setTimeout(() => {
        setIsSearching(false);
      }, 4000);
      setSearchTimeout(timeout);
    } else {
      setIsSearching(false);
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    }
  }, [debouncedValue]);

  useEffect(() => {
    if (inView && !isSearching && !isSearchFetching) {
      fetchNextPage();
    }
  }, [inView, isSearching, isSearchFetching]);

  if (!posts) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    )
  }

  const postsWithImages = posts.pages.flatMap(page => page.documents.filter((post: { imageUrl: string; }) => post.imageUrl && post.imageUrl !== 'https://example.com/default-image.jpg'));
  const followedPostsWithImages = followedPosts ? followedPosts.documents.flatMap(page => page.filter((post: { imageUrl: string; }) => post.imageUrl && post.imageUrl !== 'https://example.com/default-image.jpg')) : [];

  const filteredPosts = postType === 'recursos' ? postsWithImages.filter(post => post.isResource) : postsWithImages;
  const filteredFollowedPosts = postType === 'recursos' ? followedPostsWithImages.filter(post => post.isResource) : followedPostsWithImages;

  const shouldShowSearchResults = searchValue !== '';
  const shouldShowPosts = !shouldShowSearchResults && filteredPosts.length === 0 && posts.pages.every((item) => item.documents.length === 0);
  const shouldShowFollowedPosts = filterOption === 'seguidos' && filteredFollowedPosts;

  const showLoader = hasNextPage && !isSearchFetching && (filterOption === 'seguidos' && followedPostsWithImages.length > 0) || filterOption === 'todos';

  return (
    <div className="explore-container">
      <div className="explore-inner_container">
        <div className="flex justify-between items-center w-full">
          <h2 className="h3-bold md:h2-bold">Explorar</h2>
          <Select onValueChange={setFilterOption} defaultValue={filterOption}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filtrar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="seguidos">Seguidos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-1 px-4 w-full rounded-lg bg-dark-4 mt-4">
          <img src="/assets/icons/search.svg" width={24} height={24} alt='search' />
          <Input
            type="text"
            placeholder="Escribe lo que te interesa encontrar"
            className="explore-search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-between w-full max-w-5xl mt-16 mb-7">
        <h3 className="body-bold md:h3-bold">Trending Ahora</h3>
        <Select onValueChange={setPostType} defaultValue={postType}>
          <SelectTrigger className="flex-center gap-3 bg-dark-3 rounded-xl px-4 py-2 cursor-pointer w-[160px]">
            <SelectValue placeholder="Posts" />
            <img src="/assets/icons/filter.svg" width={20} height={20} alt="filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="posts">Posts</SelectItem>
            <SelectItem value="recursos">Recursos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-9 w-full max-w-5xl">
        {shouldShowSearchResults ? (
          <SearchResults isSearchFetching={isSearchFetching} searchedPosts={searchedPostsWithImages} />
        ) : shouldShowFollowedPosts ? (
          filteredFollowedPosts.length ? (
            filteredFollowedPosts.map((post: any, index: number) => (
              <GridPostList key={`followed-post-${index}`} posts={[post]} />
            ))
          ) : (
            <p className="text-light-4 mt-10 text-center w-full">No estás siguiendo a nadie aún o tus seguidos no tienen publicaciones.</p>
          )
        ) : shouldShowPosts ? (
          <p className="text-light-4 mt-10 text-center w-full">Has llegado al final</p>
        ) : (
          posts.pages.map((item, index) => (
            <GridPostList key={`page-${index}`} posts={filteredPosts} />
          ))
        )}
      </div>
      {showLoader && !isSearching && (
        <div ref={ref} className="mt-10">
          <Loader />
        </div>
      )}
    </div>
  )
}

export default Explore;
