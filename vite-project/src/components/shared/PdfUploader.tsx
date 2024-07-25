import { useCallback, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";

import { Button } from "../ui/button";
import { convertFileToUrl } from "@/lib/utils";

type PdfUploaderProps = {
  fieldChange: (files: File[]) => void;
  mediaUrl: string;
};

const PdfUploader = ({ fieldChange, mediaUrl }: PdfUploaderProps) => {
  const [file, setFile] = useState<File[]>([]);
  const [fileUrl, setFileUrl] = useState<string>(mediaUrl);

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      setFile(acceptedFiles);
      fieldChange(acceptedFiles);
      // Set a URL for the PDF, if necessary
      setFileUrl(convertFileToUrl(acceptedFiles[0]));
    },
    [fieldChange]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className="flex flex-center flex-col bg-dark-3 rounded-xl cursor-pointer">
      <input {...getInputProps()} className="cursor-pointer" />

      {fileUrl ? (
        <div className="flex flex-1 justify-center w-full p-5 lg:p-10">
          <div className="flex flex-col items-center">
            <img
              src="/assets/icons/pdf-icon.svg"
              width={96}
              height={96}
              alt="PDF"
            />
            <p className="file_uploader-label">PDF Subido</p>
          </div>
        </div>
      ) : (
        <div className="file_uploader-box">
          <img
            src="/assets/icons/file-upload.svg"
            width={96}
            height={77}
            alt="file upload"
          />

          <h3 className="base-medium text-light-2 mb-2 mt-6">
            Arrastrar PDF aquí
          </h3>
          <p className="text-light-4 small-regular mb-6">PDF Only</p>

          <Button type="button" className="shad-button_dark_4">
            Seleccionar desde el ordenador
          </Button>
        </div>
      )}
    </div>
  );
};

export default PdfUploader;
