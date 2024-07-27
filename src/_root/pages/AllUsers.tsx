import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useGetUsers, useSearchUsers } from '@/lib/react-query/queriesAndMutations';
import { Loader } from 'lucide-react';
import UserCard from '@/components/shared/UserCard';
import { Input } from '@/components/ui/input';
import useDebounce from '@/hooks/useDebounce';

const AllUsers = () => {
  const { toast } = useToast();
  const { data: creators, isLoading, isError: isErrorCreators } = useGetUsers();
  const [searchValue, setSearchValue] = useState('');
  const debouncedValue = useDebounce(searchValue, 500);
  const { data: searchedUsers, isFetching: isSearchFetching, isError: isErrorSearch } = useSearchUsers(debouncedValue);

  useEffect(() => {
    console.log('Searched Users:', searchedUsers);
  }, [searchedUsers]);

  if (isErrorCreators || isErrorSearch) {
    toast({ title: "Error al obtener usuarios", description: "Intente nuevamente" });
    return null;
  }

  const usersToDisplay = debouncedValue !== '' ? searchedUsers?.documents : creators?.documents;

  return (
    <div className="common-container">
      <div className="user-container">
        <h2 className="h3-bold md:h2-bold text-left w-full">
          Todos los usuarios
        </h2>

        <div className="flex gap-1 px-4 w-full rounded-lg bg-dark-4">
          <img src="/assets/icons/search.svg" width={24} height={24} alt='search' />
          <Input
            type="text"
            placeholder="Buscar usuarios"
            className="explore-search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>

        {isLoading || isSearchFetching ? (
          <div className="flex-center w-full h-full">
            <Loader />
          </div>
        ) : (
          <ul className="user-grid">
            {usersToDisplay?.map((user) => (
              <li key={user?.$id} className="flex-1 min-w-[200px] w-full">
                <UserCard user={user} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AllUsers;
