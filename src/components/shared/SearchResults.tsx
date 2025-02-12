import { Models } from 'appwrite';
import Loader from './loader';
import GridPostList from './GridPostList';

type SearchResultProps = {
  isSearchFetching: boolean;
  searchedPosts: Models.DocumentList<Models.Document> | undefined;
}

const SearchResults = ({ isSearchFetching, searchedPosts }: SearchResultProps) => {
  if (isSearchFetching) return <Loader />;

  if (searchedPosts && searchedPosts.documents.length > 0) {
    return (
      <GridPostList posts={searchedPosts.documents} />
    );
  }
  return (
    <p className="text-light-4 mt-10 text-center w-full">No se han encontrado resultados.</p>
  )
}

export default SearchResults