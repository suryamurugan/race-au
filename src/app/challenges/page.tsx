'use client';

import { api } from '@/trpc/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';
import { ChevronRight, Layers } from 'lucide-react';

export default function ChallengesPage() {
    const { data: challenges, isLoading } = api.challenge.list.useQuery();

    if (isLoading) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">Loading challenges...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-bold">Challenges</h1>
                <Link href="/create">
                    <Button>Create Challenge</Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {challenges?.map((challenge) => (
                    <Card
                        key={challenge.id}
                        className="group transition-all hover:shadow-lg"
                    >
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>{challenge.title}</CardTitle>
                                <Badge
                                    variant={
                                        challenge.isActive
                                            ? 'default'
                                            : 'secondary'
                                    }
                                >
                                    {challenge.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-4 line-clamp-2 text-sm">
                                {challenge.description}
                            </p>
                            <div className="space-y-4">
                                <div className="text-muted-foreground flex items-center text-sm">
                                    <Layers className="mr-2 h-4 w-4" />
                                    <span>{challenge.moduleCount} modules</span>
                                </div>
                                <div className="text-muted-foreground space-y-1 text-sm">
                                    <div>
                                        Start:{' '}
                                        {format(
                                            new Date(challenge.startDate),
                                            'MMM d, yyyy',
                                        )}
                                    </div>
                                    <div>
                                        End:{' '}
                                        {format(
                                            new Date(challenge.endDate),
                                            'MMM d, yyyy',
                                        )}
                                    </div>
                                </div>
                                <Link
                                    href={`/challenges/${challenge.id}`}
                                    className="text-primary hover:text-primary/80 flex items-center justify-end text-sm transition-colors"
                                >
                                    View Details
                                    <ChevronRight className="ml-1 h-4 w-4" />
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
