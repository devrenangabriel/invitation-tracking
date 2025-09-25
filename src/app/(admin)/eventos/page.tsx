import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EventsPage() {
  return (
    <div>
      <Button
        variant={"outline"}
        className="w-full h-16 justify-start text-xl"
        asChild
      >
        {/* TODO: Create constant for urls */}
        <Link href="/eventos/novo">Cadastrar Novo evento</Link>
      </Button>
    </div>
  );
}
