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
                            ```javascript
                            import {useState} from "react";
                            import {Link} from "react-router-dom";
                            import {Button} from "../ui/Button";
                            import {Trophy, User, Wallet, Menu, X} from "lucide-react";
                            import {useStore} from "../../lib/store";
                            import {NotificationBell} from "../NotificationBell";

                            export function Navbar() {
    const {currentUser, logout} = useStore();
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
                                    <div className="md:hidden absolute top-16 left-0 right-0 bg-card border-b shadow-lg z-50">
                                        <div className="flex flex-col p-4 space-y-4">
                                            <Link to="/" onClick={() => setIsOpen(false)}>
                                                <Button variant="ghost" className="w-full justify-start">Home</Button>
                                            </Link>
                                            <Link to="/tournaments" onClick={() => setIsOpen(false)}>
                                                <Button variant="ghost" className="w-full justify-start">Tournaments</Button>
                                            </Link>
                                            <Link to="/leaderboard" onClick={() => setIsOpen(false)}>
                                                <Button variant="ghost" className="w-full justify-start">Leaderboard</Button>
                                            </Link>
                                            <Link to="/schedule" onClick={() => setIsOpen(false)}>
                                                <Button variant="ghost" className="w-full justify-start">Schedule</Button>
                                            </Link>

                                            {currentUser ? (
                                                <>
                                                    {currentUser.role === 'admin' && (
                                                        <Link to="/admin" onClick={() => setIsOpen(false)}>
                                                            <Button variant="outline" className="w-full">Admin</Button>
                                                        </Link>
                                                    )}
                                                    <Link to="/my-tournaments" onClick={() => setIsOpen(false)}>
                                                        <Button variant="ghost" className="w-full justify-start">My Tournaments</Button>
                                                    </Link>
                                                    <Link to="/wallet" onClick={() => setIsOpen(false)}>
                                                        <Button variant="ghost" className="w-full justify-start">
                                                            <Wallet className="h-5 w-5 mr-2" />
                                                            Wallet
                                                        </Button>
                                                    </Link>
                                                    <div className="flex items-center justify-between px-3 py-2">
                                                        <span className="text-sm font-medium">Notifications</span>
                                                        <NotificationBell />
                                                    </div>
                                                    <Link to="/profile" onClick={() => setIsOpen(false)}>
                                                        <Button variant="ghost" className="w-full justify-start">
                                                            <User className="h-5 w-5 mr-2" />
                                                            Profile
                                                        </Button>
                                                    </Link>
                                                    <Button variant="default" className="w-full" onClick={() => { logout(); setIsOpen(false); }}>
                                                        Logout
                                                    </Button>
                                                </>
                                            ) : (
                                                <Link to="/login" onClick={() => setIsOpen(false)}>
                                                    <Button variant="default" className="w-full">Login</Button>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </nav>
                        </header>
                    );
}
                    ```
