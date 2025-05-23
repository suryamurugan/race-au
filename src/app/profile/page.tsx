'use client';

import { api } from '@/trpc/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { taskSubmissions, teams, teamMembers } from '@/server/db/schema';
import type { InferSelectModel } from 'drizzle-orm';
import { Users } from 'lucide-react';

type TaskSubmission = InferSelectModel<typeof taskSubmissions>;
type Team = InferSelectModel<typeof teams>;
type TeamMember = InferSelectModel<typeof teamMembers>;

interface UserTeam {
    team: Team;
    role: string;
    joinedAt: Date;
}

export default function ProfilePage() {
    const { data: profile, isLoading: isProfileLoading } =
        api.user.profile.useQuery();
    const { data: userTeams, isLoading: isTeamsLoading } =
        api.user.teams.useQuery();

    if (isProfileLoading || isTeamsLoading) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">Loading profile...</div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">Profile not found</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <div className="grid gap-6 md:grid-cols-2">
                {/* Profile Info */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center space-x-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={profile.image || ''} />
                                <AvatarFallback>
                                    {profile.name?.[0]?.toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-2xl">
                                    {profile.name}
                                </CardTitle>
                                <p className="text-sm text-gray-500">
                                    {profile.email}
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm text-gray-500">
                                    Tasks Completed
                                </p>
                                <p className="text-2xl font-bold">
                                    {profile.completedTasks}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-gray-500">
                                    Total Points
                                </p>
                                <p className="text-2xl font-bold">
                                    {profile.totalPoints}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Teams */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            My Teams
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {userTeams?.map(
                                ({ team, role, joinedAt }: UserTeam) => (
                                    <div
                                        key={team.id}
                                        className="flex items-center justify-between border-b pb-2"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {team.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Role: {role}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">
                                                Joined{' '}
                                                {format(
                                                    new Date(joinedAt),
                                                    'MMM d, yyyy',
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ),
                            )}
                            {(!userTeams || userTeams.length === 0) && (
                                <p className="text-center text-gray-500">
                                    You are not a member of any teams yet
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {profile.recentActivity.map(
                                (activity: TaskSubmission) => (
                                    <div
                                        key={activity.id}
                                        className="flex items-center justify-between border-b pb-2"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                Task Submission
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Status: {activity.status}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">
                                                {format(
                                                    new Date(
                                                        activity.submittedAt,
                                                    ),
                                                    'MMM d, yyyy',
                                                )}
                                            </p>
                                            {activity.points && (
                                                <p className="text-sm font-medium text-green-600">
                                                    +{activity.points} points
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
