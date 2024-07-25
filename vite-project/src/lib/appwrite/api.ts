import { ID, ImageGravity, Query} from "appwrite";
import { INewUser, INewPost, IUpdatePost } from "@/types";
import { account, appwriteConfig, avatars, databases, storage } from "./config";
import { stat } from "fs";

export async function createUserAccount(user: INewUser) {
    try {
        const newAccount = await account.create(
            ID.unique(),
            user.email,
            user.password,
            user.name,

        );
        if(!newAccount) throw Error;
        
        const avatarUrl = avatars.getInitials(user.name);
        const newUser = await saveUserToDB({
            accountId: newAccount.$id,
            name: newAccount.name,
            email: newAccount.email,
            username: user.username,
            imageUrl: avatarUrl,

        });

        return newUser;
    } catch (error) {
        console.log(error)
        return error;
    }
}

export async function saveUserToDB(user : {
    accountId: string;
    email: string;
    name: string;
    imageUrl: URL;
    username?: string;

}) {
    try {
        const newUser = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            user,
        )

        return newUser;
    } catch (error) {
        console.log(error)
        
    }
}

export async function signInAccount(user: { email: string; password: string;}){
    try {
        const session = await account.createEmailPasswordSession(user.email, user.password);
        return session;
    } catch (error) {
        console.log(error)
    }
}

export async function getCurrentUser() {
    try {
        const currentAccount = await account.get();

        if(!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )
        if(!currentUser) throw Error;

        return currentUser.documents[0];
    } catch (error) {
        console.log(error)
    }
}

export async function signOutAccount() {
    try {
        const session = await account.deleteSession("current");
        return session;
    } catch (error) {
        console.log(error);
    }
}

export async function createPost(post: INewPost) {
    try {
        let fileUrl = 'https://example.com/default-image.jpg';
        let imageId = '';
        let downloadUrl = 'https://example.com/default-image.jpg';
        let fileId = '';
        let imageUrl = 'https://example.com/default-image.jpg';

        const files = post.file;

        if (files.length > 0) {
            for (const file of files) {
                // Upload file to storage
                const uploadedFile = await uploadFile(file);
                if (!uploadedFile) {
                    throw Error;
                }

                const fileMimeType = uploadedFile.mimeType;
                let previewUrl;
                let downloadUrl;
                if (fileMimeType === 'application/pdf') {
                    // Handle PDF file

                    downloadUrl = await getFilePreview(uploadedFile.$id);
                     // Store the file ID for download
                    if (downloadUrl) {
                        fileUrl = downloadUrl.toString();
                        fileId = uploadedFile.$id;
                    } else {
                        await deleteFile(fileId);
                        throw Error;
                    }
                } else if (fileMimeType.startsWith('image/')) {
                    // Handle image file
                    previewUrl = await getFilePreview(uploadedFile.$id);
                    if (previewUrl) {
                        imageUrl = previewUrl.toString();
                        imageId = uploadedFile.$id;
                    } else {
                        await deleteFile(uploadedFile.$id);
                        throw Error;
                    }
                } else {
                    await deleteFile(uploadedFile.$id);
                    throw new Error('Unsupported file type');
                }
            }
        } else {
            // Use a default image URL or a placeholder image
            fileUrl = 'https://example.com/default-image.jpg';
            imageUrl = 'https://example.com/default-image.jpg';

        }

        const tags = post.tags?.replace(/ /g, "").split(",") || [];
        const newPost = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            ID.unique(),
            {
                creator: post.userId,
                caption: post.caption,
                imageUrl: imageUrl,
                imageId: imageId,
                location: post.location,
                tags: tags,
                isResource: post.isResource || false,
                price: post.price || 0,
                availability: post.availability || true,
                description: post.description || '',
                resourceType: post.resourceType || '',
                downloadUrl: fileUrl,
                fileId: fileId || ''
            }
        );

        if (!newPost) {
            if (imageId) {
                await deleteFile(imageId);
            }
            throw Error;
        }

        return newPost;
    } catch (error) {
        console.log(error);
    }
}

export async function uploadFile(file: File) {
try {
    const uploadedFile = await storage.createFile(
        appwriteConfig.storageId,
        ID.unique(),
        file
    );

    return uploadedFile;
} catch (error) {
    console.log(error)
}
}

export function getFilePreview(fileId: string) {
    try {
        const fileUrl = storage.getFilePreview(
            appwriteConfig.storageId,
            fileId,
            2000,
            2000,
            ImageGravity.Top,
            100,
        )
        if(!fileUrl) throw Error;
        return fileUrl;
    } catch (error) {
        console.log(error)
    }

}
export async function deleteFile(fileId: string) {
    try {
        await storage.deleteFile(appwriteConfig.storageId, fileId);
        return { status: "ok" };
    } catch (error) {
        console.log(error)
    }
}

export async function getRecentPosts() {
    try{
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            [Query.orderDesc('$createdAt'), Query.limit(20)]
        )
    
        if(!posts) throw Error;
        return posts;
    } catch (error) {
        console.log(error)
    }
    
}

export async function likePost(postId: string, likesArray: string[]){
    try {
        const updatedPost = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId,
            {
                likes: likesArray,
            }
        )

        if(!updatedPost) throw Error;

        return updatedPost;
    } catch (error) {
        console
    }
}

export async function savePost(postId: string, userId: string){
    try {
        const updatedPost = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            ID.unique(),
            {
                user: userId,
                post: postId,
            }
        )
        
        if(!updatedPost) throw Error;

        return updatedPost;
    } catch (error) {
        console
    }
}

export async function deleteSavedPost(savedRecordId: string){
    try {
        const statusCode = await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            savedRecordId,
        )
        
        if(!statusCode) throw Error;

        return {status: "ok"};
    } catch (error) {
        console
    }
}

export async function getPostById(postId: string){
    try {
        const post = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId
        )

        return post;
    } catch (error) {
        console.log(error)
    }
}

export async function updatePost(post : IUpdatePost){
    try {
        const hasFileToUpdate = post.file.length > 0;

        try {
            let image = {
                imageUrl: post.imageUrl,
                imageId: post.imageId,
            }

            if(hasFileToUpdate){
                const uploadedFile = await uploadFile(post.file[0]);
                if(!uploadedFile) throw Error;
                
                //Upload image to storage.
        
                const fileUrl = getFilePreview(uploadedFile.$id);
                if(!fileUrl){
                    deleteFile(uploadedFile.$id);
                    throw Error;
                }
                image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id}
            }

            const tags = post.tags?.replace(/ /g, "").split(",") || [];
            const updatedPost = await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.postCollectionId,
                post.postId,
                {
                    caption: post.caption,
                    imageUrl: image.imageUrl,
                    imageId: image.imageId,
                    location: post.location,
                    tags: tags,
                }
            )
            if(!updatedPost){
                await deleteFile(post.imageId);
                throw Error;
            }
            return updatedPost;
    
        } catch (error) {
            console.log(error)
        }
    } catch (error) {
        console.log(error);
    }
}

export async function deletePost(postId: string, imageId: string){
    if(!postId || !imageId) throw Error;

    try {
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId
        )

        return {status: "ok"}
    } catch (error) {
        console.log(error);
    }
}

// export async function getInfinitePosts({pageParam} : {pageParam: number}){
//     const queries: any[] = [Query.orderDesc(`$updatedAt`), Query.limit(10)]
//     if(pageParam){
//         queries.push(Query.cursorAfter(pageParam.toString()));
//     }

//     try {
//         const posts = await databases.listDocuments(
//             appwriteConfig.databaseId,
//             appwriteConfig.postCollectionId,
//             queries
//         )

//         if(!posts) throw Error;

//         return posts;
//     } catch (error) {
//         console.log(error)
//     }
// }

export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
    const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(9)];
  
    if (pageParam) {
      queries.push(Query.cursorAfter(pageParam.toString()));
    }
  
    try {
      const posts = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        queries
      );
  
      if (!posts) throw Error;
  
      return posts;
    } catch (error) {
      console.log(error);
    }
  }
  

export async function searchPosts(searchTerm: string){
    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            [Query.search('caption', searchTerm)],
            
        )

        if(!posts) throw Error;

        return posts;
    } catch (error) {
        console.log(error)
    }
}

export async function searchPostsWithImages(searchTerm: string){
    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            [Query.and([Query.search('caption', searchTerm), Query.notEqual('imageUrl', 'https://example.com/default-image.jpg')])],
        )
        if(!posts) throw Error;

        return posts;
    } catch (error) {
        console.log(error);
    }
}

export async function getUsers(limit?: number) {
    const queries: any[] = [Query.orderDesc("$createdAt")];
  
    if (limit) {
      queries.push(Query.limit(limit));
    }
  
    try {
      const users = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        queries
      );
  
      if (!users) throw Error;
  
      return users;
    } catch (error) {
      console.log(error);
    }
  }

  export async function searchUsers(searchTerm: string) {
    try {
        if (!searchTerm) {
            return { documents: [], total: 0 };
        }

        const users = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.search('username', searchTerm)]
        );

        if (!users) throw Error;

        return users;
    } catch (error) {
        console.log(error);
        return { documents: [], total: 0 };
    }
}

export async function getUserById(userId: string) {
    try {
      const user = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        userId
      );
  
      if (!user) throw Error;
  
      return user;
    } catch (error) {
      console.log(error);
    }
  }

  /////////parte a prueba!!!!!!!!!!!!!!!!!!!!!!!!!!!

// Función para seguir a un usuario
// Función para seguir a un usuario
export async function followUser(followerUsername: string, followedUsername: string) {
    try {
      // Crear documento de seguimiento
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.followsCollectionId,
        ID.unique(),
        { followerUsername, followedUsername, createdAt: new Date() }
      );
    } catch (error) {
      console.log(error);
    }
  }
  
  export async function unfollowUser(followerUsername: string, followedUsername: string) {
    try {
      // Buscar documento de seguimiento
      const follows = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.followsCollectionId,
        [Query.equal('followerUsername', followerUsername), Query.equal('followedUsername', followedUsername)]
      );
  
      // Si se encuentra el seguimiento, eliminarlo
      if (follows.documents.length > 0) {
        await databases.deleteDocument(
          appwriteConfig.databaseId,
          appwriteConfig.followsCollectionId,
          follows.documents[0].$id
        );
      }
    } catch (error) {
      console.log(error);
    }
  }
  
  export async function getFollowersCount(username: string) {
    try {
      const follows = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.followsCollectionId,
        [Query.equal('followedUsername', username)]
      );
      return follows.total;
    } catch (error) {
      console.log(error);
      return 0;
    }
  }
  
  export async function getFollowingCount(username: string) {
    try {
      const follows = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.followsCollectionId,
        [Query.equal('followerUsername', username)]
      );
      return follows.total;
    } catch (error) {
      console.log(error);
      return 0;
    }
  }
