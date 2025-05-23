import { Resend } from 'resend';
import { z } from 'zod';

// Lazy initialization of Resend to avoid build-time errors
let resendInstance: Resend | null = null;

function getResendInstance(): Resend {
    if (!resendInstance) {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            throw new Error('RESEND_API_KEY environment variable is required');
        }
        resendInstance = new Resend(apiKey);
    }
    return resendInstance;
}

const emailSchema = z.object({
    to: z.string().email(),
    subject: z.string(),
    html: z.string(),
});

type EmailParams = z.infer<typeof emailSchema>;

export async function sendEmail({ to, subject, html }: EmailParams) {
    try {
        const validated = emailSchema.parse({ to, subject, html });

        // Check if API key is available
        if (!process.env.RESEND_API_KEY) {
            throw new Error(
                'RESEND_API_KEY environment variable is not configured',
            );
        }

        const resend = getResendInstance();

        const { data, error } = await resend.emails.send({
            from: 'Standup App <standup@tri.raj.how>',
            to: validated.to,
            subject: validated.subject,
            html: validated.html,
        });

        if (error) {
            throw new Error(error.message);
        }

        return { success: true, data };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}
