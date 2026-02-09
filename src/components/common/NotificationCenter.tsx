import { useState, useEffect } from 'react';
import { Bell, CheckCircle, Info, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: string;
    link?: string;
    isRead: boolean;
    createdAt: string;
}

export function NotificationCenter() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchNotifications() {
        try {
            const res = await fetch('/api/notifications', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchNotifications();
        // Poll for notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    async function markAsRead(id: string) {
        try {
            await fetch(`/api/notifications/${id}/read`, { method: 'POST', credentials: 'include' });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error('Failed to mark as read', err);
        }
    }

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const getIcon = (type: string) => {
        switch (type) {
            case 'fulfillment': return <CheckCircle className="h-4 w-4 text-success" />;
            case 'donation': return <Info className="h-4 w-4 text-primary" />;
            default: return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative group">
                    <Bell className="h-5 w-5 transition-transform group-hover:scale-110" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-critical text-[10px] font-medium text-critical-foreground animate-pulse">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden bg-popover border-border/50 shadow-xl">
                <div className="flex items-center justify-between p-3 bg-muted/30 border-b border-border/50">
                    <h3 className="text-sm font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                        <Badge variant="outline" className="text-[10px] py-0 h-5">
                            {unreadCount} New
                        </Badge>
                    )}
                </div>

                <ScrollArea className="h-80">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : notifications.length > 0 ? (
                        <div className="divide-y divide-border/30">
                            {notifications.map((n) => (
                                <DropdownMenuItem
                                    key={n._id}
                                    className={`flex flex-col items-start gap-1 p-3 cursor-pointer focus:bg-accent hover:bg-accent/50 transition-colors ${!n.isRead ? 'bg-primary/5' : ''}`}
                                    onSelect={() => markAsRead(n._id)}
                                    asChild
                                >
                                    <Link to={n.link || '#'}>
                                        <div className="flex items-center gap-2 w-full">
                                            {getIcon(n.type)}
                                            <span className={`font-medium text-sm flex-1 ${!n.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                {n.title}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className={`text-xs leading-relaxed mt-1 ${!n.isRead ? 'text-foreground/80' : 'text-muted-foreground'}`}>
                                            {n.message}
                                        </p>
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
                            <p className="text-sm text-muted-foreground">No notifications yet</p>
                        </div>
                    )}
                </ScrollArea>

                <DropdownMenuSeparator className="m-0" />
                <Button variant="ghost" className="w-full text-xs py-2 rounded-none h-9 text-muted-foreground hover:text-primary transition-colors" asChild>
                    <Link to="/notifications">View all notifications</Link>
                </Button>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
