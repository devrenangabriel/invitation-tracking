import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-semibold text-start">
            Faça login com seu acesso
          </CardTitle>
          <CardDescription>
            Use uma conta do google com acesso para começar a gerir seus eventos
            ou entre com suas credênciais.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full">Login</Button>
          <Button variant="outline" className="w-full">
            Login com Google
          </Button>
          <div className="mt-4 text-center text-sm">
            Não tem acesso?{" "}
            <Link href="#" className="underline">
              Solicite aqui
            </Link>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}
