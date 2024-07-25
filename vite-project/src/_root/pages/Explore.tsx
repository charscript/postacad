import GridPostList from '@/components/shared/GridPostList';
import SearchResults from '@/components/shared/SearchResults';
import { Input } from '@/components/ui/input'
import useDebounce from '@/hooks/useDebounce';
import { useGetPosts, useSearchPosts, useSearchPostsWithImages } from '@/lib/react-query/queriesAndMutations';
import React, { useState, useEffect} from 'react'
import Loader from '@/components/shared/loader';
import { useInView } from 'react-intersection-observer';


const Explore = () => {
  const {ref, inView} = useInView();
  const {data: posts, fetchNextPage, hasNextPage} = useGetPosts();

  const [searchValue, setSearchValue] = useState('');
  const debouncedValue = useDebounce(searchValue, 500);
  /*const { data: searchedPosts, isFetching: isSearchFetching} = useSearchPosts(debouncedValue);*/
  const { data: searchedPostsWithImages, isFetching: isSearchFetching} = useSearchPostsWithImages(debouncedValue);

  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {

    if (debouncedValue !== '') {
      setIsSearching(true);
      console.log("set is searching true");
      if (searchTimeout) {
        clearTimeout(searchTimeout);
        console.log("cleartimeout");
      }
      const timeout = setTimeout(() => {
        setIsSearching(false);
        console.log("set is searching false");

      }, 4000); // Cambia 1000 por el tiempo de espera deseado en milisegundos
      setSearchTimeout(timeout);
      console.log("set timeout");

    } else {
      setIsSearching(false);
      console.log("set is searching false");

      if (searchTimeout) {
        clearTimeout(searchTimeout);
        console.log("cleartimeout");
      }
    }
  }, [debouncedValue]);

  useEffect(() => {
    if(inView){
      console.log("ïn view");
    }
    if(!isSearching){
      console.log("no is searching");
    }
    if (inView && !isSearching && !isSearchFetching) {
      console.log("LLEGUE papito rico");
      fetchNextPage();
    }
  }, [inView, isSearching, isSearchFetching])

  if(!posts) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    )
  }

  const postsWithImages = posts.pages.flatMap(page => page.documents.filter((post: { imageUrl: string; }) => post.imageUrl && post.imageUrl !== 'https://example.com/default-image.jpg' )); 

  const shouldShowSearchResults = searchValue !== '';
  const shouldShowPosts = !shouldShowSearchResults && postsWithImages.length === 0 && posts.pages.every((item) => item.documents.length === 0);
  return (
    <div className="explore-container">
      <div className="explore-inner_container">
        <h2 className="h3-bold md:h2-bold w-full">
          Explorar
        </h2>
        <div className="flex gap-1 px-4 w-full rounded-lg bg-dark-4">
          <img
            src="/assets/icons/search.svg"
            width={24}
            height={24}
            alt='search'
          />
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
        <div className="flex-center gap-3 bg-dark-3 rounded-xl px-4 py-2 cursor-pointer">
          <p className="small-medium md:base-medium text-light-2">
            Todos
          </p>
          <img 
            src="/assets/icons/filter.svg"
            width={20}
            height={20}
            alt="filter"  
          />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-9 w-full max-w-5xl ">
        {shouldShowSearchResults ? (
          
          <SearchResults 
            isSearchFetching={isSearchFetching}
            searchedPosts={searchedPostsWithImages}
          />
        ) : shouldShowPosts ? (
          <p className="text-light-4 mt-10 text-center w-full">
            Has llegado al final
          </p>
        ) : (posts.pages.map((item, index) => (
          <GridPostList key={`page-${index}`} posts={postsWithImages} />
        ))
      )}
      </div>
      {hasNextPage && !isSearchFetching && (
        <div ref={ref} className="mt-10">
          <Loader />
        </div>
      )}
    </div>
  )
}

export default Explore