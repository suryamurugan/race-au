import { getUserSession } from '@/server/auth/server';
import { headers } from 'next/headers';
import Image from 'next/image';
import { redirect } from 'next/navigation';

export default async function Home() {
    const session = await getUserSession(await headers());

    console.log(session);

    if (!session) {
        redirect('/login');
    }

    // If logged in, show dashboard/home content
    return (
        <div className="flex min-h-screen flex-col items-center justify-center">
            <h1 className="text-2xl font-bold">
                Welcome, {session.user?.name || 'User'}
            </h1>
            <p className="mt-4">You are logged in</p>
        </div>
    );
}
