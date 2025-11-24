import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";
import { Trophy, User, Wallet, Menu, X } from "lucide-react";
import { useStore } from "../../lib/store";
import { NotificationBell } from "../NotificationBell";

export function Navbar() {
    const { currentUser, logout } = useStore();
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    <button className="md:hidden" onClick={toggleMenu}>
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                        <Trophy className="h-6 w-6" />
                        <span>EsportsPro</span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link to="/" className="transition-colors hover:text-primary">Tournaments</Link>
                    <Link to="/leaderboard" className="transition-colors hover:text-primary">Leaderboard</Link>
                    {currentUser && <Link to="/my-tournaments" className="transition-colors hover:text-primary">My Tournaments</Link>}
                    <Link to="/schedule" className="transition-colors hover:text-primary">Schedule</Link>
                </nav>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-4">
                    {currentUser ? (
                        <>
                            {currentUser.role === 'admin' && (
                                <Link to="/admin">
                                    <Button variant="outline" size="sm">Admin</Button>
                                </Link>
                            )}
                            <Link to="/wallet">
                                <Button variant="ghost" size="icon">
                                    <Wallet className="h-5 w-5" />
                                </Button>
                            </Link>
                            <NotificationBell />
                            <Link to="/profile">
                                <Button variant="ghost" size="icon">
                                    <User className="h-5 w-5" />
                                </Button>
                            </Link>
                            <Button variant="default" size="sm" onClick={logout}>Logout</Button>
                        </>
                    ) : (
                        <Link to="/login">
                            <Button variant="default" size="sm">Login</Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden border-t p-4 bg-background">
                    <nav className="flex flex-col gap-4 text-sm font-medium">
                        <Link to="/" className="transition-colors hover:text-primary" onClick={toggleMenu}>Tournaments</Link>
                        <Link to="/leaderboard" className="transition-colors hover:text-primary" onClick={toggleMenu}>Leaderboard</Link>
                        {currentUser && <Link to="/my-tournaments" className="transition-colors hover:text-primary" onClick={toggleMenu}>My Tournaments</Link>}
                        <Link to="/schedule" className="transition-colors hover:text-primary" onClick={toggleMenu}>Schedule</Link>

                        <div className="border-t pt-4 flex flex-col gap-4">
                            {currentUser ? (
                                <>
                                    <div className="flex items-center justify-between">
                                        <Link to="/profile" onClick={toggleMenu} className="flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            <span>Profile</span>
                                        </Link>
                                        <Link to="/wallet" onClick={toggleMenu} className="flex items-center gap-2">
                                            <Wallet className="h-5 w-5" />
                                            <span>Wallet</span>
                                        </Link>
                                        <NotificationBell />
                                    </div>
                                    {currentUser.role === 'admin' && (
                                        <Link to="/admin" onClick={toggleMenu}>
                                            <Button variant="outline" size="sm" className="w-full">Admin Dashboard</Button>
                                        </Link>
                                    )}
                                    <Button variant="default" size="sm" onClick={() => { logout(); toggleMenu(); }} className="w-full">Logout</Button>
                                </>
                            ) : (
                                <Link to="/login" onClick={toggleMenu}>
                                    <Button variant="default" size="sm" className="w-full">Login</Button>
                                </Link>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
