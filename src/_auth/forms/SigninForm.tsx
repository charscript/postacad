import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import Loader from "@/components/shared/loader"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { SigninValidation } from "@/lib/validation"
import { Link, useNavigate } from "react-router-dom"
import { useSignInAccount } from "@/lib/react-query/queriesAndMutations"
import { useUserContext } from "@/context/AuthContext"

const SignInForm = () => {

  const { toast} = useToast()
  const { checkAuthUser, isLoading: isUserLoading} = useUserContext();
  const navigate = useNavigate()

  const { mutateAsync: signInAccount} = useSignInAccount();
  // 1. Define your form.
  const form = useForm<z.infer<typeof SigninValidation>>({
    resolver: zodResolver(SigninValidation),
    defaultValues: {
      email: '',
      password: '',
    },
  })
 
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof SigninValidation>) {
    const session = await signInAccount({
      email: values.email,
      password: values.password,
    }) 
    if(!session){
      return toast({
        title: "Inicio de sesión fallido, por favor intentalo de nuevo"
      })
    }
    const isLoggedIn = await checkAuthUser();

    if(isLoggedIn){
      form.reset();
      navigate("/")
    } else {
      return toast({ title: "Inicio de sesion fallido, por favor intentalo de nuevo" })
    }
  }

  return (
    
    <Form {...form}>

      <div className="sm:w-420 flex-center flex-col">
        <img src="/assets/images/logo.svg" alt="logo" />


        <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">Inicia sesión en tu cuenta</h2>
        <p className="text-light-3 small-medium md:base-regular mt-8 mb-5">Bienvenido! Por favor, introduce tus credenciales</p>
      



        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full mt-4">
          <FormField
            control={form.control}
            name="email"
            rules={{ required: true, pattern: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ }}
            shouldUnregister
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" className="shad-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            shouldUnregister
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" className="shad-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="shad-button_primary mt-10">
            {isUserLoading ? (
              <div className="flex-center gap-2">
                <Loader/> Cargando...
                
              </div>
            ) : "Iniciar sesión"}
          </Button>

          <p className="text-small-regular text-light-2 text-center mt-2">
            No estas registrado? <Link to="/sign-up" className="text-primary-500 text-small-semibold ml-1">Crea una nueva cuenta</Link>
          </p>
        </form>
      </div>
    </Form>
  )
}

export default SignInForm