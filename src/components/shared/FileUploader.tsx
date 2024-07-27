import { useCallback, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";

import { Button } from "../ui/button";
import { convertFileToUrl } from "@/lib/utils";
import { z, ZodPipeline } from "zod";
import { RadioReceiver } from "lucide-react";
import { useToast } from "../ui/use-toast";

type FileUploaderProps = {
  fieldChange: (files: File[]) => void;
  mediaUrl: string;
};

const FileUploader = ({ fieldChange, mediaUrl }: FileUploaderProps) => {
  const [file, setFile] = useState<File[]>([]);
  const [fileUrl, setFileUrl] = useState<string>(mediaUrl);
  const maxSize = 3 * 1024 * 1024;
  const { toast} = useToast()

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
        const validFiles = acceptedFiles.filter(file => {
            if (file.size > maxSize) {
              return toast({
                title: "El tamaño del archivo no puede ser superior a 3 MB"
              }) && false;
            }
            return true;
          });

          if (validFiles.length > 0) {
            setFile(validFiles);
            fieldChange(validFiles);
            setFileUrl(convertFileToUrl(validFiles[0]));
          }

    },
    [file]
  );

  
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpeg", ".jpg"],
    },
  });
  

  return (
    <div
      {...getRootProps()}
      className="flex flex-center flex-col bg-dark-3 rounded-xl cursor-pointer">
      <input {...getInputProps()} className="cursor-pointer" />

      {fileUrl ? (
        <>
          <div className="flex flex-1 justify-center w-full p-5 lg:p-10">
            <img src={fileUrl} alt="image" className="file_uploader-img" />
          </div>
          <p className="file_uploader-label">Importa una foto de portada</p>
        </>
      ) : (
        <div className="file_uploader-box ">
          <img
            src="/assets/icons/file-upload.svg"
            width={96}
            height={77}
            alt="file upload"
          />

          <h3 className="base-medium text-light-2 mb-2 mt-6">
            Arrastra tu foto aquí
          </h3>
          <p className="text-light-4 small-regular mb-6">SVG, PNG, JPG</p>

          <Button type="button" className="shad-button_dark_4">
            Subir desde tu computadora
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
