
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut } from 'lucide-react';

interface UserMenuProps {
  user: any;
  onSignOut: () => void;
  onSignIn: () => void;
  onRegister: () => void;
}

const UserMenu = ({ user, onSignOut, onSignIn, onRegister }: UserMenuProps) => {
  if (user) {
    return (
      <div className="hidden md:flex items-center space-x-3">
        <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg">
          <User className="h-4 w-4 text-rose-600" />
          <span className="text-sm font-medium text-gray-700">
            {user.email?.split('@')[0]}
          </span>
        </div>
        <Button
          onClick={onSignOut}
          variant="outline"
          size="sm"
          className="border-rose-200 text-rose-600 hover:bg-rose-50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-md transition-colors">
          <span className="text-lg">👤</span>
          <span className="text-sm font-medium">Account</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-white shadow-lg border border-gray-200">
        <DropdownMenuItem 
          onClick={onSignIn}
          className="cursor-pointer hover:bg-rose-50 focus:bg-rose-50"
        >
          Sign In
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={onRegister}
          className="cursor-pointer hover:bg-rose-50 focus:bg-rose-50"
        >
          Register
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
