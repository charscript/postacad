import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ConditionPostForm = () => {
  const navigate = useNavigate();

  const handleSelection = (selection: "Post" | "Resource") => {
    if (selection === "Post") {
      navigate("/create-post");
    } else if (selection === "Resource") {
      navigate("/create-resource");
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center h-screen">
      <div className="common-container">
        <div className="max-w-5xl flex flex-col items-center justify-center w-full gap-6">
          <img src="/assets/icons/add-post.svg" width={36} height={36} alt="add-post" />
          <h2 className="h3-bold md:h2-bold text-center w-full">
            ¿Qué deseas crear?
          </h2>
          <div className="flex flex-col items-center justify-center gap-4">
            <Button
              type="button"
              className="shad-button_primary w-64"
              onClick={() => handleSelection("Post")}
            >
              Crear un Post
            </Button>
            <Button
              type="button"
              className="shad-button_dark_4 w-64"
              onClick={() => handleSelection("Resource")}
            >
              Subir un Recurso
            </Button>

            <Button
              type="button"
              className="shad-button_light w-64"
              onClick={() => navigate(-1)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConditionPostForm;