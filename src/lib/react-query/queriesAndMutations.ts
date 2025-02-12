import {
    useQuery,
    useMutation,
    useQueryClient,
    useInfiniteQuery,
} from '@tanstack/react-query'
import {
    createUserAccount,
    signInAccount,
    getCurrentUser,
    signOutAccount,
    createPost,
    getRecentPosts,
    likePost,
    savePost,
    deleteSavedPost,
    getPostById,
    updatePost,
    deletePost,
    searchPosts,
    getInfinitePosts,
    getUsers,
    searchUsers,
    getUserById,
    searchPostsWithImages,
    getFollowedPosts,
    isFollowing,
    getFileDownload,
    createTransaction,
    getTransactionsFromPostAndUser,
} from '../appwrite/api'
import { INewPost, INewUser, IUpdatePost } from "@/types";
import { QUERY_KEYS } from './queryKeys';


export const useCreateUserAccount = () => {
    return useMutation({
        mutationFn: (user: INewUser) => createUserAccount(user)
    })
}

export const useGetFileDownload = () => {
    return useMutation({
        mutationFn: async (fileId: string) => {
            if (!fileId) throw new Error('File ID is required');

            // Llama a la función correspondiente según el tipo de archivo
            const result = await getFileDownload(fileId);

            if (!result) throw new Error('No data received');

            return result;
        },
        onSuccess: (data) => {
            console.log('Archivo o imagen descargado exitosamente', data);
        },
        onError: (error) => {
            console.log('Error al descargar el archivo o imagen', error);
        },
    });
};

export const useSignInAccount = () => {
    return useMutation({
        mutationFn: (user: { email: string; password: string; }) => signInAccount(user)
    })
}

export const useSignOutAccount = () => {
    return useMutation({
        mutationFn: signOutAccount
    });
}

export const useCreatePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (post: INewPost) => createPost(post),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
            })
        }
    })

}

export const useGetRecentPosts = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
        queryFn: getRecentPosts,
    })
}

export const useGetFollowedPosts = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_FOLLOWED_POSTS],
        queryFn: getFollowedPosts,
    });
};

export const useLikePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, likesArray }: { postId: string; likesArray: string[] }) => likePost(postId, likesArray),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id]
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POSTS]
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER]
            })
        }
    })

}

export const useSavePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ postId, userId }: { postId: string; userId: string }) => {
            // Llama a la función savePost y espera su respuesta
            return await savePost(postId, userId);
        },
        onSuccess: () => {
            // Invalidar consultas para asegurar que los datos sean actualizados
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_RECENT_POSTS] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_POSTS] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_CURRENT_USER] });
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            // Manejar errores aquí si es necesario
            console.error('Error saving post:', error);
        },
        // Puedes agregar configuraciones adicionales aquí si es necesario
    });
};
export const useDeleteSavedPost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (savedRecordId: string) => deleteSavedPost(savedRecordId),
        onMutate: () => {
            // Opcional: Puedes realizar una actualización optimista aquí
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_RECENT_POSTS] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_POSTS] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_CURRENT_USER] });
        },
        onError: (error) => {
            // Manejo de errores si es necesario
            console.error('Error deleting saved post:', error);
        },
        onSettled: () => {
            // Puedes usar esto para realizar acciones una vez que la mutación se haya completado (ya sea con éxito o error)
        },
    });
};


export const useGetCurrentUser = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
        queryFn: getCurrentUser,
    });
};

export const useGetPostById = (postId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
        queryFn: () => getPostById(postId),
        enabled: !!postId,
    })
}

export const useUpdatePost = () => {
    useQueryClient();
    return useMutation({
        mutationFn: (post: IUpdatePost) => updatePost(post),
        onSuccess: (data) => {
            [QUERY_KEYS.GET_POST_BY_ID, data?.$id]
        }
    })
}

export const useDeletePost = () => {
    useQueryClient();
    return useMutation({
        mutationFn: ({ postId, imageId }: { postId: string, imageId: string }) => deletePost(postId, imageId),
        onSuccess: () => {
            [QUERY_KEYS.GET_RECENT_POSTS]
        }
    })
}


export const useGetPosts = () => {
    return useInfiniteQuery({
        queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        queryFn: getInfinitePosts as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getNextPageParam: (lastPage: any) => {
            // If there's no data, there are no more pages.
            if (lastPage && lastPage.documents.length === 0) {
                return null;
            }

            // Use the $id of the last document as the cursor.
            const lastId = lastPage.documents[lastPage.documents.length - 1].$id;
            return lastId;
        },
        initialPageParam: 0,

    });
};


export const useSearchPosts = (searchTerm: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.SEARCH_POSTS, searchTerm],
        queryFn: () => searchPosts(searchTerm),
        enabled: !!searchTerm,
    })
}

export const useSearchPostsWithImages = (searchTerm: string) => {

    return useQuery({
        queryKey: [QUERY_KEYS.SEARCH_POSTS_WITH_IMAGES, searchTerm],
        queryFn: () => searchPostsWithImages(searchTerm),
        enabled: !!searchTerm,
    })

}

export const useGetUsers = (limit?: number) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_USERS],
        queryFn: () => getUsers(limit),
    });
};

export const useSearchUsers = (searchTerm: string) => {
    return useQuery({
        queryKey: ['searchUsers', searchTerm],
        queryFn: () => searchUsers(searchTerm),
        enabled: !!searchTerm, // Solo ejecuta la consulta si searchTerm no está vacío
    });
};

export const useGetUserById = (userId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
        queryFn: () => getUserById(userId),
        enabled: !!userId,
    });
};

export const useIsFollowing = (followerUsername: string, followedUsername: string) => {

    return useQuery({
        queryKey: [QUERY_KEYS.IS_FOLLOWING, followerUsername, followedUsername],
        queryFn: () => isFollowing(followerUsername, followedUsername),
        enabled: !!followerUsername && !!followedUsername,
    });

}





export const useCreateTransaction = (postId: string, userId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => createTransaction(postId, userId),
        onSuccess: () => {
            // Invalida la caché para que los datos se actualicen después de la creación
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_TRANSACTIONS_FROM_POST_AND_USER, postId, userId],
            });
            // Puedes agregar más lógica aquí, por ejemplo, mostrar un mensaje de éxito
        },
        onError: (error) => {
            // Manejo de errores, puedes mostrar un mensaje de error o algo similar
            console.error('Error creando la transacción:', error);
        },
    });
};


export const useGetTransactionsFromPostAndUser = (postId: string, userId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_TRANSACTIONS_FROM_POST_AND_USER, postId, userId],
        queryFn: () => getTransactionsFromPostAndUser(postId, userId),
        enabled: !!postId && !!userId,
    });
}