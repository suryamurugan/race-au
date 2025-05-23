import { getUserSession } from '@/server/auth/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { HomeContent } from '@/components/home-content';

export default async function Home() {
    const session = await getUserSession(await headers());

    if (!session) {
        redirect('/login');
    }

    return <HomeContent userName={session.user?.name} />;
}
