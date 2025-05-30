
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarUserProps {
  user: any;
  onLogout: () => void;
}

const NavbarUser: React.FC<NavbarUserProps> = ({ user, onLogout }) => {
  // Provide safe fallbacks for user properties
  const safeUser = user || {};
  const displayName = safeUser.displayName || safeUser.email || 'User';
  const photoURL = safeUser.photoURL || undefined;
  const avatarFallback = displayName.charAt(0).toUpperCase() || '?';

  const handleLogout = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onLogout();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="ml-4">
          <AvatarImage src={photoURL} />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuItem>
          <Link to="/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NavbarUser;
