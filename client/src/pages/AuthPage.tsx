import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { insertUserSchema } from "@shared/schema";
import { Dumbbell, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuth();

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      displayName: "",
      role: "user" as const,
      tier: "free" as const,
    },
  });

  const onLogin = loginForm.handleSubmit((data) => login.mutate(data));
  const onRegister = registerForm.handleSubmit((data) => {
    const { confirmPassword, ...rest } = data;
    register.mutate(rest);
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/50 rounded-2xl flex items-center justify-center shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)] mb-6 rotate-3">
            <Dumbbell className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Muscle Up <span className="text-primary">Mommy</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Connect, train, and grow together.
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-xl border border-white/5 p-8 rounded-3xl shadow-2xl">
          <div className="flex p-1 bg-white/5 rounded-xl mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                isLogin ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                !isLogin ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-white"
              }`}
            >
              Register
            </button>
          </div>

          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
                onSubmit={onLogin}
              >
                <Input
                  label="Username"
                  placeholder="mommy_fit"
                  {...loginForm.register("username")}
                  error={loginForm.formState.errors.username?.message}
                />
                <Input
                  type="password"
                  label="Password"
                  placeholder="••••••••"
                  {...loginForm.register("password")}
                  error={loginForm.formState.errors.password?.message}
                />
                <div className="pt-2">
                  <Button className="w-full" isLoading={login.isPending}>
                    Sign In <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
                onSubmit={onRegister}
              >
                <Input
                  label="Display Name"
                  placeholder="Sarah J."
                  {...registerForm.register("displayName")}
                  error={registerForm.formState.errors.displayName?.message}
                />
                <Input
                  label="Username"
                  placeholder="sarah_active"
                  {...registerForm.register("username")}
                  error={registerForm.formState.errors.username?.message}
                />
                <Input
                  type="password"
                  label="Password"
                  placeholder="••••••••"
                  {...registerForm.register("password")}
                  error={registerForm.formState.errors.password?.message}
                />
                <Input
                  type="password"
                  label="Confirm Password"
                  placeholder="••••••••"
                  {...registerForm.register("confirmPassword")}
                  error={registerForm.formState.errors.confirmPassword?.message}
                />
                <div className="pt-2">
                  <Button className="w-full" isLoading={register.isPending}>
                    Create Account
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
