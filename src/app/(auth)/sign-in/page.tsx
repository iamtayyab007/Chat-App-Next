"use client";
import { Controller, useForm } from "react-hook-form";
import { signinSchema } from "../../../../schemas/signinSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type FormData = {
  identifier: string;
  password: string;
};

export default function page() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof signinSchema>>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });
  const {
    formState: { ...errors },
  } = form;
  const onSubmit = async (data: FormData) => {
    console.log("", data);
    const response = await signIn("credentials", {
      redirect: false,
      identifier: data.identifier,
      password: data.password,
    });
    if (response?.ok) {
      console.log("", response);
      router.replace("/dashboard");
    } else {
      setError("invalid email or password");
      console.log(response?.error);
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen text-black">
      {error && <p className="absolute top-4 text-red-500">{error}</p>}

      <div className="flex flex-col items-center">
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
          <Controller
            name="identifier"
            control={form.control}
            rules={{ required: true }}
            render={({ field }) => (
              <input
                {...field}
                className="border border-gray-300 px-4 py-2 rounded mb-4 w-64"
                placeholder="Email"
              />
            )}
          />
          <Controller
            name="password"
            control={form.control}
            rules={{ required: true }}
            render={({ field }) => (
              <input
                {...field}
                type="password"
                className="border border-gray-300 px-4 py-2 rounded mb-4 w-64"
                placeholder="Password"
              />
            )}
          />
          <input
            type="submit"
            value="Sign In"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
          />
        </form>
      </div>
    </div>
  );
}
