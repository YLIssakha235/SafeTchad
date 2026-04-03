import { Link, useNavigate } from "@tanstack/react-router";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

import { Button } from "./ui/button";

export default function UserMenu() {
  const navigate = useNavigate();

  // Better Auth lit la session utilisateur courante.
  // C'est probablement ici que part l'appel /api/auth/get-session.
  const { data: session, isPending } = authClient.useSession();

  // Pendant le chargement de session, on garde une largeur stable
  // pour éviter un effet visuel trop brusque dans le header.
  if (isPending) {
    return (
      <Button variant="outline" disabled className="min-w-[96px]">
        ...
      </Button>
    );
  }

  // Si pas connecté, on affiche le bouton de connexion
  if (!session) {
    return (
      <Link to="/login">
        <Button variant="outline">Sign In</Button>
      </Link>
    );
  }

  // Si connecté, on affiche le menu utilisateur
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" className="min-w-[96px]" />}>
        {session.user.name}
      </DropdownMenuTrigger>

      <DropdownMenuContent className="bg-card">
        <DropdownMenuGroup>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>{session.user.email}</DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    navigate({
                      to: "/",
                    });
                  },
                },
              });
            }}
          >
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}