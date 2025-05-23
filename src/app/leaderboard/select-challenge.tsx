'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';

interface Challenge {
    id: string;
    title: string;
}

interface SelectChallengeProps {
    challenges: Challenge[];
    selectedValue: string | null;
}

export function SelectChallenge({
    challenges,
    selectedValue,
}: SelectChallengeProps) {
    const router = useRouter();

    const handleValueChange = (value: string) => {
        const url = new URL(window.location.href);
        if (value && value !== 'all') {
            url.searchParams.set('challenge', value);
        } else {
            url.searchParams.delete('challenge');
        }
        router.push(url.toString());
    };

    return (
        <div className="w-full max-w-xs space-y-2">
            <label className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Select Challenge
            </label>
            <Select
                value={selectedValue || 'all'}
                onValueChange={handleValueChange}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Select a challenge" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Challenges</SelectItem>
                    {challenges.map((challenge) => (
                        <SelectItem key={challenge.id} value={challenge.id}>
                            {challenge.title}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
