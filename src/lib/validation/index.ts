
import { z } from "zod"

export const SignupValidation = z.object({
    name: z.string().min(2, { message: "El nombre es muy corto (Min. 2 caracteres)." }).max(50, { message: "El nombre es muy largo (Max. 50 caracteres)." }),
    username: z.string().min(2, { message: "El nombre de usuario es muy corto (Min. 2 caracteres)." }).max(50, { message: "El nombre de usuario es muy largo (Max. 50 caracteres)." }),
    email: z.string().email({ message: "El email no es valido." }),
    password: z.string().min(8, { message: "La contraseña es muy corta (Min. 8 caracteres)." }).max(50, { message: "La contraseña es muy larga (Max. 50 caracteres)." }),
})

export const SigninValidation = z.object({
    email: z.string().email({ message: "El email no es valido." }),
    password: z.string().min(8, { message: "La contraseña es muy corta (Min. 8 caracteres)." }).max(50, { message: "La contraseña es muy larga (Max. 50 caracteres)." }),
})

export const PostValidation = z.object({
    caption: z.string().max(2200, { message: "El texto es muy largo (Max. 2200 caracteres)." }),
    file: z.custom<File[]>(),
    location: z.string().max(100).optional(),
    tags: z.string().optional(),
    isResource: z.boolean().default(false),
    price: z.number().optional(),
    availability: z.boolean().default(true),
    description: z.string().optional(),
    resourceType: z.string().optional(),
    downloadUrl: z.string().url().optional(),
}).refine(data => data.caption || (data.file && data.file.length > 0), {
    message: "El texto y el archivo no pueden estar vacíos al mismo tiempo",
    path: ["caption"], // You can set this to any field you want to highlight the error
});