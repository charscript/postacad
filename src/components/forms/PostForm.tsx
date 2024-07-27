import * as z from "zod";
import { Models } from "appwrite";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { PostValidation } from "@/lib/validation";
import { useToast } from "@/components/ui/use-toast";
import { useUserContext } from "@/context/AuthContext";
import FileUploader from "../shared/FileUploader";
import Loader from "@/components/shared/loader";
import { useCreatePost, useUpdatePost } from "@/lib/react-query/queriesAndMutations";
import { Checkbox } from "../ui/checkbox";
import PdfUploader from "../shared/PdfUploader";
import { useState } from "react";

type PostFormProps = {
  post?: Models.Document;
  action: "Create" | "Update";
  type: "Post" | "Resource";
};

const PostForm = ({ post, action, type }: PostFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUserContext();

  const { mutateAsync: createPost, isPending: isLoadingCreate } = useCreatePost();
  const { mutateAsync: updatePost, isPending: isLoadingUpdate } = useUpdatePost();

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [isFree, setIsFree] = useState<boolean>(post ? post.price === 0 : true);

  const form = useForm<z.infer<typeof PostValidation>>({
    resolver: zodResolver(PostValidation),
    defaultValues: {
      caption: post ? post?.caption : "",
      file: [],
      location: post ? post.location : "",
      tags: post ? post.tags.join(",") : "",
      isResource: type === "Resource",
      price: post ? post?.price : 0,
      availability: post ? post?.availability : true,
      description: post ? post?.description : "",
      resourceType: post ? post?.resourceType : "",
      downloadUrl: post ? post?.downloadUrl : "https://example.com/file.pdf",
    },
  });


  const handleSubmit = async (value: z.infer<typeof PostValidation>) => {
    const allFiles = [...imageFiles, ...pdfFiles];

    const postData = {
      ...value,
      price: isFree ? 0 : value.price,
    };

    // ACTION = UPDATE
    if (post && action === "Update") {
      const updatedPost = await updatePost({
        ...postData,
        postId: post.$id,
        imageId: post.imageId,
        imageUrl: post.imageUrl,
        file: allFiles,
      });

      if (!updatedPost) {
        toast({ title: "Error al actualizar el post", description: "Intente nuevamente" });
      }
      return navigate(`/posts/${post.$id}`);
    }

    // ACTION = CREATE
    const newPost = await createPost({
      ...postData,
      userId: user.id,
      file: allFiles,
    });

    if (!newPost) {
      toast({
        title: "Error al crear el post",
        description: "Intente nuevamente"
      });
    }
    navigate("/");
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-9 w-full max-w-5xl">
        <FormField
          control={form.control}
          name="caption"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Texto</FormLabel>
              <FormControl>
                <Textarea
                  className="shad-textarea custom-scrollbar"
                  placeholder="Escribe aquí el texto que quieres compartir..."
                  {...field}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Agregar Fotos</FormLabel>
              <FormControl>
                <FileUploader
                  fieldChange={setImageFiles}
                  mediaUrl={post?.imageUrl}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Agregar Ubicación</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">
                ${'Agregar Tags (separados por coma " , ")'}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Calculo, Algebra, Teoria de Números..."
                  type="text"
                  className="shad-input"
                  {...field}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        {type === "Resource" && (
          <>
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Agregar Archivos</FormLabel>
                  <FormControl>
                    <PdfUploader
                      fieldChange={setPdfFiles}
                      mediaUrl={post?.downloadUrl}
                    />
                  </FormControl>
                  <FormMessage className="shad-form_message" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">¿Es gratuito?</FormLabel>
                  <FormControl>
                    <Checkbox
                      checked={isFree}
                      onCheckedChange={(checked) => {
                        setIsFree(checked === true); // Asegurando que el valor sea booleano
                        if (checked === true) form.setValue("price", 0);
                      }}
                    />
                  </FormControl>
                  <FormMessage className="shad-form_message" />
                </FormItem>
              )}
            />

            {!isFree && (
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="shad-form_label">Precio</FormLabel>
                    <FormControl>
                      <Input type="number" className="shad-input" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage className="shad-form_message" />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="availability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Disponibilidad</FormLabel>
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormMessage className="shad-form_message" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resourceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Tipo de Recurso</FormLabel>
                  <FormControl>
                    <Input type="text" className="shad-input" {...field} />
                  </FormControl>
                  <FormMessage className="shad-form_message" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Descripción</FormLabel>
                  <FormControl>
                    <Textarea className="shad-textarea custom-scrollbar" {...field} />
                  </FormControl>
                  <FormMessage className="shad-form_message" />
                </FormItem>
              )}
            />
          </>
        )}

        <div className="flex gap-4 items-center justify-end">
          <Button
            type="button"
            className="shad-button_dark_4"
            onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button
            type="submit"
            className="shad-button_primary whitespace-nowrap"
            disabled={isLoadingCreate || isLoadingUpdate}>
            {(isLoadingCreate || isLoadingUpdate) && <Loader />}
            {action} Subir
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PostForm;
